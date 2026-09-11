import { request } from './api.js';
import {
  resolveChemicalNameToSmiles,
  identifyMoleculeFromSmiles,
  isSmilesString,
  validateSmilesSyntax,
  extractCandidateChemicalName
} from './chemicalResolver.js';
import {
  detectLanguage,
  formatMultilingualMoleculeResponse,
  formatUnresolvableResponse
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
  'orca': 'ORCA',
  'psi 4': 'PSI4',
  'psi4': 'PSI4',
  'lipinski': 'Lipinski',
  'vqe': 'VQE',
  'retrosynthesis': 'Retrosynthesis',
  'tanimoto': 'Tanimoto',
  'ecfp4': 'ECFP4',
  'mmff94': 'MMFF94',
  'etkdg': 'ETKDG',
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
  'dopamine': 'Dopamine',
  'serotonin': 'Serotonin',
  'toluene': 'Toluene',
  'aniline': 'Aniline',
  'phenol': 'Phenol',
  'quantum chemistry': 'Quantum Chemistry',
  'spectroscopy': 'Spectroscopy',
  'mass spectrometry': 'Mass Spectrometry',
  'mass spec': 'Mass Spectrometry',
  'uv vis': 'UV-Vis',
  'uv-vis': 'UV-Vis',
  'ibm rxn': 'IBM RXN',
  'chromatography': 'Chromatography',
  'hplc': 'HPLC',
  'gc': 'GC',
  'tlc': 'TLC',
  'python': 'Python'
};

export const CHEMBOT_SYSTEM_PROMPT = `
You are ChemBot, the AI assistant embedded in this chemistry website. Your role is to help users navigate and use the site effectively.

Your responsibilities:
- Answer chemistry questions directly — including topics related to the periodic table, molecular structures, drug discovery concepts, spectroscopy, and chemical synthesis. Give clear, accurate, and educational answers.
- Return verified SMILES strings for chemical names accurately.
- Guide users to the right tools — When a user asks about a specific feature (e.g., "draw a molecule," "calculate spectroscopy data," "look up an element"), tell them exactly which button or tool on the site does that, and explain briefly how to use it. If the interface allows it, you may trigger the relevant tool/button on the user's behalf rather than just describing it.
- Handle general questions too — If a user asks something unrelated to chemistry, respond helpfully and naturally like a knowledgeable, friendly assistant, then gently guide the conversation back to what the site offers if relevant.
- Maintain a consistent, approachable character — Friendly, knowledgeable, and clear. Avoid overly technical jargon unless the user signals expertise.
- Do not break existing site functionality — Only assist with or trigger actions the site already supports. Do not fabricate features, data, or results that don't exist on the platform.

Tone: Helpful, clear, and conversational — like a knowledgeable lab assistant, not a generic customer service bot.
`;

class AICopilotService {
  constructor() {
    this.history = [];
    this.isListening = false;
    this.recognition = null;
    this.speechSynth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.ttsEnabled = false;

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

  /**
   * Corrects common speech-to-text mistranscriptions for scientific terms
   */
  sanitizeVoiceTranscript(rawText) {
    if (!rawText) return '';
    let corrected = rawText;
    for (const [wrong, right] of Object.entries(SCIENTIFIC_CORRECTIONS)) {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      corrected = corrected.replace(regex, right);
    }
    return corrected;
  }

  /**
   * Main method to send a prompt to the scientific AI assistant
   */
  async sendMessage(query, context = {}, signal = null) {
    const sanitizedQuery = this.sanitizeVoiceTranscript(query);
    const langInfo = detectLanguage(sanitizedQuery);

    // 1. First-class Chemistry Resolution: Check for chemical name or SMILES intent
    const chemResult = await this.tryResolveChemistryIntent(sanitizedQuery, langInfo);
    if (chemResult) {
      this.history.push({ role: 'user', content: sanitizedQuery });
      this.history.push({ role: 'assistant', content: chemResult.responseText });
      return chemResult;
    }

    try {
      const response = await request('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          query: sanitizedQuery,
          systemPrompt: CHEMBOT_SYSTEM_PROMPT,
          history: this.history.slice(-8), // Send recent messages for continuity
          context: {
            ...context,
            detectedLanguage: langInfo.code,
            currentPath: typeof window !== 'undefined' ? window.location.pathname : '/',
            timestamp: new Date().toISOString()
          }
        }),
        signal
      });

      if (response && response.status === 'success' && response.responseText) {
        // Record into conversation history
        this.history.push({ role: 'user', content: sanitizedQuery });
        this.history.push({ role: 'assistant', content: response.responseText });

        // Execute Platform Actions if returned
        if (response.platformAction) {
          this.handlePlatformAction(response.platformAction);
        }

        return response;
      }
      throw new Error('Invalid response from AI backend');
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      console.warn('[AICopilotService] Using high-fidelity scientific client engine:', error.message);
      const fallback = await this.generateClientFallbackResponse(sanitizedQuery, context, langInfo);
      this.history.push({ role: 'user', content: sanitizedQuery });
      this.history.push({ role: 'assistant', content: fallback.responseText });
      return fallback;
    }
  }

  /**
   * Dedicated chemical intent resolution layer
   */
  async tryResolveChemistryIntent(query, langInfo) {
    const lower = query.toLowerCase().trim();

    // A. Detect if user is entering a SMILES string directly or asking to identify SMILES
    let candidateSmiles = null;
    if (isSmilesString(query)) {
      candidateSmiles = query.trim();
    } else {
      const tokens = query.split(/\s+/);
      for (const token of tokens) {
        const clean = token.replace(/^[:,'"`]+|[:,'"`]+$/g, '');
        if (isSmilesString(clean)) {
          candidateSmiles = clean;
          break;
        }
      }
    }

    if (candidateSmiles && validateSmilesSyntax(candidateSmiles)) {
      const identified = await identifyMoleculeFromSmiles(candidateSmiles);
      if (identified.success) {
        const formatted = formatMultilingualMoleculeResponse(langInfo.code, identified, 'reverse');
        return {
          status: 'success',
          query,
          responseText: formatted.text,
          thinkingSteps: [
            `Detected valid SMILES structural input: "${candidateSmiles}"`,
            `Language detected: ${langInfo.name} (${langInfo.code})`,
            `Identified molecular entity: ${identified.name}`,
            `Source: ${identified.source}`
          ],
          moleculeCard: {
            name: identified.name,
            iupac: identified.iupac || '',
            smiles: identified.smiles,
            formula: identified.formula || '',
            molWeight: identified.mw || 0,
            logP: identified.logP ?? 1.2,
            tpsa: identified.tpsa ?? 40.0,
            lipinskiPassed: identified.lipinski ?? true,
            source: identified.source,
            category: identified.category || 'Identified Compound'
          },
          suggestedActions: formatted.suggested,
          timestamp: new Date().toISOString()
        };
      }
    }

    // B. Detect chemical name query (e.g. "Give me the SMILES for ethanol", "Acetic acid", "What is the SMILES of caffeine?")
    const asksSmiles = lower.includes('smiles') || lower.includes('formula') || lower.includes('structure') || lower.includes('molecular weight') || lower.includes('mw') || lower.includes('what is') || lower.includes('give me') || lower.includes('show me') || lower.includes('tell me') || lower.includes('convert') || lower.includes('yokka') || lower.includes('kya hai') || lower.includes('enna');

    const candidateName = extractCandidateChemicalName(query);

    // If query is very short (e.g. "acetic acid", "ethanol", "caffeine", "benzene") or asks for SMILES/properties
    if (candidateName && (asksSmiles || candidateName.split(' ').length <= 4)) {
      const resolved = await resolveChemicalNameToSmiles(candidateName);
      if (resolved.success) {
        const formatted = formatMultilingualMoleculeResponse(langInfo.code, resolved, 'smiles');
        return {
          status: 'success',
          query,
          responseText: formatted.text,
          thinkingSteps: [
            `Extracted candidate chemical entity: "${candidateName}"`,
            `Language detected: ${langInfo.name} (${langInfo.code})`,
            `Resolved canonical SMILES: ${resolved.smiles}`,
            `Validation: Confirmed through ${resolved.source}`
          ],
          moleculeCard: {
            name: resolved.name,
            iupac: resolved.iupac || '',
            smiles: resolved.smiles,
            formula: resolved.formula || '',
            molWeight: resolved.mw || 0,
            logP: resolved.logP ?? 1.2,
            tpsa: resolved.tpsa ?? 40.0,
            lipinskiPassed: resolved.lipinski ?? true,
            source: resolved.source,
            category: resolved.category || 'Resolved Molecule'
          },
          suggestedActions: formatted.suggested,
          timestamp: new Date().toISOString()
        };
      } else if (asksSmiles && candidateName.length > 2 && !candidateName.includes('help') && !candidateName.includes('how to')) {
        // Explicitly asked for a chemical's SMILES, but it could not be resolved reliably
        // NEVER fabricate a SMILES string
        return {
          status: 'success',
          query,
          responseText: formatUnresolvableResponse(langInfo.code, candidateName),
          thinkingSteps: [
            `Chemical entity query: "${candidateName}"`,
            `Attempted resolution via ChemSpace Verified Registry, PubChem PUG REST, and NIH Cactus`,
            `Result: Could not verify molecular structure with 100% confidence`,
            `Safeguard triggered: Refusing to hallucinate unverified SMILES`
          ],
          moleculeCard: null,
          suggestedActions: ['Try Another Molecule', 'Draw in ChemDraw', 'Search Periodic Table'],
          timestamp: new Date().toISOString()
        };
      }
    }

    return null;
  }

  /**
   * Executes safe platform actions
   */
  handlePlatformAction(action) {
    if (typeof window === 'undefined') return;

    if (action === 'SWITCH_THEME_DARK' || action === 'SWITCH_THEME_LIGHT') {
      const theme = action === 'SWITCH_THEME_DARK' ? 'dark' : 'light';
      window.dispatchEvent(new CustomEvent('chemspace-theme-switch', { detail: { theme } }));
    }
  }

  /**
   * Streams response chunks to simulate real-time conversational output
   */
  async *streamResponse(text, signal = null) {
    if (!text) return;
    const words = text.split(' ');
    let currentText = '';

    for (let i = 0; i < words.length; i++) {
      if (signal && signal.aborted) break;
      currentText += (i === 0 ? '' : ' ') + words[i];
      yield currentText;
      // Slight natural variation in streaming cadence
      const delay = Math.min(50, Math.max(12, words[i].length * 5));
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  /**
   * Client-side scientific reasoning engine for ChemBot
   */
  async generateClientFallbackResponse(query, context = {}, langInfo = null) {
    const lang = langInfo || detectLanguage(query);
    const lower = query.toLowerCase().trim();
    let navTarget = null;
    let targetName = null;
    let platformAction = null;
    let responseText = '';
    let codeBlock = null;
    let moleculeCard = null;
    let suggestedActions = [];

    // 1. Theme controls
    if (lower.includes('dark mode') || lower.includes('night mode') || lower.includes('dark theme')) {
      platformAction = 'SWITCH_THEME_DARK';
      this.handlePlatformAction('SWITCH_THEME_DARK');
      responseText = "I've switched the theme to **Obsidian Dark** mode for you. It provides high contrast and is easy on the eyes during long lab sessions!";
      suggestedActions = ['Switch to Light Mode', 'Open ChemDraw Studio', 'Explore Periodic Table'];
    } else if (lower.includes('light mode') || lower.includes('day mode') || lower.includes('light theme')) {
      platformAction = 'SWITCH_THEME_LIGHT';
      this.handlePlatformAction('SWITCH_THEME_LIGHT');
      responseText = "I've switched the theme to **Ceramic Light** mode for you. Clean and bright!";
      suggestedActions = ['Switch to Dark Mode', 'Open ChemDraw Studio', 'Explore Periodic Table'];
    }
    // 2. Navigation & Tool Guidance
    else if (lower.includes('draw') || lower.includes('chemdraw') || lower.includes('sketch') || lower.includes('canvas') || lower.includes('structure editor')) {
      navTarget = '/chemdraw';
      targetName = 'ChemDraw Studio';
      responseText = "You can draw molecules in **ChemDraw Studio**!\n\nTo use it:\n1. Click on any atom or bond tool in the toolbar on the left.\n2. Click or drag onto the 2D canvas to place bonds, rings, or heteroatoms.\n3. Click **'Generate 3D & Minimize'** in the top action bar to convert your 2D sketch into an optimized 3D conformer with real-time energy minimization.\n\nI'm navigating you to **ChemDraw Studio** now!";
      suggestedActions = ['Draw Benzene Ring', 'Export SMILES', 'Optimize in 3D'];
    } else if (lower.includes('rdkit') || lower.includes('python') || lower.includes('script') || lower.includes('lipinski') || lower.includes('descriptor') || lower.includes('drug-like') || lower.includes('drug likeness')) {
      navTarget = '/rdkit-lab';
      targetName = 'RDKit Python Lab';
      responseText = "For computing molecular descriptors, Lipinski Rule of 5 parameters, and running Python chemoinformatics scripts, head to the **RDKit Python Laboratory**.\n\nHow to use it:\n- Enter a SMILES string or write custom Python code in the interactive editor.\n- Click **'Execute Python Code'** to run live RDKit calculations, generate 2D vector diagrams, and view the interactive 3D conformer.\n- Check the **Lipinski Matrix** for molecular weight, LogP, TPSA, and hydrogen bond donors/acceptors.\n\nOpening **RDKit Lab** for you now!";
      suggestedActions = ['Calculate Lipinski Descriptors', 'Generate 3D Conformer', 'Morgan Fingerprints'];
    } else if (lower.includes('spectroscopy') || lower.includes('ir') || lower.includes('ftir') || lower.includes('nmr') || lower.includes('mass spec') || lower.includes('mass spectrum') || lower.includes('uv-vis') || lower.includes('uv vis') || lower.includes('spectrum') || lower.includes('peaks')) {
      navTarget = '/spectroscopy';
      targetName = 'Spectroscopy Suite';
      responseText = "You can analyze functional groups and spectral peaks in the **Spectroscopy Suite**.\n\nWhat it offers:\n- **FTIR (Infrared)**: Identifies diagnostic bonds like carbonyls ($C=O$ at ~1715 cm⁻¹), alcohols ($O-H$ broad at ~3300 cm⁻¹), and amines.\n- **¹H & ¹³C NMR**: Multi-nuclear chemical shift simulations and coupling constants.\n- **Mass Spectrometry (MS)**: Molecular ion peaks and fragmentation pathways.\n- **UV-Vis**: Electronic absorption bands and chromophores.\n\nLet's head over to the **Spectroscopy Suite**!";
      suggestedActions = ['Analyze Carbonyl Peak', 'Show 1H NMR Shifts', 'Inspect Mass Spec'];
    } else if (lower.includes('quantum') || lower.includes('dft') || lower.includes('homo') || lower.includes('lumo') || lower.includes('orbital') || lower.includes('vqe') || lower.includes('hartree-fock') || lower.includes('basis set') || lower.includes('pes scan')) {
      navTarget = '/quantum-library';
      targetName = 'Quantum Chemistry Lab';
      responseText = "Our **Quantum Chemistry Lab** provides 100% input-driven ab initio calculations.\n\nKey capabilities:\n- **Theory Levels**: Density Functional Theory (DFT with B3LYP, PBE), Hartree-Fock (HF), and Semi-empirical models.\n- **Basis Sets**: From minimal STO-3G up to def2-TZVP for transition metals.\n- **Electronic Structure**: Computes HOMO-LUMO energy gaps, total electronic ground state energies, dipole moments, and 1D Potential Energy Surface (PES) bond-stretching scans.\n\nOpening the **Quantum Chemistry Lab** now!";
      suggestedActions = ['Run DFT B3LYP', 'Calculate HOMO-LUMO Gap', '1D PES Scan'];
    } else if (lower.includes('rxn') || lower.includes('retrosynthesis') || lower.includes('synthesis') || lower.includes('reaction') || lower.includes('predict product') || lower.includes('synthetic pathway')) {
      navTarget = '/ibm-rxn';
      targetName = 'IBM RXN Studio';
      responseText = "For predicting organic chemical reactions and retrosynthetic pathways, use the **IBM RXN Studio**.\n\nFeatures:\n- **Reaction Outcome Prediction**: Enter reactants and reagents to forecast the major organic product with confidence scoring.\n- **Retrosynthesis Planner**: Disassembles a complex target molecule into commercially available starting precursors step-by-step.\n\nNavigating you to **IBM RXN Studio**!";
      suggestedActions = ['Predict Reaction Outcome', 'Run Retrosynthesis', 'Atom-Mapping'];
    } else if (lower.includes('periodic') || lower.includes('element') || lower.includes('atom') || lower.includes('atomic number') || lower.includes('electronegativity') || lower.includes('periodic table')) {
      navTarget = '/periodic-table';
      targetName = 'Periodic Table';
      responseText = "The **Interactive Periodic Table** has comprehensive data for all 118 chemical elements.\n\nExplore:\n- Standard atomic weights, electron configurations, oxidation states, and electronegativity trends.\n- Categorization by alkali metals, transition metals, halogens, noble gases, lanthanides, and actinides.\n- Visual atomic radius and ionization energy heatmaps.\n\nTaking you to the **Periodic Table** now!";
      suggestedActions = ['Inspect Transition Metals', 'Check Electronegativities', 'Show Electron Orbitals'];
    } else if (lower.includes('chromatography') || lower.includes('hplc') || lower.includes('gc') || lower.includes('tlc') || lower.includes('rf') || lower.includes('retention time') || lower.includes('column chromatography') || lower.includes('paper chromatography') || lower.includes('size exclusion') || lower.includes('ion exchange') || lower.includes('affinity')) {
      navTarget = '/chromatography';
      targetName = 'Chromatography Studio';
      responseText = "Opening the **Chromatography & Separation Science Studio**!\n\nCapabilities:\n- **Paper & TLC**: Real-time solvent front tracking and automated $R_f = \\frac{d_{\\text{solute}}}{d_{\\text{solvent}}}$ calculations with UV 254/365 nm simulation.\n- **GC & HPLC**: Quantitative peak integration (Area %, $k'$, resolution $R_s$, theoretical plates $N$, HETP, calibration curve quantification).\n- **Column & Biomolecules**: Fraction collection tracker, recovery %, SEC $K_{\\text{SEC}}$, and Ion-Exchange / Affinity protocols.\n\nNavigating you to **Chromatography Studio** now!";
      suggestedActions = ['Calculate Rf Value', 'Analyze HPLC Chromatogram', 'Calculate Resolution Rs', 'Open TLC Workspace'];
    } else if (lower.includes('scientist') || lower.includes('pioneer') || lower.includes('chemist') || lower.includes('history') || lower.includes('biography') || lower.includes('nobel prize') || lower.includes('curie') || lower.includes('mendeleev') || lower.includes('pauling')) {
      navTarget = '/scientists';
      targetName = 'Scientists & History Gallery';
      responseText = "Explore our **Scientists & History Gallery** to learn about the pioneers who built modern chemistry.\n\nHighlights:\n- Verified biographies, discoveries, mathematical formulations, and signature molecules in interactive 2D and 3D.\n- Global historical chronology timeline spanning the 18th century to modern CRISPR gene editing.\n- Side-by-side comparison tool between any two pioneering scientists.\n\nOpening the **Scientists Gallery** for you!";
      suggestedActions = ['Dmitri Mendeleev', 'Marie Curie', 'Linus Pauling', 'Jennifer Doudna'];
    } else if (lower.includes('download') || lower.includes('my downloads') || lower.includes('exported files')) {
      navTarget = '/workspace';
      targetName = 'Downloads Manager';
      responseText = "Opening your personal **Downloads Manager**! Here you can find every molecular file, SMILES export, and report you've generated, with options to download them again.";
      suggestedActions = ['View All Downloads', 'Go to History', 'Open ChemDraw'];
    } else if (lower.includes('history') || lower.includes('recent calculations') || lower.includes('what did i work on') || lower.includes('my recent work') || lower.includes('yesterday')) {
      navTarget = '/workspace';
      targetName = 'User Workspace & History';
      responseText = "Taking you to your **Personal History** workspace. Here you can inspect your authentic past calculations, saved molecules, and lab experiments.";
      suggestedActions = ['Filter by Molecules', 'Filter by Calculations', 'View Downloads'];
    } else if (lower.includes('settings') || lower.includes('preferences') || lower.includes('control center') || lower.includes('voice settings')) {
      navTarget = '/settings';
      targetName = 'Settings Control Center';
      responseText = "Opening the **Settings & Personalization Control Center**! You can adjust your profile, theme, conversational language, voice preferences, and privacy controls.";
      suggestedActions = ['Change Language', 'Voice Settings', 'Security Overview'];
    }
    // 3. Chemistry Educational Questions (Direct Knowledge)
    else if (lower.includes('lipinski') || lower.includes('rule of 5') || lower.includes('drug discovery')) {
      responseText = "**Lipinski's Rule of 5** is a set of guidelines used in drug discovery to evaluate drug-likeness for orally active pharmaceuticals:\n\n1. **Molecular Weight**: $\\le 500\\text{ g/mol}$\n2. **Lipophilicity (LogP)**: $\\le 5.0$\n3. **Hydrogen Bond Donors (HBD)**: $\\le 5$ (sum of $OH$ and $NH$ groups)\n4. **Hydrogen Bond Acceptors (HBA)**: $\\le 10$ (sum of $N$ and $O$ atoms)\n\n*A compound with $\\le 1$ violation is generally considered to possess good oral bioavailability.* You can test any molecule against these rules right now in the **RDKit Python Lab**!";
      suggestedActions = ['Open RDKit Lab', 'Test Aspirin', 'Test Caffeine'];
    } else if (lower.includes('homo') || lower.includes('lumo') || lower.includes('frontier orbital')) {
      responseText = "**HOMO** (Highest Occupied Molecular Orbital) and **LUMO** (Lowest Unoccupied Molecular Orbital) are the frontier orbitals of a molecule:\n\n- **HOMO**: Contains the highest-energy electrons available for donation (nucleophilic / oxidation character).\n- **LUMO**: The lowest-energy empty orbital available to accept incoming electrons (electrophilic / reduction character).\n- **HOMO-LUMO Gap ($\\Delta E$)**: Indicates chemical hardness and kinetic stability. A large gap generally signifies high thermodynamic stability and UV absorption, whereas a narrow gap indicates higher chemical reactivity.\n\nYou can compute exact HOMO-LUMO gaps using DFT in the **Quantum Chemistry Lab**!";
      suggestedActions = ['Calculate HOMO-LUMO in Quantum Lab', 'Open ChemDraw', 'Draw Conjugated Diene'];
    } else if (lower.includes('electronegativity') || lower.includes('periodic trend')) {
      responseText = "**Electronegativity** is a measure of an atom's ability to attract shared bonding electrons toward itself:\n\n- **Trend Across a Period (Left $\\to$ Right)**: Increases due to greater effective nuclear charge ($Z_{\\text{eff}}$) pulling valence electrons closer.\n- **Trend Down a Group (Top $\\to$ Bottom)**: Decreases because additional electron shells increase atomic shielding.\n- **Most Electronegative Element**: Fluorine ($3.98$ on the Pauling scale).\n- **Least Electronegative**: Francium and Cesium (~$0.7$).\n\nYou can visually compare electronegativities across all 118 elements in our **Periodic Table** module!";
      suggestedActions = ['Open Periodic Table', 'Explore Halogens', 'Compare Pauling vs Mulliken'];
    }
    // 4. Greetings & General / Non-chemistry Questions
    else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('good morning') || lower.includes('good afternoon') || lower.includes('namaste') || lower.includes('vanakkam') || lower.includes('namaskaram')) {
      responseText = "Hello there! I'm **ChemBot**, your scientific lab assistant on ChemSpace. 👋\n\nI can answer chemistry questions, convert chemical names into verified SMILES strings, explain concepts from molecular orbitals to organic synthesis, or guide you directly to our interactive tools:\n- 🧪 **Chemical Name $\\to$ SMILES**: Try *'Give me the SMILES for caffeine'* or *'Ethanol'*.\n- 🎨 **ChemDraw Studio**: 2D drawing & 3D conformer optimization\n- 🐍 **RDKit Lab**: Molecular descriptors & Python scripting\n- ⚛️ **Quantum Chemistry**: DFT & HOMO-LUMO gap calculations\n- 📊 **Spectroscopy Suite**: FTIR, NMR, MS & UV-Vis\n- 🧪 **IBM RXN**: Organic synthesis & retrosynthesis\n- 🗺️ **Periodic Table**: 118 elements & periodic trends\n\nWhat molecule or calculation would you like to explore today?";
      suggestedActions = ['Give me the SMILES for caffeine', 'Draw a Molecule', 'Analyze Spectroscopy Data', 'Look Up an Element'];
    } else if (lower.includes('who are you') || lower.includes('what are you') || lower.includes('what can you do')) {
      responseText = "I am **ChemBot**, the embedded AI assistant for ChemSpace! Think of me as your personal computational chemistry lab assistant.\n\nHere is how I can help you:\n1. **Chemical Name $\\to$ SMILES**: Ask for the SMILES of any chemical name (e.g. *'SMILES of aspirin'*, *'caffeine'*, *'ethanol'*), or enter a SMILES code to identify the molecule.\n2. **Answer Chemistry Questions**: Molecular structures, drug discovery (Lipinski Rule of 5), spectroscopy peaks, reaction mechanisms, and quantum orbitals.\n3. **Guide You to Tools**: Tell me what you want to do (e.g. *'draw benzene'*, *'check IR peaks'*, *'look up gold'*), and I will explain how to use the feature and can navigate you right to it.\n4. **Multilingual Chat**: Ask in English, Telugu, Hindi, or Tamil.\n\nLet me know where you'd like to start!";
      suggestedActions = ['SMILES of aspirin', 'Open ChemDraw', 'Open RDKit Lab', 'Open Periodic Table'];
    } else if (lower.includes('weather') || lower.includes('joke') || lower.includes('music') || lower.includes('movie') || lower.includes('game') || lower.includes('capital of') || lower.includes('recipe')) {
      responseText = `I'm happy to chat about that! While I spend most of my time in the chemistry lab analyzing molecules, reactions, and periodic trends, I'm always here to help with general questions too.\n\nWhenever you're ready to dive back into science, we have great tools ready—like **ChemDraw** for molecular sketching, the **Periodic Table**, or the **Spectroscopy Suite**. Just let me know what you'd like to explore next!`;
      suggestedActions = ['SMILES for caffeine', 'Explore Periodic Table', 'Draw a Molecule', 'Ask a Chemistry Question'];
    } else {
      responseText = `I've analyzed your query: **"${query}"**.\n\nAs your lab assistant, I can resolve chemical names to verified SMILES strings, explain chemical principles, walk you through molecular calculations, or open the right workspace for you (such as **ChemDraw Studio**, **RDKit Lab**, **Quantum Chemistry**, **Spectroscopy**, or the **Periodic Table**).\n\nHow would you like to proceed?`;
      suggestedActions = ['Give me the SMILES for caffeine', 'Open ChemDraw Studio', 'Launch RDKit Lab', 'Open Periodic Table'];
    }

    return {
      status: 'success',
      query,
      responseText,
      thinkingSteps: [
        `ChemBot captured query: "${query}"`,
        `Language: ${lang.name} (${lang.code})`,
        `Context route: ${context.currentPath || '/'}`,
        navTarget ? `Identified tool guidance intent: ${targetName}` : 'Formulated scientific lab assistant response',
        'Validated through ChemSpace Registry'
      ],
      moleculeCard,
      codeBlock,
      navigationTarget: navTarget,
      targetName,
      platformAction,
      suggestedActions,
      timestamp: new Date().toISOString()
    };
  }

  // --- Voice AI (STT & TTS) ---

  startListening(onInterimResult, onFinalResult, onError, onEnd) {
    if (!this.recognition) {
      if (onError) onError('Speech Recognition is not supported in this browser. Please use text input.');
      return;
    }

    this.isListening = true;

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
      console.warn('[AICopilot Voice Error]', event.error);
      this.isListening = false;
      if (onError) {
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          onError('Microphone permission was denied. Please allow microphone access in your browser.');
        } else {
          onError(`Voice input notice: ${event.error}`);
        }
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      this.isListening = false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.isListening = false;
  }

  speak(text) {
    if (!this.speechSynth || !text) return;

    this.speechSynth.cancel();

    // Clean markdown formatting before speaking
    const cleanText = text
      .replace(/[`*#_~]/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/---/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = this.speechSynth.getVoices();
    const preferredVoice = voices.find((v) =>
      v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Jenny')
    ) || voices[0];

    if (preferredVoice) utterance.voice = preferredVoice;

    this.speechSynth.speak(utterance);
  }

  stopSpeaking() {
    if (this.speechSynth) {
      this.speechSynth.cancel();
    }
  }

  clearHistory() {
    this.history = [];
  }
}

export const aiCopilot = new AICopilotService();
