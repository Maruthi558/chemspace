import React, { useRef, useEffect, useState } from 'react';
import { Camera, Minimize2, Maximize2, X, Hand, Activity } from 'lucide-react';
import { useGestures } from '../../context/GestureContext';

export default function FloatingCameraPreview() {
  const {
    isEnabled,
    previewVisible,
    setPreviewVisible,
    previewMinimized,
    setPreviewMinimized,
    handDetected,
    currentMode,
    currentAction,
    isPinching,
    isPaused,
    enableGestures,
    hiddenVideoRef
  } = useGestures();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Position state for draggable HUD
  const [position, setPosition] = useState(() => {
    return {
      x: window.innerWidth - 270,
      y: window.innerHeight - 230
    };
  });
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Connect video and canvas when component mounts
  useEffect(() => {
    if (isEnabled && videoRef.current && canvasRef.current) {
      enableGestures(videoRef.current, canvasRef.current);
    }
  }, [isEnabled, enableGestures]);

  // Dragging handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return;
    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 260, e.clientX - dragOffsetRef.current.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 200, e.clientY - dragOffsetRef.current.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!isEnabled || !previewVisible) return null;

  // Minimized Compact Pill
  if (previewMinimized) {
    return (
      <div
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        className="fixed z-[99990] flex items-center gap-2 p-2 rounded-2xl bg-[#08080a]/90 border border-cyan-500/30 text-white shadow-2xl backdrop-blur-xl cursor-move select-none animate-in fade-in"
        onMouseDown={handleMouseDown}
      >
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            handDetected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
          }`}
        />
        <Camera className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300">
          {currentMode}
        </span>
        <button
          onClick={() => setPreviewMinimized(false)}
          className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
          title="Expand Camera Preview"
        >
          <Maximize2 className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed z-[99990] w-64 rounded-2xl overflow-hidden bg-[#0a0a0e]/95 border border-cyan-500/30 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl select-none font-sans text-white animate-in zoom-in-95 duration-150"
    >
      {/* Header Bar - Draggable */}
      <div
        onMouseDown={handleMouseDown}
        className="px-3 py-2 bg-neutral-900/90 border-b border-white/10 flex items-center justify-between cursor-move"
      >
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              handDetected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span className="text-[10px] font-mono font-bold tracking-wider text-neutral-300">
            GESTURE SENSOR
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPreviewMinimized(true)}
            className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
            title="Minimize Preview"
          >
            <Minimize2 className="w-3 h-3" />
          </button>
          <button
            onClick={() => setPreviewVisible(false)}
            className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
            title="Hide Preview (Tracking continues)"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Video & Skeleton Viewport */}
      <div className="relative w-full h-44 bg-black overflow-hidden">
        {/* Mirrored webcam stream */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover -scale-x-100 opacity-60"
          playsInline
          muted
          autoPlay
        />

        {/* Real-time Hand Landmarks Canvas */}
        <canvas
          ref={canvasRef}
          width={256}
          height={176}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Live HUD Telemetry Overlay */}
        <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/70 border border-white/10 text-[9px] font-mono backdrop-blur-sm">
            <Activity className="w-2.5 h-2.5 text-cyan-400" />
            <span className="text-neutral-300">
              {handDetected ? (isPaused ? 'PAUSED' : currentMode) : 'SEARCHING'}
            </span>
          </div>
        </div>

        {/* Pinch Indicator Bar */}
        {handDetected && (
          <div className="absolute bottom-2 left-2 right-2 z-20 flex items-center justify-between px-2.5 py-1 rounded-xl bg-black/80 border border-white/10 text-[10px] font-mono backdrop-blur-md">
            <span className="text-neutral-400 truncate max-w-[140px]">
              {currentAction}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded font-bold uppercase text-[8px] ${
                isPinching
                  ? 'bg-emerald-500 text-black'
                  : 'bg-white/10 text-neutral-300'
              }`}
            >
              {isPinching ? 'PINCH' : 'OPEN'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
