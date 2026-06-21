import type { Plugin, Connect } from 'vite';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Project, SyntaxKind } from 'ts-morph';
import { z } from 'zod';
import { execFile } from 'child_process';

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

const saveHeroSchema = z.object({
  tagline: z.string().min(1).max(200),
  typewriterTexts: z.array(z.string().min(1).max(100)).min(1).max(10),
});

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
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
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

          // Route: GET /api/admin/hero (protected)
          if (url === '/api/admin/hero' && req.method === 'GET') {
            try {
              const project = new Project();
              const sourceFile = project.addSourceFileAtPath(path.resolve(process.cwd(), 'src/config/siteConfig.ts'));
              const siteConfigVariable = sourceFile.getVariableDeclaration('siteConfig');
              if (!siteConfigVariable) throw new Error('siteConfig variable not found');

              const initializer = siteConfigVariable.getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);
              
              const personalProp = initializer.getPropertyOrThrow('personal').asKindOrThrow(SyntaxKind.PropertyAssignment);
              const personalObject = personalProp.getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);
              const taglineProp = personalObject.getPropertyOrThrow('tagline').asKindOrThrow(SyntaxKind.PropertyAssignment);
              const tagline = taglineProp.getInitializerIfKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue();

              const heroProp = initializer.getPropertyOrThrow('hero').asKindOrThrow(SyntaxKind.PropertyAssignment);
              const heroObject = heroProp.getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);
              const typewriterTextsProp = heroObject.getPropertyOrThrow('typewriterTexts').asKindOrThrow(SyntaxKind.PropertyAssignment);
              const typewriterTextsArray = typewriterTextsProp.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
              const typewriterTexts = typewriterTextsArray.getElements().map(el => el.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue());

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ tagline, typewriterTexts }));
              return;
            } catch (e: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Failed to read siteConfig.ts: ' + e.message }));
              return;
            }
          }

          // Route: POST /api/admin/save-hero (protected + csrf)
          if (url === '/api/admin/save-hero' && req.method === 'POST') {
            try {
              const body = await getRequestBody(req);
              const parsed = saveHeroSchema.safeParse(body);
              if (!parsed.success) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Validation failed', details: parsed.error.flatten() }));
                return;
              }

              const { tagline, typewriterTexts } = parsed.data;

              // Write to siteConfig.ts via ts-morph AST edits
              const project = new Project();
              const sourceFile = project.addSourceFileAtPath(path.resolve(process.cwd(), 'src/config/siteConfig.ts'));
              const siteConfigVariable = sourceFile.getVariableDeclaration('siteConfig');
              if (!siteConfigVariable) throw new Error('siteConfig variable not found');

              const initializer = siteConfigVariable.getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);

              // Set tagline
              const personalProp = initializer.getPropertyOrThrow('personal').asKindOrThrow(SyntaxKind.PropertyAssignment);
              const personalObject = personalProp.getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);
              const taglineProp = personalObject.getPropertyOrThrow('tagline').asKindOrThrow(SyntaxKind.PropertyAssignment);
              taglineProp.setInitializer(JSON.stringify(tagline));

              // Set typewriterTexts
              const heroProp = initializer.getPropertyOrThrow('hero').asKindOrThrow(SyntaxKind.PropertyAssignment);
              const heroObject = heroProp.getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);
              const typewriterTextsProp = heroObject.getPropertyOrThrow('typewriterTexts').asKindOrThrow(SyntaxKind.PropertyAssignment);
              const arrayInitializer = `[\n    ${typewriterTexts.map(t => JSON.stringify(t)).join(',\n    ')}\n  ]`;
              typewriterTextsProp.setInitializer(arrayInitializer);

              sourceFile.saveSync();

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ tagline, typewriterTexts }));
              return;
            } catch (e: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Failed to write siteConfig.ts: ' + e.message }));
              return;
            }
          }

          // Route: POST /api/admin/publish (protected + csrf)
          if (url === '/api/admin/publish' && req.method === 'POST') {
            try {
              // Execute git add, commit, push in order safely via execFile
              await runGitCommand(['add', 'src/config/siteConfig.ts']);
              
              let commitOut = '';
              let commitHash = '';
              try {
                commitOut = await runGitCommand(['commit', '-m', 'chore: update hero content via admin']);
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
