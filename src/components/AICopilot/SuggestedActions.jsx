import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function SuggestedActions({ actions, onAction }) {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => onAction(action)}
          className="px-3 py-1.5 rounded-full bg-[var(--bg-inner)] border border-[var(--border-subtle)] hover:border-emerald-500/40 text-[11px] font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-sm"
        >
          <Sparkles className="w-3 h-3 text-emerald-500" />
          <span>{action}</span>
        </button>
      ))}
    </div>
  );
}
