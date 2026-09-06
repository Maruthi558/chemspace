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
  Compass,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import OtpInput from '../components/OtpInput';
import { setupRecaptchaVerifier } from '../services/firebase';

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
    sendEmailOtp,
    verifyEmailOtp,
    sendPhoneOtp,
    verifyPhoneOtp,
    signInWithGoogle
  } = useAuth();

  // Target redirect destination
  const fromDestination = location.state?.from?.pathname || '/';

  // If already authenticated with a permanent active session, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      navigate(fromDestination, { replace: true });
    }
  }, [isAuthenticated, navigate, fromDestination]);

  // View Mode: 'signin' | 'signup'
  const [viewMode, setViewMode] = useState(() => {
    return searchParams.get('mode') === 'signup' || location.pathname === '/register' ? 'signup' : 'signin';
  });

  // Auth Method: 'email' | 'phone'
  const [authMode, setAuthMode] = useState('email');

  // Step: 'input' | 'otp' | 'success'
  const [step, setStep] = useState('input');

  // Create account metadata
  const [fullName, setFullName] = useState('');
  const [workplace, setWorkplace] = useState('');

  // Form inputs
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');

  // OTP inputs state (6 array elements)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // States
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const recaptchaContainerRef = useRef(null);

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

  // Email format validation helper
  const isValidEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  // Phone number validation helper
  const isValidPhone = (val) => {
    const digits = val.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
  };

  // Masking helper for verification display
  const getMaskedTarget = () => {
    if (authMode === 'email') {
      const parts = email.trim().split('@');
      if (parts.length < 2) return email;
      const user = parts[0];
      const domain = parts[1];
      const maskedUser = user.length <= 2 ? user + '***' : user.slice(0, 2) + '•••' + user.slice(-1);
      return `${maskedUser}@${domain}`;
    } else {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const last4 = cleanPhone.slice(-4);
      return `${countryCode} •••• ••${last4}`;
    }
  };

  // ── 1. SEND OTP ACTION ───────────────────────────────────────────────────────
  async function handleSendOtp(e) {
    if (e) e.preventDefault();
    setError('');

    if (viewMode === 'signup' && !fullName.trim()) {
      setError('Please enter your full name or scientist title.');
      return;
    }

    if (authMode === 'email') {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) {
        setError('Please enter your email address.');
        return;
      }
      if (!isValidEmail(cleanEmail)) {
        setError('Please enter a valid email address.');
        return;
      }

      setLoading(true);
      try {
        await sendEmailOtp(cleanEmail);
        setStep('otp');
        setCooldown(60);
        setOtpDigits(['', '', '', '', '', '']);
      } catch (err) {
        setError(err.message || 'Failed to send verification code. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // Mobile Phone Mode
      const cleanDigits = phoneNumber.replace(/\D/g, '');
      if (!cleanDigits) {
        setError('Please enter your mobile phone number.');
        return;
      }
      if (!isValidPhone(cleanDigits)) {
        setError('Please enter a valid phone number with 7 to 15 digits.');
        return;
      }

      const fullNumber = `${countryCode}${cleanDigits}`;
      setLoading(true);
      try {
        const verifier = setupRecaptchaVerifier('recaptcha-container');
        const confirmResult = await sendPhoneOtp(fullNumber, verifier);
        setConfirmationResult(confirmResult);
        setStep('otp');
        setCooldown(60);
        setOtpDigits(['', '', '', '', '', '']);
      } catch (err) {
        setError(err.message || 'Failed to send SMS verification code.');
      } finally {
        setLoading(false);
      }
    }
  }

  // ── 2. VERIFY OTP ACTION ─────────────────────────────────────────────────────
  async function handleVerifyOtp(codeToVerify) {
    const code = codeToVerify || otpDigits.join('');
    setError('');

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    const profilePayload = {
      name: fullName.trim(),
      workplace: workplace.trim() || 'ChemSpace Research Institute',
      role: 'Research Scientist'
    };

    setLoading(true);
    try {
      if (authMode === 'email') {
        await verifyEmailOtp(email.trim().toLowerCase(), code, profilePayload);
      } else {
        const phoneTarget = confirmationResult || `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
        await verifyPhoneOtp(phoneTarget, code, profilePayload);
      }

      setStep('success');
      setTimeout(() => {
        navigate(fromDestination, { replace: true });
      }, 500);
    } catch (err) {
      setError(err.message || 'Verification code could not be confirmed. Please check and try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── 3. GOOGLE SSO ACTION ────────────────────────────────────────────────────
  async function handleGoogleLogin() {
    setError('');
    setGoogleLoading(true);
    const profilePayload = {
      name: fullName.trim(),
      workplace: workplace.trim() || 'ChemSpace Research Institute'
    };
    try {
      await signInWithGoogle(profilePayload);
      setStep('success');
      setTimeout(() => {
        navigate(fromDestination, { replace: true });
      }, 500);
    } catch (err) {
      setError(err.message || 'This account could not be authenticated right now. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  }

  // ── 4. GUEST LOGIN ACTION ───────────────────────────────────────────────────
  function handleGuestAccess() {
    setGuestLoading(true);
    setError('');
    setTimeout(() => {
      continueAsGuest(fullName.trim() || 'Guest Researcher');
      setGuestLoading(false);
      navigate(fromDestination, { replace: true });
    }, 300);
  }

  // Edit contact method (step back)
  function handleEditContact() {
    setError('');
    setStep('input');
    setOtpDigits(['', '', '', '', '', '']);
  }

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 select-none font-sans relative overflow-hidden transition-colors duration-200 ${
        isDark ? 'bg-[#08080a] text-white' : 'bg-[#f8f9fa] text-neutral-900'
      }`}
    >
      {/* Subtle Metallic Grid Pattern Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] bg-[radial-gradient(#888_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Invisible reCAPTCHA container for Phone Auth */}
      <div id="recaptcha-container" ref={recaptchaContainerRef} className="invisible absolute" />

      {/* Main Authentication Card - Premium Monochrome System */}
      <div
        className={`w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative transition-all border backdrop-blur-xl ${
          isDark
            ? 'bg-[#111114]/95 border-neutral-800 text-white shadow-black/80'
            : 'bg-white/95 border-neutral-200 text-neutral-900 shadow-neutral-300/40'
        }`}
      >
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div
            className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border shadow-sm transition-transform duration-300 hover:scale-105 ${
              isDark
                ? 'bg-white text-black border-neutral-300'
                : 'bg-black text-white border-neutral-800'
            }`}
          >
            <Atom className="w-7 h-7 stroke-[1.75]" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-xl font-black tracking-widest uppercase font-sans">
                CHEMSPACE
              </h1>
              <span
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                  isDark
                    ? 'bg-neutral-900 text-neutral-300 border-neutral-700'
                    : 'bg-neutral-100 text-neutral-700 border-neutral-300'
                }`}
              >
                {viewMode === 'signup' ? 'REGISTER' : 'SECURE'}
              </span>
            </div>
            <p className={`text-xs font-mono ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {viewMode === 'signup'
                ? 'Create Verified Scientist Profile & Workspace'
                : 'Verified Scientific Identity & Platform Access'}
            </p>
          </div>
        </div>

        {/* Sign In vs Create Account Toggle Tabs */}
        {step === 'input' && (
          <div className="grid grid-cols-2 p-1 rounded-2xl border text-xs font-bold font-sans transition-all ${
            isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-100 border-neutral-200'
          }">
            <button
              type="button"
              onClick={() => {
                setViewMode('signin');
                setError('');
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer text-center ${
                viewMode === 'signin'
                  ? isDark
                    ? 'bg-white text-black shadow-sm'
                    : 'bg-black text-white shadow-sm'
                  : isDark
                  ? 'text-neutral-400 hover:text-white'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('signup');
                setError('');
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer text-center ${
                viewMode === 'signup'
                  ? isDark
                    ? 'bg-white text-black shadow-sm'
                    : 'bg-black text-white shadow-sm'
                  : isDark
                  ? 'text-neutral-400 hover:text-white'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* ── STEP 1: INPUT CREDENTIALS ── */}
        {step === 'input' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Auth Method Selector Pills (Email vs Mobile) */}
            <div
              className={`p-1 rounded-2xl flex items-center border ${
                isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-100/80 border-neutral-200'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setAuthMode('email');
                  setError('');
                }}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authMode === 'email'
                    ? isDark
                      ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                      : 'bg-white text-neutral-900 border border-neutral-300 shadow-sm'
                    : isDark
                    ? 'text-neutral-400 hover:text-white'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email OTP</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('phone');
                  setError('');
                }}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authMode === 'phone'
                    ? isDark
                      ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                      : 'bg-white text-neutral-900 border border-neutral-300 shadow-sm'
                    : isDark
                    ? 'text-neutral-400 hover:text-white'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Mobile OTP</span>
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendOtp} className="space-y-3">
              {/* Optional Registration Fields */}
              {viewMode === 'signup' && (
                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label
                      className={`text-[11px] font-mono block ${
                        isDark ? 'text-neutral-300' : 'text-neutral-700'
                      }`}
                    >
                      Full Name / Scientist Title:
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Dr. Maruthi Chemist"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-mono border transition-all outline-none ${
                          isDark
                            ? 'bg-neutral-900/80 border-neutral-800 text-white focus:border-neutral-400'
                            : 'bg-white border-neutral-300 text-neutral-900 focus:border-neutral-600'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label
                      className={`text-[11px] font-mono block ${
                        isDark ? 'text-neutral-300' : 'text-neutral-700'
                      }`}
                    >
                      Workplace / Institution (Optional):
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={workplace}
                        onChange={(e) => setWorkplace(e.target.value)}
                        placeholder="ChemSpace Research Institute"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-mono border transition-all outline-none ${
                          isDark
                            ? 'bg-neutral-900/80 border-neutral-800 text-white focus:border-neutral-400'
                            : 'bg-white border-neutral-300 text-neutral-900 focus:border-neutral-600'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {authMode === 'email' ? (
                <div className="space-y-1">
                  <label
                    className={`text-[11px] font-mono block ${
                      isDark ? 'text-neutral-300' : 'text-neutral-700'
                    }`}
                  >
                    Institutional / Academic Email:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      autoFocus={viewMode === 'signin'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="scientist@lab.org"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-mono border transition-all outline-none ${
                        isDark
                          ? 'bg-neutral-900/80 border-neutral-800 text-white focus:border-neutral-400'
                          : 'bg-white border-neutral-300 text-neutral-900 focus:border-neutral-600'
                      }`}
                    />
                  </div>
                  <p
                    className={`text-[10px] font-mono ${
                      isDark ? 'text-neutral-500' : 'text-neutral-400'
                    }`}
                  >
                    A real 6-digit verification code will be sent to your email.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <label
                    className={`text-[11px] font-mono block ${
                      isDark ? 'text-neutral-300' : 'text-neutral-700'
                    }`}
                  >
                    Mobile Phone Number:
                  </label>
                  <div className="flex gap-2">
                    {/* Country Code Dropdown */}
                    <div className="relative shrink-0">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className={`h-full pl-3 pr-7 py-2.5 rounded-xl text-xs font-mono font-bold border transition-all outline-none appearance-none cursor-pointer ${
                          isDark
                            ? 'bg-neutral-900/80 border-neutral-800 text-white focus:border-neutral-400'
                            : 'bg-white border-neutral-300 text-neutral-900 focus:border-neutral-600'
                        }`}
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option
                            key={`${c.code}-${c.country}`}
                            value={c.code}
                            className={isDark ? 'bg-neutral-900 text-white' : 'bg-white text-black'}
                          >
                            {c.flag} {c.code} ({c.country})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2 top-3 pointer-events-none" />
                    </div>

                    {/* Phone Number Input */}
                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        required
                        autoFocus={viewMode === 'signin'}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d\s-]/g, ''))}
                        placeholder="98765 43210"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-mono border transition-all outline-none ${
                          isDark
                            ? 'bg-neutral-900/80 border-neutral-800 text-white focus:border-neutral-400'
                            : 'bg-white border-neutral-300 text-neutral-900 focus:border-neutral-600'
                        }`}
                      />
                    </div>
                  </div>
                  <p
                    className={`text-[10px] font-mono ${
                      isDark ? 'text-neutral-500' : 'text-neutral-400'
                    }`}
                  >
                    An SMS with your 6-digit verification code will be sent.
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-xl bg-neutral-900/40 border border-rose-500/40 text-rose-400 text-xs flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-mono text-[11px] leading-relaxed">{error}</span>
                </div>
              )}

              {/* Primary Submit Button - Monochrome */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition text-xs uppercase tracking-wider active:scale-[0.99] disabled:opacity-50 cursor-pointer ${
                  isDark
                    ? 'bg-white text-black hover:bg-neutral-200 shadow-white/10'
                    : 'bg-black text-white hover:bg-neutral-800 shadow-black/10'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching Verification Code...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {viewMode === 'signup' ? 'Create Account & Send Code' : 'Send Verification Code'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 font-mono text-[10px] text-neutral-400 pt-1">
              <div className={`flex-1 h-px ${isDark ? 'bg-neutral-800' : 'bg-neutral-200'}`} />
              <span>OR OTHER OPTIONS</span>
              <div className={`flex-1 h-px ${isDark ? 'bg-neutral-800' : 'bg-neutral-200'}`} />
            </div>

            {/* Google SSO Button - Clean Monochrome Card */}
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading || guestLoading}
              type="button"
              className={`w-full py-2.5 rounded-2xl font-bold flex items-center justify-center gap-3 text-xs transition border cursor-pointer ${
                isDark
                  ? 'bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-800'
                  : 'bg-white hover:bg-neutral-100 text-neutral-900 border-neutral-300 shadow-sm'
              }`}
            >
              {googleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to Google Account...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Continue as Guest Button - Minimal Monochrome */}
            <button
              onClick={handleGuestAccess}
              disabled={guestLoading || loading || googleLoading}
              type="button"
              className={`w-full py-2.5 rounded-2xl font-bold flex items-center justify-center gap-2 text-xs transition border cursor-pointer ${
                isDark
                  ? 'bg-neutral-900/60 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
                  : 'bg-neutral-100/80 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
              }`}
            >
              {guestLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Preparing Guest Workspace...</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4 opacity-80" />
                  <span>Continue as Guest (Instant Exploration)</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ── STEP 2: VERIFY 6-DIGIT OTP ── */}
        {step === 'otp' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Target Display Banner */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-100 border-neutral-200'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    isDark
                      ? 'bg-neutral-800 text-white border-neutral-700'
                      : 'bg-white text-black border-neutral-300'
                  }`}
                >
                  {authMode === 'email' ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                </div>
                <div className="truncate">
                  <span
                    className={`text-[10px] font-mono uppercase block ${
                      isDark ? 'text-neutral-400' : 'text-neutral-500'
                    }`}
                  >
                    {viewMode === 'signup'
                      ? 'Create Account OTP Sent To:'
                      : 'Verification Code Sent To:'}
                  </span>
                  <span className="text-xs font-mono font-bold truncate block">
                    {getMaskedTarget()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleEditContact}
                className={`p-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1 transition cursor-pointer ${
                  isDark ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-200 text-neutral-700'
                }`}
                title="Change Email or Mobile Number"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            </div>

            {/* Instruction */}
            <div className="text-center space-y-1">
              <span
                className={`text-xs font-mono font-bold block ${
                  isDark ? 'text-neutral-200' : 'text-neutral-800'
                }`}
              >
                Enter 6-Digit Verification Code
              </span>
              <p
                className={`text-[11px] font-sans ${
                  isDark ? 'text-neutral-400' : 'text-neutral-500'
                }`}
              >
                Check your {authMode === 'email' ? 'email inbox / spam folder' : 'SMS messages'}. Code expires in 5 minutes.
              </p>
            </div>

            {/* 6-Box OTP Input Component */}
            <div className="py-2">
              <OtpInput
                value={otpDigits}
                onChange={setOtpDigits}
                onComplete={handleVerifyOtp}
                disabled={loading}
                hasError={Boolean(error)}
                autoFocus
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-neutral-900/40 border border-rose-500/40 text-rose-400 text-xs flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-mono text-[11px] leading-relaxed">{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                disabled={loading || otpDigits.join('').length !== 6}
                className={`w-full py-3.5 font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition text-xs uppercase tracking-wider active:scale-[0.99] disabled:opacity-50 cursor-pointer ${
                  isDark
                    ? 'bg-white text-black hover:bg-neutral-200'
                    : 'bg-black text-white hover:bg-neutral-800'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {viewMode === 'signup' ? 'Verify & Create Account' : 'Verify & Enter Platform'}
                    </span>
                  </>
                )}
              </button>

              {/* Resend OTP Timer & Back Button */}
              <div className="flex items-center justify-between text-xs font-mono pt-1">
                <button
                  type="button"
                  onClick={handleEditContact}
                  className="text-neutral-400 hover:text-white transition cursor-pointer"
                >
                  ← Back
                </button>

                {cooldown > 0 ? (
                  <span className="text-neutral-400 text-[11px]">
                    Resend code in <strong className="font-bold">{cooldown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleSendOtp(e)}
                    disabled={loading}
                    className="font-bold underline flex items-center gap-1.5 cursor-pointer hover:opacity-80"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend OTP Code</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: SUCCESS STATE ── */}
        {step === 'success' && (
          <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-xl border ${
                isDark
                  ? 'bg-white text-black border-white'
                  : 'bg-black text-white border-black'
              }`}
            >
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black tracking-tight">
                {viewMode === 'signup' ? 'Account Created Successfully!' : 'Authentication Verified!'}
              </h3>
              <p className={`text-xs font-mono ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Session established. Redirecting to workspace...
              </p>
            </div>
          </div>
        )}

        {/* Security Assurance Footer */}
        <div
          className={`pt-2 border-t text-[10px] font-mono text-center flex items-center justify-center gap-1.5 ${
            isDark ? 'border-neutral-800 text-neutral-500' : 'border-neutral-200 text-neutral-400'
          }`}
        >
          <Lock className="w-3 h-3 stroke-[1.75]" />
          <span>Secure authentication • Protected Laboratory Environment</span>
        </div>
      </div>
    </div>
  );
}
