import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Mail,
  User,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
  Smartphone,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ButtonSpinner from '../components/common/ButtonSpinner';
import AuthLayout from '../components/auth/AuthLayout';
import PasswordField from '../components/auth/PasswordField';
import SocialAuthButtons from '../components/auth/SocialAuthButtons';
import OtpVerification from '../components/auth/OtpVerification';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme } = useTheme();

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
    signInWithMicrosoft,
    signInWithGithub
  } = useAuth();

  // Redirect destination
  const fromDestination = location.state?.from?.pathname || '/dashboard';

  // If already authenticated with an active session, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      navigate(fromDestination, { replace: true });
    }
  }, [isAuthenticated, navigate, fromDestination]);

  // Mode: 'signin' | 'signup'
  const [viewMode, setViewMode] = useState(() => {
    return searchParams.get('mode') === 'signup' || location.pathname === '/register'
      ? 'signup'
      : 'signin';
  });

  // Keep URL query in sync when mode changes
  const handleModeSwitch = (newMode) => {
    setViewMode(newMode);
    setError('');
    setConfirmPassword('');
    setNotice('');
    setStep('input');
    setSearchParams(newMode === 'signup' ? { mode: 'signup' } : {});
  };

  // Method: 'password' | 'email_otp' | 'phone_otp'
  const [authMethod, setAuthMethod] = useState('password');

  // Step: 'input' | 'verify_otp' | 'success'
  const [step, setStep] = useState('input');

  // Credentials
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Password Reset Modal
  const [showForgotModal, setShowForgotModal] = useState(false);

  // OTP State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpTargetType, setOtpTargetType] = useState('email'); // 'email' | 'phone'
  const [cooldown, setCooldown] = useState(0);

  // Loading & State Feedback
  const [loading, setLoading] = useState(false);
  const [socialLoadingProvider, setSocialLoadingProvider] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Clean up reCAPTCHA verifier on unmount
  useEffect(() => {
    return () => {
      clearRecaptcha('recaptcha-container');
    };
  }, []);

  // Cooldown timer
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

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Password Login & Registration
  // ─────────────────────────────────────────────────────────────────────────────
  async function handleEmailPasswordSubmit(e) {
    if (e) e.preventDefault();
    setError('');
    setNotice('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setError('Please provide a valid institutional or personal email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (viewMode === 'signup') {
      if (!fullName.trim() || fullName.trim().length < 2) {
        setError('Please enter your full name or title.');
        return;
      }
      if (!confirmPassword) {
        setError('Please confirm your password.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      if (viewMode === 'signup') {
        await signUpWithEmail(cleanEmail, password, fullName.trim(), {
          name: fullName.trim(),
          workplace: 'ChemNova Research Institute',
          role: 'Lead Research Chemist'
        });
      } else {
        await signInWithEmail(cleanEmail, password);
      }

      setStep('success');
      setTimeout(() => {
        navigate(fromDestination, { replace: true });
      }, 400);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Email OTP Request & Verification
  // ─────────────────────────────────────────────────────────────────────────────
  async function handleSendEmailOtp(e) {
    if (e) e.preventDefault();
    setError('');
    setNotice('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setError('Please enter a valid email address to receive your 6-digit code.');
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
      setError('Please enter the 6-digit numeric verification code.');
      return;
    }

    setLoading(true);
    try {
      await verifyEmailOtp(email.trim().toLowerCase(), code, {
        name: fullName.trim() || 'Research Chemist',
        workplace: 'ChemNova Research Institute'
      });
      setStep('success');
      setTimeout(() => {
        navigate(fromDestination, { replace: true });
      }, 400);
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMagicLink(e) {
    if (e) e.preventDefault();
    setError('');
    setNotice('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setError('Please enter a valid institutional or personal email address.');
      return;
    }

    setLoading(true);
    try {
      await sendEmailVerificationLink(cleanEmail);
      setNotice(`A sign-in link has been sent to ${cleanEmail}. Click the link in your email to sign in instantly.`);
    } catch (err) {
      setError(err.message || 'Could not send sign-in link. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Phone SMS OTP Request & Verification
  // ─────────────────────────────────────────────────────────────────────────────
  async function handleSendPhoneSms(e) {
    if (e) e.preventDefault();
    setError('');
    setNotice('');

    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (!cleanDigits || !isValidPhone(cleanDigits)) {
      setError('Please enter a valid mobile phone number (7 to 15 digits).');
      return;
    }

    const fullNumber = `${countryCode}${cleanDigits}`;
    setLoading(true);
    try {
      const verifier = setupRecaptcha('recaptcha-container');
      const confirmResult = await sendPhoneOtp(fullNumber, verifier);
      setConfirmationResult(confirmResult);
      setOtpTargetType('phone');
      setStep('verify_otp');
      setCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
    } catch (err) {
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
      setError('Verification session expired. Please request a new code.');
      setStep('input');
      return;
    }

    setLoading(true);
    try {
      await verifyPhoneOtp(confirmationResult, code, {
        name: fullName.trim() || 'Research Chemist',
        workplace: 'ChemNova Research Institute'
      });
      setStep('success');
      setTimeout(() => {
        navigate(fromDestination, { replace: true });
      }, 400);
    } catch (err) {
      setError(err.message || 'Invalid SMS verification code.');
    } finally {
      setLoading(false);
    }
  }

  function handleGenericVerify(code) {
    if (otpTargetType === 'email') {
      handleVerifyEmailOtpSubmit(code);
    } else {
      handleVerifyPhoneOtpSubmit(code);
    }
  }

  function handleResendOtp() {
    if (otpTargetType === 'email') {
      handleSendEmailOtp();
    } else {
      handleSendPhoneSms();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Social Authentication Handlers
  // ─────────────────────────────────────────────────────────────────────────────
  async function handleSocialSignIn(providerName, authFn) {
    setError('');
    setNotice('');
    setSocialLoadingProvider(providerName);

    try {
      const res = await authFn({
        name: fullName.trim(),
        workplace: 'ChemNova Research Institute'
      });
      if (res) {
        setStep('success');
        setTimeout(() => {
          navigate(fromDestination, { replace: true });
        }, 400);
      }
    } catch (err) {
      console.warn(`[ChemSpace Auth] ${providerName} sign-in notice:`, err.message);
      if (err.message && (err.message.includes('not yet enabled') || err.message.includes('configuration not found'))) {
        setNotice(
          `${providerName.charAt(0).toUpperCase() + providerName.slice(1)} provider is not yet activated in project chemistry1-e2723. You can sign in using Google, Email OTP, or Password.`
        );
      } else {
        setError(err.message || `${providerName} sign-in could not be completed.`);
      }
    } finally {
      setSocialLoadingProvider(null);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  const isPasswordsMismatch =
    viewMode === 'signup' &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  return (
    <AuthLayout
      title={
        step === 'verify_otp'
          ? null
          : viewMode === 'signup'
          ? 'Create Account'
          : 'Welcome Back'
      }
      subtitle={
        step === 'verify_otp'
          ? null
          : viewMode === 'signup'
          ? 'Register to access ChemSpace chemical computing'
          : 'Sign in to continue to ChemSpace'
      }
    >
      {/* Notifications & Error Banners */}
      {error && (
        <div
          className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-150"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="opacity-95 leading-relaxed">{error}</p>
        </div>
      )}

      {notice && (
        <div
          className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-150"
          role="status"
        >
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="opacity-95 leading-relaxed">{notice}</p>
        </div>
      )}

      {/* ── STATE A: SUCCESS TRANSITION ── */}
      {step === 'success' && (
        <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-emerald-400">
              {viewMode === 'signup' ? 'Account Created' : 'Authenticated'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Opening ChemSpace molecular workspace...
            </p>
          </div>
        </div>
      )}

      {/* ── STATE B: OTP VERIFICATION (SHARED FOR EMAIL & PHONE) ── */}
      {step === 'verify_otp' && (
        <OtpVerification
          type={otpTargetType}
          destination={
            otpTargetType === 'email' ? email : `${countryCode} ${phoneNumber}`
          }
          digits={otpDigits}
          onChangeDigits={setOtpDigits}
          onVerify={handleGenericVerify}
          onResend={handleResendOtp}
          onChangeDestination={() => {
            setStep('input');
            setError('');
          }}
          loading={loading}
          error={error}
          cooldown={cooldown}
        />
      )}

      {/* ── STATE C: CREDENTIALS INPUT FORM ── */}
      {step === 'input' && (
        <div className="space-y-5">
          {/* Method Selector Tabs: Password | Email OTP | Phone SMS */}
          <div
            className="p-1 rounded-xl grid grid-cols-3 border border-[var(--border-subtle)] bg-[var(--bg-input)] text-xs font-medium"
            role="tablist"
            aria-label="Authentication Method"
          >
            <button
              type="button"
              role="tab"
              aria-selected={authMethod === 'password'}
              onClick={() => {
                setAuthMethod('password');
                setError('');
              }}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMethod === 'password'
                  ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm font-semibold border border-[var(--border-subtle)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Password</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={authMethod === 'email_otp'}
              onClick={() => {
                setAuthMethod('email_otp');
                setError('');
              }}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMethod === 'email_otp'
                  ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm font-semibold border border-[var(--border-subtle)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email OTP</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={authMethod === 'phone_otp'}
              onClick={() => {
                setAuthMethod('phone_otp');
                setError('');
              }}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMethod === 'phone_otp'
                  ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm font-semibold border border-[var(--border-subtle)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
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
                <div className="space-y-1.5 animate-in fade-in duration-150">
                  <label
                    htmlFor="fullName"
                    className="text-xs font-medium text-[var(--text-secondary)] block"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-60" />
                    <input
                      id="fullName"
                      name="name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dr. Rosalind Franklin"
                      autoComplete="name"
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-[var(--text-primary)] outline-none transition"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-medium text-[var(--text-secondary)] block"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-60" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="scientist@chemnova.org"
                    autoComplete="email"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-[var(--text-primary)] outline-none transition"
                  />
                </div>
              </div>

              <PasswordField
                id="password"
                name="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete={
                  viewMode === 'signup' ? 'new-password' : 'current-password'
                }
                actionLink={
                  viewMode === 'signin' ? (
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs text-emerald-500 dark:text-emerald-400 hover:underline transition cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  ) : null
                }
              />

              {viewMode === 'signup' && (
                <PasswordField
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  error={isPasswordsMismatch ? 'Passwords do not match.' : ''}
                />
              )}

              <button
                type="submit"
                disabled={loading || isPasswordsMismatch}
                className="w-full py-2.5 px-4 rounded-xl btn-primary text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <ButtonSpinner className="text-current w-4 h-4" />
                    <span>
                      {viewMode === 'signup'
                        ? 'Creating Account...'
                        : 'Signing In...'}
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {viewMode === 'signup' ? 'Create Account' : 'Sign In'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* METHOD 2: EMAIL OTP */}
          {authMethod === 'email_otp' && (
            <form onSubmit={handleSendEmailOtp} className="space-y-4">
              {viewMode === 'signup' && (
                <div className="space-y-1.5 animate-in fade-in duration-150">
                  <label
                    htmlFor="emailOtpFullName"
                    className="text-xs font-medium text-[var(--text-secondary)] block"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-60" />
                    <input
                      id="emailOtpFullName"
                      name="name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dr. Rosalind Franklin"
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-[var(--text-primary)] outline-none transition"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="emailOtp"
                  className="text-xs font-medium text-[var(--text-secondary)] block"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-60" />
                  <input
                    id="emailOtp"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="scientist@chemnova.org"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-[var(--text-primary)] outline-none transition"
                  />
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  We'll send a 6-digit verification code to your email.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl btn-primary text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <ButtonSpinner className="text-current w-4 h-4" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Send Verification Code</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSendMagicLink}
                disabled={loading}
                className="w-full py-2 px-3 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] text-xs text-[var(--text-secondary)] font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Send Passwordless Sign-In Link Instead</span>
              </button>
            </form>
          )}

          {/* METHOD 3: PHONE SMS OTP */}
          {authMethod === 'phone_otp' && (
            <form onSubmit={handleSendPhoneSms} className="space-y-4">
              {viewMode === 'signup' && (
                <div className="space-y-1.5 animate-in fade-in duration-150">
                  <label
                    htmlFor="phoneOtpFullName"
                    className="text-xs font-medium text-[var(--text-secondary)] block"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-60" />
                    <input
                      id="phoneOtpFullName"
                      name="name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dr. Rosalind Franklin"
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-[var(--text-primary)] outline-none transition"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="phoneNumber"
                  className="text-xs font-medium text-[var(--text-secondary)] block"
                >
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    aria-label="Country Code"
                    className="py-2.5 px-2.5 rounded-xl text-xs font-mono bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-emerald-500 text-[var(--text-primary)] outline-none transition cursor-pointer"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>

                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-60" />
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-[var(--text-primary)] outline-none transition"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Standard SMS rates may apply via Firebase Phone Verification.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl btn-primary text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <ButtonSpinner className="text-current w-4 h-4" />
                    <span>Sending SMS...</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4" />
                    <span>Send SMS Code</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Clean Divider */}
          <div className="relative flex items-center justify-center pt-2 pb-1">
            <div className="w-full border-t border-[var(--border-subtle)]" />
            <span className="px-3 text-[11px] uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-card)] absolute font-medium">
              or continue with
            </span>
          </div>

          {/* Social Sign-In Buttons */}
          <SocialAuthButtons
            onGoogleSignIn={() => handleSocialSignIn('Google', signInWithGoogle)}
            onMicrosoftSignIn={() =>
              handleSocialSignIn('Microsoft', signInWithMicrosoft)
            }
            onGithubSignIn={() => handleSocialSignIn('GitHub', signInWithGithub)}
            loadingProvider={socialLoadingProvider}
            disabled={loading}
          />

          {/* Bottom Switcher: Sign In vs Create Account */}
          <div className="pt-2 text-center text-xs text-[var(--text-secondary)]">
            {viewMode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('signup')}
                  className="font-semibold text-emerald-500 dark:text-emerald-400 hover:underline transition cursor-pointer"
                >
                  Create account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('signin')}
                  className="font-semibold text-emerald-500 dark:text-emerald-400 hover:underline transition cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        initialEmail={email}
        onClose={() => setShowForgotModal(false)}
        onResetPassword={resetPassword}
      />
    </AuthLayout>
  );
}
