import { request } from './api.js';
import {
  resolveChemicalNameToSmiles,
  identifyMoleculeFromSmiles,
  isSmilesString,
  validateSmilesSyntax
} from './chemicalResolver.js';
import {
  detectLanguage,
  formatMultilingualMoleculeResponse
} from './languageDetector.js';

// Scientific terminology phoneme & speech transcription correction dictionary
const SCIENTIFIC_CORRECTIONS = {
  'rd kit': 'RDKit',
  'rdkit': 'RDKit',
  'chem draw': 'ChemDraw',
  'chemdraw': 'ChemDraw',
  'homo lumo': 'HOMO-LUMO',
  'homo': 'HOMO',
  'lumo': 'LUMO',
  'dft': 'DFT',
  'b3 lyp': 'B3LYP',
  'b3lyp': 'B3LYP',
  'nmr': 'NMR',
  'ftir': 'FTIR',
  'ft ir': 'FTIR',
  'ir': 'IR',
  'smiles': 'SMILES',
  'smile': 'SMILES',
  'aspirin': 'Aspirin',
  'caffeine': 'Caffeine',
  'benzene': 'Benzene',
  'ibuprofen': 'Ibuprofen',
  'paracetamol': 'Paracetamol',
  'acetaminophen': 'Acetaminophen',
  'ethanol': 'Ethanol',
  'methanol': 'Methanol',
  'acetic acid': 'Acetic acid',
  'acetone': 'Acetone',
  'glucose': 'Glucose',
  'toluene': 'Toluene',
  'aniline': 'Aniline',
  'phenol': 'Phenol',
  'quantum chemistry': 'Quantum Chemistry',
  'spectroscopy': 'Spectroscopy',
  'mass spectrometry': 'Mass Spectrometry',
  'uv vis': 'UV-Vis',
  'ibm rxn': 'IBM RXN',
  'chromatography': 'Chromatography',
  'hplc': 'HPLC',
  'gc': 'GC',
  'tlc': 'TLC',
  'python': 'Python'
};

export const CHEMSPACE_AI_SYSTEM_PROMPT = `You are ChemSpace AI, a friendly, highly capable chemistry and science assistant.

Understand the user's actual intent before answering.
Do not force chemistry into casual conversation.
Answer chemistry and science questions accurately and clearly.
Explain concepts at the user's requested level.
Maintain conversation context across turns.
Do not generate SMILES unless requested or genuinely useful.
Never fabricate scientific facts, molecular structures, calculations, or citations.
When uncertain, say so honestly.
Use available chemistry tools only when the user requests or when genuinely needed.
Use web search only when current information is required and the web-search tool is available.
Respond naturally and conversationally.
Adapt language to the user (English, Telugu, Hindi, or mixed queries), preserving chemical formulas (e.g. C6H6), SMILES, and scientific units (e.g. g/mol) in standard notation.
Be helpful, clear, and scientifically responsible.`;

const DEFAULT_VOICE_CONFIG = {
  voiceGender: 'female', // 'female' | 'male' | 'neutral'
  selectedVoiceURI: '',
  speechSpeed: 'normal', // 'slow' | 'normal' | 'fast'
  voiceOutput: false,
  volume: 1.0,
  conversationalMode: false
};

class AICopilotService {
  constructor() {
    this.history = [];
    this.isListening = false;
    this.isSpeaking = false;
    this.recognition = null;
    this.speechSynth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voiceConfig = this.loadVoiceConfig();
    this.availableVoices = [];

    // Load available voices asynchronously
    if (this.speechSynth) {
      this.updateVoices();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.updateVoices();
        };
      }
    }

    // Initialize Web Speech API if supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      }
    }
  }

  updateVoices() {
    if (!this.speechSynth) return;
    this.availableVoices = this.speechSynth.getVoices() || [];
  }

  getAvailableVoices() {
    if (!this.availableVoices.length && this.speechSynth) {
      this.availableVoices = this.speechSynth.getVoices() || [];
    }
    return this.availableVoices.map((v) => ({
      name: v.name,
      lang: v.lang,
      voiceURI: v.voiceURI,
      isNatural: /natural|online|neural|google/i.test(v.name)
    }));
  }

  loadVoiceConfig() {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('chemspace_voice_config');
        if (saved) return { ...DEFAULT_VOICE_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {}
    return { ...DEFAULT_VOICE_CONFIG };
  }

  saveVoiceConfig(newConfig) {
    this.voiceConfig = { ...this.voiceConfig, ...newConfig };
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('chemspace_voice_config', JSON.stringify(this.voiceConfig));
      }
    } catch (e) {}
    return this.voiceConfig;
  }

  clearHistory() {
    this.history = [];
  }

  interruptAll() {
    this.stopListening();
    this.stopSpeaking();
  }

  sanitizeVoiceTranscript(rawText) {
    if (!rawText) return '';
    let corrected = rawText;
    for (const [wrong, right] of Object.entries(SCIENTIFIC_CORRECTIONS)) {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      corrected = corrected.replace(regex, right);
    }
    return corrected;
  }

  setLanguage(langCode = 'en') {
    if (!this.recognition) return;
    if (langCode === 'te') {
      this.recognition.lang = 'te-IN';
    } else if (langCode === 'hi') {
      this.recognition.lang = 'hi-IN';
    } else {
      this.recognition.lang = 'en-US';
    }
  }

  detectIntent(query) {
    const q = (query || '').toLowerCase().trim();
    if (/^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening)|how\s+are\s+you|who\s+are\s+you|what\s+is\s+your\s+name)[\s!?,.]*$/.test(q)) {
      return 'GENERAL_CONVERSATION';
    }
    if (['hi', 'hello', 'hey', 'namaste', 'vanakkam', 'namaskaram'].includes(q)) {
      return 'GENERAL_CONVERSATION';
    }
    if (q.includes('how are you') || q.includes('who are you')) {
      return 'GENERAL_CONVERSATION';
    }
    if (q.includes('smiles') || q.includes('canonical smiles')) {
      return 'SMILES';
    }
    if (q.includes("today's") || q.includes('latest news') || q.includes('recent news') || q.includes('latest research')) {
      return 'WEB_SEARCH';
    }
    if (q.includes('calculate') || q.includes('molecular weight') || q.includes('mw of') || q.includes('molarity')) {
      return 'CALCULATION';
    }
    if (q.includes('class 10') || q.includes('explain simply') || q.includes('like i am in')) {
      return 'ACADEMIC';
    }
    if (q.includes('rdkit') || q.includes('python code') || q.includes('write code')) {
      return 'CODING';
    }
    if (q.includes('benzene') || q.includes('reaction') || q.includes('sn1') || q.includes('sn2') || q.includes('nmr') || q.includes('ftir')) {
      return 'CHEMISTRY';
    }
    return 'OTHER';
  }

  /**
   * Real-time SSE streaming from backend
   */
  async *streamResponse(query, context = {}, signal = null) {
    const sanitizedQuery = this.sanitizeVoiceTranscript(query);
    const langInfo = detectLanguage(sanitizedQuery);
    const userLanguage = context.preferredLanguage || langInfo.code || 'en';

    let streamedSuccess = false;

    try {
      const response = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: sanitizedQuery,
          systemPrompt: CHEMSPACE_AI_SYSTEM_PROMPT,
          history: this.history.slice(-8),
          context: {
            ...context,
            detectedLanguage: userLanguage,
            currentPath: typeof window !== 'undefined' ? window.location.pathname : '/',
            timestamp: new Date().toISOString()
          },
          language: userLanguage
        }),
        signal
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulatedText = '';
        let buffer = '';
        let citations = [];
        let metadata = {};
        let tools = [];
        let tool_used = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done || (signal && signal.aborted)) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const clean = line.trim();
            if (clean.startsWith('data: ')) {
              const dataStr = clean.slice(6);
              if (dataStr === '[DONE]') break;
              try {
                const parsed = jsonParseSafe(dataStr);
                if (parsed?.type === 'metadata' || parsed?.type === 'done') {
                  if (parsed.citations) citations = parsed.citations;
                  if (parsed.metadata) metadata = parsed.metadata;
                  if (parsed.tools) tools = parsed.tools;
                  if (parsed.tool_used !== undefined) tool_used = parsed.tool_used;
                }
                if (parsed?.type === 'delta' && parsed.content) {
                  accumulatedText += parsed.content;
                  streamedSuccess = true;
                  yield {
                    text: accumulatedText,
                    delta: parsed.content,
                    isDone: false,
                    citations,
                    metadata,
                    tools,
                    tool_used
                  };
                }
              } catch (e) {}
            }
          }
        }

        if (accumulatedText) {
          this.history.push({ role: 'user', content: sanitizedQuery });
          this.history.push({
            role: 'assistant',
            content: accumulatedText,
            citations,
            metadata,
            tools,
            tool_used
          });
          yield { text: accumulatedText, isDone: true, citations, metadata, tools, tool_used };
          return;
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      console.warn('[AICopilotService] Streaming fallback notice:', err.message);
    }

    // Fallback: Use standard sendMessage if streaming fails or is interrupted
    if (!streamedSuccess) {
      const fallbackResult = await this.sendMessage(query, context, signal);
      const words = (fallbackResult.responseText || '').split(' ');
      let cur = '';
      for (let i = 0; i < words.length; i++) {
        if (signal && signal.aborted) break;
        cur += (i === 0 ? '' : ' ') + words[i];
        yield { text: cur, isDone: i === words.length - 1 };
        await new Promise((r) => setTimeout(r, 18));
      }
    }
  }

  /**
   * Standard single-call message handler
   */
  async sendMessage(query, context = {}, signal = null) {
    const sanitizedQuery = this.sanitizeVoiceTranscript(query);
    const langInfo = detectLanguage(sanitizedQuery);
    const userLanguage = context.preferredLanguage || langInfo.code || 'en';
    const intent = this.detectIntent(sanitizedQuery);

    try {
      const response = await request('/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: sanitizedQuery,
          query: sanitizedQuery,
          systemPrompt: CHEMSPACE_AI_SYSTEM_PROMPT,
          history: this.history.slice(-8),
          context: {
            ...context,
            detectedLanguage: userLanguage,
            currentPath: typeof window !== 'undefined' ? window.location.pathname : '/',
            timestamp: new Date().toISOString()
          },
          language: userLanguage
        }),
        signal
      });

      const replyText = response?.response || response?.responseText;
      if (response && (response.status === 'success' || replyText)) {
        const text = replyText || 'ChemSpace Chemistry AI responded.';
        const citations = response.citations || [];
        const metadata = response.metadata || {};
        const tools = response.tools || [];
        const tool_used = response.tool_used || false;

        this.history.push({ role: 'user', content: sanitizedQuery });
        this.history.push({
          role: 'assistant',
          content: text,
          citations,
          metadata,
          tools,
          tool_used,
        });

        // Search Result Rule: Only attach molecule card if intent is strictly SMILES
        let molCard = null;
        if (intent === 'SMILES') {
          molCard = response.moleculeCard;
        }

        return {
          ...response,
          responseText: text,
          citations,
          metadata,
          tools,
          tool_used,
          moleculeCard: molCard
        };
      }
      throw new Error('Invalid response from AI backend');
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      console.warn('[AICopilotService] Using high-fidelity scientific client engine:', error.message);

      // Client-side fallback reasoning
      const fallback = await this.generateClientFallbackResponse(sanitizedQuery, context, langInfo);
      this.history.push({ role: 'user', content: sanitizedQuery });
      this.history.push({ role: 'assistant', content: fallback.responseText });
      return fallback;
    }
  }

  async generateClientFallbackResponse(query, context = {}, langInfo = null) {
    const lang = langInfo || detectLanguage(query);
    const lower = query.toLowerCase().trim();
    const intent = this.detectIntent(query);

    let responseText = '';
    let moleculeCard = null;

    if (intent === 'GENERAL_CONVERSATION') {
      if (lower.includes('who are you') || lower.includes('what are you') || lower.includes('your name')) {
        responseText = "I'm ChemSpace AI, your chemistry and science assistant. I'm here to help with chemical concepts, reactions, structures, calculations, academic questions, and scientific research.";
      } else if (lower.includes('how are you')) {
        responseText = "I'm doing well, thank you! What can I help you explore today?";
      } else {
        responseText = "Hi! How can I help you today?";
      }
    } else if (intent === 'SMILES') {
      if (lower.includes('benzene')) {
        responseText = "The canonical SMILES for **Benzene** is:\n\n`c1ccccc1`";
      } else if (lower.includes('caffeine')) {
        responseText = "The canonical SMILES for **Caffeine** is:\n\n`Cn1cnc2c1c(=O)n(c(=O)n2C)C`";
      } else if (lower.includes('aspirin')) {
        responseText = "The canonical SMILES for **Aspirin** is:\n\n`CC(=O)Oc1ccccc1C(=O)O`";
      } else if (lower.includes('ethanol')) {
        responseText = "The canonical SMILES for **Ethanol** is:\n\n`CCO`";
      } else {
        const resolved = await resolveChemicalNameToSmiles(query);
        if (resolved.success) {
          responseText = `The canonical SMILES for **${resolved.name}** is:\n\n\`${resolved.smiles}\``;
        } else {
          responseText = `I could not verify the exact canonical SMILES for that compound. Please check the spelling or draw the structure in ChemDraw Studio.`;
        }
      }
    } else if (lower.includes('benzene') && (lower.includes('why') || lower.includes('aromatic'))) {
      responseText = (
        "Benzene ($C_6H_6$) is aromatic because it satisfies **Hückel's Rule ($4n + 2\\,\\pi$ electrons)**:\n\n" +
        "1. **Planar Cyclic Geometry:** A planar six-membered ring with $sp^2$-hybridized carbons and $120^\\circ$ bond angles.\n" +
        "2. **Continuous Delocalization:** Each carbon contributes one unhybridized $2p$ orbital forming an unbroken cyclic $\\pi$ cloud.\n" +
        "3. **Hückel's $(4n+2)$ Rule:** For $n = 1$, benzene possesses exactly $6\\,\\pi$ electrons completely filling the three bonding molecular orbitals.\n" +
        "4. **Resonance Stabilization Energy:** This provides approximately **150 kJ/mol (36 kcal/mol)** of thermodynamic resonance stabilization energy, explaining why it favors electrophilic substitution over addition."
      );
    } else if (lower.includes('benzene')) {
      responseText = (
        "**Benzene** ($C_6H_6$) is a fundamental aromatic hydrocarbon consisting of a planar hexagonal ring of six carbon atoms, each bonded to one hydrogen atom.\n\n" +
        "Key characteristics:\n" +
        "- **Structure:** All six carbon-carbon bonds have an identical length (~1.40 Å), intermediate between single and double bonds, due to completely delocalized $\\pi$ electrons.\n" +
        "- **Stability:** Highly stable due to aromatic resonance stabilization energy (~150 kJ/mol).\n" +
        "- **Reactivity:** Readily undergoes Electrophilic Aromatic Substitution (EAS) such as nitration, halogenation, and Friedel-Crafts alkylation/acylation."
      );
    } else if (intent === 'CALCULATION' || (lower.includes('caffeine') && (lower.includes('molecular weight') || lower.includes('mw') || lower.includes('calculate')))) {
      responseText = (
        "### Molecular Weight Calculation for Caffeine:\n\n" +
        "- **Molecular Formula:** $C_8H_{10}N_4O_2$\n" +
        "- **Standard Atomic Weights:**\n" +
        "  * Carbon ($C$): $8 \\times 12.011\\text{ g/mol} = 96.088\\text{ g/mol}$\n" +
        "  * Hydrogen ($H$): $10 \\times 1.008\\text{ g/mol} = 10.080\\text{ g/mol}$\n" +
        "  * Nitrogen ($N$): $4 \\times 14.007\\text{ g/mol} = 56.028\\text{ g/mol}$\n" +
        "  * Oxygen ($O$): $2 \\times 15.999\\text{ g/mol} = 31.998\\text{ g/mol}$\n\n" +
        "$$\\text{Total MW} = 96.088 + 10.080 + 56.028 + 31.998 = \\mathbf{194.194\\text{ g/mol}}$$\n\n" +
        "The molecular weight of caffeine is **194.19 g/mol**."
      );
    } else if (lower.includes('class 10') || lower.includes('simply')) {
      responseText = (
        "Let's explain this simply, at a Class 10 level:\n\n" +
        "Think of chemical reactions as atoms swapping dance partners to reach a more stable, lower-energy state.\n" +
        "1. **Atoms** hold together through bonds (like sharing electrons in covalent bonds).\n" +
        "2. **Carbon** is uniquely versatile because it has a valency of 4 and can form long, strong chains and rings (catenation).\n" +
        "3. **Acids and Bases** interact by exchanging protons ($H^+$ ions) to produce water and salts.\n\n" +
        "What specific concept or question would you like to explore step by step?"
      );
    } else if (lower.includes('telugu') || lower.includes('తెలుగు')) {
      responseText = (
        "నమస్కారం! కెమిస్ట్రీ మరియు సైన్స్ కాన్సెప్ట్‌లను సహజమైన తెలుగులో ఇక్కడ సులభంగా వివరిస్తాను.\n\n" +
        "రసాయన శాస్త్రం, మూలకాలు, బెంజీన్ ($C_6H_6$) నిర్మాణాలు, చర్యల మెకానిజమ్స్ మరియు అణు భారాలు ($g/mol$) గురించి మీరు అడగవచ్చు. మీకు ఏ అంశంపై వివరణ కావాలి?"
      );
    } else if (intent === 'WEB_SEARCH') {
      responseText = "Live web lookup is currently unavailable in offline fallback mode. I can answer questions on chemical principles, reaction mechanisms, calculations, and spectroscopic properties directly from established scientific literature.";
    } else {
      responseText = (
        `I understand your question about: **${query}**.\n\n` +
        "Could you clarify which aspect you'd like to explore—such as conceptual principles, reaction mechanisms, calculations, or practical laboratory applications?"
      );
    }

    return {
      status: 'success',
      query,
      responseText,
      intent,
      moleculeCard,
      timestamp: new Date().toISOString()
    };
  }

  // =========================================================================
  // NATURAL VOICE AI ENGINE (STT & TTS)
  // =========================================================================

  getVoiceSettings() {
    return { ...this.voiceConfig };
  }

  setVoiceGender(gender) {
    return this.saveVoiceConfig({ voiceGender: gender });
  }

  setSelectedVoiceURI(uri) {
    return this.saveVoiceConfig({ selectedVoiceURI: uri });
  }

  setSpeechSpeed(speed) {
    return this.saveVoiceConfig({ speechSpeed: speed });
  }

  setVoiceOutput(enabled) {
    return this.saveVoiceConfig({ voiceOutput: Boolean(enabled) });
  }

  setVolume(vol) {
    const clamped = Math.max(0, Math.min(1, parseFloat(vol) || 1.0));
    return this.saveVoiceConfig({ volume: clamped });
  }

  setConversationalMode(enabled) {
    return this.saveVoiceConfig({ conversationalMode: Boolean(enabled) });
  }

  /**
   * Resolves natural, smooth human voice. Avoids harsh robotic legacy voices.
   */
  resolveVoice(gender = 'female', langCode = 'en') {
    if (!this.speechSynth) return null;
    const voices = this.speechSynth.getVoices() || [];
    if (!voices.length) return null;

    // A. Explicit user selected voice
    if (this.voiceConfig.selectedVoiceURI) {
      const explicit = voices.find((v) => v.voiceURI === this.voiceConfig.selectedVoiceURI);
      if (explicit) return explicit;
    }

    // B. Regional language voice
    if (langCode === 'te') {
      const teVoice = voices.find((v) => v.lang.startsWith('te'));
      if (teVoice) return teVoice;
    } else if (langCode === 'hi') {
      const hiVoice = voices.find((v) => v.lang.startsWith('hi'));
      if (hiVoice) return hiVoice;
    }

    // C. Natural Neural Voices by Gender
    const lowerGender = (gender || 'female').toLowerCase();

    if (lowerGender === 'female') {
      // Prioritize natural warm female voices
      const femaleKeywords = [
        'jenny', 'aria', 'samantha', 'victoria', 'google us english', 
        'natural', 'online', 'female', 'zira'
      ];
      for (const kw of femaleKeywords) {
        const match = voices.find((v) => v.name.toLowerCase().includes(kw));
        if (match) return match;
      }
    } else if (lowerGender === 'male') {
      // Prioritize natural male voices
      const maleKeywords = [
        'guy', 'daniel', 'alex', 'david', 'google uk english male', 
        'natural', 'online', 'male'
      ];
      for (const kw of maleKeywords) {
        const match = voices.find((v) => v.name.toLowerCase().includes(kw));
        if (match) return match;
      }
    }

    // Default natural fallback
    const naturalVoice = voices.find((v) => /natural|online|google/i.test(v.name) && v.lang.startsWith('en'));
    return naturalVoice || voices[0];
  }

  prepareTextForSpeech(text) {
    if (!text) return '';
    return text
      .replace(/\|.*?\|/g, ' ')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/[`*#_~]/g, '')
      .replace(/---/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\bSMILES\b/g, 'Smiles')
      .replace(/\bNMR\b/g, 'N M R')
      .replace(/\bFTIR\b/g, 'F T I R')
      .replace(/\bUV-Vis\b/gi, 'U V Vis')
      .replace(/\bMW\b/g, 'Molecular Weight')
      .replace(/\bLogP\b/gi, 'Log P')
      .replace(/\bTPSA\b/g, 'T P S A')
      .replace(/\bDFT\b/g, 'D F T')
      .replace(/\bHOMO\b/g, 'Homo')
      .replace(/\bLUMO\b/g, 'Lumo')
      .replace(/\bpH\b/g, 'p H')
      .replace(/\bpKa\b/g, 'p K a')
      .replace(/\bg\/mol\b/gi, 'grams per mole')
      .replace(/\s+/g, ' ')
      .trim();
  }

  speak(text, onStart = null, onEnd = null, onError = null, preferredLang = 'en') {
    if (!this.speechSynth || !text) return;
    this.speechSynth.cancel();

    const cleanText = this.prepareTextForSpeech(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Natural rate (not fast or shrill)
    let rate = 1.0;
    if (this.voiceConfig.speechSpeed === 'slow') rate = 0.85;
    else if (this.voiceConfig.speechSpeed === 'fast') rate = 1.20;
    utterance.rate = rate;

    // Natural pitch (fixed to 1.0 to prevent metallic robot distortion)
    utterance.pitch = 1.0;
    utterance.volume = typeof this.voiceConfig.volume === 'number' ? this.voiceConfig.volume : 1.0;

    const selectedVoice = this.resolveVoice(this.voiceConfig.voiceGender, preferredLang);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = (err) => {
      this.isSpeaking = false;
      if (onError) onError(err);
    };

    this.speechSynth.speak(utterance);
  }

  stopSpeaking() {
    if (this.speechSynth) {
      this.speechSynth.cancel();
      this.isSpeaking = false;
    }
  }

  startListening(onInterimResult, onFinalResult, onError, onEnd, preferredLang = 'auto') {
    if (!this.recognition) {
      if (onError) onError('Speech Recognition is not supported in this browser. Please use text input.');
      return;
    }

    this.stopSpeaking();
    this.isListening = true;

    if (preferredLang === 'te') {
      this.recognition.lang = 'te-IN';
    } else if (preferredLang === 'hi') {
      this.recognition.lang = 'hi-IN';
    } else {
      this.recognition.lang = 'en-US';
    }

    this.recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      const correctedInterim = this.sanitizeVoiceTranscript(interim);
      const correctedFinal = this.sanitizeVoiceTranscript(final);

      if (correctedInterim && onInterimResult) {
        onInterimResult(correctedInterim);
      }
      if (correctedFinal && onFinalResult) {
        onFinalResult(correctedFinal);
      }
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {}
  }

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
  }
}

function jsonParseSafe(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

export const aiCopilot = new AICopilotService();
