# ChemNova / ChemSpace: Self-Hosted Chemistry LLM File Plan
**Phase:** Step 1 Foundation  
**System Target:** Small Self-Hosted Chemistry AI / LLM  
**Root Path:** `chemistry_llm/`

---

## 1. Directory Tree & Architecture Layout

The new self-hosted Chemistry LLM module is placed inside `chemistry_llm/` directly within the repository, maintaining full isolation while integrating with the existing Python backend:

```text
chemistry_llm/
│
├── README.md                      # Architecture overview and development guide
├── requirements.txt               # Minimal Step 1 dependencies
├── .env.example                   # Local configuration template (no secrets)
│
├── config/
│   ├── __init__.py
│   └── settings.py                # Environment-driven configuration settings
│
├── data/                          # Data store for chemistry corpus (no data downloaded in Step 1)
│   ├── raw/                       # Unprocessed text, textbooks, papers (.gitkeep)
│   ├── cleaned/                   # Sanitized, deduplicated text (.gitkeep)
│   ├── processed/                 # Tokenized/formatted instruction pairs (.gitkeep)
│   └── evaluation/                # Benchmark Q&A and chemistry test sets (.gitkeep)
│
├── models/                        # Model storage (no weights downloaded in Step 1)
│   ├── base/                      # Base small LLM weights (.gitkeep)
│   ├── checkpoints/               # Training checkpoints (.gitkeep)
│   └── adapters/                  # LoRA / QLoRA adapter weights (.gitkeep)
│
├── training/                      # Future training & fine-tuning pipelines
│   ├── __init__.py
│   ├── datasets/                  # Dataset loaders and schemas
│   ├── preprocessing/             # Cleaning, deduplication, and normalizers
│   ├── scripts/                   # Training launch scripts (deferred)
│   └── configs/                   # Hyperparameter configurations (deferred)
│
├── inference/                     # Runtime inference layer
│   ├── __init__.py
│   ├── model_loader.py            # Base model and tokenizer loader interface
│   ├── generate.py                # Response generation interface
│   └── prompts.py                 # Chemistry system prompts and templates
│
├── evaluation/                    # Chemistry benchmarking and evaluation
│   ├── __init__.py
│   ├── benchmarks/                # Domain-specific test benchmarks
│   └── evaluate.py                # Evaluation runner interface
│
├── tools/                         # Tool-augmented chemistry execution layer
│   ├── __init__.py
│   ├── chemistry/                 # Chemistry calculation tools
│   │   ├── __init__.py
│   │   ├── rdkit_tools.py         # RDKit descriptor & property calculations
│   │   ├── smiles_tools.py        # SMILES validation and canonicalization
│   │   └── spectroscopy_tools.py  # Spectral peak and formula utilities
│   └── utilities/                 # Formatting & helper utilities
│       ├── __init__.py
│       └── formatting.py          # Formula and LaTeX formatting
│
├── api/                           # Minimal REST API layer for local model
│   ├── __init__.py
│   └── app.py                     # FastAPI application exposing POST /api/chat
│
└── tests/                         # Unit and structure test suite
    ├── __init__.py
    ├── test_config.py             # Configuration and environment tests
    └── test_structure.py          # Directory layout and interface tests
```

---

## 2. File Responsibilities & Component Boundaries

### Configuration (`chemistry_llm/config/`)
- `settings.py`:
  - Implements `ChemistryLLMSettings` utilizing Pydantic settings / standard environment parsing.
  - Exposes:
    - `MODEL_PATH`: Local directory for base model weights.
    - `TOKENIZER_PATH`: Local directory for tokenizer files.
    - `DATA_PATH`: Local root path for datasets.
    - `CHECKPOINT_PATH`: Checkpoint storage location.
    - `DEVICE`: Compute target (`"cpu"`, `"cuda"`, `"mps"`, `"auto"`).
    - `MAX_CONTEXT_LENGTH`: Maximum sequence length (default: 2048).
    - `TEMPERATURE`: Sampling temperature (default: 0.2).
    - `TOP_P`: Nucleus sampling cutoff (default: 0.9).
  - No hardcoded secrets or remote API URLs.

### Data Architecture (`chemistry_llm/data/`)
- Pure filesystem hierarchy for future data collection:
  - `raw/`: Raw scraped or ingested textbooks, open-access papers, and tables.
  - `cleaned/`: Extracted text stripped of OCR noise, duplicates, and non-scientific artifacts.
  - `processed/`: Formatted instruction-response pairs (JSONL/Parquet).
  - `evaluation/`: Benchmark validation sets for chemistry question answering, SMILES parsing, and stoichiometry.

### Model Storage (`chemistry_llm/models/`)
- Protected directories with `.gitignore` coverage:
  - `base/`: Storage for future quantized/unquantized base model weights (e.g. GGUF, SafeTensors).
  - `checkpoints/`: Intermediate training states.
  - `adapters/`: LoRA/QLoRA adapter weights.

### Inference Layer (`chemistry_llm/inference/`)
- `model_loader.py`:
  - Declares `load_model(model_path=None)` and `load_tokenizer(tokenizer_path=None)`.
  - In Step 1, clearly raises `NotImplementedError` or returns structured metadata indicating that base model selection and weight download will occur in a subsequent phase.
- `generate.py`:
  - Declares `generate_response(prompt: str, context: Optional[dict] = None) -> dict`.
  - In Step 1, returns a structured development response with `connected=False` and status metadata.
- `prompts.py`:
  - Contains `CHEMNOVA_SYSTEM_PROMPT` establishing scientific guardrails, intentional reasoning, and restraint against unrequested SMILES emission.

### Chemistry Tool Layer (`chemistry_llm/tools/`)
- `tools/chemistry/rdkit_tools.py`:
  - Safely wraps RDKit operations (molecular weight, LogP, TPSA, Lipinski Rule of 5) when RDKit is installed, without forcing automatic execution.
- `tools/chemistry/smiles_tools.py`:
  - Validates SMILES syntax and provides canonicalization hooks.
- `tools/chemistry/spectroscopy_tools.py`:
  - Utility definitions for IR functional group bands, NMR chemical shift ranges, and mass spectrometry isotope calculations.
- `tools/utilities/formatting.py`:
  - Clean formatting for chemical formulas (e.g., converting `H2O` to HTML `H<sub>2</sub>O` or Markdown).

### API Layer (`chemistry_llm/api/`)
- `api/app.py`:
  - Standalone FastAPI application.
  - Exposes:
    - `GET /api/health`: Health status, Step 1 foundation confirmation.
    - `POST /api/chat`: Development endpoint returning structured response indicating local model connectivity status.
  - Can be run independently or mounted directly inside ChemSpace's `backend/main.py`.

### Tests (`chemistry_llm/tests/`)
- `test_config.py`: Verifies default and custom environment variables.
- `test_structure.py`: Verifies directories exist, modules import cleanly, tool interfaces return expected structures, and API endpoints handle requests gracefully.
