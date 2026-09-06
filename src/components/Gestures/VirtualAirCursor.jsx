import React from 'react';
import { useGestures } from '../../context/GestureContext';

export default function VirtualAirCursor() {
  const { isEnabled, handDetected, cursorPos, isPinching, currentMode, currentAction, isPaused } =
    useGestures();

  if (!isEnabled || !handDetected) return null;

  const isClicking = isPinching;
  const cursorColor = isPaused
    ? '#f43f5e' // Rose if paused
    : isClicking
    ? '#10b981' // Emerald when pinching/clicking
    : currentMode === 'SCROLL'
    ? '#f59e0b' // Amber when scrolling
    : currentMode === 'ZOOM'
    ? '#8b5cf6' // Purple when zooming
    : '#06b6d4'; // Cyan default

  return (
    <div
      className="fixed pointer-events-none z-[99998] transition-transform duration-75 will-change-transform"
      style={{
        left: `${cursorPos.x}px`,
        top: `${cursorPos.y}px`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="relative flex items-center justify-center air-cursor-glow">
        {/* Outer Rotating Reticle Ring */}
        <div
          className={`w-10 h-10 rounded-full border border-dashed transition-all duration-150 ${
            isClicking ? 'scale-75 border-solid' : 'animate-spin-slow scale-100'
          }`}
          style={{ borderColor: cursorColor }}
        />

        {/* Inner Targeting Ring */}
        <div
          className={`absolute rounded-full border transition-all duration-150 ${
            isClicking ? 'w-4 h-4 bg-emerald-400/40' : 'w-6 h-6'
          }`}
          style={{
            borderColor: cursorColor,
            boxShadow: `0 0 10px ${cursorColor}`
          }}
        />

        {/* Center Nucleus Dot */}
        <div
          className="w-2 h-2 rounded-full transition-all duration-150"
          style={{
            backgroundColor: cursorColor,
            boxShadow: `0 0 8px ${cursorColor}`
          }}
        />

        {/* Futuristic HUD Badge */}
        <div
          className="absolute top-6 left-6 px-2 py-0.5 rounded-full text-[9px] font-mono font-black tracking-widest uppercase border whitespace-nowrap shadow-lg backdrop-blur-md transition-all"
          style={{
            backgroundColor: 'rgba(8, 8, 10, 0.85)',
            borderColor: cursorColor,
            color: cursorColor
          }}
        >
          {isPaused
            ? 'PAUSED'
            : isClicking
            ? 'AIR CLICK'
            : currentMode === 'SCROLL'
            ? 'SCROLLING'
            : currentMode === 'ZOOM'
            ? 'ZOOMING'
            : 'AIR POINT'}
        </div>
      </div>
    </div>
  );
}
