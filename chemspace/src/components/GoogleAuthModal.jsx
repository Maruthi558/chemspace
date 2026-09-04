import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function GoogleAuthModal({ onClose }) {
  const { theme } = useTheme();

  function handleGoogleLogin() {
    localStorage.setItem('chemspace_token', 'google_sso_oauth2_token_2026');
    localStorage.setItem('chemspace_user', JSON.stringify({ username: 'Dr. Scientist (Google)', email: 'researcher@gmail.com' }));
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="glass-panel w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-5 relative transition-colors duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 opacity-60 hover:opacity-100 p-1 rounded-lg">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto shadow-lg">
            <svg className="w-7 h-7" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z" />
            </svg>
          </div>

          <h3 className="text-lg font-black">Sign in with Google</h3>
          <p className="text-xs opacity-70 font-sans">Authenticate via Google SSO to access ChemNova cloud storage and RDKit laboratory workflows.</p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full btn-horizontal btn-primary text-xs font-bold py-3"
        >
          <span>Continue with Google Account</span>
        </button>
      </div>
    </div>
  );
}
