import React from 'react';

/**
 * ButtonSpinner
 * Precision Atomic Orbital Circular Spinner for buttons, action triggers, and inline loading.
 * Features an orbital ring track, rotating glowing arc, orbital node, and central nucleus.
 */
export default function ButtonSpinner({
  className = 'w-3.5 h-3.5',
  color = 'currentColor',
  accentColor = '#f97316'
}) {
  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        className="w-full h-full animate-spin [animation-duration:0.8s] [animation-timing-function:cubic-bezier(0.4,0,0.2,1)]"
        fill="none"
      >
        {/* Outer Circular Track */}
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke={color}
          strokeWidth="2"
          className="opacity-20"
        />

        {/* High-Precision Rotating Glowing Arc */}
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke={accentColor || color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="22 35"
          className="drop-shadow-[0_0_3px_currentColor]"
        />

        {/* Orbiting Valence Node */}
        <circle
          cx="12"
          cy="3"
          r="1.8"
          fill={accentColor || color}
          className="drop-shadow-[0_0_4px_currentColor]"
        />

        {/* Central Quantum Nucleus */}
        <circle
          cx="12"
          cy="12"
          r="1.5"
          fill={color}
          className="opacity-75 animate-pulse"
        />
      </svg>
    </span>
  );
}

