"""Abstract Base Interface for Chemistry Vector Stores."""

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from chemistry_llm.rag.documents.schema import Chunk


class BaseVectorStore(ABC):
    """Abstract interface for storing and querying chemistry vector embeddings."""

    @abstractmethod
    def add_chunks(self, chunks: List[Chunk]) -> int:
        """Add indexed chunks with embeddings to the vector store."""
        pass

    @abstractmethod
    def search(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        filter_dict: Optional[Dict[str, Any]] = None,
    ) -> List[Tuple[Chunk, float]]:
        """Retrieve top_k most similar chunks satisfying optional metadata filters."""
        pass

    @abstractmethod
    def delete_document(self, document_id: str) -> int:
        """Remove all chunks associated with a document ID."""
        pass

    @abstractmethod
    def clear(self) -> None:
        """Clear the vector store completely."""
        pass

    @abstractmethod
    def save(self, path: Optional[Path] = None) -> None:
        """Persist vector indices and metadata to disk."""
        pass

    @abstractmethod
    def load(self, path: Optional[Path] = None) -> None:
        """Load vector indices and metadata from disk."""
        pass

    @abstractmethod
    def count(self) -> int:
        """Return total number of chunks currently stored."""
        pass
