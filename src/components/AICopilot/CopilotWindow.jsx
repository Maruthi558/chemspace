import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Mic,
  MicOff,
  Bot,
  Sparkles,
  Terminal,
  Activity,
  History,
  Trash2,
  Maximize2,
  Minimize2,
  RotateCcw,
  StopCircle,
  Paperclip,
  Volume2,
  VolumeX,
  FileText,
  CheckCircle2,
  ArrowRight,
  Code,
  Compass,
  Zap,
  Play
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { aiCopilot } from '../../services/aiCopilotService';
import { useTheme } from '../../context/ThemeContext';
import ChatMessage from './ChatMessage';
import VoiceVisualizer from './VoiceVisualizer';
import ChemistryCard from './ChemistryCard';
import SuggestedActions from './SuggestedActions';
import { getUserPreferences } from '../../services/userPreferences';

export default function CopilotWindow({ onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am **ChemBot**, your AI lab assistant embedded in this chemistry website.\n\nI can answer chemistry questions directly (periodic table, molecular structures, drug discovery, spectroscopy, chemical synthesis) or guide you to any tool on the site (like **ChemDraw**, **RDKit Lab**, **Quantum Chemistry**, or **Spectroscopy**).\n\nHow can I help you today?",
      suggestedActions: [
        'Draw a Molecule in ChemDraw',
        'Calculate Lipinski Descriptors',
        'Explain HOMO-LUMO Gap',
        'Look Up an Element'
      ]
    }
  ]);

  const [micState, setMicState] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'speaking'
  const [liveTranscript, setLiveTranscript] = useState('');
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const [attachedFile, setAttachedFile] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, liveTranscript]);

  useEffect(() => {
    // Theme switch listener dispatched from AI
    const handleThemeSwitch = (e) => {
      if (e.detail && e.detail.theme) {
        setTheme(e.detail.theme);
      }
    };
    window.addEventListener('chemspace-theme-switch', handleThemeSwitch);
    return () => window.removeEventListener('chemspace-theme-switch', handleThemeSwitch);
  }, [setTheme]);

  /**
   * Handle sending a query to the AI Copilot
   */
  const handleSend = async (textOverride = null, isRegenerate = false) => {
    const text = (textOverride || query).trim();
    if (!text && !attachedFile && !isRegenerate) return;

    let fullPrompt = text;
    let currentAttached = attachedFile;

    if (currentAttached) {
      fullPrompt = `[Attached File: ${currentAttached.name} (${currentAttached.type})]\n${currentAttached.content}\n\nUser Request: ${text || 'Please inspect this scientific file, identify the molecular data or script, and suggest next steps.'}`;
    }

    if (!isRegenerate) {
      setQuery('');
      setAttachedFile(null);
      setLiveTranscript('');
      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          content: text || `Uploaded file: ${currentAttached?.name}`,
          attachedFileName: currentAttached?.name
        }
      ]);
    } else {
      setMessages((prev) => prev.slice(0, -1));
    }

    setIsLoading(true);
    setActionNotice(null);
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const prefs = getUserPreferences();
      const activeMolecule = localStorage.getItem('chemspace_active_molecule') || null;
      const activeScientist = localStorage.getItem('chemspace_selected_scientist') || null;

      const contextPayload = {
        currentPath: location.pathname,
        activeMolecule,
        activeScientist,
        preferredLanguage: prefs.language,
        responseMode: prefs.aiResponseMode
      };

      const result = await aiCopilot.sendMessage(fullPrompt, contextPayload, controller.signal);

      const aiMessage = {
        role: 'assistant',
        content: '',
        thinkingSteps: result.thinkingSteps || [],
        moleculeCard: result.moleculeCard,
        codeBlock: result.codeBlock,
        suggestedActions: result.suggestedActions || []
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Stream response chunks smoothly
      for await (const chunk of aiCopilot.streamResponse(result.responseText, controller.signal)) {
        if (controller.signal.aborted) break;
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = chunk;
          return newMessages;
        });
      }

      // Handle Safe Navigation Action
      if (result.navigationTarget) {
        setActionNotice(`Navigating to ${result.targetName || result.navigationTarget}...`);
        setTimeout(() => {
          if (!controller.signal.aborted) {
            navigate(result.navigationTarget);
            setActionNotice(null);
          }
        }, 1500);
      }

      // If TTS enabled, voice was used, or autoRead preference is on, speak the response
      if (ttsEnabled || micState === 'processing' || prefs.autoRead) {
        aiCopilot.speak(result.responseText);
        setMicState('speaking');
        setTimeout(() => {
          setMicState('idle');
        }, Math.min(10000, result.responseText.length * 70));
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: "I encountered an issue processing that scientific request. Please verify the input syntax or try another query."
          }
        ]);
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  /**
   * Stops current generation & TTS
   */
  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setIsLoading(false);
      setAbortController(null);
    }
    aiCopilot.stopSpeaking();
    aiCopilot.stopListening();
    setMicState('idle');
  };

  /**
   * Toggles Voice Dictation
   */
  const toggleMic = () => {
    if (micState === 'listening') {
      aiCopilot.stopListening();
      setMicState('idle');
      if (liveTranscript.trim()) {
        handleSend(liveTranscript);
      }
    } else {
      setMicState('listening');
      setLiveTranscript('');
      aiCopilot.startListening(
        (interim) => {
          setLiveTranscript(interim);
        },
        (final) => {
          setLiveTranscript(final);
          setMicState('processing');
          handleSend(final);
        },
        (error) => {
          console.warn('Voice recognition notice:', error);
          setMicState('idle');
        },
        () => {
          if (micState === 'listening') setMicState('idle');
        }
      );
    }
  };

  /**
   * Handles local file attachment (.py, .mol, .sdf, .xyz, .csv, .txt, .json, .log)
   */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setAttachedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.name.split('.').pop().toUpperCase(),
        content: evt.target?.result || ''
      });
      textInputRef.current?.focus();
    };
    reader.readAsText(file);
  };

  const handleClearHistory = () => {
    aiCopilot.clearHistory();
    setMessages([
      {
        role: 'assistant',
        content: "Conversation history cleared. Ready for your next research task.",
        suggestedActions: ["Analyze Aspirin", "Write RDKit Script", "Open Quantum Chemistry"]
      }
    ]);
  };

  const handleActionClick = (action) => {
    handleSend(action);
  };

  const handleDeepAnalyzeCard = (cardData) => {
    if (cardData?.smiles) {
      try {
        localStorage.setItem('chemspace_active_mol', JSON.stringify({ smiles: cardData.smiles, name: cardData.name }));
      } catch (e) {}
      navigate('/rdkit-lab');
      onClose();
    }
  };

  if (isMinimized) {
    return (
      <div
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-3xl bg-cyan-500 text-slate-950 shadow-2xl cursor-pointer hover:scale-105 transition flex items-center gap-3 font-mono font-bold"
      >
        <Bot className="w-5 h-5 animate-pulse" />
        <span className="text-xs">ChemAI Copilot (Active)</span>
        <Maximize2 className="w-4 h-4" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 select-none font-mono">
      <div
        className={`glass-panel rounded-[32px] border border-[var(--border-subtle)] shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isMaximized ? 'w-full h-full max-w-[1280px] max-h-[92vh]' : 'w-full max-w-2xl h-[680px] max-h-[88vh]'
        }`}
      >
        {/* 1. COPILOT HEADER */}
        <div className="px-5 py-3.5 border-b border-inherit flex items-center justify-between bg-inherit shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-[var(--text-primary)]">ChemBot AI Assistant</h2>
                <span className="telemetry-pill text-[9px]">LAB COPILOT</span>
              </div>
              <p className="text-[10px] text-[var(--text-secondary)] font-sans">
                Context: <strong className="text-cyan-400">{location.pathname}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
            {/* Audio Voice Toggle */}
            <button
              onClick={() => {
                setTtsEnabled(!ttsEnabled);
                if (ttsEnabled) aiCopilot.stopSpeaking();
              }}
              className={`p-2 rounded-xl transition ${
                ttsEnabled ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'hover:bg-white/5'
              }`}
              title={ttsEnabled ? 'Mute AI Voice Output' : 'Enable AI Voice Output'}
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Clear History */}
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl hover:bg-white/5 transition"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Maximize / Restore */}
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2 rounded-xl hover:bg-white/5 transition hidden sm:inline-flex"
              title={isMaximized ? 'Restore Size' : 'Maximize Window'}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Minimize */}
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 rounded-xl hover:bg-white/5 transition"
              title="Minimize Copilot"
            >
              <span className="text-base leading-none font-bold">_</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-rose-500/20 hover:text-rose-400 transition"
              title="Close Copilot"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Notice Bar (when AI executes safe platform action) */}
        {actionNotice && (
          <div className="px-5 py-2 bg-cyan-500/10 border-b border-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center gap-2 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* 2. CONVERSATION MESSAGE STREAM */}
        <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx}>
              <ChatMessage message={msg} isLast={idx === messages.length - 1} />
              {msg.moleculeCard && (
                <div className="max-w-[85%] ml-11">
                  <ChemistryCard data={msg.moleculeCard} onAnalyze={handleDeepAnalyzeCard} />
                </div>
              )}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && idx === messages.length - 1 && (
                <div className="ml-11">
                  <SuggestedActions actions={msg.suggestedActions} onAction={handleActionClick} />
                </div>
              )}
            </div>
          ))}

          {/* Live Voice Speech-to-Text Preview */}
          {micState === 'listening' && (
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs flex items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-cyan-400 animate-bounce" />
                <span className="font-bold">Listening:</span>
                <span className="italic text-[var(--text-primary)]">
                  {liveTranscript || 'Speak your scientific question or command...'}
                </span>
              </div>
              <VoiceVisualizer state={micState} />
            </div>
          )}

          {/* Loading / Generating Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] ml-1">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
              </div>
              <span className="animate-pulse font-medium">ChemAI is computing scientific response...</span>
            </div>
          )}
        </div>

        {/* 3. ATTACHED FILE BADGE */}
        {attachedFile && (
          <div className="px-5 py-2 border-t border-inherit bg-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-cyan-400">
              <FileText className="w-4 h-4" />
              <span className="font-bold">{attachedFile.name}</span>
              <span className="text-[10px] opacity-60 font-mono">({attachedFile.size})</span>
            </div>
            <button
              onClick={() => setAttachedFile(null)}
              className="text-rose-400 hover:text-rose-300 text-xs font-bold"
            >
              Remove
            </button>
          </div>
        )}

        {/* 4. FOOTER & MULTI-MODAL PROMPT INPUT */}
        <div className="p-4 border-t border-inherit bg-inherit shrink-0 space-y-2">
          <div className="relative flex items-center gap-2">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".py,.mol,.sdf,.xyz,.csv,.txt,.json,.log,.out"
              className="hidden"
            />

            {/* Attach File Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-cyan-400 transition"
              title="Attach File (.py, .mol, .sdf, .xyz, .csv, .log)"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Voice Dictation Button */}
            <button
              onClick={toggleMic}
              className={`p-3 rounded-2xl border transition-all ${
                micState === 'listening'
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-lg'
                  : 'bg-white/5 hover:bg-white/10 border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-cyan-400'
              }`}
              title={micState === 'listening' ? 'Stop Listening & Send' : 'Speak Voice Command'}
            >
              {micState === 'listening' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Query Text Input */}
            <input
              ref={textInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask chemistry questions, request RDKit code, or say 'Open ChemDraw'..."
              className="input-control flex-1 py-3 px-4 rounded-2xl text-xs font-mono text-[var(--text-primary)]"
            />

            {/* Send / Stop Button */}
            {isLoading ? (
              <button
                onClick={handleStop}
                className="p-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white transition shadow-md"
                title="Stop Response Generation"
              >
                <StopCircle className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                disabled={!query.trim() && !attachedFile}
                className="p-3 rounded-2xl btn-primary transition shadow-lg disabled:opacity-30"
                title="Send Prompt (Enter)"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
