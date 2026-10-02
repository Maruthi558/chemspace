# ChemNova Chemistry Dataset Infrastructure

## 1. Overview & Architecture

The **ChemNova Chemistry Dataset Infrastructure** provides a clean, scalable, verifiable pipeline for ingesting, validating, deduplicating, normalizing, splitting, and registering chemistry data prior to model training.

This infrastructure is strictly decoupled from the model training process: **raw data is never directly fed into the tokenizer or neural network**. Every record must pass through an explicit multi-stage quality pipeline and receive formal registry approval before entering the training or evaluation partitions.

```
RAW DATA (JSON / JSONL / CSV / TXT / MD)
  │
  ▼ [DataIngestor]
data/imported/ (Standardized ChemNovaRecords)
  │
  ▼ [DataValidator] ──────────► data/rejected/ (Quarantine + Issue Log)
data/validated/
  │
  ▼ [DuplicateDetector] ─────► metadata/dedup_audit/ (Duplicate Log)
data/cleaned/
  │
  ▼ [DataNormalizer]
data/normalized/ (Canonical Unicode, Units, Arrows, Formulas)
  │
  ▼ [Quality Approval Check]
data/processed/ (Approved Master Dataset)
  │
  ▼ [DatasetSplitter]
data/training/   data/validation/   data/test/
  │
  ▼ [DatasetTokenizationBridge]
data/tokenized/ (Token IDs & Attention Masks via Step 1 Tokenizer)
  │
  ▼ [DatasetTrainingBridge]
ChemNova-LLM Training Pipeline (PyTorch DataLoader)
```

---

## 2. Directory Structure

```
chemistry_llm/data/
│
├── raw/                 # Unaltered external source files
├── sources/             # Source documentation and provenance receipts
├── metadata/            # Split manifests, dedup audit logs, run logs
├── imported/            # Parsed into standard ChemNovaRecord JSONL
├── cleaned/             # Deduplicated datasets
├── normalized/          # Standardized notation, units, and Unicode
├── validated/           # Passed schema & field integrity checks
├── rejected/            # Quarantined invalid records with failure reasons
├── processed/           # Master approved datasets ready for partitioning
├── tokenized/           # Pre-tokenized tensor caches for fast loader ingestion
├── training/            # Training split partition (e.g., 80%)
├── validation/          # Validation split partition (e.g., 10%)
├── test/                # Test split partition (e.g., 10%)
├── evaluation/          # Benchmark & out-of-distribution evaluation sets
├── statistics/          # Generated distribution and token length reports
├── schema/              # Pydantic schemas, enums, and data models
│   ├── __init__.py
│   ├── record.py        # ChemNovaRecord definition
│   └── types.py         # 30 DatasetTypes, 8 Domains, License & Status enums
├── dataset_registry.json # Master registry catalog tracking all datasets
├── ingest.py            # Format parsing (JSON, JSONL, CSV, TXT, MD)
├── validate.py          # Field validation and quarantine engine
├── deduplicate.py       # ID, QA, molecular, and reaction deduplication
├── normalize.py         # Chemical, Unicode, unit, and arrow normalizer
├── provenance.py        # Source attribution & license compliance tracker
├── split.py             # Seeded zero-leakage dataset partitioner
├── statistics.py        # Corpus analytics and distribution generator
├── registry.py          # Registry manager for dataset lifecycle
├── pipeline.py          # End-to-end quality pipeline orchestrator
├── bridge.py            # Tokenizer and PyTorch training interfaces
└── cli.py               # Unified command-line interface
```

---

## 3. Standard Data Format (`ChemNovaRecord`)

Every dataset entry is standardized into a JSONL record conforming to the `ChemNovaRecord` Pydantic model:

| Field | Type | Description |
|---|---|---|
| `id` | `str` | Unique, deterministic record identifier |
| `type` | `DatasetType` | One of the 30 supported chemistry dataset types |
| `domain` | `ChemistryDomain` | Broad chemistry discipline (organic, inorganic, physical, etc.) |
| `subdomain` | `Optional[str]` | Granular field (e.g., "thermodynamics", "stereochemistry") |
| `question` | `Optional[str]` | Prompt, query, or problem statement |
| `answer` | `Optional[str]` | Ground truth response or target text |
| `context` | `Optional[str]` | Background text, passage, or problem context |
| `explanation` | `Optional[str]` | Conceptual explanation or didactic summary |
| `reasoning` | `Optional[str]` | Multi-step reasoning chain or thought trace |
| `formula` | `Optional[str]` | Empirical or molecular formula (e.g., `H2SO4`) |
| `equation` | `Optional[str]` | Chemical equation string |
| `reaction` | `Optional[str]` | Chemical reaction with arrows (e.g., `2H2 + O2 → 2H2O`) |
| `reactants` | `Optional[List[str]]`| List of reactant formulas or SMILES |
| `reagents` | `Optional[List[str]]` | Catalysts, solvents, or reaction reagents |
| `products` | `Optional[List[str]]` | Reaction product species |
| `conditions` | `Optional[str]` | Temperature, pressure, solvent, catalyst |
| `molecule` | `Optional[str]` | Common or IUPAC chemical name |
| `smiles` | `Optional[str]` | Simplified molecular-input line-entry system string |
| `inchi` | `Optional[str]` | International Chemical Identifier string |
| `molecular_formula`| `Optional[str]` | Canonical molecular formula |
| `source` | `str` | Source publication, database, or repository |
| `source_url` | `Optional[str]` | Direct URL or DOI link to source material |
| `license` | `str` | License identifier (e.g., `CC0`, `CC-BY-4.0`, `MIT`) |
| `provenance` | `Optional[str]` | Detailed custody, extraction, or curation lineage |
| `confidence` | `float` | Quality confidence score (0.0 to 1.0, default 1.0) |
| `verified` | `bool` | Whether record is human- or expert-verified |
| `created_at` | `str` | ISO 8601 UTC creation timestamp |
| `updated_at` | `str` | ISO 8601 UTC last update timestamp |

---

## 4. Supported Dataset Types & Domains

### 30 Supported Dataset Types:
1. `chemistry_facts`
2. `chemistry_definitions`
3. `chemistry_concepts`
4. `chemistry_qa`
5. `chemistry_reasoning`
6. `numerical_problems`
7. `worked_solutions`
8. `chemical_equations`
9. `chemical_reactions`
10. `reaction_mechanisms`
11. `molecular_information`
12. `compound_information`
13. `element_information`
14. `spectroscopy_information`
15. `organic_chemistry`
16. `inorganic_chemistry`
17. `physical_chemistry`
18. `analytical_chemistry`
19. `biochemistry`
20. `medicinal_chemistry`
21. `materials_chemistry`
22. `computational_chemistry`
23. `quantum_chemistry`
24. `laboratory_knowledge`
25. `safety_knowledge`
26. `chemistry_terminology`
27. `scientist_discovery`
28. `hypothetical_questions`
29. `multi_step_reasoning`
30. `chemnova_knowledge`

### 8 Chemistry Domains:
- `general_chemistry`
- `organic_chemistry`
- `inorganic_chemistry`
- `physical_chemistry`
- `analytical_chemistry`
- `biochemistry`
- `computational_chemistry`
- `laboratory_safety`

---

## 5. Ingestion System (`DataIngestor`)

The ingestion module parses heterogeneous raw file formats into standardized `ChemNovaRecord` streams:

- **JSONL (`.jsonl`)**: Direct line-by-line streaming with fallback key normalization.
- **JSON (`.json`)**: Both top-level lists and wrapped objects (`{"data": [...]}`).
- **CSV (`.csv`)**: Automatic column-to-field mapping supporting headers like `prompt` ➔ `question`, `output`/`completion` ➔ `answer`, `smiles`, `reaction`, etc.
- **TXT (`.txt`)**: Double-newline paragraph chunking into contextual fact records.
- **Markdown (`.md`)**: Heading-based section parsing (`## Heading` ➔ context / question, body text ➔ answer / explanation).

---

## 6. Validation & Quarantine Engine (`DataValidator`)

Every record is evaluated against schema requirements before downstream processing:
- **Required Fields**: Unique non-empty `id`, valid `source`, and valid `license`.
- **Duplicate ID Check**: Batch-level duplicate ID prevention.
- **Type Compatibility**: Must be one of the 30 recognized `DatasetType`s.
- **Type-Specific Rules**:
  - QA / Problem types (`chemistry_qa`, `numerical_problems`, `worked_solutions`): Require non-empty `question` (min 3 chars) and non-empty `answer`.
  - Reaction types (`chemical_reactions`, `reaction_mechanisms`, `chemical_equations`): Require `reaction`, `equation`, or explicit `reactants` + `products`.
  - Molecular types (`molecular_information`, `compound_information`): Require `molecule`, `smiles`, `formula`, or `molecular_formula`.

**Quarantine Guarantee**: Non-compliant records are segregated into `data/rejected/<name>_rejected.jsonl` with an accompanying rejection manifest detailing specific failure reasons. Valid records move to `data/validated/`.

---

## 7. Deduplication Engine (`DuplicateDetector`)

Duplicates are identified across multiple axes and logged to an audit trail without silent deletion:
1. **Duplicate IDs**: Records sharing the same identifier.
2. **Duplicate Question-Answer Pairs**: Normalized cross-comparison (`q1 == q2` and `a1 == a2`).
3. **Strict Question Collisions**: Multiple records asking the exact same question (configurable).
4. **Chemical SMILES Matches**: Normalized molecular representations matching previous entries.
5. **Chemical Reaction Collisions**: Normalized reaction equations matching previous entries.
6. **Content Hash Collisions**: SHA-256 fingerprinting of multi-field combinations.

Audit logs are persisted in `data/metadata/dedup_audit/<dataset>_dedup_audit.json`.

---

## 8. Normalization Engine (`DataNormalizer`)

Scientific accuracy requires standardized notation without modifying scientific semantics:
- **Whitespace & Line Breaks**: Strips excess trailing whitespace, normalizes multiple spaces, and collapses excessive line breaks.
- **Unicode & Punctuation**: Replaces smart quotes (`“`, `”`, `‘`, `’`) with standard quotes (`"`, `'`) and converts hyphens (`—`, `–`) to `-`.
- **Reaction Arrows**: Converts ASCII representations (`-->`, `->`, `<=>`, `<->`, `<==>`) into canonical Unicode arrows (`→`, `⇌`).
- **Chemical Units**: Normalizes unit spacing and typography: `kj/mol` ➔ `kJ/mol`, `deg C` ➔ `°C`, `g / mol` ➔ `g/mol`, `kcal / mol` ➔ `kcal/mol`.
- **Scientific Notation**: Replaces verbose ASCII products (e.g., `6.022 x 10^23` ➔ `6.022 × 10²³`).
- **Molecular Formulas**: Capitalizes common formulas while preserving indices (`h2o` ➔ `H2O`, `co2` ➔ `CO2`, `nacl` ➔ `NaCl`).
- **SMILES Cleaning**: Strips whitespace and leading/trailing quotes while preserving valid chemical syntax.
- **Raw Data Preservation**: Original input records are stored alongside the normalized data for complete auditability.

---

## 9. Provenance & License Tracking (`ProvenanceTracker`)

Every record tracks its source lineage and license status:
- **Verified Open**: `CC0`, `Public Domain`, `MIT`, `Apache-2.0`, `CC-BY-4.0`.
- **Restricted**: `CC-BY-NC`, `Proprietary`, `All Rights Reserved`.
- **Unverified**: Missing or unrecognized license terms.
- **Unknown License**: Explicitly flagged as unverified to prevent accidental inclusion in commercial training runs.

Datasets maintain a `DatasetManifest` with source URLs, author information, timestamps, and access methods.

---

## 10. Train / Validation / Test Splitting (`DatasetSplitter`)

Partitions data into training, validation, and test sets with strict guarantees:
- **Reproducible**: Configurable random seed (default: `42`).
- **Zero Cross-Split Leakage**: Uses content-hash grouping so identical or near-identical records can never appear in both train and validation/test sets.
- **Configurable Ratios**: Default 80% train / 10% validation / 10% test.
- **Manifest Persistence**: Split statistics and metadata are saved to `data/metadata/splits/<dataset>_split_manifest.json`.

---

## 11. Dataset Statistics Tool (`statistics.py`)

Computes comprehensive analytical summaries across any dataset file or directory:
- Total records, valid count, rejected count, duplicate count.
- Distribution by **domain** (organic, inorganic, physical, etc.).
- Distribution by **dataset type** (facts, questions, reactions, molecules).
- Distribution by **source** and **license status**.
- Character length statistics: min, max, average, and median text lengths.
- Word count statistics.

Output is exportable to JSON or visual terminal summaries.

---

## 12. Dataset Registry (`dataset_registry.json`)

All datasets are cataloged in `chemistry_llm/data/dataset_registry.json`:

```json
{
  "dataset_id": "openstax_chemistry_ch1_10",
  "dataset_name": "OpenStax Chemistry General QA",
  "version": "1.0.0",
  "source": "OpenStax Chemistry 2e",
  "source_url": "https://openstax.org/details/books/chemistry-2e",
  "license": "CC-BY-4.0",
  "record_count": 1250,
  "validated_count": 1245,
  "rejected_count": 5,
  "date_added": "2026-09-27T16:00:00Z",
  "status": "approved",
  "description": "General chemistry conceptual questions and answers"
}
```

Allowed Statuses: `imported` ➔ `validating` ➔ `validated` ➔ `approved` ➔ `rejected` ➔ `archived`.

---

## 13. Future Tokenization Connection (`DatasetTokenizationBridge`)

Connects the validated dataset to the **Step 1 ChemNovaTokenizer**:
```python
from chemistry_llm.data.bridge import DatasetTokenizationBridge
from chemistry_llm.tokenizer import ChemNovaTokenizer

tokenizer = ChemNovaTokenizer.from_directory("checkpoints/base_initial")
bridge = DatasetTokenizationBridge(tokenizer=tokenizer, max_length=512)

# Converts ChemNovaRecords into token tensors ready for batching
tokenized_batch = bridge.tokenize_records(records)
# Returns: {"input_ids": LongTensor, "attention_mask": LongTensor, "labels": LongTensor}
```

---

## 14. Future Training Connection (`DatasetTrainingBridge`)

Provides standard PyTorch `Dataset` and `DataLoader` abstractions directly fed into `ChemNovaLanguageModel`:
```python
from chemistry_llm.data.bridge import DatasetTrainingBridge
from chemistry_llm.model import ChemNovaLanguageModel, ChemNovaModelConfig

bridge = DatasetTrainingBridge(tokenizer=tokenizer, max_sequence_length=128)
dataloader = bridge.create_dataloader("chemistry_llm/data/training/dataset.jsonl", batch_size=8)

for batch in dataloader:
    input_ids = batch["input_ids"]
    labels = batch["labels"]
    logits, loss = model(input_ids, targets=labels)
    # Ready for backpropagation in Step 3!
```

---

## 15. CLI Usage Reference

The unified CLI provides command-line control over all dataset tools:

```bash
# Ingest raw files
python -m chemistry_llm.data.ingest --input raw_data.json --output chemistry_llm/data/imported/data.jsonl --source OpenStax --license CC-BY-4.0

# Validate records
python -m chemistry_llm.data.validate --input chemistry_llm/data/imported/data.jsonl

# Deduplicate records
python -m chemistry_llm.data.deduplicate --input chemistry_llm/data/validated/data.jsonl

# Normalize scientific notation
python -m chemistry_llm.data.normalize --input chemistry_llm/data/cleaned/data.jsonl

# Split into train/val/test
python -m chemistry_llm.data.split --input chemistry_llm/data/processed/data.jsonl --train-ratio 0.8 --seed 42

# Generate statistics
python -m chemistry_llm.data.statistics --input chemistry_llm/data/processed/data.jsonl

# Run full end-to-end pipeline
python -m chemistry_llm.data.cli pipeline --input raw_data.json --id chem_curated_01 --name "Curated Chemistry Corpus" --approve --split
```
