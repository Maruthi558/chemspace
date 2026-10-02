import React, { useEffect, useState } from 'react';
import { Mic, Volume2, Sparkles, X, Brain } from 'lucide-react';
import ButtonSpinner from '../common/ButtonSpinner';

/**
 * VoiceVisualizer
 * Compact, scientific voice interaction states:
 * IDLE, LISTENING, TRANSCRIBING, THINKING, SPEAKING
 * Features instant cancellation and GPU-efficient micro-waveform.
 */
export default function VoiceVisualizer({
  state = 'idle', // 'idle' | 'listening' | 'transcribing' | 'thinking' | 'speaking'
  durationSeconds = 0,
  onCancel = null
}) {
  const [pulseHeights, setPulseHeights] = useState([30, 60, 85, 55, 75, 45, 65, 35]);

  useEffect(() => {
    if (state !== 'listening' && state !== 'speaking' && state !== 'transcribing') return;

    const interval = setInterval(() => {
      setPulseHeights([
        Math.floor(20 + Math.random() * 60),
        Math.floor(30 + Math.random() * 55),
        Math.floor(40 + Math.random() * 50),
        Math.floor(25 + Math.random() * 65),
        Math.floor(35 + Math.random() * 55),
        Math.floor(20 + Math.random() * 60),
        Math.floor(30 + Math.random() * 50),
        Math.floor(15 + Math.random() * 45)
      ]);
    }, 100);

    return () => clearInterval(interval);
  }, [state]);

  if (state === 'idle') return null;

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const getBarColor = () => {
    switch (state) {
      case 'listening':
        return 'bg-cyan-400';
      case 'speaking':
        return 'bg-emerald-400';
      case 'transcribing':
        return 'bg-amber-400';
      case 'thinking':
        return 'bg-violet-400';
      default:
        return 'bg-cyan-400';
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)]"
    >
      {/* State Icon Indicator */}
      <div className="shrink-0 flex items-center justify-center">
        {state === 'listening' && <Mic className="w-3 h-3 text-cyan-400 animate-pulse" />}
        {state === 'transcribing' && <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />}
        {state === 'thinking' && <ButtonSpinner className="w-3 h-3 text-violet-400" />}
        {state === 'speaking' && <Volume2 className="w-3 h-3 text-emerald-400 animate-pulse" />}
      </div>

      {/* Dynamic Mini Waveform (only during audio I/O) */}
      {(state === 'listening' || state === 'speaking' || state === 'transcribing') && (
        <div className="flex items-center gap-0.5 h-4 min-w-[36px] justify-center" aria-hidden="true">
          {pulseHeights.map((h, idx) => (
            <div
              key={idx}
              className={`w-[2.5px] rounded-full transition-all duration-100 ${getBarColor()}`}
              style={{
                height: state === 'transcribing' ? '40%' : `${h}%`
              }}
            />
          ))}
        </div>
      )}

      {/* State Label / Timer */}
      <div className="flex items-center gap-1 text-[10px] font-mono text-[var(--text-muted)] select-none">
        {state === 'listening' && <span>{formatTimer(durationSeconds)}</span>}
        {state === 'transcribing' && <span className="text-amber-400">Transcribing...</span>}
        {state === 'thinking' && <span className="text-violet-400">Processing...</span>}
        {state === 'speaking' && <span className="text-emerald-400">Speaking...</span>}
      </div>

      {/* Stop / Interrupt Control */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 hover:bg-rose-500 hover:text-white transition cursor-pointer flex items-center gap-0.5"
          title="Stop Audio"
        >
          <X className="w-2.5 h-2.5" />
          <span>Stop</span>
        </button>
      )}
    </div>
  );
}
