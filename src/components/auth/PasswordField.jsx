import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

/**
 * Reusable Password Field with show/hide toggle eye icon
 */
export default function PasswordField({
  id = 'password',
  name = 'password',
  label = 'Password',
  value = '',
  onChange,
  placeholder = '••••••••',
  required = true,
  autoComplete = 'current-password',
  error = '',
  actionLink = null,
  disabled = false,
  className = ''
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-xs font-medium text-[var(--text-secondary)] select-none"
        >
          {label}
        </label>
        {actionLink}
      </div>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
          <Lock className="w-4 h-4 opacity-60" />
        </div>

        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          required={required}
          disabled={disabled}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-[var(--bg-input)] border transition-all duration-150 outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)] ${
            error
              ? 'border-rose-500/70 focus:border-rose-500 ring-1 ring-rose-500/20'
              : 'border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 hover:border-slate-400 dark:hover:border-slate-700'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          aria-label={showPassword ? `Hide ${label}` : `Show ${label}`}
          title={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500/30 cursor-pointer"
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>

      {error && (
        <p className="text-[11px] text-rose-500 dark:text-rose-400 font-mono animate-in fade-in duration-150">
          {error}
        </p>
      )}
    </div>
  );
}
