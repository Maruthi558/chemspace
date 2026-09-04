import React, { useState } from 'react';
import { Mail, MapPin, Send, Sparkles, Bot, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="workspace-container font-mono select-none">
      {/* 1. WORKSPACE HEADER */}
      <div className="workspace-header">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/15">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white tracking-wider">SCIENTIFIC SUPPORT & INQUIRIES</span>
              <span className="text-[10px] bg-white text-black font-bold px-1.5 py-0.5 rounded">
                COMMUNICATIONS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Reach out for academic collaborations, enterprise deployment, or computational chemistry questions.
            </p>
          </div>
        </div>

        <div className="telemetry-pill">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>INQUIRY DESK // ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        {/* Left: Contact Form (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-white/15 space-y-4 shadow-2xl">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3">
            Send Message to the ChemNova Scientific Team
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
              <label className="block text-xs text-slate-400 font-sans mb-1.5">Inquiry Details:</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={7}
                className="w-full rounded-xl border border-white/15 bg-[#02040a] p-3 text-xs text-white focus:border-white focus:outline-none font-mono transition"
                placeholder="Inquire about RDKit REST API integrations, custom DFT basis sets, or enterprise workflows..."
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="btn-horizontal btn-primary text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>

              {submitted && (
                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Message received! We will respond shortly.
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Right: Office & ChemAI Support (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="glass-panel p-5 rounded-2xl border border-white/15 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2.5 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-white" /> Headquarters & Direct Mail
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-[#02040a] rounded-xl border border-white/10 space-y-1">
                <span className="text-slate-500 text-[10px] block font-sans">Research Center:</span>
                <span className="text-white font-bold">ChemNova Computational Chemistry Laboratories</span>
                <span className="text-slate-400 block font-sans">Palo Alto Science Park, CA</span>
              </div>

              <div className="p-3 bg-[#02040a] rounded-xl border border-white/10 space-y-1">
                <span className="text-slate-500 text-[10px] block font-sans">Official Email:</span>
                <span className="text-white font-mono font-bold">research@chemnova.sci</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
