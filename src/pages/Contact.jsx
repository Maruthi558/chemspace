import React, { useState } from 'react';
import { Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 select-none font-sans">
      {/* 1. WORKSPACE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-500 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[var(--text-primary)] tracking-tight">SCIENTIFIC SUPPORT & INQUIRIES</span>
              <span className="text-[10px] font-mono bg-orange-500/15 text-orange-500 border border-orange-500/30 font-semibold px-2 py-0.5 rounded-full">
                COMMUNICATIONS
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-normal mt-0.5">
              Reach out for academic collaborations, enterprise deployment, or computational chemistry workflows.
            </p>
          </div>
        </div>

        <div className="telemetry-pill">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>INQUIRY DESK // ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Contact Form (7 Cols) */}
        <div className="lg:col-span-7 card-scientific p-6 space-y-4">
          <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border-subtle)] pb-3">
            Send Message to the ChemSpace Scientific Team
          </h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!message.trim()) return;
              setSubmitted(true);
              setMessage('');
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs text-[var(--text-secondary)] font-medium mb-1.5">Inquiry Details:</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={7}
                className="input-control font-mono leading-relaxed"
                placeholder="Inquire about RDKit REST API integrations, custom DFT basis sets, or enterprise workflows..."
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="btn-orange text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>

              {submitted && (
                <span className="text-emerald-500 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  Message received! We will respond shortly.
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Right: Office & Support (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="card-scientific p-6 space-y-4">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border-subtle)] pb-2.5 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" /> Headquarters & Direct Mail
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-[var(--bg-inner)] rounded-xl border border-[var(--border-subtle)] space-y-1">
                <span className="text-[var(--text-muted)] text-[10px] block font-mono">Research Center:</span>
                <span className="text-[var(--text-primary)] font-bold block">ChemSpace Computational Chemistry Laboratories</span>
                <span className="text-[var(--text-secondary)] block">Palo Alto Science Park, CA</span>
              </div>

              <div className="p-3.5 bg-[var(--bg-inner)] rounded-xl border border-[var(--border-subtle)] space-y-1">
                <span className="text-[var(--text-muted)] text-[10px] block font-mono">Official Email:</span>
                <span className="text-[var(--text-primary)] font-mono font-bold block">research@chemspace.sci</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
