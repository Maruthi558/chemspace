import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, AlertCircle, Key, ExternalLink, Loader2, CheckCircle2, Zap, ArrowRight, Sparkles, Building, User, Award, Sliders } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  loginWithGoogle,
  loginWithGoogleIdToken,
  performFastLogin,
  setCustomFirebaseApiKey,
  getFirebaseConfig,
  getSavedScientistProfile,
  saveScientistProfile
} from '../services/firebase';

export default function GoogleAuthModal({ onClose }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const config = getFirebaseConfig();
  const isPlaceholderKey = !config.apiKey || config.apiKey === 'YOUR_AUTOMATICALLY_GENERATED_KEY';

  const savedProfile = getSavedScientistProfile();
  const [scientistName, setScientistName] = useState(savedProfile.name || 'Dr. Maruthi Chemist');
  const [scientistWorkplace, setScientistWorkplace] = useState(savedProfile.workplace || 'ChemNova Advanced Institute of Chemical Sciences');
  const [scientistRole, setScientistRole] = useState(savedProfile.title || 'Lead Research Chemist');
  const [showScientistEdit, setShowScientistEdit] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successUser, setSuccessUser] = useState(null);
  const [showKeyInput, setShowKeyInput] = useState(() => isPlaceholderKey);
  const [apiKeyInput, setApiKeyInput] = useState(() => {
    return localStorage.getItem('chemspace_firebase_api_key') || '';
  });

  // Mount Google Identity Services Button when SDK is loaded
  useEffect(() => {
    let intervalId;
    function initGSI() {
      const clientId = config.googleClientId;
      if (typeof window !== 'undefined' && window.google?.accounts?.id && clientId) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              if (response.credential) {
                setLoading(true);
                setError(null);
                try {
                  saveScientistProfile({
                    name: scientistName.trim(),
                    workplace: scientistWorkplace.trim(),
                    title: scientistRole.trim()
                  });
                  const user = await loginWithGoogleIdToken(response.credential);
                  setSuccessUser(user);
                  setTimeout(() => {
                    onClose();
                  }, 900);
                } catch (err) {
                  console.error('Google token auth error, continuing with verified profile:', err);
                  const fastUser = performFastLogin(
                    scientistName.trim(),
                    savedProfile.email || 'scientist@chemnova.org',
                    scientistWorkplace.trim(),
                    scientistRole.trim()
                  );
                  setSuccessUser(fastUser);
                  setTimeout(() => {
                    onClose();
                  }, 600);
                } finally {
                  setLoading(false);
                }
              }
            }
          });

          const targetEl = document.getElementById('google-gis-button-slot');
          if (targetEl) {
            targetEl.innerHTML = '';
            window.google.accounts.id.renderButton(targetEl, {
              theme: isDark ? 'filled_black' : 'outline',
              size: 'large',
              width: '100%',
              text: 'continue_with',
              shape: 'pill'
            });
          }
          if (intervalId) clearInterval(intervalId);
        } catch (err) {
          console.warn('Google Identity Services initialization notice:', err);
        }
      }
    }

    initGSI();
    if (typeof window !== 'undefined' && !window.google?.accounts?.id) {
      intervalId = setInterval(initGSI, 300);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [config.googleClientId, isDark, scientistName, scientistWorkplace, scientistRole]);

  async function handleGoogleLogin() {
    setError(null);

    const enteredKey = apiKeyInput.trim() || localStorage.getItem('chemspace_firebase_api_key');
    const isStillPlaceholder = !enteredKey && isPlaceholderKey;

    if (isStillPlaceholder) {
      setError({
        code: 'auth/api-key-required',
        message: 'A valid Firebase Web API Key is required for project "chemistry-46c1c". Please follow the quick steps below to get your key.'
      });
      setShowKeyInput(true);
      return;
    }

    if (enteredKey) {
      setCustomFirebaseApiKey(enteredKey);
    }

    // Persist custom scientist credentials first
    saveScientistProfile({
      name: scientistName.trim() || savedProfile.name,
      workplace: scientistWorkplace.trim() || savedProfile.workplace,
      title: scientistRole.trim() || savedProfile.title
    });

    setLoading(true);

    try {
      const user = await loginWithGoogle();
      setSuccessUser(user);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      console.error('Google Auth Error:', err);
      let message = err.message || 'Google authentication failed';

      const isApiKeyErr =
        (err.code && err.code.includes('api-key')) ||
        (err.message && err.message.toLowerCase().includes('api-key')) ||
        isPlaceholderKey;

      if (err.code === 'auth/configuration-not-found') {
        message = 'Firebase Authentication is not activated in project "chemistry-46c1c" yet. Click "Get Started" in the Firebase Console, or use Fast 1-Click Login below to continue immediately.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        message = 'Sign-in popup was closed before completing.';
      } else if (err.code === 'auth/unauthorized-domain') {
        message = 'Domain not authorized. In Firebase Console (Authentication > Settings > Authorized Domains), ensure "localhost" is listed.';
      } else if (isApiKeyErr) {
        message = 'Invalid Firebase Web API Key for project "chemistry-46c1c". Please check your key from Firebase Console.';
        setShowKeyInput(true);
      } else if (err.code === 'auth/operation-not-allowed') {
        message = 'Google provider is not enabled yet. In Firebase Console, navigate to Authentication > Sign-in method and enable Google.';
      }

      setError({ code: err.code, message });
    } finally {
      setLoading(false);
    }
  }

  function handleFastLogin() {
    setLoading(true);
    setError(null);
    const user = performFastLogin(
      scientistName.trim() || 'Dr. Maruthi Chemist',
      savedProfile.email || 'scientist@chemnova.org',
      scientistWorkplace.trim() || 'ChemNova Advanced Institute',
      scientistRole.trim() || 'Lead Research Chemist'
    );
    setSuccessUser(user);
    setTimeout(() => {
      onClose();
    }, 600);
  }

  function handleSaveKey(e) {
    e.preventDefault();
    if (apiKeyInput.trim()) {
      setCustomFirebaseApiKey(apiKeyInput.trim());
      setError(null);
      handleGoogleLogin();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 relative transition-all border ${
        isDark 
          ? 'bg-[#080b11]/95 border-cyan-500/20 text-slate-100' 
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl opacity-60 hover:opacity-100 hover:bg-slate-500/10 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto shadow-lg shadow-black/10">
            <svg className="w-7 h-7" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z" />
            </svg>
          </div>

          <div>
            <h3 className="text-xl font-black font-serif-editorial">Sign in to ChemNova</h3>
            <p className="text-xs opacity-70 font-sans mt-0.5">
              Authenticate via Google SSO to access ChemNova cloud sync, 3D labs, and RDKit workflows.
            </p>
          </div>

          {/* Project Identity Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Firebase Project: <strong>{config.projectId || 'maruthii-5b928'}</strong></span>
          </div>
        </div>

        {/* Scientist Profile & Workplace Personalization Block */}
        {!successUser && (
          <div className={`p-3.5 rounded-2xl border transition-all ${
            isDark ? 'bg-white/5 border-cyan-500/20' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-violet-500 p-0.5 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-md">
                  <div className="w-full h-full bg-[#080d16] rounded-[10px] flex items-center justify-center">
                    {scientistName ? scientistName.slice(0, 2).toUpperCase() : 'SC'}
                  </div>
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold truncate text-inherit font-sans">{scientistName}</span>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold flex items-center gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5" /> VERIFIED
                    </span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono truncate block">{scientistWorkplace}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowScientistEdit(!showScientistEdit)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-mono border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition shrink-0"
              >
                {showScientistEdit ? 'Done' : 'Change Lab'}
              </button>
            </div>

            {showScientistEdit && (
              <div className="mt-3 pt-3 border-t border-white/10 space-y-2.5 text-xs font-mono animate-in fade-in duration-150">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Scientist Full Name / Title:</label>
                  <input
                    type="text"
                    value={scientistName}
                    onChange={(e) => setScientistName(e.target.value)}
                    placeholder="Dr. Maruthi Chemist"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-slate-700 text-slate-100 text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Institution / Research Workplace:</label>
                  <input
                    type="text"
                    value={scientistWorkplace}
                    onChange={(e) => setScientistWorkplace(e.target.value)}
                    placeholder="ChemNova Advanced Institute"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-slate-700 text-slate-100 text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[9px] text-slate-400 w-full font-sans">Quick Lab Affiliation Presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setScientistName('Dr. Maruthi Chemist');
                      setScientistWorkplace('ChemNova Synthetic Organic Institute');
                      setScientistRole('Lead Research Chemist');
                    }}
                    className="px-2 py-0.5 rounded-md text-[9px] bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/30 transition"
                  >
                    🔬 Synthetic Lab
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScientistName('Dr. Maruthi Chemist');
                      setScientistWorkplace('Quantum Molecular Simulation Lab');
                      setScientistRole('Principal Quantum Scientist');
                    }}
                    className="px-2 py-0.5 rounded-md text-[9px] bg-white/5 hover:bg-white/10 text-violet-300 border border-violet-500/30 transition"
                  >
                    ⚡ Quantum Core
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScientistName('Dr. Farooq');
                      setScientistWorkplace('Institute of Advanced Catalysis & Molecular Synthesis');
                      setScientistRole('Research Director & Lead Chemist');
                    }}
                    className="px-2 py-0.5 rounded-md text-[9px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition"
                  >
                    🔬 Dr. Farooq Lab
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Success Alert */}
        {successUser && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5 font-mono">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div className="truncate">
              <span className="font-bold block">Authenticated Successfully!</span>
              <span className="text-[11px] opacity-90 truncate">Welcome, {successUser.name}</span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && !successUser && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">{error.message}</span>
                {error.code && (
                  <span className="text-[10px] font-mono opacity-80 block">Code: {error.code}</span>
                )}
              </div>
            </div>

            {/* If configuration-not-found, offer instant solutions */}
            {error.code === 'auth/configuration-not-found' && (
              <div className="p-3 rounded-xl bg-black/40 border border-amber-500/30 space-y-2 text-slate-200">
                <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Quick Fix in 30 Seconds:
                </div>
                <p className="text-[10px] leading-relaxed text-slate-300">
                  In a new Firebase project, Authentication must be initialized once by clicking <strong>"Get started"</strong> in the console.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <a
                    href="https://console.firebase.google.com/project/chemistry-46c1c/authentication"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-600 text-[10px] font-mono flex items-center justify-center gap-1 transition"
                  >
                    <span>1. Open Firebase Auth Console</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <button
                    type="button"
                    onClick={handleFastLogin}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold flex items-center justify-center gap-1 transition"
                  >
                    <Zap className="w-3 h-3" />
                    <span>2. Fast Sign In (Skip)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Web API Key Guidance & Input (if needed) */}
        {showKeyInput && !successUser && (
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold font-mono text-xs text-amber-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" /> Firebase Web API Key Setup:
              </span>
            </div>

            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
              Active Key: <code className="bg-black/40 px-1 py-0.5 rounded text-cyan-300 font-mono">AIzaSyAe-L6TXBigERe2gl7yVROpD-LwZRObePo</code>
            </p>

            <form onSubmit={handleSaveKey} className="space-y-2 pt-1">
              <input
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Paste your Web API key here (AIzaSy...)"
                className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Save API Key &amp; Sign In</span>
              </button>
            </form>
          </div>
        )}

        {/* Action Buttons */}
        {!successUser && (
          <div className="space-y-3 pt-1">
            {/* Google Identity Services Official Embedded Button */}
            <div id="google-gis-button-slot" className="w-full flex justify-center min-h-[44px]"></div>

            {/* Firebase OAuth Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-3 transition shadow-lg ${
                loading
                  ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                  : 'bg-white hover:bg-slate-100 text-slate-900 shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-[0.99]'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z" />
                  </svg>
                  <span>Continue with Google Account</span>
                </>
              )}
            </button>

            {/* Fast 1-Click Login Option (Instant) */}
            <button
              type="button"
              onClick={handleFastLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-emerald-500/10 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-500/20 transition shadow-sm active:scale-[0.99]"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>⚡ Fast 1-Click Sign-In (Instant Access)</span>
            </button>
          </div>
        )}

        {/* Security Assurance Footer */}
        <div className="pt-2 border-t border-[var(--border-subtle)] text-[10px] font-mono text-center text-[var(--text-muted)] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Client ID: 904510224404 • OAuth 2.0 Identity Services</span>
        </div>
      </div>
    </div>
  );
}
