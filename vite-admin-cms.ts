import type { Plugin, Connect } from 'vite';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { execFile } from 'child_process';
import { z } from 'zod';
import { Project } from 'ts-morph';

// Debug logger to write events to a local file for diagnostic purposes
function logDebug(message: string, error?: any) {
  try {
    const logDir = path.resolve(process.cwd(), 'scratch');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logPath = path.resolve(logDir, 'cms-debug.log');
    const timestamp = new Date().toISOString();
    const errorStr = error ? `\nError: ${error.stack || error.message || error}` : '';
    fs.appendFileSync(logPath, `[${timestamp}] ${message}${errorStr}\n`, 'utf-8');
  } catch (e) {
    console.error('Failed to write debug log:', e);
  }
}

// Load .env variables locally
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const index = trimmed.indexOf('=');
        if (index > 0) {
          const key = trimmed.slice(0, index).trim();
          let value = trimmed.slice(index + 1).trim();
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
          process.env[key] = value;
        }
      });
    }
  } catch (e) {
    console.error('Error loading .env file:', e);
  }
}

loadEnv();

// In-memory rate limiting map: Map<ip, {count, windowStart, lockedUntil}>
interface RateLimitInfo {
  count: number;
  windowStart: number;
  lockedUntil: number;
}
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;
const rateLimits = new Map<string, RateLimitInfo>();

// Input schemas removed to avoid duplicate Zod library issues at runtime

function getCookie(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [key, val] = cookie.trim().split('=');
    if (key === name) return val;
  }
  return null;
}

function getRequestBody(req: Connect.IncomingMessage): Promise<any> {
  logDebug(`[getRequestBody] Request starting for ${req.method} ${req.url}`);
  
  // If body is already parsed by another middleware
  if ((req as any).body !== undefined) {
    logDebug(`[getRequestBody] Body already parsed by another middleware, returning existing body`);
    return Promise.resolve((req as any).body);
  }

  // If it's a request that shouldn't have a body
  const contentLength = req.headers['content-length'];
  if (contentLength === '0') {
    logDebug(`[getRequestBody] Content-length is 0, returning empty body`);
    return Promise.resolve({});
  }

  // If stream is already complete or not readable
  if (req.complete || !req.readable) {
    logDebug(`[getRequestBody] Stream complete=${req.complete} or readable=${req.readable}, returning empty body`);
    return Promise.resolve({});
  }

  return new Promise((resolve, reject) => {
    let body = '';
    
    // 5-second timeout to prevent hanging if the stream was already consumed
    const timeout = setTimeout(() => {
      logDebug(`[getRequestBody] TIMED OUT waiting for request body`);
      console.error('[CMS Middleware] getRequestBody timed out waiting for request body');
      reject(new Error('Request body parsing timed out. The stream may have already been consumed.'));
    }, 5000);

    req.on('data', (chunk) => {
      body += chunk;
      logDebug(`[getRequestBody] Received chunk of length ${chunk.length}`);
    });
    
    req.on('end', () => {
      clearTimeout(timeout);
      logDebug(`[getRequestBody] Stream ended. Total body length: ${body.length}`);
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        logDebug(`[getRequestBody] JSON parse failed`, e);
        reject(e);
      }
    });

    req.on('error', (err) => {
      clearTimeout(timeout);
      logDebug(`[getRequestBody] Stream error`, err);
      reject(err);
    });
  });
}

function runGitCommand(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile('git', args, { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(error.message + '\n' + stdout + '\n' + stderr));
      } else {
        resolve((stdout || stderr).trim());
      }
    });
  });
}

// requireValidSession middleware check
function validateSession(req: Connect.IncomingMessage): { valid: boolean; payload?: any } {
  const sessionToken = getCookie(req.headers.cookie, 'admin_session');
  if (!sessionToken) return { valid: false };

  const parts = sessionToken.split('.');
  if (parts.length !== 2) return { valid: false };

  const [base64Payload, signature] = parts;
  const secret = process.env.SESSION_HMAC_SECRET;
  if (!secret) return { valid: false };

  // Re-verify HMAC signature
  const expectedSig = crypto.createHmac('sha256', secret)
    .update(base64Payload)
    .digest('hex');

  const sigBuffer = Buffer.from(signature, 'hex');
  const expectedSigBuffer = Buffer.from(expectedSig, 'hex');

  // CRITICAL: Guard against length mismatch before timingSafeEqual to avoid throwing
  if (sigBuffer.length !== expectedSigBuffer.length) {
    return { valid: false };
  }

  if (!crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) {
    return { valid: false };
  }

  // Parse payload and check expiry
  try {
    const payloadStr = Buffer.from(base64Payload, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadStr);

    if (!payload.exp || payload.exp < Date.now()) {
      return { valid: false };
    }

    return { valid: true, payload };
  } catch (e) {
    return { valid: false };
  }
}

// CSRF double submit cookie check
function validateCsrf(req: Connect.IncomingMessage): boolean {
  const headerToken = req.headers['x-csrf-token'] as string;
  const cookieToken = getCookie(req.headers.cookie, 'csrf_token');

  if (!headerToken || !cookieToken) return false;

  const headerBuffer = Buffer.from(headerToken, 'hex');
  const cookieBuffer = Buffer.from(cookieToken, 'hex');

  // Guard length mismatch
  if (headerBuffer.length !== cookieBuffer.length) {
    return false;
  }

  if (!crypto.timingSafeEqual(headerBuffer, cookieBuffer)) {
    return false;
  }

  return true;
}

export function adminCmsPlugin(): Plugin {
  return {
    name: 'admin-cms-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        const pathname = url.split('?')[0];

        // Intercept direct /admin requests and redirect to hash route /#/admin
        if (pathname === '/admin' || pathname === '/admin/') {
          res.writeHead(302, { Location: '/#/admin' });
          res.end();
          return;
        }

        // Route: POST /api/admin/login
        if (url === '/api/admin/login' && req.method === 'POST') {
          const ip = req.socket.remoteAddress || 'unknown';
          const now = Date.now();

          // Rate limit check
          const limitInfo = rateLimits.get(ip);
          if (limitInfo && limitInfo.lockedUntil > now) {
            res.writeHead(429, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Too many attempts. Lockout for 15 minutes.' }));
            return;
          }

          try {
            const body = await getRequestBody(req);
            const { passcode } = body;

            const savedHash = process.env.ADMIN_PASSCODE_HASH;
            if (!savedHash) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Admin passcode hash is not configured.' }));
              return;
            }

            const isValid = typeof passcode === 'string' && bcrypt.compareSync(passcode, savedHash);

            if (!isValid) {
              let info = rateLimits.get(ip);
              if (!info || (now - info.windowStart) > WINDOW_MS) {
                info = { count: 1, windowStart: now, lockedUntil: 0 };
              } else {
                info.count += 1;
              }
              if (info.count >= 5) {
                info.lockedUntil = now + LOCKOUT_MS;
              }
              rateLimits.set(ip, info);

              res.writeHead(401, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Invalid passcode' }));
              return;
            }

            // Success: Reset rate limits
            rateLimits.delete(ip);

            // Generate Session Tokens
            const payloadStr = JSON.stringify({
              iat: now,
              exp: now + 2 * 60 * 60 * 1000, // 2-hour expiry
            });
            const base64Payload = Buffer.from(payloadStr).toString('base64url');
            
            const secret = process.env.SESSION_HMAC_SECRET;
            if (!secret) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'HMAC secret is not configured.' }));
              return;
            }
            
            const signature = crypto.createHmac('sha256', secret)
              .update(base64Payload)
              .digest('hex');

            const isSecure = req.headers['x-forwarded-proto'] === 'https' || (req.socket as any).encrypted;
            
            const sessionCookie = [
              `admin_session=${base64Payload}.${signature}`,
              'HttpOnly',
              'SameSite=Strict',
              'Path=/',
              isSecure ? 'Secure' : '',
            ].filter(Boolean).join('; ');

            const csrfToken = crypto.randomBytes(24).toString('hex');
            const csrfCookie = [
              `csrf_token=${csrfToken}`,
              'SameSite=Strict',
              'Path=/',
              isSecure ? 'Secure' : '',
            ].filter(Boolean).join('; ');

            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Set-Cookie': [sessionCookie, csrfCookie] as any,
            });
            res.end(JSON.stringify({ success: true, csrfToken }));
            return;
          } catch (e: any) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Bad Request: ' + e.message }));
            return;
          }
        }

        // Apply session validation to all other /api/admin endpoints
        if (url.startsWith('/api/admin')) {
          const { valid } = validateSession(req);
          if (!valid) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized: Invalid or expired session' }));
            return;
          }

          // Apply CSRF validation to POST endpoints
          if (req.method === 'POST') {
            if (!validateCsrf(req)) {
              res.writeHead(403, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Forbidden: CSRF token validation failed' }));
              return;
            }
          }

          // Route: GET /api/admin/config (protected)
          if (url === '/api/admin/config' && req.method === 'GET') {
            try {
              const configPath = path.resolve(process.cwd(), 'src/config/siteConfig.ts');
              
              // Invalidate cache before loading to ensure we load the fresh content on disk
              const modules = server.moduleGraph.getModulesByFile(configPath);
              if (modules) {
                for (const mod of modules) {
                  server.moduleGraph.invalidateModule(mod);
                }
              }

              const moduleExports = await server.ssrLoadModule(configPath);
              const currentSiteConfig = moduleExports.siteConfig || moduleExports.default;

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(currentSiteConfig));
              return;
            } catch (e: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Failed to read siteConfig.ts: ' + e.message }));
              return;
            }
          }

          // Route: POST /api/admin/save-config (protected + csrf)
          if (url === '/api/admin/save-config' && req.method === 'POST') {
            logDebug('POST /api/admin/save-config route matched');
            try {
              const body = await getRequestBody(req);
              logDebug(`POST /api/admin/save-config parsed body successfully, length: ${body ? JSON.stringify(body).length : 0}`);
              
              if (!body || typeof body !== 'object') {
                logDebug('POST /api/admin/save-config error: body is not an object');
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid config format: body must be an object' }));
                return;
              }
              if (!body.personal || typeof body.personal !== 'object') {
                logDebug('POST /api/admin/save-config error: personal is not an object');
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid config format: personal info is required' }));
                return;
              }

              const json = JSON.stringify(body, null, 2);
              const fileContent = `// Site Configuration - Edit this file to update content easily
// No need to modify component files

export const siteConfig = ${json};

export default siteConfig;
`;
              const configPath = path.resolve(process.cwd(), 'src/config/siteConfig.ts');
              logDebug(`POST /api/admin/save-config writing to ${configPath}`);
              fs.writeFileSync(configPath, fileContent, 'utf-8');
              logDebug('POST /api/admin/save-config write successful');

              // Invalidate Vite's module cache for siteConfig.ts
              const modules = server.moduleGraph.getModulesByFile(configPath);
              if (modules) {
                for (const mod of modules) {
                  server.moduleGraph.invalidateModule(mod);
                }
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, config: body }));
              logDebug('POST /api/admin/save-config returned 200 response');
              return;
            } catch (e: any) {
              logDebug('CRITICAL ERROR in save-config', e);
              console.error('CRITICAL ERROR in save-config:', e);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Failed to write siteConfig.ts: ' + e.message }));
              return;
            }
          }

          // Route: POST /api/admin/upload-file (protected + csrf)
          if (url === '/api/admin/upload-file' && req.method === 'POST') {
            try {
              const body = await getRequestBody(req);
              const { filename, base64Data } = body;
              if (typeof filename !== 'string' || typeof base64Data !== 'string') {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Validation failed: filename and base64Data must be strings' }));
                return;
              }

              const cleanFilename = path.basename(filename);
              
              const ext = path.extname(cleanFilename).toLowerCase();
              const allowedExts = ['.pdf', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico'];
              if (!allowedExts.includes(ext)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Unsupported file type. Allowed extensions: ' + allowedExts.join(', ') }));
                return;
              }

              const base64Content = base64Data.replace(/^data:.*?;base64,/, '');
              const buffer = Buffer.from(base64Content, 'base64');

              const publicDir = path.resolve(process.cwd(), 'public');
              if (!fs.existsSync(publicDir)) {
                fs.mkdirSync(publicDir, { recursive: true });
              } else {
                // Delete existing file case-insensitively so Windows respects the new file case
                const files = fs.readdirSync(publicDir);
                const lowerFilename = cleanFilename.toLowerCase();
                const matchedFile = files.find(f => f.toLowerCase() === lowerFilename);
                if (matchedFile) {
                  try {
                    fs.unlinkSync(path.resolve(publicDir, matchedFile));
                  } catch (err) {
                    console.error('Failed to remove case-mismatched file:', err);
                  }
                }
              }

              const targetPath = path.resolve(publicDir, cleanFilename);
              fs.writeFileSync(targetPath, buffer);

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, filePath: cleanFilename }));
              return;
            } catch (e: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Failed to upload file: ' + e.message }));
              return;
            }
          }

          // Route: POST /api/admin/save-blog (protected + csrf)
          if (url === '/api/admin/save-blog' && req.method === 'POST') {
            try {
              const body = await getRequestBody(req);

              const blogPostSchema = z.object({
                id: z.string().min(1).max(50),
                slug: z.string()
                  .min(1).max(100)
                  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 
                    'Slug must be lowercase letters, numbers, and hyphens only'),
                title: z.string().min(1).max(200),
                excerpt: z.string().min(1).max(500),
                content: z.string().min(1).max(50000),
                date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
                lang: z.enum(['en', 'bn']),
                tags: z.array(z.string().min(1).max(50)).max(10),
                featured: z.boolean(),
                published: z.boolean(),
              });

              const saveBlogSchema = z.object({
                posts: z.array(blogPostSchema).max(100),
              });

              const parseResult = saveBlogSchema.safeParse(body);
              if (!parseResult.success) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Validation failed: ' + parseResult.error.message }));
                return;
              }

              const { posts } = parseResult.data;

              // Use ts-morph to open src/config/blogConfig.ts
              logDebug('Initializing ts-morph Project...');
              const project = new Project({
                useInMemoryFileSystem: false,
                skipAddingFilesFromTsConfig: true,
              });
              logDebug('ts-morph Project initialized');
              const blogConfigPath = path.resolve(process.cwd(), 'src/config/blogConfig.ts');
              const sourceFile = project.addSourceFileAtPath(blogConfigPath);

              // Find the blogConfig array variable declaration
              const blogConfigVar = sourceFile.getVariableDeclaration('blogConfig');
              if (!blogConfigVar) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to find blogConfig variable in blogConfig.ts' }));
                return;
              }

              // Replace its initializer with the new posts array
              // JSON.stringify the array, then wrap as TS array literal
              const postsJson = JSON.stringify(posts, null, 2);
              blogConfigVar.setInitializer(postsJson);

              // saveSync()
              sourceFile.saveSync();

              // Invalidate Vite's module cache for blogConfig.ts
              const modules = server.moduleGraph.getModulesByFile(blogConfigPath);
              if (modules) {
                for (const mod of modules) {
                  server.moduleGraph.invalidateModule(mod);
                }
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, count: posts.length }));
              return;
            } catch (e: any) {
              console.error('Error in save-blog:', e);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Failed to save blogConfig.ts: ' + e.message }));
              return;
            }
          }

          // Route: POST /api/admin/change-passcode (protected + csrf)
          if (url === '/api/admin/change-passcode' && req.method === 'POST') {
            try {
              const body = await getRequestBody(req);
              const { newPasscode } = body;
              if (typeof newPasscode !== 'string' || newPasscode.trim().length < 4) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Passcode must be at least 4 characters long.' }));
                return;
              }

              const salt = bcrypt.genSaltSync(10);
              const newHash = bcrypt.hashSync(newPasscode, salt);

              // Read, modify, and write .env file
              const envPath = path.resolve(process.cwd(), '.env');
              let envContent = '';
              if (fs.existsSync(envPath)) {
                envContent = fs.readFileSync(envPath, 'utf-8');
              }

              const lines = envContent.split('\n');
              let found = false;
              const updatedLines = lines.map(line => {
                const trimmed = line.trim();
                if (trimmed.startsWith('ADMIN_PASSCODE_HASH=')) {
                  found = true;
                  return `ADMIN_PASSCODE_HASH=${newHash}`;
                }
                return line;
              });

              if (!found) {
                updatedLines.push(`ADMIN_PASSCODE_HASH=${newHash}`);
              }

              fs.writeFileSync(envPath, updatedLines.join('\n'), 'utf-8');

              // Update process.env for instant effect
              process.env.ADMIN_PASSCODE_HASH = newHash;

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, message: 'Passcode changed successfully! Take effect instantly.' }));
              return;
            } catch (e: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Failed to change passcode: ' + e.message }));
              return;
            }
          }

          // Route: POST /api/admin/publish (protected + csrf)
          if (url === '/api/admin/publish' && req.method === 'POST') {
            try {
              // Execute git add, commit, push in order safely via execFile
              await runGitCommand(['add', 'src/config/siteConfig.ts', 'src/config/blogConfig.ts']);
              
              let commitOut = '';
              let commitHash = '';
              try {
                commitOut = await runGitCommand(['commit', '-m', 'chore: update site content via admin']);
                commitHash = await runGitCommand(['rev-parse', 'HEAD']);
              } catch (commitErr: any) {
                const errMsg = commitErr.message || '';
                // Check if there is nothing to commit
                if (errMsg.includes('nothing to commit') || errMsg.includes('no changes added to commit')) {
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({
                    success: true,
                    message: 'No changes to publish'
                  }));
                  return;
                }
                throw commitErr;
              }
              
              let pushOut = '';
              let pushSucceeded = true;
              let pushErrorMsg = '';
              try {
                pushOut = await runGitCommand(['push']);
              } catch (pushErr: any) {
                pushSucceeded = false;
                pushErrorMsg = 'Commit succeeded locally but push to GitHub failed: ' + pushErr.message;
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: true,
                pushSucceeded,
                commitHash,
                commitOutput: commitOut,
                ...(pushSucceeded 
                  ? { pushOutput: pushOut } 
                  : { error: pushErrorMsg }
                )
              }));
              return;
            } catch (e: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Git operation failed: ' + e.message }));
              return;
            }
          }
        }

        next();
      });
    },
  };
}
