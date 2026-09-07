import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Atom, ShieldCheck, AlertCircle, Loader2, CheckCircle2, ArrowRight, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function FinishSignUp() {
  const navigate = useNavigate();
  const { completeEmailLinkSignIn } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [needEmailInput, setNeedEmailInput] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    async function verifyLink() {
      const storedEmail = window.localStorage.getItem('emailForSignIn');
      if (!storedEmail) {
        setNeedEmailInput(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        await completeEmailLinkSignIn(storedEmail, window.location.href);
        setSuccess(true);
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1200);
      } catch (err) {
        console.error('Email link completion error:', err);
        setError(err.message || 'Could not complete sign-in with this link.');
      } finally {
        setLoading(false);
      }
    }

    verifyLink();
  }, [completeEmailLinkSignIn, navigate]);

  async function handleManualSubmit(e) {
    e.preventDefault();
    if (!emailInput.trim()) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await completeEmailLinkSignIn(emailInput.trim(), window.location.href);
      setSuccess(true);
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1200);
    } catch (err) {
      console.error('Email link completion error:', err);
      setError(err.message || 'Could not complete sign-in with this link.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors select-none ${
      isDark ? 'bg-[#06080d] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className={`w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border transition-all ${
        isDark ? 'bg-[#0a0e17]/95 border-cyan-500/20' : 'bg-white border-slate-200'
      }`}>
        {/* Header */}
        <div className="text-center space-y-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <Atom className="w-7 h-7 animate-spin [animation-duration:12s]" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif-editorial">Completing Passwordless Sign-In</h2>
            <p className="text-xs opacity-70 font-sans mt-1">
              Verifying your cryptographic sign-in token with ChemSpace Firebase Backend
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-8 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mx-auto" />
            <p className="text-xs font-mono text-cyan-400">Securing your laboratory session...</p>
          </div>
        )}

        {/* Success State */}
        {success && (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-emerald-400 font-mono">Sign-In Verified!</h3>
              <p className="text-xs opacity-70">Redirecting to your workspace...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Sign-In Link Expired or Invalid</span>
              <p className="opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Manual Email Input if opened on another browser/device */}
        {needEmailInput && !success && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono opacity-80 block">Confirm Your Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="scientist@institution.org"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-mono border focus:outline-none focus:border-cyan-400 transition ${
                    isDark ? 'bg-black/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <p className="text-[10px] opacity-60">
                You opened this link in a new browser window. Please confirm the email address you used to request the sign-in link.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <span>Complete Sign-In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Back to Login */}
        {error && (
          <button
            onClick={() => navigate('/login')}
            className="w-full mt-4 py-2.5 px-4 rounded-xl border border-white/20 hover:bg-white/5 text-xs font-mono transition"
          >
            ← Return to Sign-In Page
          </button>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 text-[10px] font-mono text-center opacity-50 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Protected by Firebase Authentication (Project chemistry1-e2723)</span>
        </div>
      </div>
    </div>
  );
}
