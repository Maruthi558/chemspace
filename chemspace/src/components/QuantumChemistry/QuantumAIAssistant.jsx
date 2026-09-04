import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  Terminal,
  Zap,
  Info,
  ChevronRight
} from 'lucide-react';
import { request } from '../../services/api';

export default function QuantumAIAssistant({ config, onApplyConfig, onRunCalculation, onGenerateInput }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Greetings. I am your **Quantum Chemistry Research Copilot**. I can configure computational workflows, explain frontier molecular orbitals, diagnose SCF convergence failures, and recommend optimal DFT functionals or basis sets for your specific molecular system.\n\nTry asking: *'Recommend a functional for my molecule'*, *'What basis set should I use for anions?'*, or *'Generate an ORCA input file'*."
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleSend = async (customText = null) => {
    const textToSend = (customText || query).trim();
    if (!textToSend) return;

    const newMessages = [...messages, { role: 'user', text: textToSend }];
    setMessages(newMessages);
    setQuery('');
    setIsThinking(true);

    try {
      // Local specialized Quantum AI reasoning logic
      const lower = textToSend.toLowerCase();
      let reply = '';
      let action = null;

      const hasMolecule = config.geometry_atoms && config.geometry_atoms.length > 0;

      if (!hasMolecule) {
        reply = "No molecular input is currently loaded. Enter a SMILES string or draw a molecule in ChemDraw Studio first before analyzing or calculating.";
      } else if (lower.includes('recommend') || lower.includes('functional') || lower.includes('method')) {
        const hasMetals = config.geometry_atoms?.some((a) => ['Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ti', 'Cr'].includes(a));
        if (hasMetals) {
          reply = `For your active transition metal complex (${config.geometry_atoms.join(', ')}), standard B3LYP can struggle with d-electron self-interaction. I recommend **PBE0 or TPSSh** with a **def2-TZVP** basis set to properly capture d-orbital polarization and ligand-field splitting.`;
          action = { label: 'Apply PBE0 / def2-TZVP', config: { method: 'DFT', functional: 'PBE0', basis_set: 'def2-TZVP' } };
        } else {
          reply = `For your active molecular system (${config.geometry_atoms.join('')}), **DFT with the B3LYP functional** and **6-31G(d)** or **def2-SVP** provides an optimal benchmark between accuracy and computational cost.`;
          action = { label: 'Apply B3LYP / 6-31G(d)', config: { method: 'DFT', functional: 'B3LYP', basis_set: '6-31G(d)' } };
        }
      } else if (lower.includes('homo') || lower.includes('lumo') || lower.includes('gap')) {
        reply = `Analyzing frontier orbitals for active structure **${config.smiles || config.formula || config.geometry_atoms.join('')}** (${config.geometry_atoms.length} atoms):\n\nThe **HOMO-LUMO energy gap** represents the fundamental electronic excitation threshold. A larger gap (>4.5 eV) indicates high thermodynamic stability and chemical hardness (resistance to charge transfer).`;
      } else if (lower.includes('orca') || lower.includes('input') || lower.includes('generate')) {
        reply = `I have structured an **ORCA 5.0** input deck tailored specifically to your active molecular structure (${config.geometry_atoms.length} atoms) with tight SCF convergence and standard DFT integration grids.`;
        onGenerateInput();
      } else if (lower.includes('run') || lower.includes('optimize') || lower.includes('calculate')) {
        reply = `Submitting geometry optimization for active structure (${config.geometry_atoms.length} atoms) using **${config.method}/${config.basis_set}** to the compute engine...`;
        onRunCalculation();
      } else if (lower.includes('scf') || lower.includes('convergence') || lower.includes('fail')) {
        reply = `Common reasons for SCF convergence failure include:
1. **Poor initial guess**: Use Huckel or core Hamiltonian guess.
2. **Near-degeneracy / Open-shell state**: Check if your molecule requires UHF or Multiplicity > 1.
3. **Small basis set polarization**: Upgrade from STO-3G to def2-SVP.
4. **Damping & DIIS**: Enable direct inversion in iterative subspace.`;
      } else {
        reply = `Understood. Analyzing computational setup for active molecule with ${config.geometry_atoms.length} atoms using **${config.method} / ${config.basis_set}**. Would you like to run a Single-Point calculation or generate an engine script?`;
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: reply, action }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Error processing quantum AI query.' }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleVoiceToggle = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    if (!isListening) {
      setIsListening(true);
      recognition.start();
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        handleSend(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      recognition.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="glass-panel rounded-[36px] overflow-hidden border border-white/10 shadow-2xl p-6 bg-slate-900/80 dark:bg-black/80 flex flex-col h-[520px] font-sans justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-inner">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              AI Quantum Research Assistant
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 uppercase">
                Active
              </span>
            </h3>
            <p className="text-[10px] text-gray-400 font-mono">Ab initio computational reasoning &amp; workflow automation</p>
          </div>
        </div>

        <button
          onClick={handleVoiceToggle}
          className={`p-2.5 rounded-2xl border transition-all ${
            isListening
              ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
          }`}
          title={isListening ? 'Listening...' : 'Voice Command'}
        >
          {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2 mb-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-4 rounded-3xl max-w-[85%] text-xs leading-relaxed font-sans shadow-md ${
                m.role === 'user'
                  ? 'bg-cyan-500 text-black font-semibold rounded-tr-sm'
                  : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm'
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>

              {/* Action Button inside message */}
              {m.action && (
                <div className="mt-3 pt-2 border-t border-white/10">
                  <button
                    onClick={() => {
                      if (m.action.config) onApplyConfig(m.action.config);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 text-black font-black text-[10px] uppercase flex items-center gap-1 hover:bg-cyan-400 transition shadow-md"
                  >
                    <Zap className="w-3 h-3" /> {m.action.label}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> Quantum AI reasoning in progress...
          </div>
        )}
      </div>

      {/* Prompt Suggestions */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 mb-2">
        {[
          'Recommend functional',
          'Explain HOMO-LUMO gap',
          'Diagnose SCF failure',
          'Generate ORCA input'
        ].map((s) => (
          <button
            key={s}
            onClick={() => handleSend(s)}
            className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-gray-300 whitespace-nowrap font-mono transition"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask quantum questions or issue commands (e.g. 'Use B3LYP and def2-SVP')..."
          className="flex-1 bg-black/60 border border-white/10 rounded-2xl py-3 px-4 text-xs text-cyan-300 font-mono outline-none focus:border-cyan-500 shadow-inner"
        />
        <button
          onClick={() => handleSend()}
          disabled={!query.trim() || isThinking}
          className="p-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-black font-black rounded-2xl transition shadow-lg shadow-cyan-500/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
