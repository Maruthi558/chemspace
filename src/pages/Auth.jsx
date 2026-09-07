import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Atom,
  Mail,
  Phone,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Building,
  ChevronDown,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import OtpInput from '../components/OtpInput';
import { setupRecaptcha } from '../services/firebase';

const COUNTRY_CODES = [
  { code: '+1', country: 'US/CA', flag: '🇺🇸' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+81', country: 'JP', flag: '🇯🇵' },
  { code: '+86', country: 'CN', flag: '🇨🇳' },
  { code: '+61', country: 'AU', flag: '🇦🇺' },
  { code: '+55', country: 'BR', flag: '🇧🇷' },
  { code: '+65', country: 'SG', flag: '🇸🇬' },
  { code: '+971', country: 'AE', flag: '🇦🇪' },
  { code: '+41', country: 'CH', flag: '🇨🇭' },
  { code: '+31', country: 'NL', flag: '🇳🇱' },
  { code: '+82', country: 'KR', flag: '🇰🇷' }
];

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    isAuthenticated,
    continueAsGuest,
    signUpWithEmail,
    signInWithEmail,
    resetPassword,
    sendEmailVerificationLink,
    sendPhoneOtp,
    verifyPhoneOtp,
    signInWithGoogle
  } = useAuth();

  // Target redirect destination
  const fromDestination = location.state?.from?.pathname || '/';

  // If already authenticated with an active session, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      navigate(fromDestination, { replace: true });
    }
  }, [isAuthenticated, navigate, fromDestination]);

  // View Mode: 'signin' | 'signup'
  const [viewMode, setViewMode] = useState(() => {
    return searchParams.get('mode') === 'signup' || location.pathname === '/register' ? 'signup' : 'signin';
  });

  // Auth Method: 'email' (password) | 'phone' (SMS) | 'magic_link' (passwordless)
  const [authMode, setAuthMode] = useState('email');

  // Step: 'input' | 'otp' | 'success'
  const [step, setStep] = useState('input');

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Password reset state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Magic link state
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // OTP inputs state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // States
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  const isValidPhone = (val) => {
    const digits = val.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
  };

  // ── 1. EMAIL / PASSWORD SIGN IN OR SIGN UP ─────────────────────────────────
  async function handleEmailPasswordSubmit(e) {
    if (e) e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setError('Please provide a valid institutional or personal email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (viewMode === 'signup' && (!fullName.trim() || fullName.trim().length < 2)) {
      setError('Please enter your full scientist name or title.');
      return;
    }

    setLoading(true);
    try {
      if (viewMode === 'signup') {
        await signUpWithEmail(cleanEmail, password, fullName.trim(), {
          name: fullName.trim(),
          workplace: workplace.trim() || 'ChemNova Research Institute',
          role: 'Lead Research Chemist'
        });
      } else {
        await signInWithEmail(cleanEmail, password);
      }
      setStep('success');
      setTimeout(() => {
        navigate(fromDestination, { replace: true });
      }, 700);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  }

  // ── 2. EMAIL MAGIC LINK (PASSWORDLESS) ──────────────────────────────────────
  async function handleSendMagicLink(e) {
    if (e) e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setError('Please enter a valid email address to receive your sign-in link.');
      return;
    }

    setLoading(true);
    try {
      await sendEmailVerificationLink(cleanEmail);
      setMagicLinkSent(true);
      setCooldown(60);
    } catch (err) {
      setError(err.message || 'Could not send verification link. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── 3. PHONE SMS OTP ────────────────────────────────────────────────────────
  async function handleSendPhoneSms(e) {
    if (e) e.preventDefault();
    setError('');

    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (!cleanDigits || !isValidPhone(cleanDigits)) {
      setError('Please enter a valid phone number (7 to 15 digits).');
      return;
    }

    const fullNumber = `${countryCode}${cleanDigits}`;
    setLoading(true);
    try {
      const verifier = setupRecaptcha('recaptcha-container');
      const confirmResult = await sendPhoneOtp(fullNumber, verifier);
      setConfirmationResult(confirmResult);
      setStep('otp');
      setCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
    } catch (err) {
      console.error('Phone Auth Error:', err);
      setError(err.message || 'Failed to send SMS verification code.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(codeToVerify) {
    const code = codeToVerify || otpDigits.join('');
    setError('');

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setError('Please enter the complete 6-digit code received via SMS.');
      return;
    }

    setLoading(true);
    try {
      const profilePayload = {
        name: fullName.trim() || 'Research Chemist',
        workplace: workplace.trim() || 'ChemNova Research Institute'
      };
      await verifyPhoneOtp(confirmationResult, code, profilePayload);
      setStep('success');
      setTimeout(() => {
        navigate(fromDestination, { replace: true });
      }, 700);
    } catch (err) {
      setError(err.message || 'Invalid verification code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── 4. FORGOT PASSWORD ──────────────────────────────────────────────────────
  async function handleForgotPasswordSubmit(e) {
    e.preventDefault();
    if (!forgotEmail.trim() || !isValidEmail(forgotEmail.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setForgotLoading(true);
    setError('');
    try {
      await resetPassword(forgotEmail.trim());
      setForgotSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setForgotLoading(false);
    }
  }

  // ── 5. GOOGLE SIGN-IN ───────────────────────────────────────────────────────
  async function handleGoogleLogin() {
    setError('');
    setGoogleLoading(true);
    try {
      const res = await signInWithGoogle({
        name: fullName.trim(),
        workplace: workplace.trim() || 'ChemNova Research Institute'
      });
      if (res) {
        setStep('success');
        setTimeout(() => {
          navigate(fromDestination, { replace: true });
        }, 700);
      }
    } catch (err) {
      setError(err.message || 'Google sign-in could not be completed.');
    } finally {
      setGoogleLoading(false);
    }
  }

  // ── 6. GUEST ACCESS ─────────────────────────────────────────────────────────
  function handleGuestAccess() {
    setGuestLoading(true);
    setError('');
    try {
      continueAsGuest(fullName.trim() || 'Guest Researcher');
      setGuestLoading(false);
      navigate(fromDestination, { replace: true });
    } catch {
      setError('Could not start guest session.');
      setGuestLoading(false);
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors relative select-none ${
      isDark ? 'bg-[#06080d] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Invisible reCAPTCHA container for Phone Auth */}
      <div id="recaptcha-container" className="hidden"></div>

      <div className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative border transition-all ${
        isDark ? 'bg-[#0a0e17]/95 border-cyan-500/20' : 'bg-white border-slate-200'
      }`}>
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-lg shadow-cyan-500/5">
            <Atom className="w-7 h-7 animate-spin [animation-duration:15s]" />
          </div>

          <div>
            <h2 className="text-2xl font-black font-serif-editorial tracking-tight">
              {viewMode === 'signup' ? 'Create Scientist Account' : 'Sign in to ChemSpace'}
            </h2>
            <p className="text-xs opacity-70 font-sans mt-0.5">
              Secure Laboratory Cloud • Project: <span className="font-mono text-cyan-400">chemistry1-e2723</span>
            </p>
          </div>

          {/* Mode Switcher: Sign In vs Sign Up */}
          <div className={`p-1 rounded-xl flex max-w-xs mx-auto border text-xs font-mono ${
            isDark ? 'bg-black/40 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => { setViewMode('signin'); setError(''); setStep('input'); }}
              className={`flex-1 py-1.5 rounded-lg font-bold transition ${
                viewMode === 'signin'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-inherit'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setViewMode('signup'); setError(''); setStep('input'); }}
              className={`flex-1 py-1.5 rounded-lg font-bold transition ${
                viewMode === 'signup'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-inherit'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">Authentication Notice</span>
              <p className="opacity-90 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Success State */}
        {step === 'success' && (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-emerald-400 font-mono">
                {viewMode === 'signup' ? 'Account Created & Session Verified!' : 'Authenticated Successfully!'}
              </h3>
              <p className="text-xs opacity-70">Entering ChemSpace laboratory workspace...</p>
            </div>
          </div>
        )}

        {/* ── STEP 1: INPUT CREDENTIALS ── */}
        {step === 'input' && (
          <div className="space-y-5">
            {/* Auth Method Selector Tabs */}
            <div className={`p-1 rounded-2xl flex border text-xs font-mono ${
              isDark ? 'bg-black/40 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => { setAuthMode('email'); setError(''); setMagicLinkSent(false); }}
                className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                  authMode === 'email'
                    ? (isDark ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30 shadow' : 'bg-white text-cyan-700 shadow')
                    : 'text-slate-400 hover:text-inherit'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email &amp; Password</span>
              </button>

              <button
                type="button"
                onClick={() => { setAuthMode('phone'); setError(''); }}
                className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                  authMode === 'phone'
                    ? (isDark ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30 shadow' : 'bg-white text-cyan-700 shadow')
                    : 'text-slate-400 hover:text-inherit'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Phone SMS</span>
              </button>

              <button
                type="button"
                onClick={() => { setAuthMode('magic_link'); setError(''); }}
                className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                  authMode === 'magic_link'
                    ? (isDark ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30 shadow' : 'bg-white text-cyan-700 shadow')
                    : 'text-slate-400 hover:text-inherit'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Email Link</span>
              </button>
            </div>

            {/* TAB 1: EMAIL & PASSWORD */}
            {authMode === 'email' && (
              <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
                {viewMode === 'signup' && (
                  <div className="space-y-3 animate-in fade-in duration-150">
                    <div>
                      <label className="text-[11px] font-mono opacity-80 block mb-1">Scientist Full Name / Title</label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Dr. Maruthi Chemist"
                          className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-mono border focus:outline-none focus:border-cyan-400 transition ${
                            isDark ? 'bg-black/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-mono opacity-80 block mb-1">Research Institution / Workplace</label>
                      <div className="relative">
                        <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                        <input
                          type="text"
                          value={workplace}
                          onChange={(e) => setWorkplace(e.target.value)}
                          placeholder="ChemNova Advanced Institute"
                          className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-mono border focus:outline-none focus:border-cyan-400 transition ${
                            isDark ? 'bg-black/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-mono opacity-80 block mb-1">Institutional or Personal Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="scientist@chemnova.org"
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-mono border focus:outline-none focus:border-cyan-400 transition ${
                        isDark ? 'bg-black/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono opacity-80">Password (min. 6 characters)</label>
                    {viewMode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => { setShowForgotModal(true); setForgotEmail(email); }}
                        className="text-[10px] font-mono text-cyan-400 hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-9 pr-9 py-2.5 rounded-xl text-xs font-mono border focus:outline-none focus:border-cyan-400 transition ${
                        isDark ? 'bg-black/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating with Firebase...</span>
                    </>
                  ) : (
                    <>
                      <span>{viewMode === 'signup' ? 'Create Account & Enter Lab' : 'Sign In with Email'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: PHONE SMS OTP */}
            {authMode === 'phone' && (
              <form onSubmit={handleSendPhoneSms} className="space-y-4">
                {viewMode === 'signup' && (
                  <div>
                    <label className="text-[11px] font-mono opacity-80 block mb-1">Scientist Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Dr. Maruthi Chemist"
                        className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-mono border focus:outline-none focus:border-cyan-400 transition ${
                          isDark ? 'bg-black/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-mono opacity-80 block mb-1">Mobile Phone Number</label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className={`py-2.5 px-2.5 rounded-xl text-xs font-mono border focus:outline-none focus:border-cyan-400 transition ${
                        isDark ? 'bg-black/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>

                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="9876543210"
                        className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-mono border focus:outline-none focus:border-cyan-400 transition ${
                          isDark ? 'bg-black/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                  <p className="text-[10px] opacity-60 mt-1">
                    An SMS with a 6-digit verification code will be sent via Firebase Phone Auth.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Initializing reCAPTCHA &amp; Sending SMS...</span>
                    </>
                  ) : (
                    <>
                      <span>Send 6-Digit SMS Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 3: PASSWORDLESS EMAIL LINK */}
            {authMode === 'magic_link' && (
              <div className="space-y-4">
                {magicLinkSent ? (
                  <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 space-y-3">
                    <div className="flex items-center gap-2 font-mono font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      <span>Magic Link Dispatched!</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      We sent a secure sign-in link to <strong className="text-cyan-300 font-mono">{email}</strong>. Open your email inbox and click the link to automatically log into ChemSpace.
                    </p>
                    <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                      <button
                        type="button"
                        onClick={() => setMagicLinkSent(false)}
                        className="text-slate-400 hover:text-white underline"
                      >
                        Change email
                      </button>
                      {cooldown > 0 ? (
                        <span className="opacity-60">Resend in {cooldown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendMagicLink}
                          disabled={loading}
                          className="font-bold underline text-cyan-400"
                        >
                          Resend link
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSendMagicLink} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-mono opacity-80 block mb-1">Your Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="scientist@institution.org"
                          className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-mono border focus:outline-none focus:border-cyan-400 transition ${
                            isDark ? 'bg-black/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <p className="text-[10px] opacity-60 mt-1">
                        No password needed! We will email you a 1-click passwordless sign-in link.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.99] disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending Magic Link...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Passwordless Sign-In Link</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-white/10" />
              <span className={`px-3 text-[10px] font-mono uppercase tracking-wider absolute ${
                isDark ? 'bg-[#0a0e17] text-slate-500' : 'bg-white text-slate-400'
              }`}>
                or continue with
              </span>
            </div>

            {/* Google Single Sign-On Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-3 transition shadow-lg border ${
                isDark
                  ? 'bg-white hover:bg-slate-100 text-slate-900 border-transparent shadow-cyan-500/5'
                  : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 shadow-sm'
              }`}
            >
              {googleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
                  <span>Connecting to Google SSO...</span>
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

            {/* Quick Guest Exploration Button */}
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={handleGuestAccess}
                disabled={guestLoading}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition underline"
              >
                {guestLoading ? 'Starting guest preview...' : '⚡ Explore ChemSpace as Guest Researcher'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: PHONE OTP VERIFICATION ── */}
        {step === 'otp' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold font-mono">Verify 6-Digit SMS Code</h3>
              <p className="text-xs opacity-70">
                Sent to: <strong className="text-cyan-400">{countryCode} {phoneNumber}</strong>
              </p>
            </div>

            <div className="py-2">
              <OtpInput
                digits={otpDigits}
                onChange={setOtpDigits}
                onComplete={handleVerifyOtp}
                disabled={loading}
              />
            </div>

            <button
              type="button"
              onClick={() => handleVerifyOtp()}
              disabled={loading || otpDigits.join('').length !== 6}
              className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying SMS Code...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Code &amp; Enter Platform</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs font-mono pt-1">
              <button
                type="button"
                onClick={() => { setStep('input'); setOtpDigits(['', '', '', '', '', '']); }}
                className="text-slate-400 hover:text-white underline"
              >
                ← Back
              </button>

              {cooldown > 0 ? (
                <span className="text-slate-400 text-[11px]">Resend code in {cooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendPhoneSms}
                  disabled={loading}
                  className="font-bold underline text-cyan-400 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend SMS Code</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 border-t border-white/10 text-[10px] font-mono text-center opacity-60 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Firebase Auth &amp; Firestore • Protected Lab Environment</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 border ${
            isDark ? 'bg-[#0a0e17] border-cyan-500/30 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <span>Reset Password</span>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-xs opacity-60 hover:opacity-100"
              >
                ✕
              </button>
            </div>

            {forgotSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs space-y-2">
                <p>Password reset link sent to <strong>{forgotEmail}</strong>. Check your inbox to choose a new password.</p>
                <button
                  type="button"
                  onClick={() => { setShowForgotModal(false); setForgotSuccess(false); }}
                  className="w-full py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <p className="text-xs opacity-70">
                  Enter the email associated with your ChemSpace account to receive a secure reset link.
                </p>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="scientist@lab.org"
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none focus:border-cyan-400 ${
                    isDark ? 'bg-black/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Reset Email</span>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
