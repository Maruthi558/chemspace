# ChemNova Chemistry RAG Architecture (Step 8)

## 1. System Overview & Core Principles

The **ChemNova Chemistry Retrieval-Augmented Generation (RAG)** architecture is a self-hosted, domain-specific retrieval subsystem developed for the ChemNova local Chemistry LLM. It empowers the compact 8-layer Transformer language model (trained from scratch in Step 5 and instruction-tuned in Step 6) to access vast external chemical literature, spectroscopic databases, molecular records, and thermodynamic reference manuals without requiring model parameter retraining or relying on external cloud LLM APIs.

```
                              USER QUESTION
                                    │
                                    ▼
                   ┌──────────────────────────────────┐
                   │    CHEMNOVA ASSISTANT ROUTER     │
                   │       (Intent Classification)    │
                   └────────────────┬─────────────────┘
                                    │
                      Query Analysis & Normalization
                                    │
                                    ▼
                   ┌──────────────────────────────────┐
                   │      CHEMISTRY RETRIEVER         │
                   │  - Dense Local Embeddings (128d) │
                   │  - Lexical / BM25 Term Matching  │
                   │  - Entity & Domain Filtering     │
                   └────────────────┬─────────────────┘
                                    │ Top Candidates
                                    ▼
                   ┌──────────────────────────────────┐
                   │      CHEMISTRY RERANKER          │
                   │  - Chemical Entity Alignment     │
                   │  - Verification Status Weighting │
                   │  - Diversity Penalty             │
                   └────────────────┬─────────────────┘
                                    │ Ranked Chunks
                                    ▼
                   ┌──────────────────────────────────┐
                   │   PROMPT INJECTION DEFENSE &     │
                   │        CONTEXT BUILDER           │
                   │  - Envelope Escaping             │
                   │  - Boundary Protection           │
                   └────────────────┬─────────────────┘
                                    │ <RETRIEVED_CONTEXT>
                                    ▼
                   ┌──────────────────────────────────┐
                   │      LOCAL CHEMNOVA LLM          │
                   │ (Reasoning & Answer Synthesis)   │
                   └────────────────┬─────────────────┘
                                    │
                                    ▼
                   ┌──────────────────────────────────┐
                   │     FINAL RESPONSE + CITATIONS   │
                   │       (Verified Attribution)     │
                   └──────────────────────────────────┘
```

---

## 2. Directory Structure

The RAG subsystem is modularized inside `chemistry_llm/rag/`:

```
chemistry_llm/rag/
├── cache/
│   └── cache_manager.py           # LRU Cache with TTL for embeddings & search queries
├── chunking/
│   └── chunker.py                 # Chemistry-aware chunker preserving reactions & spectra
├── cleaning/
│   └── cleaner.py                 # NFKC normalization, HTML sanitization, script stripping
├── configs/
│   └── config.py                  # RAGConfig dataclass (thresholds, weights, paths)
├── context/
│   └── context_builder.py         # Formats structured <RETRIEVED_CONTEXT> XML blocks
├── citation/
│   └── citation_engine.py         # Grounding & citation generator ([VERIFIED_SOURCE], etc.)
├── documents/
│   ├── knowledge_base.py          # Curated foundational chemistry documents
│   └── schema.py                  # Document and Chunk Pydantic schemas with provenance
├── embeddings/
│   ├── base.py                    # Pluggable BaseEmbeddingModel interface
│   └── local_embedding.py         # 128d deterministic subword n-gram & chemical hash projection
├── evaluation/
│   └── evaluator.py               # Benchmark suite measuring precision, recall, and grounding
├── ingestion/
│   └── pipeline.py                # Batch and stream ingestion pipeline for TXT, MD, JSON, CSV
├── normalization/
│   └── normalizer.py              # Canonical SMILES via RDKit, unicode unit standardizer
├── query/
│   └── analyzer.py                # Chemical entity recognition, intent & query expansion
├── reranking/
│   └── reranker.py                # Multi-attribute deterministic chemistry reranker
├── retrieval/
│   └── retriever.py               # Hybrid dense vector + keyword search engine
├── security/
│   └── prompt_defense.py          # Scans and sanitizes prompt injection in documents
├── tests/
│   └── test_step8_rag.py          # 19 comprehensive unit & integration tests
├── vector_store/
│   ├── base.py                    # VectorStore interface (search, add, delete, save, load)
│   └── local_store.py             # Memory-mapped NumPy matrix vector store
└── engine.py                      # Master ChemNovaRAGEngine facade
```

---

## 3. Chemistry-Aware Ingestion Pipeline

### Document Lifecycle
```
RAW DOCUMENT (TXT, MD, JSON, CSV)
      │
      ▼
1. Validation (Schema checks, license validation, provenance verification)
      │
      ▼
2. Cleaning (NFKC normalization, HTML stripping, control char removal)
      │
      ▼
3. Normalization (RDKit canonical SMILES, units °C, cm⁻¹, kJ/mol standardizer)
      │
      ▼
4. Chemistry-Aware Chunking (Reaction mechanisms, property cards kept atomic)
      │
      ▼
5. Dense Local Embeddings (128-dimensional normalized projection)
      │
      ▼
6. Vector Database Indexing (Storage in isolated numpy matrix + metadata manifest)
```

### Metadata & Provenance Tracking
Every ingested document and chunk records strict provenance attributes:
- `document_id`: Deterministic UUID or SHA-256 derived identifier.
- `title`: Standardized scientific document title.
- `source`: Publisher, textbook, or experimental catalog (e.g. *Clayden Organic Chemistry*, *Atkins' Physical Chemistry*).
- `source_url`: Public DOI or academic permalink.
- `author`: Original authors / scientific discoverers.
- `publication_date`: ISO publication timestamp.
- `license`: Open-access / academic fair use declaration.
- `domain`: Subfield (`organic_chemistry`, `physical_chemistry`, `analytical_chemistry`, etc.).
- `subdomain`: Specialized category (`spectroscopy`, `thermodynamics`, `organometallics`).
- `smiles`: Canonical SMILES of primary chemical entities.
- `reaction`: Reaction name / classification if applicable.
- `verification_status`: `verified`, `peer_reviewed`, `experimental`, or `predicted`.
- `confidence`: Grounding confidence score (0.0 to 1.0).

---

## 4. Chemistry-Aware Chunking

Generic character-based or line-based chunkers sever chemical equations, reaction mechanisms, and spectroscopy tables. `ChemistryAwareChunker` prevents this through domain-specific heuristic boundaries:

1. **Reaction Integrity**:
   - Keeps Reactants + Reagents + Catalysts + Solvents + Conditions + Products + Mechanism together as single semantic chunks.
2. **Spectroscopic Tables**:
   - Recognizes functional group ranges (e.g. `3200 - 3600 cm⁻¹ O-H stretch`, `1650 - 1750 cm⁻¹ C=O stretch`) and keeps diagnostic correlation items intact.
3. **Molecular Property Cards**:
   - Preserves IUPAC name, SMILES, formula, molecular weight, LogP, and TPSA in cohesive cards.
4. **Boundary Detection**:
   - Splits on chemical headers (`###`, `Reaction:`, `Mechanism:`, `Experiment:`) and list entries (`\n-`, `\n*`, `\n1.`) when block lengths exceed `chunk_size` (default: 400 chars).

---

## 5. Pluggable Embedding Layer

The embedding interface (`BaseEmbeddingModel`) is completely decoupled from cloud APIs:
- Default implementation: `ChemNovaLocalEmbedding` (128 dimensions).
- Uses subword n-gram character hashing combined with SMILES atom/bond feature projections.
- Fully vectorized with NumPy; computes embeddings on CPU in **< 1.0 ms**.
- Output vectors are strictly $L_2$-normalized, enabling fast cosine similarity computation via vector-matrix dot products ($v_q \cdot M^T$).
- Future drop-in replacement support for domain-specific models (e.g. ChemBERTa, SciBERT, Mol2Vec) without modifying the vector store or retrieval engine.

---

## 6. Vector Database Architecture

`ChemNovaLocalVectorStore` provides persistent, self-hosted vector indexing:
- **Matrix Storage**: Stored as compressed NumPy arrays (`vectors.npy`) paired with JSON metadata (`chunks.json`).
- **Isolation**: Vector indexes are stored in `chemistry_llm/rag/vector_store/storage/`, completely isolated from user accounts, MySQL, and SQLite application databases. Customer data is never mixed with chemical knowledge vectors.
- **Filtering**: Supports instantaneous metadata filtering across `domain`, `subdomain`, `smiles`, `reaction`, and `verification_status`.
- **CRUD Operations**: Supports `add_documents`, `delete_document`, `reindex`, `save`, and `load`.

---

## 7. Hybrid Retrieval Engine

`ChemistryRetriever` employs a multi-signal scoring algorithm:
1. **Dense Semantic Cosine Similarity**: $S_{\text{dense}} = \cos(\mathbf{q}, \mathbf{d})$.
2. **Lexical Keyword Overlap (BM25 variant)**: $S_{\text{kw}} = \frac{|\mathcal{W}_q \cap \mathcal{W}_d|}{|\mathcal{W}_q|}$.
3. **Chemical Entity Exact Match Bonus**:
   - Canonical SMILES match: $+0.35$.
   - Chemical formula / name match: $+0.25$.
4. **Intent & Subdomain Alignment Bonus**:
   - Spectroscopy intent matching spectroscopy document: $+0.30$.
   - Reaction mechanism intent matching reaction records: $+0.15$.
   - Molecular property intent matching property cards: $+0.15$.
5. **Combined Hybrid Score**:
   $$S_{\text{hybrid}} = w_{\text{dense}} \cdot S_{\text{dense}} + w_{\text{kw}} \cdot S_{\text{kw}} + \text{Bonus}_{\text{entity}} + \text{Bonus}_{\text{intent}}$$
   *(Default weights: $w_{\text{dense}} = 0.60, w_{\text{kw}} = 0.40$)*.

---

## 8. Deterministic Chemistry Reranker

Retrieved candidate chunks (top 15) pass through `ChemistryReranker`:
- **Verification Weight**: `verified` ($1.0\times$), `peer_reviewed` ($0.95\times$), `unverified` ($0.75\times$).
- **Domain Relevance**: High-confidence match to query subfield ($+0.15$).
- **SMILES Alignment**: Identical SMILES match ($+0.25$).
- **Document Diversity Penalty**: Penalizes over-representation of multiple chunks from the same document ($-0.10$ for each subsequent chunk from identical `document_id`) to ensure broad chemical perspective.

---

## 9. Context Construction & Citations

`ContextBuilder` compiles top ranked chunks into an XML-demarcated prompt envelope:
```xml
<RETRIEVED_CONTEXT>
SOURCE 1:
Title: Comprehensive Infrared (IR) Absorption Spectroscopy Diagnostic Table
Source: Silverstein's Spectrometric Identification of Organic Compounds
Domain: analytical_chemistry
Provenance: Peer-Reviewed Scientific Reference
Verification: verified
Content:
Technique: Infrared (IR) Vibrational Spectroscopy
- 3200 - 3600 cm⁻¹ (broad): Hydrogen-bonded Alcohol and Phenol O-H stretch.

SOURCE 2:
Title: Ethanol - Physicochemical Properties and Spectroscopy
Source: CRC Handbook of Chemistry and Physics / NIST Chemistry WebBook
Domain: organic_chemistry
Provenance: Peer-Reviewed Scientific Reference
Verification: verified
Content:
Boiling point: 78.37 °C (351.52 K)
</RETRIEVED_CONTEXT>
```

`CitationEngine` formats clean citations:
- `[VERIFIED_SOURCE]` for peer-reviewed literature and curated reference manuals.
- `[TOOL_RESULT]` for deterministic computations performed by RDKit, ChemDraw, IBM RXN, or Quantum engines.
- `[PREDICTION_SIMULATION]` for ML/empirical predictions.
- `[WEB_RETRIEVAL]` for real-time web research results.
