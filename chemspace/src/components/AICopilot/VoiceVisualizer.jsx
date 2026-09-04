import React from 'react';

export default function VoiceVisualizer({ state }) {
  if (state === 'idle') return null;

  return (
    <div className="flex items-center gap-1 h-6">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full bg-cyan-400 ${
            state === 'listening'
              ? 'animate-bounce'
              : state === 'processing'
              ? 'animate-pulse'
              : 'h-1'
          }`}
          style={{
            height: state === 'listening' ? `${20 + Math.random() * 60}%` : '100%',
            animationDelay: `${i * 0.1}s`,
            animationDuration: state === 'listening' ? '0.6s' : '1.5s'
          }}
        />
      ))}
    </div>
  );
}
