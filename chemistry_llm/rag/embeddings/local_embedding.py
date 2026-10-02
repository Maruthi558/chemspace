"""Self-Contained Local Chemistry-Aware Dense Embedding Model.

Combines subword n-gram hashing and chemical token projection to produce
dense, normalized embeddings with sub-millisecond execution and zero external network calls.
"""

import hashlib
import math
import re
from typing import List, Optional

from chemistry_llm.rag.embeddings.base import BaseEmbeddingModel


class ChemNovaLocalEmbedding(BaseEmbeddingModel):
    """Local, deterministic 128-dimensional dense chemistry embedding model."""

    def __init__(self, dimension: int = 128, model_name: str = "chemnova-local-chem-embed-v1"):
        self.dimension = dimension
        self.model_name = model_name

        # High-weight chemistry feature prefixes
        self._chem_tokens = {
            "smiles", "c1", "c2", "cc", "c=o", "oh", "cooh", "nh2", "no2", "so3h",
            "ester", "alcohol", "ketone", "aldehyde", "alkene", "alkyne", "alkane",
            "benzene", "aromatic", "ir", "nmr", "uv-vis", "mass", "spectrometry",
            "reaction", "synthesis", "catalyst", "mechanism", "quantum", "dft",
            "homo", "lumo", "energy", "enthalpy", "entropy", "equilibrium", "ph",
            "acid", "base", "redox", "oxidation", "reduction", "yield", "solvent"
        }

    def get_dimension(self) -> int:
        return self.dimension

    def get_model_name(self) -> str:
        return self.model_name

    def embed_text(self, text: str) -> List[float]:
        """Generate a normalized dense vector representation for the input text."""
        clean = (text or "").lower().strip()
        if not clean:
            return [0.0] * self.dimension

        vec = [0.0] * self.dimension

        # 1. Word-level and n-gram feature hashing
        words = re.findall(r"[a-z0-9\(\)\[\]\=\#\-\+\@\:\.\\\/]+", clean)
        total_tokens = max(len(words), 1)

        for w in words:
            weight = 2.5 if w in self._chem_tokens or any(c in w for c in "=#[@+") else 1.0
            # Generate deterministic hash buckets
            h1 = int(hashlib.md5(w.encode("utf-8")).hexdigest(), 16)
            h2 = int(hashlib.sha1(w.encode("utf-8")).hexdigest(), 16)

            idx1 = h1 % self.dimension
            idx2 = h2 % self.dimension
            sign1 = 1.0 if (h1 >> 8) & 1 else -1.0
            sign2 = 1.0 if (h2 >> 8) & 1 else -1.0

            vec[idx1] += sign1 * weight
            vec[idx2] += sign2 * weight

        # 2. Character 3-gram hashing for subword chemistry patterns
        for i in range(len(clean) - 2):
            trigram = clean[i:i + 3]
            h = int(hashlib.md5(trigram.encode("utf-8")).hexdigest(), 16)
            idx = h % self.dimension
            sign = 1.0 if (h >> 4) & 1 else -1.0
            vec[idx] += sign * 0.35

        # 3. L2 Normalization (so dot product equals cosine similarity)
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 1e-12:
            vec = [round(x / norm, 6) for x in vec]
        else:
            vec = [0.0] * self.dimension

        return vec

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate normalized dense vectors for a batch of strings."""
        return [self.embed_text(t) for t in texts]


def get_embedding_model(model_name: Optional[str] = None, dimension: int = 128) -> BaseEmbeddingModel:
    """Factory creating configured embedding backend."""
    name = model_name or "chemnova-local-chem-embed-v1"
    return ChemNovaLocalEmbedding(dimension=dimension, model_name=name)
