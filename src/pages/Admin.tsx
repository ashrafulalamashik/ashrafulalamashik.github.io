import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  Lock, 
  Unlock, 
  Save, 
  GitBranch, 
  Plus, 
  Trash2, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Settings
} from 'lucide-react';

export default function Admin() {
  // If production environment, strictly block and redirect to home page
  if (import.meta.env.PROD) {
    return <Navigate to="/" replace />;
  }

  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [tagline, setTagline] = useState('');
  const [typewriterTexts, setTypewriterTexts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasSaved, setHasSaved] = useState(false);
  const [publishResult, setPublishResult] = useState<{ commitHash?: string; pushOutput?: string; pushSucceeded?: boolean } | null>(null);

  // Clear messages after a timeout
  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const t = setTimeout(() => setErrorMessage(''), 7000);
      return () => clearTimeout(t);
    }
  }, [errorMessage]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      setCsrfToken(data.csrfToken);
      setIsAuthenticated(true);
      setSuccessMessage('Logged in successfully!');
      fetchHeroConfig(data.csrfToken);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid passcode');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHeroConfig = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/hero', {
        method: 'GET',
        headers: {
          'X-CSRF-Token': token,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch hero config');
      }

      const data = await res.json();
      setTagline(data.tagline || '');
      setTypewriterTexts(data.typewriterTexts || []);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTextRow = () => {
    if (typewriterTexts.length >= 10) {
      setErrorMessage('You can add a maximum of 10 typewriter items.');
      return;
    }
    setTypewriterTexts([...typewriterTexts, '']);
  };

  const handleRemoveTextRow = (index: number) => {
    if (typewriterTexts.length <= 1) {
      setErrorMessage('You must keep at least one typewriter item.');
      return;
    }
    const next = typewriterTexts.filter((_, i) => i !== index);
    setTypewriterTexts(next);
  };

  const handleTextChange = (index: number, val: string) => {
    const next = [...typewriterTexts];
    next[index] = val;
    setTypewriterTexts(next);
  };

  const handleSaveDraft = async () => {
    if (!csrfToken) return;
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setPublishResult(null);

    // Frontend validation prior to API call
    if (!tagline.trim() || tagline.length > 200) {
      setErrorMessage('Tagline is required and must be under 200 characters.');
      setIsLoading(false);
      return;
    }

    if (typewriterTexts.some(text => !text.trim() || text.length > 100)) {
      setErrorMessage('Typewriter texts cannot be empty and must be under 100 characters each.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/save-hero', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ tagline, typewriterTexts }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save hero settings');
      }

      setSuccessMessage('Draft saved successfully to siteConfig.ts!');
      setHasSaved(true);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!csrfToken || !hasSaved) return;
    setIsPublishing(true);
    setErrorMessage('');
    setSuccessMessage('');
    setPublishResult(null);

    try {
      const res = await fetch('/api/admin/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Git commit & push operations failed');
      }

      if (data.pushSucceeded === false) {
        setErrorMessage(data.error || 'Commit succeeded locally, but push to GitHub failed. Please check/fix your git credentials and try again.');
        setPublishResult({
          commitHash: data.commitHash,
          pushOutput: data.error,
          pushSucceeded: false,
        });
      } else {
        setSuccessMessage(data.message || 'Successfully committed & pushed changes to GitHub!');
        setPublishResult({
          commitHash: data.commitHash,
          pushOutput: data.pushOutput,
          pushSucceeded: true,
        });
      }
      setHasSaved(false); // Reset save state after publish
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-4 relative font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-[#22C55E]/10 to-transparent blur-[120px] -top-24 -left-24" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-l from-[#22C55E]/5 to-transparent blur-[100px] bottom-0 right-1/4" />
      </div>

      <div className="w-full max-w-2xl bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md relative z-10 shadow-2xl">
        
        {/* Navigation / Header */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-800/80 mb-6">
          <Link to="/" className="text-zinc-400 hover:text-white flex items-center gap-2 text-sm transition-colors">
            <ArrowLeft size={16} /> Back to Website
          </Link>
          <div className="flex items-center gap-2 text-[#22C55E]">
            <Settings size={18} className="animate-spin-slow" style={{ animationDuration: '8s' }} />
            <span className="text-xs uppercase tracking-wider font-semibold">DevSecOps CMS</span>
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="mb-6 p-4 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-xl text-[#22C55E] flex items-start gap-2.5 text-sm animate-fade-in">
            <CheckCircle className="flex-shrink-0 mt-0.5" size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-start gap-2.5 text-sm animate-fade-in">
            <AlertCircle className="flex-shrink-0 mt-0.5" size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* LOGIN SCREEN */}
        {!isAuthenticated ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-full flex items-center justify-center mx-auto mb-4 text-[#22C55E] shadow-lg shadow-[#22C55E]/5">
              <Lock size={28} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Admin Passcode</h2>
            <p className="text-zinc-400 text-sm mb-6 max-w-sm mx-auto">
              Please enter the secure DevSecOps admin passcode to unlock editing modes.
            </p>

            <form onSubmit={handleLogin} className="max-w-sm mx-auto space-y-4">
              <input
                type="password"
                placeholder="••••••••••••••••"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#22C55E] rounded-xl px-4 py-3.5 text-center tracking-widest text-lg outline-none transition-all placeholder:tracking-normal font-mono"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-[#22C55E]/10 hover:shadow-[#22C55E]/20 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Verifying passcode...
                  </>
                ) : (
                  <>
                    <Unlock size={18} /> Unlock Dashboard
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* DASHBOARD PANEL */
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Edit Hero Settings</h2>
              <p className="text-zinc-400 text-xs sm:text-sm">
                Updates are parsed via AST and written to <code className="text-zinc-300 font-mono">src/config/siteConfig.ts</code>.
              </p>
            </div>

            {/* Tagline Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300 block">Personal Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                maxLength={200}
                required
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#22C55E] rounded-xl px-4 py-3 outline-none transition-all text-sm sm:text-base"
                placeholder="e.g. Full-Stack & DevSecOps · Automation"
              />
            </div>

            {/* Typewriter Array */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-zinc-300">Hero Typewriter Roles</label>
                <button
                  type="button"
                  onClick={handleAddTextRow}
                  className="flex items-center gap-1 text-xs text-[#22C55E] hover:text-[#16A34A] font-medium transition-colors"
                >
                  <Plus size={14} /> Add Role
                </button>
              </div>

              <div className="space-y-2.5">
                {typewriterTexts.map((text, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <span className="text-xs font-mono text-zinc-600 w-5">{idx + 1}.</span>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => handleTextChange(idx, e.target.value)}
                      maxLength={100}
                      required
                      className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-[#22C55E] rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                      placeholder={`Role #${idx + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveTextRow(idx)}
                      className="p-2.5 text-zinc-500 hover:text-red-400 bg-zinc-950 hover:bg-red-500/5 border border-zinc-800 hover:border-red-500/20 rounded-xl transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid sm:grid-cols-2 gap-4 pt-6 border-t border-zinc-800/80 mt-8">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isLoading || isPublishing}
                className="w-full bg-zinc-800 hover:bg-zinc-750 text-white font-medium py-3 rounded-xl border border-zinc-700/80 transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Save Draft
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={!hasSaved || isLoading || isPublishing}
                className={`w-full font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                  hasSaved 
                    ? 'bg-[#22C55E] hover:bg-[#16A34A] text-white shadow-lg shadow-[#22C55E]/10' 
                    : 'bg-zinc-900 text-zinc-600 border border-zinc-850 cursor-not-allowed'
                }`}
              >
                {isPublishing ? <Loader2 className="animate-spin" size={18} /> : <GitBranch size={18} />}
                Commit & Push to GitHub
              </button>
            </div>

            {/* Git Publish Result Info */}
            {publishResult && (
              <div className="mt-6 p-5 bg-zinc-950 border border-zinc-800/80 rounded-xl font-mono text-xs text-zinc-400 space-y-2 max-h-48 overflow-y-auto">
                <div className={`flex items-center gap-1.5 font-bold mb-1 ${publishResult.pushSucceeded === false ? 'text-red-400' : 'text-emerald-500'}`}>
                  {publishResult.pushSucceeded === false ? (
                    <>
                      <AlertCircle size={14} /> PUSH FAILED (COMMIT SAVED LOCALLY)
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} /> PUBLISH SUCCESS
                    </>
                  )}
                </div>
                <div>
                  <span className="text-zinc-600">Commit:</span> {publishResult.commitHash}
                </div>
                {publishResult.pushOutput && (
                  <div>
                    <span className="text-zinc-600">Git/Error Output:</span>
                    <pre className="mt-1 bg-zinc-900/50 p-2.5 rounded border border-zinc-850 overflow-x-auto text-[10px]">{publishResult.pushOutput}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Simple dynamic router helper link
import { Link } from 'react-router-dom';
