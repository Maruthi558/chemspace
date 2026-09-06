import React from 'react';
import {
  Hand,
  Camera,
  CameraOff,
  Eye,
  EyeOff,
  Sliders,
  HelpCircle,
  Activity,
  AlertTriangle,
  Play,
  Pause
} from 'lucide-react';
import { useGestures } from '../../context/GestureContext';

export default function GestureControlPanel({ isOpen, onClose }) {
  const {
    isEnabled,
    toggleGestures,
    cameraActive,
    handDetected,
    handCount,
    currentMode,
    currentAction,
    isPaused,
    previewVisible,
    setPreviewVisible,
    sensitivity,
    setSensitivity,
    openTutorial,
    openCalibration,
    cameraError
  } = useGestures();

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-4 sm:right-6 z-[99990] w-80 rounded-3xl bg-[#0c0d12]/95 border border-cyan-500/30 p-5 shadow-2xl shadow-cyan-950/60 backdrop-blur-xl select-none font-sans text-white animate-in slide-in-from-top-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
              isEnabled
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-neutral-800 border-neutral-700 text-neutral-400'
            }`}
          >
            <Hand className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-wider uppercase font-mono text-white">
              TOUCHLESS GESTURES
            </h3>
            <span className="text-[9px] font-mono text-cyan-400 block">
              Spatial Vision Controller
            </span>
          </div>
        </div>

        {/* Master Power Toggle Button */}
        <button
          onClick={toggleGestures}
          type="button"
          className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-sm ${
            isEnabled
              ? 'bg-emerald-500 text-black hover:bg-emerald-400'
              : 'bg-white/10 text-neutral-300 hover:bg-white/20 border border-white/20'
          }`}
        >
          {isEnabled ? (
            <>
              <Camera className="w-3.5 h-3.5" />
              <span>ACTIVE</span>
            </>
          ) : (
            <>
              <CameraOff className="w-3.5 h-3.5" />
              <span>ENABLE</span>
            </>
          )}
        </button>
      </div>

      {/* Camera Permission Alert if Error */}
      {cameraError && (
        <div className="mt-3 p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="text-[11px] font-mono">{cameraError}</span>
        </div>
      )}

      {/* Telemetry Status Gauges */}
      <div className="mt-4 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          {/* Camera Status */}
          <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-white/10 space-y-1">
            <span className="text-[9px] uppercase tracking-wider text-neutral-400 block">
              Camera Sensor
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  cameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'
                }`}
              />
              <span className="font-bold text-[11px] text-white">
                {cameraActive ? 'Streaming' : 'Standby'}
              </span>
            </div>
          </div>

          {/* Hand Detection Status */}
          <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-white/10 space-y-1">
            <span className="text-[9px] uppercase tracking-wider text-neutral-400 block">
              Hand Tracking
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  handDetected ? 'bg-cyan-400 animate-pulse' : 'bg-neutral-600'
                }`}
              />
              <span className="font-bold text-[11px] text-white">
                {handDetected ? `${handCount} Hand${handCount > 1 ? 's' : ''}` : 'Searching'}
              </span>
            </div>
          </div>
        </div>

        {/* Current Mode & Action Banner */}
        <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-neutral-400 uppercase tracking-wider">Active Mode:</span>
            <span
              className={`font-bold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-widest ${
                isPaused
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}
            >
              {isPaused ? 'PAUSED' : currentMode}
            </span>
          </div>
          <p className="text-[11px] font-mono text-neutral-300 truncate">
            {currentAction}
          </p>
        </div>
      </div>

      {/* Sensitivity Slider */}
      <div className="mt-3 p-2.5 rounded-xl bg-neutral-900/80 border border-white/10 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-neutral-400">Tracking Sensitivity:</span>
          <span className="text-cyan-400 font-bold">{sensitivity.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="2.5"
          step="0.1"
          value={sensitivity}
          onChange={(e) => setSensitivity(parseFloat(e.target.value))}
          className="w-full accent-cyan-400 cursor-pointer h-1.5"
        />
      </div>

      {/* Quick Action Links */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-mono">
        <button
          onClick={() => setPreviewVisible(!previewVisible)}
          type="button"
          className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-neutral-300 hover:text-white flex flex-col items-center gap-1 transition cursor-pointer"
        >
          {previewVisible ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{previewVisible ? 'Preview' : 'Hidden'}</span>
        </button>

        <button
          onClick={openCalibration}
          type="button"
          className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-neutral-300 hover:text-white flex flex-col items-center gap-1 transition cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Calibrate</span>
        </button>

        <button
          onClick={openTutorial}
          type="button"
          className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-neutral-300 hover:text-white flex flex-col items-center gap-1 transition cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>Tutorial</span>
        </button>
      </div>

      {/* Close button */}
      <div className="mt-3 pt-2 border-t border-white/10 text-center">
        <button
          onClick={onClose}
          type="button"
          className="text-[10px] font-mono text-neutral-400 hover:text-white transition cursor-pointer"
        >
          Dismiss Control Panel
        </button>
      </div>
    </div>
  );
}
