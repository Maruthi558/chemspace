import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { sendAIChatMessage, getRouteSuggestions } from '../services/aiService';

const AIContext = createContext(null);

const INITIAL_MESSAGE = {
  id: 'welcome-1',
  sender: 'ai',
  text: "Hello! I am **ChemAI**, your production-grade Scientific AI Copilot. Ask me chemistry questions, request molecular analyses, generate RDKit Python scripts, interpret IR/NMR spectra, or speak using voice commands.",
  timestamp: new Date().toISOString(),
  thinkingSteps: [
    'Initialized ChemAI Scientific Copilot Kernel v3.2',
    'RDKit C++ Cheminformatics engine online',
    'Voice STT/TTS speech interface standby'
  ],
  suggestedActions: [
    'Analyze Benzene SMILES',
    'Predict Aspirin Retrosynthesis',
    'Generate RDKit Descriptor Script',
    'Open Periodic Table'
  ]
};

export function AIProvider({ children }) {
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('chemspace_ai_sessions');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'session-1',
        title: 'Initial Research Session',
        createdAt: new Date().toISOString(),
        messages: [INITIAL_MESSAGE]
      }
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    return sessions[0]?.id || 'session-1';
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const [activeMolecule, setActiveMolecule] = useState(() => {
    try {
      return localStorage.getItem('chemspace_active_molecule') || 'CC(=O)OC1=CC=CC=C1C(=O)O';
    } catch {
      return 'CC(=O)OC1=CC=CC=C1C(=O)O';
    }
  });
  const [activeCodeToTransfer, setActiveCodeToTransfer] = useState(null);

  // Voice AI States
  const [voiceState, setVoiceState] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'speaking'
  const [liveTranscript, setLiveTranscript] = useState('');
  const [editablePrompt, setEditablePrompt] = useState('');
  const [voiceError, setVoiceError] = useState(null);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);

  const recognitionRef = useRef(null);
  const abortControllerRef = useRef(null);
  const typeIntervalRef = useRef(null);

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chemspace_ai_sessions', JSON.stringify(sessions));
    } catch {
      // ignore
    }
  }, [sessions]);

  // Sync active molecule to localStorage
  useEffect(() => {
    if (activeMolecule) {
      try {
        localStorage.setItem('chemspace_active_molecule', activeMolecule);
      } catch {
        // ignore
      }
    }
  }, [activeMolecule]);

  // Active Session Messages getter
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession ? activeSession.messages : [INITIAL_MESSAGE];

  // Helper to update active session messages
  function updateActiveMessages(newMessages) {
    setSessions((prevSessions) =>
      prevSessions.map((session) => {
        if (session.id === activeSessionId) {
          // Update title if first custom user message
          let title = session.title;
          const userMsgs = newMessages.filter((m) => m.sender === 'user');
          if (userMsgs.length > 0 && session.title === 'Initial Research Session') {
            title = userMsgs[0].text.slice(0, 24) + '...';
          }
          return { ...session, title, messages: newMessages };
        }
        return session;
      })
    );
  }

  // --- VOICE AI STT IMPLEMENTATION ---
  function startListening() {
    setVoiceError(null);
    setLiveTranscript('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('Speech Recognition is not supported in this browser. Please use standard text input.');
      setVoiceState('idle');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setVoiceState('listening');
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const text = final || interim;
        setLiveTranscript(text);
        setEditablePrompt(text);
      };

      recognition.onerror = (event) => {
        console.warn('[Voice AI Error]', event.error);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setVoiceError('Microphone permission denied. Please allow microphone access in your browser settings.');
        } else {
          setVoiceError(`Voice input error: ${event.error}`);
        }
        setVoiceState('idle');
      };

      recognition.onend = () => {
        setVoiceState('idle');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setVoiceError(`Failed to initialize microphone: ${err.message}`);
      setVoiceState('idle');
    }
  }

  function stopListening() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setVoiceState('idle');
  }

  // --- TEXT TO SPEECH (TTS) IMPLEMENTATION ---
  function speakText(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[`*#_~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setVoiceState('speaking');
    utterance.onend = () => setVoiceState('idle');
    utterance.onerror = () => setVoiceState('idle');

    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setVoiceState('idle');
  }

  // --- AI CHAT & STREAMING ---
  async function sendMessage(promptText, currentPath = '/') {
    const textToSend = promptText || editablePrompt;
    if (!textToSend.trim() || isGenerating) return;

    // Reset voice prompt buffer
    setEditablePrompt('');
    setLiveTranscript('');

    // Cancel TTS if playing
    stopSpeaking();

    const userMessageId = `user-${Date.now()}`;
    const userMessage = {
      id: userMessageId,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    updateActiveMessages(updatedMessages);

    setIsGenerating(true);
    const aiMessageId = `ai-${Date.now()}`;
    setStreamingMessageId(aiMessageId);

    // Initial placeholder AI message
    const placeholderAiMsg = {
      id: aiMessageId,
      sender: 'ai',
      text: '',
      timestamp: new Date().toISOString(),
      thinkingSteps: [
        `Analyzing user query: "${textToSend.slice(0, 35)}..."`,
        `Querying ChemSpace Scientific AI Engine...`
      ],
      isStreaming: true
    };

    updateActiveMessages([...updatedMessages, placeholderAiMsg]);

    abortControllerRef.current = new AbortController();

    try {
      const response = await sendAIChatMessage({
        query: textToSend,
        history: updatedMessages.slice(-6),
        context: {
          currentPath,
          activeMolecule
        },
        signal: abortControllerRef.current.signal
      });

      // Update active molecule context if new SMILES detected
      if (response.moleculeCard?.smiles) {
        setActiveMolecule(response.moleculeCard.smiles);
      }

      // Smooth Typewriter Streaming Effect
      const fullText = response.responseText || 'Analysis complete.';
      let charIdx = 0;

      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);

      typeIntervalRef.current = setInterval(() => {
        charIdx += Math.min(4, fullText.length - charIdx);
        const chunk = fullText.slice(0, charIdx);

        const currentAiMsg = {
          id: aiMessageId,
          sender: 'ai',
          text: chunk,
          timestamp: response.timestamp || new Date().toISOString(),
          thinkingSteps: response.thinkingSteps || [],
          moleculeCard: response.moleculeCard,
          codeBlock: response.codeBlock,
          navigationTarget: response.navigationTarget,
          targetName: response.targetName,
          suggestedActions: response.suggestedActions || [],
          isStreaming: charIdx < fullText.length
        };

        setSessions((prevSessions) =>
          prevSessions.map((s) => {
            if (s.id === activeSessionId) {
              const msgs = s.messages.map((m) => (m.id === aiMessageId ? currentAiMsg : m));
              return { ...s, messages: msgs };
            }
            return s;
          })
        );

        if (charIdx >= fullText.length) {
          clearInterval(typeIntervalRef.current);
          setIsGenerating(false);
          setStreamingMessageId(null);

          // If TTS enabled, speak full response
          if (isTtsEnabled) {
            speakText(fullText);
          }
        }
      }, 30);
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('[ChemAI] Generation stopped by user.');
      } else {
        const errorMsg = {
          id: aiMessageId,
          sender: 'ai',
          text: `An error occurred while processing your request: ${err.message || 'Unknown network error'}. Please verify backend connection and try again.`,
          timestamp: new Date().toISOString(),
          isError: true
        };
        updateActiveMessages([...updatedMessages, errorMsg]);
      }
      setIsGenerating(false);
      setStreamingMessageId(null);
    }
  }

  function stopGeneration() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (typeIntervalRef.current) {
      clearInterval(typeIntervalRef.current);
    }
    setIsGenerating(false);
    setStreamingMessageId(null);
  }

  function regenerateLastResponse(currentPath = '/') {
    if (isGenerating || messages.length < 2) return;
    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === 'user') {
        lastUserIndex = i;
        break;
      }
    }
    if (lastUserIndex === -1) return;

    const userPrompt = messages[lastUserIndex].text;
    const trimmedMessages = messages.slice(0, lastUserIndex);
    updateActiveMessages(trimmedMessages);
    sendMessage(userPrompt, currentPath);
  }

  function clearChat() {
    stopGeneration();
    stopSpeaking();
    updateActiveMessages([INITIAL_MESSAGE]);
  }

  function createNewSession() {
    stopGeneration();
    stopSpeaking();
    const newId = `session-${Date.now()}`;
    const newSession = {
      id: newId,
      title: `Research Session ${sessions.length + 1}`,
      createdAt: new Date().toISOString(),
      messages: [INITIAL_MESSAGE]
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
  }

  function deleteSession(id) {
    if (sessions.length <= 1) {
      clearChat();
      return;
    }
    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    if (activeSessionId === id) {
      setActiveSessionId(filtered[0].id);
    }
  }

  return (
    <AIContext.Provider
      value={{
        sessions,
        activeSessionId,
        setActiveSessionId,
        messages,
        isGenerating,
        streamingMessageId,
        activeMolecule,
        setActiveMolecule,
        activeCodeToTransfer,
        setActiveCodeToTransfer,

        // Voice AI
        voiceState,
        liveTranscript,
        editablePrompt,
        setEditablePrompt,
        voiceError,
        isTtsEnabled,
        setIsTtsEnabled,
        startListening,
        stopListening,
        speakText,
        stopSpeaking,

        // Actions
        sendMessage,
        stopGeneration,
        regenerateLastResponse,
        clearChat,
        createNewSession,
        deleteSession,
        getRouteSuggestions
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}
