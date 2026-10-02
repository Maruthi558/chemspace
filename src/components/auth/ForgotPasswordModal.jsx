import React, { useState } from 'react';
import { KeyRound, Mail, X, CheckCircle2, AlertCircle } from 'lucide-react';
import ButtonSpinner from '../common/ButtonSpinner';

export default function ForgotPasswordModal({
  isOpen,
  initialEmail = '',
  onClose,
  onResetPassword
}) {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please provide a valid institutional or personal email address.');
      return;
    }

    setLoading(true);
    try {
      await onResetPassword(cleanEmail);
      setSuccess(true);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to send password reset email. Please verify your address.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-title"
    >
      <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <h2 id="forgot-password-title" className="text-sm font-semibold">
              Reset Password
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close reset modal"
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="space-y-4 py-2 animate-in zoom-in-95 duration-150">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Password Reset Email Dispatched</span>
                <p className="opacity-90 leading-relaxed">
                  We have sent instructions to{' '}
                  <strong className="font-mono text-emerald-300">{email}</strong>. Please check your inbox and spam folder.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl btn-primary text-xs font-semibold"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Enter your email address and we'll send you a secure link to create a new password.
            </p>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-start gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="reset-email" className="text-xs font-medium text-[var(--text-secondary)]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-60" />
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="scientist@chemspace.org"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-[var(--text-primary)] outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl btn-primary text-xs font-semibold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <ButtonSpinner className="text-current w-3.5 h-3.5" />
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                <span>Send Password Reset Link</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
