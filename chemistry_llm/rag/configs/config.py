"""Configuration settings for ChemNova RAG (Retrieval-Augmented Generation) System."""

from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional


@dataclass
class RAGConfig:
    """Configuration container for ChemNova RAG architecture."""

    # Storage Paths
    storage_dir: Path = field(default_factory=lambda: Path("chemistry_llm/rag/vector_store/storage"))
    documents_dir: Path = field(default_factory=lambda: Path("chemistry_llm/rag/documents/raw"))

    # Chunking Parameters
    chunk_size: int = 400
    chunk_overlap: int = 50
    min_chunk_size: int = 40

    # Embedding Parameters
    embedding_dimension: int = 128
    embedding_model_name: str = "chemnova-local-chem-embed-v1"

    # Retrieval & Search Parameters
    top_k: int = 3
    similarity_threshold: float = 0.20
    dense_weight: float = 0.60
    keyword_weight: float = 0.40

    # Reranking Parameters
    reranking_enabled: bool = True
    max_rerank_candidates: int = 10

    # Cache Settings
    cache_enabled: bool = True
    cache_ttl_seconds: int = 3600
    cache_max_entries: int = 500

    # Security & Prompt Defense
    sanitize_input: bool = True
    strict_data_envelopes: bool = True

    def __post_init__(self):
        self.storage_dir = Path(self.storage_dir)
        self.documents_dir = Path(self.documents_dir)
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        self.documents_dir.mkdir(parents=True, exist_ok=True)
