import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Mic,
  MicOff,
  Sparkles,
  Minus,
  Maximize2,
  Minimize2,
  Trash2,
  Square,
  Sliders,
  Volume2,
  VolumeX,
  Radio,
  Paperclip,
  FileText
} from 'lucide-react';
import { aiCopilot } from '../../services/aiCopilotService';
import { useTheme } from '../../context/ThemeContext';
import ChatMessage from './ChatMessage';
import VoiceVisualizer from './VoiceVisualizer';
import CircularVoiceButton from './CircularVoiceButton';
import AILoader from '../loading/AILoader';

const INITIAL_WELCOME_MESSAGE = {
  role: 'assistant',
  content: "Hello! I am **ChemSpace AI**, your chemistry and science assistant. I'm here to answer chemical concepts, solve calculations, explain mechanisms, analyze spectra, or explore scientific topics with you.\n\nHow can I help you today?",
  timestamp: new Date().toISOString()
};

export default function CopilotWindow({ isOpen = true, onClose, onOpen }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([INITIAL_WELCOME_MESSAGE]);
  const [selectedLanguage, setSelectedLanguage] = useState('auto');

  // Window Display States
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Execution States
  const [isLoading, setIsLoading] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const [attachedFile, setAttachedFile] = useState(null);

  // Voice States
  const [voiceConfig, setVoiceConfig] = useState(aiCopilot.getVoiceSettings());
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [micState, setMicState] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'speaking'
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');

  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recordingTimerRef = useRef(null);

  // Scroll to bottom on new messages or stream chunks
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, liveTranscript]);

  // Load available speech voices
  useEffect(() => {
    const loadVoices = () => {
      setAvailableVoices(aiCopilot.getAvailableVoices());
    };
    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      aiCopilot.interruptAll();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  const updateVoiceSetting = (key, value) => {
    let updated;
    if (key === 'voiceGender') updated = aiCopilot.setVoiceGender(value);
    else if (key === 'speechSpeed') updated = aiCopilot.setSpeechSpeed(value);
    else if (key === 'voiceOutput') updated = aiCopilot.setVoiceOutput(value);
    else if (key === 'selectedVoiceURI') updated = aiCopilot.setSelectedVoiceURI(value);
    else if (key === 'conversationalMode') updated = aiCopilot.setConversationalMode(value);
    setVoiceConfig({ ...updated });
  };

  /**
   * CANCEL / STOP: Mandatory control to immediately cancel generation, voice playback, or recording
   */
  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    aiCopilot.interruptAll();
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsLoading(false);
    setMicState('idle');
    setRecordingSeconds(0);
    setLiveTranscript('');
  };

  /**
   * SEND ACTION: Streams response from backend or uses fallback
   */
  const handleSend = async (textOverride = null) => {
    const text = (textOverride || query).trim();
    if (!text && !attachedFile) return;

    // Interrupt any active voice playback before new query
    aiCopilot.stopSpeaking();

    const currentAttached = attachedFile;
    let fullPrompt = text;
    if (currentAttached) {
      fullPrompt = `[Attached File: ${currentAttached.name}]\n${currentAttached.content}\n\n${text || 'Please inspect this scientific file.'}`;
    }

    setQuery('');
    setAttachedFile(null);
    setLiveTranscript('');

    const userMessage = {
      role: 'user',
      content: text || `Attached: ${currentAttached?.name}`,
      attachedFileName: currentAttached?.name,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    // Initial placeholder AI message
    const aiMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, aiMessage]);

    try {
      let accumulatedText = '';
      for await (const chunk of aiCopilot.streamResponse(fullPrompt, { preferredLanguage: selectedLanguage }, controller.signal)) {
        if (controller.signal.aborted) break;
        accumulatedText = chunk.text;
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            ...next[next.length - 1],
            content: accumulatedText,
            citations: chunk.citations?.length ? chunk.citations : next[next.length - 1].citations,
            metadata: chunk.metadata && Object.keys(chunk.metadata).length ? chunk.metadata : next[next.length - 1].metadata,
            tools: chunk.tools?.length ? chunk.tools : next[next.length - 1].tools,
            tool_used: chunk.tool_used !== undefined ? chunk.tool_used : next[next.length - 1].tool_used,
          };
          return next;
        });
      }

      // Voice output: Speak AI answer if voiceOutput is enabled or in conversational mode
      if (accumulatedText && (voiceConfig.voiceOutput || voiceConfig.conversationalMode) && !controller.signal.aborted) {
        setMicState('speaking');
        aiCopilot.speak(
          accumulatedText,
          () => setMicState('speaking'),
          () => {
            setMicState('idle');
            // If conversational hands-free loop active, listen for follow up
            if (voiceConfig.conversationalMode && !controller.signal.aborted) {
              setTimeout(() => {
                startListeningSession();
              }, 500);
            }
          },
          () => setMicState('idle'),
          selectedLanguage
        );
      } else {
        setMicState('idle');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            ...next[next.length - 1],
            content: "I'm sorry, an unexpected error occurred while processing that request. Please try again."
          };
          return next;
        });
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  /**
   * VOICE RECOGNITION: Start speech-to-text
   */
  const startListeningSession = () => {
    aiCopilot.stopSpeaking();
    setMicState('listening');
    setRecordingSeconds(0);
    setLiveTranscript('');

    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    aiCopilot.startListening(
      (interim) => {
        setLiveTranscript(interim);
        setQuery(interim);
      },
      (final) => {
        setLiveTranscript(final);
        setQuery(final);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

        if (voiceConfig.conversationalMode && final.trim().length > 1) {
          setMicState('processing');
          handleSend(final);
        } else {
          setMicState('idle');
        }
      },
      () => {
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        setMicState('idle');
      },
      () => {
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        if (micState === 'listening') setMicState('idle');
      },
      selectedLanguage
    );
  };

  const toggleMic = () => {
    if (micState === 'listening') {
      aiCopilot.stopListening();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setMicState('idle');
    } else {
      startListeningSession();
    }
  };

  const handleClearHistory = () => {
    aiCopilot.clearHistory();
    setMessages([INITIAL_WELCOME_MESSAGE]);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setAttachedFile({
        name: file.name,
        content: evt.target?.result || ''
      });
      textareaRef.current?.focus();
    };
    reader.readAsText(file);
  };

  // =========================================================================
  // 1. DEFAULT COLLAPSED / MINIMIZED STATE: Precision Circular AI Launcher
  // =========================================================================
  if (!isOpen || isMinimized) {
    const isProcessing = isLoading || micState === 'processing';
    const isListening = micState === 'listening';
    const isSpeaking = micState === 'speaking';

    return (
      <aside aria-label="ChemSpace AI Launcher" className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            setIsMinimized(false);
            if (onOpen) onOpen();
          }}
          className={`relative w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 select-none group border shadow-lg ${
            isListening
              ? 'bg-rose-600 text-white border-rose-300 shadow-[0_4px_24px_rgba(244,63,94,0.45)] animate-pulse'
              : isProcessing
              ? 'bg-[#121622] text-amber-400 border-amber-500/40 shadow-[0_4px_24px_rgba(245,158,11,0.35)]'
              : isSpeaking
              ? 'bg-emerald-600 text-white border-emerald-300 shadow-[0_4px_24px_rgba(16,185,129,0.45)]'
              : 'bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-400 text-white border-orange-300/40 shadow-[0_4px_20px_rgba(249,115,22,0.35)] hover:shadow-[0_6px_28px_rgba(249,115,22,0.55)] hover:scale-105 active:scale-95'
          }`}
          title={
            isListening
              ? 'ChemSpace AI (Listening...)'
              : isProcessing
              ? 'ChemSpace AI (Analyzing Chemistry...)'
              : 'ChemSpace AI (Click to Open)'
          }
          aria-label="Open ChemSpace AI"
        >
          {/* Outer Orbital Ring with Contextual Motion */}
          <span
            className={`absolute -inset-1 rounded-full border pointer-events-none ${
              isProcessing
                ? 'border-amber-400/50 chemspace-orbit'
                : isListening
                ? 'border-rose-400/50 animate-ping opacity-30'
                : 'border-orange-400/30 group-hover:border-orange-300/50 transition-colors'
            }`}
          />

          {isProcessing ? (
            /* Thinking / Processing: Dual orbital node cyclotron */
            <div className="relative w-5 h-5 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 chemspace-orbit" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="14 10" />
                <circle cx="12" cy="3" r="2" fill="#f97316" />
                <circle cx="21" cy="12" r="1.5" fill="#10b981" />
              </svg>
            </div>
          ) : isListening ? (
            <Mic className="w-5 h-5 text-white" />
          ) : isSpeaking ? (
            <Volume2 className="w-5 h-5 text-white animate-pulse" />
          ) : (
            <Sparkles className="w-5 h-5 text-white transition-transform duration-200 group-hover:rotate-12" />
          )}
        </button>
      </aside>
    );
  }

  // =========================================================================
  // 2. EXPANDED FLOATING AI PANEL (Desktop & Mobile Responsive)
  // =========================================================================
  return (
    <div
      role="dialog"
      aria-label="ChemSpace AI Assistant"
      className={`fixed z-50 glass-panel rounded-2xl border border-[var(--border-subtle)] shadow-2xl flex flex-col overflow-hidden transition-all duration-200 font-sans ${
        isMaximized
          ? 'w-[calc(100vw-32px)] max-w-4xl h-[86vh] bottom-4 right-4 sm:bottom-6 sm:right-6'
          : 'w-[440px] max-w-[calc(100vw-32px)] h-[620px] max-h-[calc(100vh-80px)] bottom-4 right-4 sm:bottom-6 sm:right-6'
      }`}
    >
      {/* ── HEADER: Clean ChemSpace AI branding + Controls ──────────────── */}
      <div className="px-4 py-3 border-b border-inherit flex items-center justify-between bg-[var(--bg-card)] shrink-0 select-none">
        {/* Left: ChemSpace AI only */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-[var(--text-primary)]">ChemSpace AI</h2>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online" />
          </div>
        </div>

        {/* Right: Action Controls */}
        <div className="flex items-center gap-1 text-[var(--text-secondary)]">
          {/* Language Selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => {
              setSelectedLanguage(e.target.value);
              aiCopilot.setLanguage(e.target.value);
            }}
            className="px-2 py-1 rounded-lg text-[10px] bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none cursor-pointer"
            title="Language"
          >
            <option value="auto">Auto</option>
            <option value="en">English</option>
            <option value="te">తెలుగు</option>
            <option value="hi">हिन्दी</option>
          </select>

          {/* Voice Settings Popover Toggle */}
          <button
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              showVoiceSettings || voiceConfig.voiceOutput
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'hover:bg-white/5'
            }`}
            title="Voice settings"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Clear Conversation */}
          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-lg hover:bg-white/5 transition cursor-pointer"
            title="Clear chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Maximize / Restore */}
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 rounded-lg hover:bg-white/5 transition hidden sm:inline-flex cursor-pointer"
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Mandatory Minimize Button: Collapses window, preserves conversation */}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-lg hover:bg-white/5 transition cursor-pointer"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Mandatory Close Button: Closes window, preserves state */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-rose-500/20 hover:text-rose-400 transition cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── VOICE SETTINGS PANEL (Popover) ─────────────────────────────── */}
      {showVoiceSettings && (
        <div className="px-4 py-3 bg-[var(--bg-inner)] border-b border-inherit space-y-3 shrink-0 text-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-1.5">
            <span className="font-bold text-[var(--text-primary)]">Voice &amp; Audio Settings</span>
            <button
              onClick={() => setShowVoiceSettings(false)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium text-xs cursor-pointer"
            >
              Done
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Voice Style / Gender */}
            <div>
              <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold block mb-1">
                Voice Tone
              </label>
              <div className="flex rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-0.5">
                {['female', 'male', 'neutral'].map((g) => (
                  <button
                    key={g}
                    onClick={() => updateVoiceSetting('voiceGender', g)}
                    className={`flex-1 py-1 text-[10px] rounded-md font-semibold capitalize transition ${
                      voiceConfig.voiceGender === g
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Speech Speed */}
            <div>
              <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold block mb-1">
                Speed
              </label>
              <div className="flex rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-0.5">
                {[
                  { id: 'slow', label: '0.85x' },
                  { id: 'normal', label: '1.0x' },
                  { id: 'fast', label: '1.2x' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => updateVoiceSetting('speechSpeed', s.id)}
                    className={`flex-1 py-1 text-[10px] rounded-md font-semibold transition ${
                      voiceConfig.speechSpeed === s.id
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Voice Output Toggle & Hands-free Mode */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => {
                const next = !voiceConfig.voiceOutput;
                updateVoiceSetting('voiceOutput', next);
                if (!next) aiCopilot.stopSpeaking();
              }}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                voiceConfig.voiceOutput
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
              }`}
            >
              {voiceConfig.voiceOutput ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>Voice Readout: {voiceConfig.voiceOutput ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => updateVoiceSetting('conversationalMode', !voiceConfig.conversationalMode)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                voiceConfig.conversationalMode
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
              }`}
              title="Continuous conversational voice mode with automatic turn taking"
            >
              <Radio className={`w-3.5 h-3.5 ${voiceConfig.conversationalMode ? 'animate-pulse text-cyan-400' : ''}`} />
              <span>Hands-Free Loop</span>
            </button>
          </div>
        </div>
      )}

      {/* ── CONVERSATION STREAM ────────────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-[var(--bg-main)]">
        {messages.map((msg, idx) => (
          <ChatMessage
            key={idx}
            message={msg}
            isLast={idx === messages.length - 1}
            onRegenerate={() => handleSend(messages[idx - 1]?.content)}
          />
        ))}

        {/* Live Listening Waveform */}
        {micState === 'listening' && (
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 animate-pulse" />
                Listening...
              </span>
              <VoiceVisualizer
                state="listening"
                durationSeconds={recordingSeconds}
                onCancel={handleStop}
              />
            </div>
            {liveTranscript && (
              <div className="text-xs text-[var(--text-primary)] italic bg-[var(--bg-card)] p-2 rounded-xl border border-cyan-500/20">
                "{liveTranscript}"
              </div>
            )}
          </div>
        )}

        {/* Speaking Waveform */}
        {micState === 'speaking' && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-3 text-xs">
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              ChemSpace AI is speaking
            </span>
            <VoiceVisualizer state="speaking" onCancel={handleStop} />
          </div>
        )}

        {/* Thinking Indicator */}
        {isLoading && !messages[messages.length - 1]?.content && (
          <div className="py-1">
            <AILoader onCancel={handleStop} />
          </div>
        )}
      </div>

      {/* ── ATTACHED FILE BADGE ────────────────────────────────────────── */}
      {attachedFile && (
        <div className="px-4 py-1.5 border-t border-inherit bg-[var(--bg-inner)] flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <FileText className="w-3.5 h-3.5" />
            <span className="font-semibold truncate max-w-[280px]">{attachedFile.name}</span>
          </div>
          <button
            onClick={() => setAttachedFile(null)}
            className="text-rose-400 hover:text-rose-300 text-xs font-semibold cursor-pointer"
          >
            Remove
          </button>
        </div>
      )}

      {/* ── INPUT BAR ─────────────────────────────────────────────────── */}
      <div className="p-3 border-t border-inherit bg-[var(--bg-card)] shrink-0">
        <div className="relative flex items-center gap-1.5">
          {/* File Input (Hidden) */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".py,.mol,.sdf,.xyz,.csv,.txt,.json,.log"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-[var(--bg-inner)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-emerald-400 transition cursor-pointer shrink-0"
            title="Attach file"
          >
            <Paperclip className="w-3.5 h-3.5" />
          </button>

          {/* Premium Circular Voice Action Button */}
          <CircularVoiceButton
            state={micState}
            onClick={toggleMic}
            size="sm"
            title={micState === 'listening' ? 'Stop listening' : 'Voice input (Listen)'}
          />

          {/* Auto-expanding Input Area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask a question or request a calculation..."
            className="input-control flex-1 py-2 px-3 rounded-xl text-xs text-[var(--text-primary)] min-w-0 resize-none max-h-28 overflow-y-auto leading-relaxed"
          />

          {/* Send / Stop Action Button with arrow/icon micro-interaction */}
          {isLoading || micState === 'speaking' ? (
            <button
              type="button"
              onClick={handleStop}
              className="p-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition shrink-0 cursor-pointer shadow-sm active:scale-95"
              title="Stop"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!query.trim() && !attachedFile}
              className="group p-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white transition disabled:opacity-30 disabled:pointer-events-none shrink-0 cursor-pointer shadow-[0_2px_12px_rgba(249,115,22,0.3)] hover:shadow-[0_4px_18px_rgba(249,115,22,0.45)] active:scale-95 border border-orange-400/30"
              title="Send"
            >
              <Send className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
