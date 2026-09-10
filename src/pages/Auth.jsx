import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Atom,
  Mail,
  Phone,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Building,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Send,
  ChevronLeft,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import OtpInput from '../components/OtpInput';
import { setupRecaptcha, clearRecaptcha } from '../services/firebase';

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
    signUpWithEmail,
    signInWithEmail,
    resetPassword,
    sendEmailOtp,
    verifyEmailOtp,
    sendEmailVerificationLink,
    sendPhoneOtp,
    verifyPhoneOtp,
    signInWithGoogle,
    resetRecaptcha
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

  // Auth Method: 'password' | 'email_otp' | 'phone_otp' | 'email_link'
  const [authMethod, setAuthMethod] = useState('password');

  // Step: 'input' | 'verify_otp' | 'success'
  const [step, setStep] = useState('input');

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Password reset modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  // Email magic link state
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // OTP inputs state (for both Email OTP and Phone SMS)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpTargetType, setOtpTargetType] = useState('phone'); // 'phone' | 'email'

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Clean up reCAPTCHA verifier on unmount
  useEffect(() => {
    return () => {
      clearRecaptcha('recaptcha-container');
    };
  }, []);

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

  // ── 1. EMAIL & PASSWORD SUBMIT ──────────────────────────────────────────────
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
      setError('Please enter your scientist name or title.');
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
      }, 600);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  }

  // ── 2. REAL EMAIL OTP ───────────────────────────────────────────────────────
  async function handleSendEmailOtpSubmit(e) {
    if (e) e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setError('Please enter a valid email address to receive your verification code.');
      return;
    }

    setLoading(true);
    try {
      await sendEmailOtp(cleanEmail);
      setOtpTargetType('email');
      setStep('verify_otp');
      setCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
    } catch (err) {
      setError(err.message || 'Could not send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyEmailOtpSubmit(codeToVerify) {
    const code = codeToVerify || otpDigits.join('');
    setError('');

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setError('Please enter the 6-digit numeric verification code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      await verifyEmailOtp(email.trim().toLowerCase(), code, {
        name: fullName.trim(),
        workplace: workplace.trim() || 'ChemNova Research Institute'
      });
      setStep('success');
      setTimeout(() => {
        navigate(fromDestination, { replace: true });
      }, 600);
    } catch (err) {
      setError(err.message || 'Verification code invalid or expired. Please check and try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── 3. REAL PHONE SMS OTP ───────────────────────────────────────────────────
  async function handleSendPhoneSms(e) {
    if (e) e.preventDefault();
    setError('');

    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (!cleanDigits || !isValidPhone(cleanDigits)) {
      setError('Please enter a valid mobile phone number (7 to 15 digits).');
      return;
    }

    const fullNumber = `${countryCode}${cleanDigits}`;
    setLoading(true);
    try {
      // Re-use or initialize single verified instance without duplicate DOM clash
      const verifier = setupRecaptcha('recaptcha-container');
      const confirmResult = await sendPhoneOtp(fullNumber, verifier);
      setConfirmationResult(confirmResult);
      setOtpTargetType('phone');
      setStep('verify_otp');
      setCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
    } catch (err) {
      console.error('Phone Auth Error:', err);
      setError(err.message || 'Failed to dispatch SMS verification code.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyPhoneOtpSubmit(codeToVerify) {
    const code = codeToVerify || otpDigits.join('');
    setError('');

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setError('Please enter the complete 6-digit SMS code.');
      return;
    }

    if (!confirmationResult) {
      setError('SMS session has expired. Please request a new verification code.');
      setStep('input');
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
      }, 600);
    } catch (err) {
      setError(err.message || 'Invalid SMS verification code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  }

  // Unified OTP verification trigger
  function handleGenericVerifyOtp(codeToVerify) {
    if (otpTargetType === 'email') {
      handleVerifyEmailOtpSubmit(codeToVerify);
    } else {
      handleVerifyPhoneOtpSubmit(codeToVerify);
    }
  }

  // ── 4. EMAIL MAGIC LINK (PASSWORDLESS) ──────────────────────────────────────
  async function handleSendMagicLink(e) {
    if (e) e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setError('Please enter a valid email address.');
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

  // ── 5. GOOGLE SINGLE SIGN-ON ────────────────────────────────────────────────
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
        }, 600);
      }
    } catch (err) {
      setError(err.message || 'Google sign-in could not be completed.');
    } finally {
      setGoogleLoading(false);
    }
  }

  // ── 6. FORGOT PASSWORD ──────────────────────────────────────────────────────
  async function handleForgotPasswordSubmit(e) {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail.trim() || !isValidEmail(forgotEmail.trim())) {
      setForgotError('Please enter a valid email address.');
      return;
    }

    setForgotLoading(true);
    try {
      await resetPassword(forgotEmail.trim());
      setForgotSuccess(true);
      setForgotError('');
    } catch (err) {
      setForgotError(err.message || 'Failed to send reset link. Please check the email and try again.');
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 transition-colors relative select-none ${
      isDark ? 'bg-[#090a0f] text-slate-100' : 'bg-[#f6f8fa] text-slate-900'
    }`}>
      {/* Invisible reCAPTCHA container for Phone Auth */}
      <div id="recaptcha-container" className="hidden"></div>

      {/* Main Authentication Card */}
      <div className={`w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl border transition-all space-y-6 ${
        isDark ? 'bg-[#111319] border-white/10' : 'bg-white border-slate-200 shadow-slate-200/60'
      }`}>
        {/* Top Header */}
        <div className="text-center space-y-2.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center mx-auto">
            <Atom className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              {viewMode === 'signup' ? 'Create Research Account' : 'Sign In to ChemSpace'}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Secure Laboratory Cloud • Project: <span className="font-mono text-emerald-400">chemistry1-e2723</span>
            </p>
          </div>

          {/* Mode Switcher: Sign In vs Create Account */}
          <div className={`p-1 rounded-xl flex max-w-xs mx-auto border text-xs font-mono ${
            isDark ? 'bg-black/40 border-white/10' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => { setViewMode('signin'); setError(''); setStep('input'); }}
              className={`flex-1 py-1.5 rounded-lg font-bold transition ${
                viewMode === 'signin'
                  ? (isDark ? 'bg-white text-slate-950 shadow-sm' : 'bg-slate-900 text-white shadow-sm')
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setViewMode('signup'); setError(''); setStep('input'); }}
              className={`flex-1 py-1.5 rounded-lg font-bold transition ${
                viewMode === 'signup'
                  ? (isDark ? 'bg-white text-slate-950 shadow-sm' : 'bg-slate-900 text-white shadow-sm')
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">Notice</span>
              <p className="opacity-90 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* ── SUCCESS STATE ── */}
        {step === 'success' && (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-emerald-400 font-mono">
                {viewMode === 'signup' ? 'Account Created & Verified' : 'Authentication Successful'}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">Entering ChemSpace laboratory workspace...</p>
            </div>
          </div>
        )}

        {/* ── STEP 1: INPUT CREDENTIALS ── */}
        {step === 'input' && (
          <div className="space-y-5">
            {/* Auth Method Selector Tabs */}
            <div className={`p-1 rounded-xl grid grid-cols-3 border text-xs font-mono ${
              isDark ? 'bg-black/30 border-white/10' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => { setAuthMethod('password'); setError(''); setMagicLinkSent(false); }}
                className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition ${
                  authMethod === 'password'
                    ? (isDark ? 'bg-white/15 text-white border border-white/20 shadow-sm' : 'bg-white text-slate-950 shadow-sm')
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Password</span>
              </button>

              <button
                type="button"
                onClick={() => { setAuthMethod('email_otp'); setError(''); }}
                className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition ${
                  authMethod === 'email_otp'
                    ? (isDark ? 'bg-white/15 text-white border border-white/20 shadow-sm' : 'bg-white text-slate-950 shadow-sm')
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email OTP</span>
              </button>

              <button
                type="button"
                onClick={() => { setAuthMethod('phone_otp'); setError(''); }}
                className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition ${
                  authMethod === 'phone_otp'
                    ? (isDark ? 'bg-white/15 text-white border border-white/20 shadow-sm' : 'bg-white text-slate-950 shadow-sm')
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phone SMS</span>
              </button>
            </div>

            {/* METHOD 1: EMAIL & PASSWORD */}
            {authMethod === 'password' && (
              <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
                {viewMode === 'signup' && (
                  <div className="space-y-3 animate-in fade-in duration-150">
                    <div>
                      <label className="text-[11px] font-mono text-[var(--text-secondary)] block mb-1">
                        Scientist Full Name / Title
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Dr. Maruthi Chemist"
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-[var(--text-primary)] transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-[var(--text-secondary)] block mb-1">
                        Research Institution / Workplace
                      </label>
                      <div className="relative">
                        <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                        <input
                          type="text"
                          value={workplace}
                          onChange={(e) => setWorkplace(e.target.value)}
                          placeholder="ChemNova Advanced Institute"
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-[var(--text-primary)] transition"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-mono text-[var(--text-secondary)] block mb-1">
                    Institutional / Personal Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="scientist@chemnova.org"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-[var(--text-primary)] transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-[var(--text-secondary)]">Password</label>
                    {viewMode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => { setShowForgotModal(true); setForgotEmail(email); }}
                        className="text-[10px] font-mono text-emerald-400 hover:underline"
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
                      className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-[var(--text-primary)] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl btn-primary text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>{viewMode === 'signup' ? 'Create Account' : 'Sign In'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* METHOD 2: REAL EMAIL OTP */}
            {authMethod === 'email_otp' && (
              <form onSubmit={handleSendEmailOtpSubmit} className="space-y-4">
                {viewMode === 'signup' && (
                  <div>
                    <label className="text-[11px] font-mono text-[var(--text-secondary)] block mb-1">
                      Scientist Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Dr. Maruthi Chemist"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-[var(--text-primary)] transition"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-mono text-[var(--text-secondary)] block mb-1">
                    Email Address to Receive 6-Digit Code
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="scientist@chemnova.org"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-[var(--text-primary)] transition"
                    />
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    A secure 6-digit verification code will be generated and dispatched to your email inbox.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl btn-primary text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send 6-Digit Email Code</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* METHOD 3: REAL PHONE SMS OTP */}
            {authMethod === 'phone_otp' && (
              <form onSubmit={handleSendPhoneSms} className="space-y-4">
                {viewMode === 'signup' && (
                  <div>
                    <label className="text-[11px] font-mono text-[var(--text-secondary)] block mb-1">
                      Scientist Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Dr. Maruthi Chemist"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-[var(--text-primary)] transition"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-mono text-[var(--text-secondary)] block mb-1">
                    Mobile Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="py-2 px-2.5 rounded-xl text-xs font-mono bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:outline-none focus:border-emerald-500 text-[var(--text-primary)] transition"
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
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-[var(--text-primary)] transition"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    An SMS with a 6-digit code will be sent via Firebase Phone Authentication.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl btn-primary text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending SMS Code...</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Send 6-Digit SMS Code</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative flex items-center justify-center pt-1">
              <div className="w-full border-t border-[var(--border-subtle)]" />
              <span className={`px-2.5 text-[10px] font-mono uppercase tracking-wider absolute ${
                isDark ? 'bg-[#111319] text-slate-500' : 'bg-white text-slate-400'
              }`}>
                or continue with
              </span>
            </div>

            {/* Google Single Sign-On Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 transition border ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-sm'
              }`}
            >
              {googleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
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

            {/* Create New Account / Sign In switcher prompt */}
            <div className="pt-2 text-center text-xs text-[var(--text-secondary)]">
              {viewMode === 'signin' ? (
                <div>
                  <span>Need an account? </span>
                  <button
                    type="button"
                    onClick={() => { setViewMode('signup'); setError(''); setStep('input'); }}
                    className="font-bold text-emerald-500 hover:text-emerald-400 underline transition cursor-pointer"
                  >
                    Create New Account
                  </button>
                </div>
              ) : (
                <div>
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => { setViewMode('signin'); setError(''); setStep('input'); }}
                    className="font-bold text-emerald-500 hover:text-emerald-400 underline transition cursor-pointer"
                  >
                    Sign In to Existing Account
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 2: OTP VERIFICATION (EMAIL OR PHONE) ── */}
        {step === 'verify_otp' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="text-center space-y-1">
              <h2 className="text-sm font-bold font-mono text-[var(--text-primary)]">
                {otpTargetType === 'email' ? 'Enter 6-Digit Email Verification Code' : 'Enter 6-Digit SMS Code'}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Sent to:{' '}
                <strong className="text-emerald-400 font-mono">
                  {otpTargetType === 'email' ? email : `${countryCode} ${phoneNumber}`}
                </strong>
              </p>
            </div>

            <div className="py-2">
              <OtpInput
                digits={otpDigits}
                onChange={setOtpDigits}
                onComplete={handleGenericVerifyOtp}
                disabled={loading}
              />
            </div>

            <button
              type="button"
              onClick={() => handleGenericVerifyOtp()}
              disabled={loading || otpDigits.join('').length !== 6}
              className="w-full py-2.5 px-4 rounded-xl btn-primary text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
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
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] underline flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              {cooldown > 0 ? (
                <span className="text-[var(--text-muted)] text-[11px]">Resend in {cooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={otpTargetType === 'email' ? handleSendEmailOtpSubmit : handleSendPhoneSms}
                  disabled={loading}
                  className="font-bold underline text-emerald-400 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend Code</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 border-t border-[var(--border-subtle)] text-[10px] font-mono text-center text-[var(--text-muted)] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Firebase &amp; Firestore Encrypted Session</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4 border ${
            isDark ? 'bg-[#111319] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span>Reset Password</span>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
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
                  className="w-full py-1.5 rounded-lg btn-primary text-xs font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <p className="text-xs text-[var(--text-secondary)]">
                  Enter the email associated with your ChemSpace account to receive a secure reset link.
                </p>
                {forgotError && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="scientist@chemnova.org"
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:outline-none focus:border-emerald-500 text-[var(--text-primary)]"
                />
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2 px-3 rounded-xl btn-primary text-xs font-bold transition flex items-center justify-center gap-1.5"
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
