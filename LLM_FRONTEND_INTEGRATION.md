# ChemNova / ChemSpace: Frontend Integration Architecture
**Phase:** Step 1 Foundation  
**System Target:** Small Self-Hosted Chemistry AI / LLM  
**Scope:** Architecture alignment between React frontend, Python backend endpoints, and the self-hosted Chemistry LLM module.

---

## 1. High-Level Integration Flow

The integration architecture routes user interactions from the React frontend to the self-hosted Chemistry LLM without relying on any third-party external AI APIs:

```text
┌────────────────────────────────────────────────────────┐
│                   React Chat UI                        │
│ (src/components/AICopilot/CopilotWindow.jsx & ChatMessage) │
└───────────────────────────┬────────────────────────────┘
                            │ (User Query + Session Context)
                            ▼
┌────────────────────────────────────────────────────────┐
│             Frontend Service Client                    │
│         (src/services/aiCopilotService.js)             │
│   • Sanitizes speech transcription                     │
│   • Detects client-side scientific intents             │
│   • Manages SSE streaming or POST /api/chat requests   │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP POST (Vite Proxy: /api)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Python Backend                       │
│                 (backend/main.py)                      │
│   • Authenticates request & checks rate limits         │
│   • Routes /api/ai/chat and /api/chat                  │
│   • Resolves scientific tools (RDKit / PubChem)       │
└───────────────────────────┬────────────────────────────┘
                            │ Python In-Process / Internal API
                            ▼
┌────────────────────────────────────────────────────────┐
│            Self-Hosted Chemistry LLM                   │
│               (chemistry_llm/)                         │
│   • settings.py: Load model & device configs           │
│   • prompts.py: Format system instructions             │
│   • generate.py: Local model inference & streaming     │
│   • tools/chemistry/: RDKit & chemical validations     │
└────────────────────────────────────────────────────────┘
```

---

## 2. API Contract Specification

### Endpoint: `POST /api/chat` (and backward-compatible `/api/ai/chat`)

#### Request Payload
```json
{
  "query": "What is the canonical SMILES for aspirin?",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hello! How can I assist your chemistry research today?" }
  ],
  "context": {
    "currentPath": "/chemdraw",
    "activeMolecule": "CC(=O)Oc1ccccc1C(=O)O",
    "detectedLanguage": "en"
  }
}
```

#### Step 1 Development Response (Local Model Pending Connection)
```json
{
  "status": "success",
  "provider": "ChemNova Local Chemistry LLM (Foundation Phase)",
  "connected": false,
  "step": 1,
  "query": "What is the canonical SMILES for aspirin?",
  "responseText": "[ChemNova Architecture Step 1] Self-hosted Chemistry LLM foundation is active. Base model weights have not yet been connected (scheduled for subsequent training/quantization phase). No external AI providers are used.",
  "timestamp": "2026-03-27T09:30:00Z"
}
```

#### Future Production Response (Local Model Connected)
```json
{
  "status": "success",
  "provider": "ChemNova Local Chemistry LLM",
  "connected": true,
  "query": "What is the canonical SMILES for aspirin?",
  "responseText": "The canonical SMILES for **Aspirin** (acetylsalicylic acid) is `CC(=O)Oc1ccccc1C(=O)O`.\n\nIt consists of a benzene ring substituted with an acetoxy group and an ortho carboxylic acid group.",
  "moleculeCard": {
    "name": "Aspirin",
    "formula": "C9H8O4",
    "smiles": "CC(=O)Oc1ccccc1C(=O)O",
    "mw": 180.16,
    "logp": 1.19,
    "tpsa": 63.6
  },
  "suggestedActions": [
    "Open in ChemDraw",
    "Calculate RDKit Descriptors",
    "Analyze IR Spectrum"
  ],
  "timestamp": "2026-03-27T09:30:00Z"
}
```

---

## 3. Streaming SSE Endpoint: `POST /api/ai/chat/stream`

For real-time low-latency response rendering in `CopilotWindow.jsx`, token chunks are streamed as standard Server-Sent Events (SSE):

```text
data: {"type": "intent", "intent": "CHEMISTRY"}

data: {"type": "delta", "content": "The "}

data: {"type": "delta", "content": "canonical "}

data: {"type": "delta", "content": "SMILES "}

data: {"type": "delta", "content": "for Aspirin is..."}

data: {"type": "done"}

data: [DONE]
```

---

## 4. UI Preservation Strategy (Zero Disruption)

1. **No UI Changes in Step 1**: The React components (`CopilotWindow.jsx`, `ChatMessage.jsx`, `ChemistryCard.jsx`, `AILoader.jsx`) remain intact.
2. **Graceful Fallback Handling**: If the backend returns `connected: false` during Step 1, the UI cleanly renders the development status notice without throwing errors or breaking user interactions.
3. **Preserved Scientific Laboratories**: All client-side tools (ChemDraw, RDKit Lab, Spectroscopy, IBM RXN, Quantum Lab) continue operating seamlessly without dependency on the LLM state.
