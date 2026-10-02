# ChemNova / ChemSpace: Chemistry LLM Data Plan
**Phase:** Step 1 Foundation  
**System Target:** Small Self-Hosted Chemistry AI / LLM  
**Important Notice:** This document outlines data sources and collection protocols for future phases. **NO data is collected, downloaded, or scraped in Step 1.**

---

## 1. Data Collection Objectives

The goal of the future data collection pipeline is to build a high-quality, scientifically accurate, legally compliant training and retrieval corpus for the self-hosted Chemistry LLM.

Rather than scraping unvetted web pages or copyrighted textbooks, the project will curate data exclusively from open-access, public domain, and permissive scientific repositories.

---

## 2. Target Data Categories

### Category A: Legally Usable Chemistry Textbooks & Open Educational Resources (OER)
- **OpenStax Chemistry 2e & Atoms First**: Complete collegiate general chemistry curriculum under Creative Commons Attribution License (CC-BY 4.0).
- **LibreTexts Chemistry**: Extensive open educational chemistry library spanning organic chemistry, physical chemistry, analytical chemistry, and biochemistry (CC-BY-NC-SA / CC-BY).
- **MIT OpenCourseWare (OCW) Chemistry**: Lecture notes, problem sets, and recitations under Creative Commons licenses.

### Category B: Public Domain & Open Access Scientific Literature
- **PubMed Central (PMC) Open Access Subset**: Peer-reviewed chemical biology and medicinal chemistry research articles distributed under CC-BY.
- **ChemRxiv & arXiv (physics.chem-ph, cond-mat.mtrl-sci)**: Open-access scientific preprints covering theoretical, computational, and quantum chemistry.
- **Beilstein Journal of Organic Chemistry**: Platinum open-access organic chemistry journal published under CC-BY.

### Category C: Chemistry Reference Standards & Controlled Vocabularies
- **IUPAC Gold Book (Compendium of Chemical Terminology)**: Standardized definitions for chemical terms, nomenclature rules, and symbols.
- **NIST Chemistry WebBook**: Open reference data for thermochemical properties, gas-phase ion energetics, and IR/UV-Vis/Mass spectra.
- **SDBS (Spectral Database for Organic Compounds)**: Reference spectra tables for functional group assignment and peak validation.

### Category D: Structured Molecular & Chemical Datasets
- **PubChem Open Data**: Public molecular identifiers, canonical SMILES, formulas, molecular weights, and IUPAC names.
- **ChEMBL Database (EMBL-EBI)**: Open bioactivity and drug discovery dataset (CC-BY-SA 3.0).
- **USPTO Patent Reaction Datasets (Lowe/NextMove Software)**: Open-access organic chemical reaction extraction datasets containing mapped reactants, reagents, and products.
- **ZINC Database**: Subset of commercially available compounds with clean 3D/2D SMILES representations for cheminformatics benchmarking.

---

## 3. Data Storage & Organization Layout

The future data pipeline maps to the directory structure inside `chemistry_llm/data/`:

```text
chemistry_llm/data/
│
├── raw/                      # Unprocessed text, PDF extractions, raw JSON/CSV dumps
│   ├── textbooks/            # OpenStax, LibreTexts raw chapters
│   ├── literature/           # PMC / ChemRxiv open-access XML/text
│   ├── references/           # IUPAC definitions, NIST tables
│   └── structures/           # Raw PubChem/USPTO dataset extracts
│
├── cleaned/                  # Sanitized, deduplicated text
│   ├── text_cleaned/         # Normalized scientific Unicode, formulas, and references
│   └── tables_cleaned/       # Cleaned spectral and physicochemical tables
│
├── processed/                # Tokenization-ready instruction pairs
│   ├── pretraining/          # Continuous text for domain pretraining / continual learning
│   ├── instruction_tuning/   # Q&A pairs (Question, Reasoning, Validated Answer)
│   └── tool_calling/         # Samples demonstrating RDKit and PubChem tool invocation
│
└── evaluation/               # Benchmark datasets (held-out from training)
    ├── smiles_syntax/        # Test suite for valid SMILES generation
    ├── calculations/         # Stoichiometry, MW, and buffer pH test set
    └── reaction_mechanisms/  # Multi-step organic mechanism reasoning test set
```

---

## 4. Data Curation & Quality Principles

1. **Licensing & Compliance**: Every ingested document must have an explicitly verifiable permissive license (CC-BY, CC-0, Public Domain, or Open Access).
2. **Deterministic Chemistry Verification**: Any generated Q&A pair involving a molecular formula or SMILES string will be validated using **RDKit** before inclusion into the processed dataset.
3. **No Hallucinated Data**: Numerical values (molecular weights, boiling points, NMR shifts) in training examples must trace to verified experimental databases.
4. **Safety Filtering**: All instructions involving the synthesis of chemical weapons, explosives, Schedule I controlled substances, or hazardous poisons must be filtered out or routed to explicit refusal safety sets.

---

## 5. Step 1 Status

- Directory structure initialized with `.gitkeep` files.
- Git tracking configured to ignore bulk data files (`*.jsonl`, `*.parquet`, `*.csv`, `*.pdf`).
- **NO datasets downloaded in Step 1.**
