# ChemNova / ChemSpace: Chemistry LLM Model Architecture
**Phase:** Step 1 Foundation  
**System Target:** Small Self-Hosted Chemistry AI / LLM  
**Architecture Philosophy:** Modular Separation of Parametric Reasoning, Grounded Knowledge Retrieval, and Deterministic Tool Execution

---

## 1. Architectural Philosophy: Knowledge vs. Weights

A fundamental mistake in domain-specific AI systems is attempting to memorize the entire scientific corpus inside neural network weights. For scientific applications, this approach leads to:
1. **Hallucination of numerical values** (inaccurate bond lengths, boiling points, molecular weights, pKa values).
2. **Invalid molecular structures** (broken valencies, impossible 5-valent carbons).
3. **Severe model bloat** (requiring hundreds of billions of parameters to retain factual trivia).
4. **Catastrophic forgetting** of reasoning capabilities during aggressive domain fine-tuning.

### The ChemNova Architecture Principle

ChemNova separates scientific tasks into three distinct pillars:
1. **Parametric Reasoning (The Small Model Weights)**: Understands scientific syntax, chemistry nomenclature, question intent, and multi-step deduction.
2. **Authoritative Knowledge Retrieval (RAG & Reference Datasets)**: Supplies exact physical constants, spectroscopic tables, literature citations, and validated experimental data at runtime.
3. **Deterministic Chemistry Engines (Tools & Cheminformatics)**: Computes molecular descriptors, verifies valence, simulates spectra, and draws structures using verified algorithms (e.g. RDKit, PySCF).

```text
User Question
     │
     ▼
┌───────────────────────────────────────────────┐
│           1. Intent & Context Parser          │
│ (Determines if question needs tool/RAG/logic) │
└──────────────────────┬────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│ 4. Retrieval    │         │ 5. Chemistry    │
│ (RAG Knowledge) │         │ Tools (RDKit)   │
└────────┬────────┘         └────────┬────────┘
         │                           │
         └─────────────┬─────────────┘
                       │ (Context Injected)
                       ▼
┌───────────────────────────────────────────────┐
│        1. Base Small Self-Hosted LLM         │
│   (2. Fine-Tuned for Scientific Reasoning)    │
└──────────────────────┬────────────────────────┘
                       ▼
┌───────────────────────────────────────────────┐
│ 6. Inference & Deterministic Validator Engine │
│   (Checks SMILES validity, formats LaTeX)     │
└──────────────────────┬────────────────────────┘
                       ▼
                 Final Answer
```

---

## 2. The Seven Core Layers

### Layer 1: Base LLM (Small Self-Hosted Core)
- **Role**: Foundational language understanding, grammar, general science, and instruction following.
- **Specification Target**: Small parameter scale (1B to 7B parameters) capable of low-latency execution on commodity self-hosted servers or workstation GPUs (or CPU inference via 4-bit/8-bit GGUF quantization).
- **Execution in Step 1**: No base model is selected or downloaded yet. The `model_loader.py` interface defines the abstraction boundary so any chosen model architecture can be plugged in during subsequent steps without altering the rest of the application.

### Layer 2: Fine-Tuning (Domain Adaptation)
- **Role**: Adapts the base model to speak the language of chemistry:
  - Scientific terminology (nucleophile, electrophile, enantiomer, HOMO-LUMO).
  - Chemical notation (SMILES, InChIKey, IUPAC names, empirical formulas).
  - Academic level calibration (adapting explanations for high-school students vs. graduate researchers).
- **Methodology**: Parameter-Efficient Fine-Tuning (PEFT) via **LoRA / QLoRA**. Fine-tuning updates low-rank adapter matrices while preserving base model weights, preventing catastrophic forgetting and enabling small adapter file sizes (~20MB to 200MB).
- **Execution in Step 1**: No fine-tuning or training is performed. The directory layout (`training/`, `models/adapters/`) and scripts interface are laid out for future activation.

### Layer 3: Chemistry Knowledge (Controlled Ingestion)
- **Role**: Curated scientific corpus stored outside the model weights.
- **Components**:
  - OpenStax Chemistry and peer-reviewed educational literature.
  - IUPAC Gold Book nomenclature definitions.
  - Standard spectral tables (IR characteristic absorptions, 1H/13C NMR chemical shift charts).
  - Verified molecular metadata (PubChem, ChEMBL).
- **Execution in Step 1**: Storage folders (`data/raw/`, `data/cleaned/`, `data/processed/`) are created with `.gitkeep`. No data is downloaded.

### Layer 4: Retrieval / RAG (Augmented Grounding)
- **Role**: Fetches exact, verified scientific literature chunks based on user queries to inject into the LLM context window.
- **Benefit**: Zero hallucination on physical constants, melting points, exact literature references, and reaction safety guidelines.
- **Architecture**: Vector embeddings + BM25 hybrid search over curated chemistry documents.
- **Execution in Step 1**: Documented and prepared; not implemented until data ingestion in later steps.

### Layer 5: Chemistry Tools (Deterministic Cheminformatics)
- **Role**: Performs calculations that an LLM should never be asked to guess mathematically:
  - Exact molecular weight calculation.
  - Canonical SMILES generation and valence check.
  - Topological Polar Surface Area (TPSA) and Octanol-Water partition coefficient (LogP).
  - Lipinski Rule of 5 evaluation.
  - Basis set / functional recommendation for quantum calculations.
- **Integration**: Explicit tool layer located in `chemistry_llm/tools/chemistry/`. Tools are called on demand rather than automatically hallucinated by model text.

### Layer 6: Inference Pipeline
- **Role**: Manages runtime model execution, token streaming, context formatting, and prompt assembly.
- **Components**:
  - `inference/model_loader.py`: Initializes model weights and tokenizer onto the configured device (`CPU`, `CUDA`, `MPS`).
  - `inference/generate.py`: Executes forward generation, implements stopping criteria, and formats output.
  - `inference/prompts.py`: Injects domain-specific system prompts and instructions.
- **Execution in Step 1**: Clean, mock-free interface that returns standardized development status indicating that local model weights will be connected in a later step.

### Layer 7: Evaluation & Benchmarking
- **Role**: Rigorous validation of the chemistry AI before release:
  - **SMILES Validity Benchmark**: Percentage of generated SMILES that parse into valid chemical molecules via RDKit.
  - **Stoichiometry & Calculation Benchmark**: Accuracy on molar mass, titration, and buffer pH questions.
  - **Mechanistic Reasoning Benchmark**: Explanation quality on organic reaction steps (SN1, SN2, EAS).
  - **Safety & Restraint Benchmark**: Refusal to generate hazardous synthesis pathways for controlled substances or explosives.
- **Execution in Step 1**: Benchmark directory `evaluation/benchmarks/` and `evaluate.py` scaffolding created.

---

## 3. Summary of Step 1 Constraints & Guarantees

1. **Zero External API Calls**: The architecture does not import, reference, or call OpenAI, OpenRouter, Gemini, Claude, or any paid service.
2. **Zero Weights Downloaded**: The `models/` directory contains only placeholders and structure files.
3. **No Training Framework Bloat**: No heavy PyTorch CUDA bundles, DeepSpeed, or Unsloth are installed in Step 1.
4. **Preserved Web Platform**: All existing ChemSpace tools (ChemDraw, RDKit, Spectroscopy, IBM RXN) remain fully functional.
