import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginUser, registerUser } from '../services/api';
import { Atom, Lock, Mail, User, ArrowRight } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = location.pathname === '/register';
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('chemspace_token')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = isRegister
        ? await registerUser(form.username, form.email, form.password)
        : await loginUser(form.username, form.password);

      localStorage.setItem('chemspace_token', payload.token || 'demo_token');
      localStorage.setItem('chemspace_user', JSON.stringify(payload.user || { username: form.username }));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    localStorage.setItem('chemspace_token', 'google_sso_token_2026');
    localStorage.setItem('chemspace_user', JSON.stringify({ username: 'Dr. Scientist (Google)', email: 'researcher@gmail.com' }));
    navigate('/dashboard');
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Logo Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 p-0.5 shadow-lg shadow-cyan-500/25 mx-auto">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Atom className="w-7 h-7 text-cyan-400 animate-spin-slow" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-100">
            {isRegister ? 'Create ChemNova Account' : 'Sign in to ChemNova'}
          </h2>
          <p className="text-xs text-slate-400">
            {isRegister ? 'Register to access 3D labs, ML models, and the ChemNova workspace.' : 'Enter credentials or sign in with Google.'}
          </p>
        </div>

        {/* Google SSO Button */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl shadow-md flex items-center justify-center gap-3 text-xs transition"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z" />
            <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z" />
          </svg>
          <span>Sign in with Google</span>
        </button>

        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
          <div className="flex-1 h-px bg-slate-800" />
          <span>OR WITH EMAIL</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs font-mono">
          {isRegister && (
            <>
              <div>
                <label className="text-slate-400 block mb-1">Username:</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) => updateField('username', e.target.value)}
                    placeholder="dr_curie"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Email Address:</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="researcher@lab.org"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {!isRegister && (
            <div>
              <label className="text-slate-400 block mb-1">Username or Email:</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => updateField('username', e.target.value)}
                  placeholder="Username or email"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-400 block mb-1">Password:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs font-mono">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-black rounded-xl shadow-lg flex items-center justify-center gap-2 transition text-xs"
          >
            <span>{loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In with Email'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          {isRegister ? 'Already registered?' : 'Need an account?'}{' '}
          <Link to={isRegister ? '/login' : '/register'} className="text-cyan-400 font-bold hover:underline">
            {isRegister ? 'Sign in' : 'Create account'}
          </Link>
        </p>
      </div>
    </div>
  );
}
