"""Pluggable Abstract Base Interface for Embedding Models."""

from abc import ABC, abstractmethod
from typing import List


class BaseEmbeddingModel(ABC):
    """Abstract interface for dense scientific vector embeddings."""

    @abstractmethod
    def embed_text(self, text: str) -> List[float]:
        """Convert a single text string into a normalized dense vector."""
        pass

    @abstractmethod
    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Convert a list of text strings into normalized dense vectors."""
        pass

    @abstractmethod
    def get_dimension(self) -> int:
        """Return the vector dimensionality."""
        pass

    @abstractmethod
    def get_model_name(self) -> str:
        """Return the embedding model identifier."""
        pass
