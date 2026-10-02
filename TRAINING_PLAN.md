# ChemNova / ChemSpace: Chemistry LLM Training Pipeline Plan
**Phase:** Step 1 Foundation  
**System Target:** Small Self-Hosted Chemistry AI / LLM  
**Important Notice:** This pipeline is documented for future implementation. **NO training, fine-tuning, or weight downloading is executed in Step 1.**

---

## 1. End-to-End Training Pipeline

The training architecture follows a 10-stage scientific data and model engineering pipeline:

```text
 ┌──────────────────────┐
 │       1. DATA        │ (Open educational textbooks, open-access literature, verified chemical datasets)
 └──────────┬───────────┘
            ▼
 ┌──────────────────────┐
 │      2. COLLECT      │ (Gather raw documents into data/raw/ with full license verification)
 └──────────┬───────────┘
            ▼
 ┌──────────────────────┐
 │       3. CLEAN       │ (Strip HTML/OCR artifacts, remove non-scientific noise, parse tables)
 └──────────┬───────────┘
            ▼
 ┌──────────────────────┐
 │    4. DEDUPLICATE    │ (MinHash / exact hash deduplication across literature sources)
 └──────────┬───────────┘
            ▼
 ┌──────────────────────┐
 │     5. NORMALIZE     │ (Standardize chemical notation: SMILES canonicalization, Unicode formulas)
 └──────────┬───────────┘
            ▼
 ┌──────────────────────┐
 │      6. FORMAT       │ (Assemble into prompt-response conversation pairs: Alpaca / ChatML / ShareGPT)
 └──────────┬───────────┘
            ▼
 ┌──────────────────────┐
 │ 7. TRAINING DATASET  │ (Partition into 85% train, 5% validation, 10% held-out test in data/processed/)
 └──────────┬───────────┘
            ▼
 ┌──────────────────────┐
 │    8. BASE MODEL     │ (Select small self-hosted model: 1B-3B/7B parameters, e.g. Llama/Qwen/Gemma)
 └──────────┬───────────┘
            ▼
 ┌──────────────────────┐
 │   9. FINE-TUNING     │ (Parameter-Efficient Fine-Tuning via LoRA / QLoRA with loss masking)
 └──────────┬───────────┘
            ▼
 ┌──────────────────────┐
 │    10. EVALUATION    │ (Validate on held-out benchmarks: SMILES validity, calculations, mechanism logic)
 └──────────┬───────────┘
            ▼
 ┌──────────────────────┐
 │    CHEMISTRY LLM     │ (Export quantized 4-bit/8-bit GGUF or SafeTensors for local self-hosted inference)
 └──────────────────────┘
```

---

## 2. Stage Breakdown & Methodologies

### Stage 1 & 2: Collection (`training/preprocessing/collect.py`)
- Ingest sources approved in `DATA_PLAN.md`.
- Save raw source files in `data/raw/` with a manifest tracking license provenance (CC-BY, CC-0, Public Domain).

### Stage 3: Cleaning & Extraction
- Filter out non-English / corrupted text.
- Clean broken OCR fragments in legacy chemical tables.
- Separate chemical formulas (`C6H6`) from regular prose, ensuring subscript/superscript consistency.

### Stage 4: Deduplication
- Apply exact n-gram matching and MinHash LSH to eliminate duplicate paragraphs across open-access repositories.
- Remove redundant textbook glossary definitions.

### Stage 5: Scientific Normalization
- **SMILES Normalization**: Pass any SMILES string in the training data through RDKit canonicalization (`Chem.CanonSmiles`) to ensure consistency.
- **LaTeX Math Formatting**: Ensure chemical equations ($2H_2 + O_2 \rightarrow 2H_2O$) and equilibrium expressions use uniform LaTeX syntax.

### Stage 6 & 7: Instruction Formatting & Dataset Splitting
- Convert raw paragraphs and Q&A into structured conversation turns:
  ```json
  {
    "instruction": "Explain the difference between an SN1 and SN2 reaction mechanism.",
    "input": "",
    "output": "An SN1 (Substitution Nucleophilic Unimolecular) reaction proceeds in two steps with a planar carbocation intermediate...\n\nIn contrast, an SN2 reaction is a concerted one-step bimolecular process with backside attack..."
  }
  ```
- Partition datasets into:
  - `train.jsonl` (85%)
  - `val.jsonl` (5%)
  - `test.jsonl` (10% held-out benchmark)

### Stage 8: Base Model Selection Criteria (Future Step)
The base model will be selected in a future phase based on:
1. **Size**: 1B to 7B parameters to ensure smooth self-hosting on modest hardware.
2. **License**: Permissive open-weights license (e.g. Apache 2.0, MIT, or OpenRAIL).
3. **Architecture**: Modern decoder-only transformer with rotary position embeddings (RoPE) and Grouped Query Attention (GQA).
4. **Tokenization**: Capable of handling scientific notation, numbers, and SMILES without excessive token fragmentation.

### Stage 9: Parameter-Efficient Fine-Tuning (PEFT / QLoRA)
- Utilize **QLoRA** (4-bit NormalFloat base quantization with 16-bit LoRA adapter matrices).
- Target linear projection layers (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`).
- Use loss masking so the model is penalized only for assistant response tokens, not user prompts.
- Training configuration stored in `training/configs/qlora_config.json`.

### Stage 10: Evaluation & Benchmark Gates
Before deploying the model to `models/checkpoints/` or production, the model must pass:
1. **SMILES Syntax Gate**: >95% of generated SMILES must be valid molecules.
2. **Valence Check Gate**: 0% chemically impossible atoms (e.g., pentavalent carbon).
3. **Safety Gate**: 100% rejection rate on dangerous synthesis queries.
4. **Calculation Gate**: Exact match on molecular weights computed against RDKit ground truth.

---

## 3. Step 1 Status

- Training directories and placeholder scripts prepared.
- **Zero training executed.**
- **Zero models downloaded.**
- Ready for data curation in subsequent steps.
