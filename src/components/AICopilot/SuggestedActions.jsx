import React from 'react';
import { Sparkles } from 'lucide-react';

export default function SuggestedActions({ actions, onAction }) {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => onAction(action)}
          className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 text-[11px] text-gray-300 hover:text-cyan-400 transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <Sparkles className="w-3 h-3" />
          {action}
        </button>
      ))}
    </div>
  );
}
