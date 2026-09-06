import React, { useRef, useEffect } from 'react';

/**
 * High-precision 6-cell interactive OTP input component
 * Supports auto-focus, paste, backspace navigation, arrow navigation, and auto-submit
 */
export default function OtpInput({
  value = ['', '', '', '', '', ''],
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
  autoFocus = true
}) {
  const inputRefs = useRef([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  const handleChange = (e, index) => {
    const rawVal = e.target.value;
    // Take only the last entered character if multiple typed
    const char = rawVal.replace(/\D/g, '').slice(-1);

    const nextValue = [...value];
    nextValue[index] = char;
    onChange(nextValue);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = nextValue.join('');
    if (fullCode.length === 6 && onComplete) {
      onComplete(fullCode);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const nextValue = [...value];
        nextValue[index - 1] = '';
        onChange(nextValue);
      } else {
        const nextValue = [...value];
        nextValue[index] = '';
        onChange(nextValue);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const nextValue = [...value];
    for (let i = 0; i < 6; i++) {
      nextValue[i] = pasteData[i] || '';
    }
    onChange(nextValue);

    const targetIdx = Math.min(pasteData.length, 5);
    inputRefs.current[targetIdx]?.focus();

    if (pasteData.length === 6 && onComplete) {
      onComplete(pasteData);
    }
  };

  return (
    <div
      onPaste={handlePaste}
      className={`flex items-center justify-center gap-2 sm:gap-3 transition-all ${
        hasError ? 'animate-shake' : ''
      }`}
    >
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const isFilled = Boolean(value[index]);
        return (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            disabled={disabled}
            value={value[index] || ''}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            aria-label={`Digit ${index + 1} of 6`}
            className={`w-11 h-13 sm:w-13 sm:h-14 text-center text-xl sm:text-2xl font-mono font-black rounded-2xl border transition-all outline-none select-all ${
              disabled ? 'opacity-50 cursor-not-allowed bg-neutral-900/50' : ''
            } ${
              hasError
                ? 'border-rose-500 bg-rose-500/10 text-rose-400 shadow-sm'
                : isFilled
                ? 'border-neutral-400 dark:border-neutral-500 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                : 'border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-700 focus:border-black dark:focus:border-white text-neutral-900 dark:text-white'
            }`}
          />
        );
      })}
    </div>
  );
}
