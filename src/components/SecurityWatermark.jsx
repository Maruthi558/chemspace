import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

/**
 * Practical User-Specific Security Watermark Overlay
 * Provides a visible deterrent against unauthorized redistribution of private lab data.
 * Displays masked user ID, verified identity, timestamp, and session hash.
 */
export default function SecurityWatermark({ label = 'RESTRICTED LAB DATA', showBanner = false }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return null;

  const maskedEmail = user.email
    ? user.email.replace(/^(.)(.*)(.@.*)$/, (_, a, b, c) => a + '•••' + c)
    : user.name || 'AUTHENTICATED RESEARCHER';
  
  const userIdentifier = user.uid ? `UID:${user.uid.slice(0, 10)}` : 'SESSION_VERIFIED';
  const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');

  return (
    <>
      {/* Subtle Repeating Background Watermark */}
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden select-none opacity-[0.03] dark:opacity-[0.04]">
        <div className="flex flex-wrap gap-24 p-8 transform -rotate-12 scale-110 font-mono text-xs font-black tracking-widest text-slate-500">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} className="whitespace-nowrap">
              {maskedEmail} • {userIdentifier} • {timestamp} • {label}
            </span>
          ))}
        </div>
      </div>

      {/* Optional Security Notice Strip */}
      {showBanner && (
        <div className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[10px] font-mono flex items-center justify-between gap-2 select-none mb-3">
          <div className="flex items-center gap-2 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-bold truncate">AUTHENTICATED WORKSPACE</span>
            <span className="opacity-70 hidden sm:inline">• Protected under user partition {userIdentifier}</span>
          </div>
          <span className="opacity-60 text-[9px] shrink-0 font-bold">
            CONFIDENTIAL • {timestamp}
          </span>
        </div>
      )}
    </>
  );
}
