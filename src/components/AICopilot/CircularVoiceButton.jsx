import React from 'react';
import { Mic, MicOff, Check, AlertCircle } from 'lucide-react';

/**
 * CircularVoiceButton
 * Premium circular microphone action button following ChemSpace specification.
 * 
 * States:
 * - IDLE: Clean circular button, subtle depth, elegant mic icon
 * - HOVER: Soft glow, micro-scale increase (1.05x)
 * - LISTENING: Animated concentric radial rings, subtle waveform ripple, active listening cue
 * - PROCESSING: Elegant circular progress ring around perimeter (no cheap spinner)
 * - SPEAKING: Audio output pulse state
 * - SUCCESS: Subtle completion tick
 * - ERROR: Controlled warning state
 */
export default function CircularVoiceButton({
  state = 'idle', // 'idle' | 'listening' | 'processing' | 'speaking' | 'success' | 'error'
  onClick,
  disabled = false,
  size = 'md', // 'sm' (34px) | 'md' (42px) | 'lg' (48px)
  className = '',
  title = 'Voice Input'
}) {
  const sizeClasses = {
    sm: 'w-8.5 h-8.5 text-xs',
    md: 'w-10.5 h-10.5 text-sm',
    lg: 'w-12 h-12 text-base'
  }[size] || 'w-10.5 h-10.5 text-sm';

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }[size] || 'w-4 h-4';

  const isListening = state === 'listening';
  const isProcessing = state === 'processing';
  const isSpeaking = state === 'speaking';
  const isSuccess = state === 'success';
  const isError = state === 'error';

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* ── CONCENTRIC RADIAL RINGS (LISTENING STATE ONLY) ────────────────── */}
      {isListening && (
        <>
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-orange-500/25 animate-ping [animation-duration:2s] pointer-events-none"
          />
          <span
            aria-hidden="true"
            className="absolute -inset-1.5 rounded-full border border-orange-500/40 animate-pulse [animation-duration:1.2s] pointer-events-none"
          />
        </>
      )}

      {/* ── SPEAKING WAVEFORM RIPPLE ──────────────────────────────────────── */}
      {isSpeaking && (
        <span
          aria-hidden="true"
          className="absolute -inset-1 rounded-full border border-emerald-500/40 animate-pulse [animation-duration:1.4s] pointer-events-none"
        />
      )}

      {/* ── MAIN CIRCULAR ACTION BUTTON ────────────────────────────────────── */}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        aria-label={title}
        className={`relative z-10 ${sizeClasses} rounded-full flex items-center justify-center transition-all duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 cursor-pointer ${
          isListening
            ? 'bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.45)] scale-105 border border-orange-400/50'
            : isSpeaking
            ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-[0_0_18px_rgba(16,185,129,0.4)] border border-emerald-400/40'
            : isProcessing
            ? 'bg-[var(--bg-inner)] text-orange-400 border border-orange-500/30'
            : isSuccess
            ? 'bg-emerald-500 text-white border border-emerald-400/50 shadow-[0_0_14px_rgba(16,185,129,0.35)]'
            : isError
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            : 'bg-[var(--bg-inner)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:shadow-md hover:scale-105 active:scale-95'
        }`}
      >
        {/* Processing Orbital Ring Overlay */}
        {isProcessing && (
          <svg
            className="absolute inset-0 w-full h-full animate-spin [animation-duration:1s] pointer-events-none"
            viewBox="0 0 40 40"
            fill="none"
          >
            <circle
              cx="20"
              cy="20"
              r="17"
              stroke="rgba(249, 115, 22, 0.2)"
              strokeWidth="2"
            />
            <circle
              cx="20"
              cy="20"
              r="17"
              stroke="#f97316"
              strokeWidth="2.2"
              strokeDasharray="28 80"
              strokeLinecap="round"
              className="drop-shadow-[0_0_4px_#f97316]"
            />
          </svg>
        )}

        {/* State Icons */}
        {isSuccess ? (
          <Check className={`${iconSizes} stroke-[2.5]`} />
        ) : isError ? (
          <AlertCircle className={`${iconSizes} stroke-[2]`} />
        ) : isListening ? (
          <MicOff className={`${iconSizes} stroke-[2] animate-pulse`} />
        ) : (
          <Mic className={`${iconSizes} stroke-[2] transition-transform duration-200 group-hover:scale-110`} />
        )}
      </button>
    </div>
  );
}
