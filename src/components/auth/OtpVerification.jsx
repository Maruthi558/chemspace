import React from 'react';
import { ArrowLeft, RefreshCw, ShieldCheck, Mail, Smartphone } from 'lucide-react';
import OtpInput from '../OtpInput';
import ButtonSpinner from '../common/ButtonSpinner';

/**
 * Mask destination email or phone for user privacy and security
 */
function maskDestination(target = '', type = 'email') {
  if (!target) return '';
  if (type === 'email') {
    const parts = target.split('@');
    if (parts.length !== 2) return target;
    const name = parts[0];
    const domain = parts[1];
    if (name.length <= 2) {
      return `${name[0]}*@${domain}`;
    }
    const maskedName = `${name[0]}${'*'.repeat(Math.min(name.length - 2, 5))}${name.slice(-1)}`;
    return `${maskedName}@${domain}`;
  } else {
    // Phone
    const digits = target.replace(/\s+/g, '');
    if (digits.length <= 4) return digits;
    const lastFour = digits.slice(-4);
    const prefix = digits.slice(0, Math.max(digits.length - 4, 3));
    return `${prefix.slice(0, 3)} ••• •• ${lastFour}`;
  }
}

/**
 * Reusable Unified OTP Verification Component
 * Used for both Email OTP and Phone SMS OTP flows
 */
export default function OtpVerification({
  type = 'email', // 'email' | 'phone'
  destination = '',
  digits = ['', '', '', '', '', ''],
  onChangeDigits,
  onVerify,
  onResend,
  onChangeDestination,
  loading = false,
  error = '',
  cooldown = 0
}) {
  const isComplete = digits.join('').length === 6;
  const maskedTarget = maskDestination(destination, type);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Target Destination Info */}
      <div className="text-center space-y-1.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center mx-auto mb-2">
          {type === 'email' ? (
            <Mail className="w-5 h-5" />
          ) : (
            <Smartphone className="w-5 h-5" />
          )}
        </div>

        <h2 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] tracking-tight">
          Enter Verification Code
        </h2>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {type === 'email' ? 'Verification code sent to your email:' : 'Verification code sent via SMS to:'}
        </p>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-input)] border border-[var(--border-subtle)] text-xs font-mono font-medium text-emerald-500 dark:text-emerald-400">
          <span>{maskedTarget}</span>
          {onChangeDestination && (
            <button
              type="button"
              onClick={onChangeDestination}
              disabled={loading}
              className="text-[11px] underline text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Change
            </button>
          )}
        </div>
      </div>

      {/* 6-Digit OTP Cells */}
      <div className="py-1">
        <OtpInput
          digits={digits}
          onChange={onChangeDigits}
          onComplete={onVerify}
          disabled={loading}
          hasError={Boolean(error)}
          autoFocus={true}
        />
      </div>

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={() => onVerify(digits.join(''))}
        disabled={loading || !isComplete}
        className="w-full py-2.5 px-4 rounded-xl btn-primary text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <>
            <ButtonSpinner className="text-current w-4 h-4" />
            <span>Verifying Code...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" />
            <span>Verify &amp; Continue</span>
          </>
        )}
      </button>

      {/* Footer Navigation & Resend Controls */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--border-subtle)]">
        <button
          type="button"
          onClick={onChangeDestination}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        {cooldown > 0 ? (
          <span className="text-[var(--text-muted)] font-mono text-[11px]">
            Resend code in {cooldown}s
          </span>
        ) : (
          <button
            type="button"
            onClick={onResend}
            disabled={loading}
            className="inline-flex items-center gap-1.5 font-medium text-emerald-500 dark:text-emerald-400 hover:underline transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Resend Code</span>
          </button>
        )}
      </div>
    </div>
  );
}
