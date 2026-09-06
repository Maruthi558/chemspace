import React from 'react';
import { X, Hand, MousePointer, ShieldCheck, ZoomIn, ArrowUpDown, ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import { useGestures } from '../../context/GestureContext';

export default function GestureTutorialModal() {
  const { tutorialOpen, closeTutorial } = useGestures();

  if (!tutorialOpen) return null;

  const TUTORIAL_ITEMS = [
    {
      title: 'Index Finger Point',
      gesture: 'Virtual Air Cursor',
      action: 'Point index finger at the screen to guide the virtual cursor smoothly.',
      icon: MousePointer,
      color: '#06b6d4'
    },
    {
      title: 'Pinch (Thumb + Index)',
      gesture: 'Air Click / Drag',
      action: 'Touch thumb and index finger together to click buttons, tabs, or drag 3D molecules.',
      icon: Hand,
      color: '#10b981'
    },
    {
      title: 'Vertical Hand Movement',
      gesture: 'Proportional Scroll',
      action: 'Move your open hand up or down to scroll pages smoothly with velocity scaling.',
      icon: ArrowUpDown,
      color: '#f59e0b'
    },
    {
      title: 'Horizontal Swipes',
      gesture: 'Page Navigation',
      action: 'Swipe your hand briskly left or right to navigate between sections and history.',
      icon: ArrowLeftRight,
      color: '#3b82f6'
    },
    {
      title: 'Two-Hand Spread / Close',
      gesture: 'Continuous 3D Zoom',
      action: 'Spread both hands apart to zoom in; bring them together to zoom out on molecules.',
      icon: ZoomIn,
      color: '#8b5cf6'
    },
    {
      title: 'Closed Fist',
      gesture: 'Pause / Lock Interaction',
      action: 'Close your hand into a fist to temporarily pause gesture tracking and avoid accidental clicks.',
      icon: ShieldCheck,
      color: '#f43f5e'
    },
    {
      title: 'Open Palm',
      gesture: 'Resume Interaction',
      action: 'Show your open palm to wake up or resume active gesture controls.',
      icon: Hand,
      color: '#10b981'
    }
  ];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-[#0d0e12] border border-cyan-500/30 p-6 shadow-2xl shadow-cyan-950/50 space-y-6 text-white font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Hand className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wider uppercase font-mono text-white">
                TOUCHLESS GESTURE SYSTEM // TUTORIAL
              </h2>
              <p className="text-xs text-neutral-400 font-sans">
                Control the entire ChemSpace platform using real-time hand tracking.
              </p>
            </div>
          </div>

          <button
            onClick={closeTutorial}
            className="p-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gestures Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1 no-scrollbar">
          {TUTORIAL_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-1.5 transition-all hover:border-cyan-500/40"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="p-1.5 rounded-xl border"
                    style={{
                      backgroundColor: `${item.color}15`,
                      borderColor: `${item.color}40`,
                      color: item.color
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold font-mono text-white block">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                      {item.gesture}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
                  {item.action}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Hardware accelerated • Processed locally in browser</span>
          </div>

          <button
            onClick={closeTutorial}
            className="px-5 py-2 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
