import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * SkeletonLoader
 * Reusable scientific skeleton placeholders for asynchronous data,
 * cards, tables, and molecular panels.
 */

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 select-none ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, idx) => (
        <div
          key={idx}
          className={`h-3 rounded-lg bg-[var(--border-subtle)] chemspace-shimmer ${
            idx === lines - 1 ? 'w-3/5' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div
      className={`p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-4 select-none ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[var(--border-subtle)] chemspace-shimmer shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 w-1/3 rounded-md bg-[var(--border-subtle)] chemspace-shimmer" />
          <div className="h-2.5 w-1/2 rounded-md bg-[var(--border-subtle)] chemspace-shimmer opacity-70" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 w-full rounded-md bg-[var(--border-subtle)] chemspace-shimmer" />
        <div className="h-3 w-4/5 rounded-md bg-[var(--border-subtle)] chemspace-shimmer" />
        <div className="h-3 w-2/3 rounded-md bg-[var(--border-subtle)] chemspace-shimmer" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }) {
  return (
    <div
      className={`w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {/* Header */}
      <div className="p-3 border-b border-[var(--border-subtle)] bg-[var(--bg-inner)] flex items-center justify-between gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded-md bg-[var(--border-subtle)] chemspace-shimmer"
            style={{ width: `${100 / cols}%` }}
          />
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y divide-[var(--border-subtle)]">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="p-3.5 flex items-center justify-between gap-4">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div
                key={cIdx}
                className="h-2.5 rounded-md bg-[var(--border-subtle)] chemspace-shimmer opacity-80"
                style={{ width: `${Math.max(40, Math.min(90, (cIdx + 1) * 20))}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonMolecule({ className = '' }) {
  return (
    <div
      className={`w-full h-48 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-inner)] flex items-center justify-center relative overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 chemspace-shimmer" />
      <div className="w-20 h-20 rounded-full border border-dashed border-emerald-500/20 flex items-center justify-center chemspace-pulse-glow">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30" />
      </div>
    </div>
  );
}

export default {
  Text: SkeletonText,
  Card: SkeletonCard,
  Table: SkeletonTable,
  Molecule: SkeletonMolecule
};
