import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, Mic, MicOff, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const QUICK_PROMPTS = [
  "Guide me through drawing benzene in ChemDraw",
  "Analyze IR peaks step-by-step for Aspirin",
  "Show Quantum HOMO-LUMO gap for Benzene",
  "Predict IBM RXN retrosynthesis pathway"
];

export default function ChemAIModal({ onClose }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am ChemAI, your scientific research assistant. Ask me chemistry questions, request molecular calculations, or say commands like 'Draw Aspirin' or 'Open Periodic Table'."
    }
  ]);
  const [loading, setLoading] = useState(false);

  function toggleVoiceCommand() {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setQuery('Draw Aspirin and calculate LogP');
      setTimeout(() => {
        setIsListening(false);
      }, 2000);
    }
  }

  function handleSend(promptText) {
    const textToSend = promptText || query;
    if (!textToSend.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: textToSend }];
    setMessages(newMessages);
    setQuery('');
    setLoading(true);

    const lower = textToSend.toLowerCase();
    if (lower.includes("draw") || lower.includes("chemdraw")) {
      setTimeout(() => {
        setMessages([...newMessages, { sender: 'ai', text: "Navigating to **ChemDraw Canvas Editor** to draw your structure..." }]);
        setLoading(false);
        navigate('/chemdraw');
        onClose();
      }, 600);
      return;
    }

    if (lower.includes("periodic")) {
      setTimeout(() => {
        setMessages([...newMessages, { sender: 'ai', text: "Opening the **118-Element Interactive Periodic Table**..." }]);
        setLoading(false);
        navigate('/periodic-table');
        onClose();
      }, 600);
      return;
    }

    if (lower.includes("rxn") || lower.includes("retrosynthesis") || lower.includes("synthesis")) {
      setTimeout(() => {
        setMessages([...newMessages, { sender: 'ai', text: "Opening the **IBM RXN Reaction Prediction Studio** for automated pathway planning..." }]);
        setLoading(false);
        navigate('/ibm-rxn');
        onClose();
      }, 600);
      return;
    }

    if (lower.includes("rdkit") || lower.includes("python") || lower.includes("ide")) {
      setTimeout(() => {
        setMessages([...newMessages, { sender: 'ai', text: "Opening the **RDKit Laboratory** for Python chemoinformatics workflows..." }]);
        setLoading(false);
        navigate('/rdkit-lab');
        onClose();
      }, 600);
      return;
    }

    if (lower.includes("quantum") || lower.includes("homo") || lower.includes("vqe")) {
      setTimeout(() => {
        setMessages([...newMessages, { sender: 'ai', text: "Opening the **Quantum VQE Calculator**..." }]);
        setLoading(false);
        navigate('/quantum-library');
        onClose();
      }, 600);
      return;
    }

    if (lower.includes("spectroscopy") || lower.includes("ir") || lower.includes("nmr")) {
      setTimeout(() => {
        setMessages([...newMessages, { sender: 'ai', text: "Opening the **Spectroscopy Suite**..." }]);
        setLoading(false);
        navigate('/spectroscopy');
        onClose();
      }, 600);
      return;
    }

    setTimeout(() => {
      setMessages([
        ...newMessages,
        {
          sender: 'ai',
          text: `[ChemAI Response]\nComputed analysis for: "${textToSend}". You can launch dedicated tools from the left sidebar to simulate MMFF94 forcefields, compute RDKit descriptors, or calculate VQE electronic structures.`
        }
      ]);
      setLoading(false);
    }, 700);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-xl rounded-3xl border overflow-hidden shadow-2xl flex flex-col max-h-[85vh] transition-colors duration-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl inner-box flex items-center justify-center">
              <Bot className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-1.5">
                ChemAI Research Copilot
                <span className="telemetry-pill text-[9px]">VOICE & BOT</span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 opacity-60 hover:opacity-100 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs font-mono">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg inner-box flex items-center justify-center shrink-0">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                  msg.sender === 'user'
                    ? 'btn-primary rounded-tr-none font-bold'
                    : 'inner-box rounded-tl-none font-sans whitespace-pre-wrap'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs font-mono p-2 opacity-80">
              <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
              <span>ChemAI processing query & computing descriptors...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestions */}
        <div className="px-4 py-2 border-t border-inherit space-y-2 inner-box rounded-none border-x-0">
          <div className="flex items-center justify-between text-xs font-mono opacity-80">
            <span>Automated Workflows:</span>
            <button
              onClick={() => setPermissionsGranted(!permissionsGranted)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
                permissionsGranted
                  ? 'bg-emerald-500 text-black'
                  : 'tag-pill'
              }`}
            >
              {permissionsGranted ? 'Active' : 'Standby'}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {QUICK_PROMPTS.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp)}
                className="text-[11px] px-2.5 py-1 rounded-full tag-pill shrink-0 truncate text-left"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Input Footer */}
        <div className="p-3 border-t border-inherit flex items-center gap-2">
          <button
            onClick={toggleVoiceCommand}
            className={`p-2.5 rounded-xl border transition ${
              isListening ? 'bg-red-600 text-white animate-pulse' : 'btn-secondary'
            }`}
            title="Voice Command Mode"
          >
            {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? "Listening to voice command..." : "Ask ChemAI or type 'Draw Benzene'..."}
            className="input-control flex-1 text-xs"
          />
          <button
            onClick={() => handleSend()}
            disabled={!query.trim()}
            className="btn-horizontal btn-primary text-xs"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
