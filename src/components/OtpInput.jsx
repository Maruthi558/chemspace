import React, { useRef, useEffect } from 'react';

/**
 * High-precision 6-cell interactive OTP input component
 * Supports:
 * - auto-focus and auto-advance
 * - paste full 6-digit codes
 * - backspace navigation and clearing
 * - keyboard arrows (left/right)
 * - numeric keypad on mobile devices
 * - supports both `digits` and `value` props
 * - clean accessible ARIA attributes
 */
export default function OtpInput({
  value,
  digits,
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
  autoFocus = true,
  className = ''
}) {
  const inputRefs = useRef([]);

  // Support both `digits` or `value` props seamlessly
  const currentDigits = Array.isArray(digits)
    ? digits
    : Array.isArray(value)
    ? value
    : ['', '', '', '', '', ''];

  useEffect(() => {
    if (autoFocus && !disabled) {
      // Focus first empty cell or cell 0
      const firstEmptyIdx = currentDigits.findIndex((d) => !d);
      const targetIdx = firstEmptyIdx !== -1 ? firstEmptyIdx : 0;
      inputRefs.current[targetIdx]?.focus();
    }
  }, [autoFocus, disabled]);

  const updateDigits = (nextDigits) => {
    if (onChange) {
      onChange(nextDigits);
    }
    const fullCode = nextDigits.join('');
    if (fullCode.length === 6 && /^\d{6}$/.test(fullCode) && onComplete) {
      onComplete(fullCode);
    }
  };

  const handleChange = (e, index) => {
    const rawVal = e.target.value;
    const digitsOnly = rawVal.replace(/\D/g, '');
    const char = digitsOnly.slice(-1);

    const nextValue = [...currentDigits];
    nextValue[index] = char;
    updateDigits(nextValue);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!currentDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const nextValue = [...currentDigits];
        nextValue[index - 1] = '';
        updateDigits(nextValue);
      } else {
        const nextValue = [...currentDigits];
        nextValue[index] = '';
        updateDigits(nextValue);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const nextValue = [...currentDigits];
    for (let i = 0; i < 6; i++) {
      nextValue[i] = pasteData[i] || '';
    }
    updateDigits(nextValue);

    const targetIdx = Math.min(pasteData.length, 5);
    inputRefs.current[targetIdx]?.focus();
  };

  return (
    <div
      onPaste={handlePaste}
      className={`flex items-center justify-center gap-2 sm:gap-2.5 transition-all ${className}`}
      role="group"
      aria-label="6-digit verification code"
    >
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const isFilled = Boolean(currentDigits[index]);
        return (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            disabled={disabled}
            value={currentDigits[index] || ''}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            aria-label={`Digit ${index + 1} of 6`}
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-bold rounded-xl border transition-all outline-none select-all ${
              disabled ? 'opacity-50 cursor-not-allowed bg-slate-900/40 text-slate-500' : ''
            } ${
              hasError
                ? 'border-rose-500/80 bg-rose-500/10 text-rose-400 focus:border-rose-500 ring-1 ring-rose-500/30'
                : isFilled
                ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400 font-extrabold focus:border-emerald-500 ring-1 ring-emerald-500/30'
                : 'border-[var(--border-subtle)] bg-[var(--bg-input)] text-[var(--text-primary)] hover:border-slate-400 dark:hover:border-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30'
            }`}
          />
        );
      })}
    </div>
  );
}
