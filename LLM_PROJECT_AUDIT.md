# ChemNova / ChemSpace: AI Architecture & Legacy Code Audit
**Date:** March 2026  
**Auditor:** Antigravity AI Engineering  
**Scope:** Complete repository inspection of React frontend, Python backend, and legacy AI components for self-hosted Chemistry LLM migration (Step 1).

---

## 1. Executive Summary

ChemSpace (also referred to as ChemNova) is a full-stack scientific platform integrating interactive chemistry tools, cheminformatics calculators, quantum chemistry engines, and learning modules. The current AI assistant features previously relied on an external third-party provider (**OpenRouter** using the `nvidia/nemotron-3-ultra-550b-a55b:free` model) along with hardcoded heuristic fallbacks.

The objective of **Step 1** is to decouple ChemSpace completely from third-party AI APIs (OpenRouter, OpenAI, Gemini, Anthropic), safely remove obsolete/duplicate AI code, preserve all existing chemistry laboratory tools, and establish a clean, isolated foundation for a **small, self-hosted Chemistry-focused LLM** that will run on private infrastructure in future phases.

---

## 2. Current Frontend Structure (`src/`)

The frontend is a modern single-page application built with **React 19**, **Vite 8**, **Tailwind CSS**, and **Three.js**.

- **Routing & Core App (`src/App.jsx`, `src/main.jsx`)**:
  - Employs React Router (`react-router-dom`) with lazy-loaded route chunking.
  - Protected routes are wrapped in `ProtectedRoute.jsx` and `Layout.jsx`.
- **Pages (`src/pages/`)**:
  - `Landing.jsx`: Product overview and interactive preview.
  - `Dashboard.jsx`: Workspace analytics, user projects, quick launchpad.
  - `ChemDraw.jsx`: 2D chemical structure editor (`ChemDrawStudio.jsx`).
  - `AIChemistryLab.jsx`: **Preserved** - RDKit Laboratory & Python Chemistry Compiler workspace (mapped to route `/rdkit-lab`).
  - `QuantumLab.jsx`: Quantum chemistry & DFT workflow configurator.
  - `IbmRxnPage.jsx`: Organic reaction mechanism and retrosynthesis tree studio.
  - `Spectroscopy.jsx`: IR, NMR, Mass Spectrometry, and UV-Vis suite.
  - `ChromatographyPage.jsx`: HPLC, GC, and TLC simulation suite.
  - `PeriodicTable.jsx`: Interactive elemental database with electron configuration.
  - `ChemistsPage.jsx`: Famous historical chemists gallery and timeline.
  - `Auth.jsx`, `FinishSignUp.jsx`: Multi-method authentication (Email/Password, Firebase OTP, Google OAuth).
  - `UserWorkspace.jsx`, `ResearchProjects.jsx`, `Settings.jsx`, `Contact.jsx`, `Notes.jsx`.
- **Services (`src/services/`)**:
  - `api.js`: Unified API client routing `/api` calls to the Python backend.
  - `aiCopilotService.js`: Floating Copilot client service handling speech recognition (STT), speech synthesis (TTS), query sanitization, and streaming to `/api/ai/chat/stream`.
  - `aiService.js`: **Obsolete / Duplicate** - Legacy AI helper file containing hardcoded references to OpenRouter Nemotron 3 Ultra. Only imported in the unused `AIContext.jsx`.
  - `authService.js`, `firebase.js`, `firestoreService.js`: Authentication state, session handling, and Firebase database bridge.
  - `chemicalGraph.js`, `chemicalReactionEngine.js`, `chemicalResolver.js`: In-browser graph-based cheminformatics, canonical SMILES resolution, and molecular weight computation.
  - `quantumService.js`, `spectroscopyEngine.js`, `chromatographyCalculations.js`: Calculation kernels for chemistry suites.
- **Contexts (`src/context/`)**:
  - `AuthContext.jsx`: User session, login, signup, Firebase sync.
  - `ThemeContext.jsx`: Dark/light mode theme provider.
  - `GestureContext.jsx`: Air cursor and gesture recognition provider.
  - `AIContext.jsx`: **Obsolete / Unused** - Dead context file never imported by `App.jsx` or any active component.
- **Components (`src/components/`)**:
  - `AICopilot/`: Floating AI copilot interface (`CopilotWindow.jsx`, `ChatMessage.jsx`, `ChemistryCard.jsx`, `SuggestedActions.jsx`, `VoiceVisualizer.jsx`).
  - `QuantumChemistry/QuantumAIAssistant.jsx`: Domain-specific guidance panel within the Quantum Lab.
  - `IbmRxn/MechanismWorkspace.jsx`: Reaction mechanism copilot panel.
  - `loading/AILoader.jsx`, `ChemSpaceLoader.jsx`: Reusable loading spinners.

---

## 3. Current Python / Backend Structure (`backend/`)

The backend is built with **FastAPI** running under **Uvicorn** with SQLite and PySCF/RDKit integration.

- `backend/main.py`:
  - 2,725-line central application containing:
    - User registration, authentication, bcrypt password hashing, and session management.
    - SQLite persistence (`chemspace.db`).
    - Email OTP verification and SMTP delivery helpers.
    - Notes and project persistence endpoints.
    - RDKit cheminformatics API endpoints (2D depiction, 3D conformers, molecular descriptors, substructure SMARTS search).
    - PySCF quantum chemistry calculation engine (`quantum_chemistry_engine.py`).
    - Spectroscopy and chromatography calculation endpoints.
    - **Legacy AI Endpoints**:
      - `OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"`
      - `OPENROUTER_MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free"`
      - `@app.post("/api/ai/chat")`: Proxies chat requests to OpenRouter over HTTPS.
      - `@app.post("/api/ai/chat/stream")`: Streams SSE tokens from OpenRouter.
      - Rule-based fallback generator for offline scenarios.
      - DuckDuckGo web scraping function (`perform_web_search()`).
    - Verified scientific utility: `@app.get("/api/ai/pubchem")` proxying PubChem PUG REST.
- `backend/auth_middleware.py`: JWT bearer token validation.
- `backend/quantum_chemistry_engine.py`: PySCF wrapper for DFT (B3LYP), Hartree-Fock, and geometry optimizations.
- `backend/database/`: SQLite connection, migrations, and repository layer.
- `backend/requirements.txt`: Python package requirements (`fastapi`, `uvicorn`, `pydantic`, `rdkit`, `numpy`, `pillow`, `pyscf`, etc.).

---

## 4. Current AI Implementation vs Target State

| Dimension | Legacy / Current State | Target Self-Hosted State (Step 1 Foundation) |
| :--- | :--- | :--- |
| **Model Hosting** | Remote 3rd-party provider (OpenRouter API) | **Self-hosted local model** on private infrastructure |
| **Model Identity** | `nvidia/nemotron-3-ultra-550b-a55b:free` | **Small Chemistry-Specialized LLM** (to be trained/selected later) |
| **API Keys** | Requires `OPENROUTER_API_KEY` | **Zero external API keys** |
| **Code Architecture** | Hardcoded monolithic endpoints in `main.py` | Dedicated modular `chemistry_llm/` package with clear interfaces |
| **Inference Interface** | Direct HTTP call to OpenRouter | Standardized `model_loader.py` and `generate.py` |
| **Chemistry Knowledge** | Hallucination-prone general LLM | Separation of weights vs controlled retrieval + RDKit tool layer |

---

## 5. Audit Classification of Files

### A. Files Safely Identified as Obsolete & Marked for Removal
1. `src/services/aiService.js`: Legacy helper file containing duplicate client logic and hardcoded references to `Nemotron 3 Ultra via OpenRouter`.
2. `src/context/AIContext.jsx`: Dead context file not imported anywhere in the project.

### B. Files Requiring Cleanup of Legacy AI References
1. `backend/main.py`:
   - Remove OpenRouter constants (`OPENROUTER_API_URL`, `OPENROUTER_MODEL`).
   - Remove outbound HTTPS calls to OpenRouter.
   - Refactor `/api/ai/chat` and `/api/ai/chat/stream` to delegate to the new `chemistry_llm` foundation and return standardized Step 1 development status without external dependencies.
   - Preserve PubChem PUG REST proxy endpoint (`/api/ai/pubchem`).
2. `.env.example`:
   - Remove `OPENROUTER_API_KEY=your_openrouter_api_key_here` and related OpenRouter comments.
   - Add local Chemistry LLM configuration placeholders.
3. `.env`:
   - Remove obsolete external AI keys (`OPENROUTER_API_KEY`, `GEMINI_API_KEY`).
4. `src/components/Layout.jsx`:
   - Remove legacy comment referencing OpenRouter Nemotron 3 Ultra.
5. `src/components/IbmRxn/MechanismWorkspace.jsx`:
   - Change static UI badge from `GPT/GEMINI PRO` to `CHEMNOVA AI`.
6. `.gitignore`:
   - Add explicit ignore patterns for future local model weights (`*.pt`, `*.bin`, `*.safetensors`, `*.gguf`) and datasets.

### C. Files that MUST Be Preserved (Core Website & Scientific Tools)
1. **React Frontend Core**: `src/App.jsx`, `src/main.jsx`, `src/context/AuthContext.jsx`, `src/context/ThemeContext.jsx`, `src/components/Layout.jsx`, `src/components/ProtectedRoute.jsx`.
2. **Authentication System**: `src/pages/Auth.jsx`, `src/pages/FinishSignUp.jsx`, `src/components/auth/*`, `src/services/authService.js`, `src/services/firebase.js`.
3. **Chemistry Laboratory Applications**:
   - `ChemDrawStudio.jsx` & `src/pages/ChemDraw.jsx` (2D Molecular Sketcher).
   - `src/pages/AIChemistryLab.jsx` (RDKit Python Laboratory - named `AIChemistryLab` in routing).
   - `src/components/RDKit/Molecule2DViewer.jsx`.
   - `src/pages/QuantumLab.jsx` & `src/components/QuantumChemistry/*` (DFT & PySCF lab).
   - `src/pages/IbmRxnPage.jsx` & `src/components/IbmRxn/*` (Organic Reaction Mechanisms).
   - `src/pages/Spectroscopy.jsx` & `src/components/SpectroscopySuite.jsx` (IR/NMR/MS).
   - `src/pages/ChromatographyPage.jsx` & `src/components/Chromatography/*`.
   - `src/pages/PeriodicTable.jsx`.
   - `src/pages/ChemistsPage.jsx` & `src/components/scientists/*`.
4. **Cheminformatics Calculation Engines**:
   - `src/services/chemicalGraph.js`.
   - `src/services/chemicalReactionEngine.js`.
   - `src/services/chemicalResolver.js`.
   - `src/services/quantumService.js`.
   - `src/services/spectroscopyEngine.js`.
   - `src/services/chromatographyCalculations.js`.
5. **Backend Core Services**:
   - `backend/auth_middleware.py`.
   - `backend/quantum_chemistry_engine.py`.
   - `backend/database/*` (`connection.py`, `migrations.py`, `repository.py`, `schema.sql`).
   - `backend/chemspace.db`.
6. **Chatbot UI Container**:
   - `src/components/AICopilot/` (`CopilotWindow.jsx`, `ChatMessage.jsx`, `ChemistryCard.jsx`, `SuggestedActions.jsx`, `VoiceVisualizer.jsx`).
   - `src/services/aiCopilotService.js` (Preserved and updated to point cleanly to the local backend endpoints).

---

## 6. Current Dependencies Audit

### Python (`backend/requirements.txt`)
- `fastapi`, `uvicorn`, `pydantic`, `email-validator` (Core web framework).
- `rdkit`, `numpy`, `pillow`, `pyscf`, `scipy`, `matplotlib`, `joblib`, `pandas` (Scientific & cheminformatics tools).
- **Audit result:** No heavy or obsolete external AI dependencies (e.g., `openai`, `langchain`, `transformers`) are currently installed in the main backend.

### Node.js (`package.json`)
- React 19, Vite 8, Tailwind CSS, Three.js, Lucide-react, Firebase, MediaPipe Tasks Vision.
- **Audit result:** No third-party LLM client SDKs (`openai`, `@google/generative-ai`) are present in `package.json`.

---

## 7. Recommended Location for the New Self-Hosted LLM System

The self-hosted Chemistry LLM will be located in:

```
c:\Users\chell\Desktop\chemspace\chemistry_llm\
```

This isolates the future model training, inference pipelines, data preparation, evaluation benchmarks, and chemistry tool adapters inside an independent modular package while allowing easy mounting into `backend/main.py`.
