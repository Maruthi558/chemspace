# ChemNova-LLM: Step 2 Dataset Infrastructure Report

**Phase:** STEP 2 — Chemistry Dataset Infrastructure  
**Status:** COMPLETE & VERIFIED  
**Date:** September 2026  
**Execution Environment:** Windows / Python 3.11 / PyTorch / Pydantic  
**Scope Confirmation:** Dataset infrastructure only. No LLM training performed. No external LLM APIs called. No final large chemistry corpus downloaded.

---

## 1. Executive Summary

Step 2 successfully establishes the complete data engineering and quality assurance foundation for the **ChemNova-LLM** project. This infrastructure serves as the single gateway through which all future chemistry datasets must flow before reaching the model training pipeline.

The architecture strictly enforces:
1. **Decoupled Quality Assurance**: Data must be explicitly ingested, validated, deduplicated, normalized, quality-checked, and approved before entering training or validation partitions.
2. **Scientific Precision**: Normalization preserves chemical semantics, formatting arrows (`→`, `⇌`), scientific notation (`6.022 × 10²³`), units (`kJ/mol`, `°C`), and formulas (`H2O`, `NaCl`).
3. **Auditability & Provenance**: Every record tracks origin, URL, author, and license classification (`verified`, `restricted`, `unverified`, `unknown_license`). Rejected records are quarantined with diagnostic failure reasons.
4. **Reproducible Partitioning**: Hash-grouped train/validation/test splitting guarantees zero cross-partition data leakage.
5. **Seamless Step 1 Integration**: Bridging layers connect validated JSONL datasets directly to the Step 1 `ChemNovaTokenizer` and `ChemNovaLanguageModel` via PyTorch `DataLoader` batching.

---

## 2. Directory Structure Created

The directory structure was created under `chemistry_llm/data/` with persistent `.gitkeep` placeholders:

```
chemistry_llm/data/
├── raw/                      # Unmodified raw source files
├── sources/                  # Source attribution documents and manifests
├── metadata/                 # Audit logs, split manifests, and run reports
│   ├── dedup_audit/          # Deduplication logs
│   └── splits/               # Partition manifests
├── imported/                 # Parsed into standard ChemNovaRecord JSONL
├── cleaned/                  # Deduplicated datasets
├── normalized/               # Standardized units, symbols, and formulas
├── validated/                # Verified compliant records
├── rejected/                 # Quarantined invalid records with issue logs
├── processed/                # Approved master datasets ready for partitioning
├── tokenized/                # Pre-tokenized tensor caches for fast loader intake
├── training/                 # Approved training partition (e.g., 80%)
├── validation/               # Approved validation partition (e.g., 10%)
├── test/                     # Approved test partition (e.g., 10%)
├── evaluation/               # Benchmark evaluation datasets
├── statistics/               # Analytical reports and distribution summaries
└── schema/                   # Data models and schemas
    ├── __init__.py
    ├── record.py             # ChemNovaRecord Pydantic specification
    └── types.py              # 30 DatasetTypes, 8 Domains, Enums
```

---

## 3. Files Created & Components Implemented

| File Path | Description |
|---|---|
| `chemistry_llm/data/schema/types.py` | Defines 30 `DatasetType`s, 8 `ChemistryDomain`s, `LicenseStatus`, and `DatasetStatus` enums. |
| `chemistry_llm/data/schema/record.py` | `ChemNovaRecord` Pydantic model with 28 standard fields, deterministic content hashing, and training text extraction. |
| `chemistry_llm/data/schema/__init__.py` | Schema module exports. |
| `chemistry_llm/data/ingest.py` | `DataIngestor` engine supporting JSONL, JSON, CSV, TXT, and Markdown parsing into standardized records. |
| `chemistry_llm/data/validate.py` | `DataValidator` engine enforcing schema rules, type constraints, and quarantining malformed records to `data/rejected/`. |
| `chemistry_llm/data/deduplicate.py` | `DuplicateDetector` finding duplicate IDs, QA pairs, questions, SMILES, and reactions with persistent audit logs. |
| `chemistry_llm/data/normalize.py` | `DataNormalizer` standardizing whitespace, Unicode, punctuation, reaction arrows, chemical formulas, and units. |
| `chemistry_llm/data/provenance.py` | `ProvenanceTracker` and `DatasetManifest` managing license compliance and origin lineage. |
| `chemistry_llm/data/split.py` | `DatasetSplitter` implementing reproducible, seeded, zero-leakage hash-grouped train/val/test splits. |
| `chemistry_llm/data/statistics.py` | Analytics engine reporting record counts, domain/type breakdowns, and text length distributions. |
| `chemistry_llm/data/registry.py` | `DatasetRegistry` manager controlling dataset lifecycle (`imported` ➔ `validating` ➔ `validated` ➔ `approved`). |
| `chemistry_llm/data/dataset_registry.json` | Master catalog tracking all registered datasets. |
| `chemistry_llm/data/pipeline.py` | `DataQualityPipeline` coordinating the end-to-end execution across all stages. |
| `chemistry_llm/data/bridge.py` | `DatasetTokenizationBridge` and `DatasetTrainingBridge` connecting datasets to Step 1 tokenizer and PyTorch DataLoader. |
| `chemistry_llm/data/cli.py` | Unified CLI tool with subcommands: `ingest`, `validate`, `deduplicate`, `normalize`, `split`, `statistics`, `registry`, `pipeline`. |
| `chemistry_llm/data/__init__.py` | High-level package interface with PEP 562 lazy loading. |
| `chemistry_llm/data/README.md` | Comprehensive operational documentation. |
| `chemistry_llm/tests/test_step2_data_infrastructure.py` | 15 unit and integration tests verifying all Step 2 requirements. |

---

## 4. Detailed Component Architecture

### 4.1. Standard Data Schema (`ChemNovaRecord`)
All data records conform to a unified Pydantic model supporting:
- **Core Identifiers**: `id`, `type`, `domain`, `subdomain`
- **Natural Language & Didactics**: `question`, `answer`, `context`, `explanation`, `reasoning`
- **Reactions & Equations**: `equation`, `reaction`, `reactants`, `reagents`, `products`, `conditions`
- **Molecular Representations**: `molecule`, `smiles`, `inchi`, `formula`, `molecular_formula`
- **Governance & Lineage**: `source`, `source_url`, `license`, `provenance`, `confidence`, `verified`
- **Timestamps**: `created_at`, `updated_at` (ISO 8601 UTC)

### 4.2. Supported 30 Dataset Types
1. Chemistry facts
2. Chemistry definitions
3. Chemistry concepts
4. Chemistry questions and answers (`chemistry_qa`)
5. Chemistry reasoning examples
6. Numerical chemistry problems
7. Worked solutions
8. Chemical equations
9. Chemical reactions
10. Reaction mechanisms
11. Molecular information
12. Compound information
13. Element information
14. Spectroscopy information
15. Organic chemistry
16. Inorganic chemistry
17. Physical chemistry
18. Analytical chemistry
19. Biochemistry
20. Medicinal chemistry
21. Materials chemistry
22. Computational chemistry
23. Quantum chemistry
24. Laboratory knowledge
25. Safety knowledge
26. Chemistry terminology
27. Scientist / discovery information
28. Hypothetical chemistry questions
29. Multi-step reasoning examples
30. ChemNova website knowledge

### 4.3. Data Ingestion System
The `DataIngestor` ingests diverse inputs and produces normalized `ChemNovaRecord` streams:
- **JSONL**: Direct line streaming with tolerant key mapping.
- **JSON**: Top-level arrays and dictionary structures (`{"data": [...]}`).
- **CSV**: Flexible column mapping supporting `prompt`/`question`, `response`/`answer`, `smiles`, `formula`, etc.
- **TXT**: Paragraph-based extraction for conceptual background knowledge.
- **Markdown**: Heading-based section chunking (h1/h2 headings map to concepts, paragraphs to didactic answers).

### 4.4. Validation & Quarantine Engine
Records are evaluated before downstream advancement:
- Enforces non-empty `id`, `source`, and `license`.
- Validates membership in the 30 supported types.
- Requires question and answer for didactic types (`chemistry_qa`, `worked_solutions`, `numerical_problems`).
- Requires chemical representations for molecular/reaction types.
- **Quarantine Guarantee**: Non-compliant records are segregated into `data/rejected/` alongside a structured issue manifest (`record_id`, `reason`, `details`).

### 4.5. Multi-Criteria Deduplication
The `DuplicateDetector` flags collisions and logs entries to `metadata/dedup_audit/` without silent deletion:
- **Duplicate ID**: Colliding record IDs.
- **Duplicate QA Pair**: Normalized question-and-answer pairs.
- **Identical Question**: Repeated prompt statements (when in strict mode).
- **Duplicate Molecule**: Normalized SMILES strings.
- **Duplicate Reaction**: Normalized reaction equations.
- **Content Hash Fallback**: SHA-256 fingerprint collision detection.

### 4.6. Scientific Normalization
The `DataNormalizer` standardizes notation without altering scientific accuracy:
- Normalizes excess whitespace and collapses linebreaks.
- Converts smart quotes and typographical dashes to standard characters.
- Replaces ASCII arrows (`-->`, `->`, `<=>`, `<==>`) with canonical Unicode arrows (`→`, `⇌`).
- Formats chemical units (`kj/mol` ➔ `kJ/mol`, `deg C` ➔ `°C`, `g / mol` ➔ `g/mol`).
- Converts ASCII scientific notation (e.g., `6.022 x 10^23` ➔ `6.022 × 10²³`).
- Capitalizes common chemical formulas (`h2o` ➔ `H2O`, `co2` ➔ `CO2`, `nacl` ➔ `NaCl`).
- Preserves raw input records for complete lineage reversibility.

### 4.7. Provenance & License Classification
The `ProvenanceTracker` tags every record with a compliance status:
- **`verified`**: Permissive open-source licenses (`CC0`, `Public Domain`, `MIT`, `Apache-2.0`, `CC-BY-4.0`).
- **`restricted`**: Non-commercial or proprietary licenses (`CC-BY-NC`, `Proprietary`).
- **`unverified` / `unknown_license`**: Unspecified or ambiguous licensing. Prevents unverified data from silently entering the training pipeline.

### 4.8. Zero-Leakage Dataset Splitting
The `DatasetSplitter` partitions data into train (80%), validation (10%), and test (10%) sets:
- **Reproducibility**: Configurable pseudo-random seed.
- **Zero Cross-Split Contamination**: Groups records by content hash so identical or near-identical prompts cannot leak across train and validation/test partitions.
- Saves partition manifests to `metadata/splits/`.

### 4.9. Dataset Registry Catalog
`dataset_registry.json` tracks each dataset through its lifecycle:
- Statuses: `imported` ➔ `validating` ➔ `validated` ➔ `approved` ➔ `rejected` ➔ `archived`.
- Captures source URLs, license identifiers, total counts, valid counts, and rejection counts.

### 4.10. Future Bridges (Sections 14 & 15)
- **Tokenization Bridge (`DatasetTokenizationBridge`)**: Formats `ChemNovaRecord` into clean training text and feeds it into the Step 1 `ChemNovaTokenizer` to produce padded `input_ids`, `attention_mask`, and `labels`.
- **Training Bridge (`DatasetTrainingBridge`)**: Implements `ChemNovaDataset` (PyTorch `Dataset`) and `create_dataloader()`, verified via dry-run forward pass through `ChemNovaLanguageModel` with valid cross-entropy loss computation.

---

## 5. Verification & Test Execution Results

All 15 Step 2 tests and all 41 Step 1 foundation tests pass with 100% success:

```
Command: .venv\Scripts\python -m unittest discover -s chemistry_llm/tests -v
Result: Ran 56 tests in 1.736s — OK
```

### Breakdown of Step 2 Tests:
| Test Method | Description | Result |
|---|---|---|
| `test_01_jsonl_import` | Ingest JSONL format into standardized ChemNovaRecords | PASS |
| `test_02_json_import` | Ingest JSON array and wrapped JSON structures | PASS |
| `test_03_csv_import` | Ingest CSV format with column header mapping | PASS |
| `test_04_txt_markdown_import` | Ingest plain text paragraphs and markdown sections | PASS |
| `test_05_record_validation_success` | Valid records pass schema validation | PASS |
| `test_06_record_validation_rejection` | Invalid records are quarantined to rejected output with reasons | PASS |
| `test_07_duplicate_detection` | Detect duplicate IDs, QA pairs, and molecules with audit log | PASS |
| `test_08_normalization` | Scientific normalization preserves raw data & fixes symbols/units | PASS |
| `test_09_provenance_and_licensing` | Provenance tracking and license classification | PASS |
| `test_10_dataset_registry` | Dataset registry lifecycle, status updates, and persistence | PASS |
| `test_11_dataset_splitting` | Reproducible train/val/test splitting with zero cross-split leakage | PASS |
| `test_12_statistics_generation` | Corpus statistics and distribution calculation | PASS |
| `test_13_tokenization_bridge` | Connects dataset to Step 1 tokenizer producing valid token IDs | PASS |
| `test_14_training_dataset_bridge` | Connects dataset to PyTorch DataLoader and computes forward loss | PASS |
| `test_15_full_pipeline` | End-to-end quality pipeline: RAW ➔ IMPORT ➔ VALIDATE ➔ DEDUP ➔ NORM ➔ SPLIT ➔ REGISTRY | PASS |

### CLI Tool Verification:
- `python -m chemistry_llm.data.cli --help`: Clean exit code 0.
- `python -m chemistry_llm.data.ingest --help`: Clean exit code 0.
- `python -m chemistry_llm.data.validate --help`: Clean exit code 0.
- `python -m chemistry_llm.data.statistics --help`: Clean exit code 0.

---

## 6. Known Limitations & Next Steps

1. **RDKit / Canonical SMILES Normalization**: Currently, SMILES strings are normalized via string sanitization. In future steps, an optional RDKit dependency can be enabled to perform canonical tautomer and stereochemical SMILES hashing.
2. **Synthetic Data Only**: All tests were executed strictly using small synthetic fixtures. No real chemistry corpus was downloaded or ingested during Step 2.
3. **Training Inactive**: The training bridge is verified for DataLoader generation and forward loss computation, but model training was intentionally not triggered.

---

## 7. Conclusion

STEP 2 is **100% complete, fully verified, and ready**. The dataset infrastructure stands ready to receive curated chemistry data in subsequent steps.

Per prompt instructions: **STOPPING NOW. Awaiting next user instruction.**
