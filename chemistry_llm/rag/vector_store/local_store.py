"""Self-Contained High-Performance Local Vector Store for Chemistry RAG.

Completely isolated from application MySQL/SQLite customer data.
Persists vectors and metadata into chemistry_llm/rag/vector_store/storage.
"""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import numpy as np

from chemistry_llm.rag.documents.schema import Chunk
from chemistry_llm.rag.vector_store.base import BaseVectorStore

logger = logging.getLogger("chemistry_llm.rag.vector_store")


class ChemNovaLocalVectorStore(BaseVectorStore):
    """NumPy-accelerated local vector database with metadata filtering and persistence."""

    def __init__(self, storage_dir: Optional[Path] = None):
        self.storage_dir = Path(storage_dir or "chemistry_llm/rag/vector_store/storage")
        self.storage_dir.mkdir(parents=True, exist_ok=True)

        self.chunks: List[Chunk] = []
        self.vectors: Optional[np.ndarray] = None  # Shape: (N, D)
        self.chunk_id_map: Dict[str, int] = {}

        # Inverted index for fast metadata filtering
        self._domain_index: Dict[str, List[int]] = {}
        self._doc_id_index: Dict[str, List[int]] = {}

        self.load()

    def add_chunks(self, chunks: List[Chunk]) -> int:
        """Add and index chunks with their embeddings."""
        if not chunks:
            return 0

        new_chunks = []
        new_vecs = []

        for chk in chunks:
            if chk.embedding is None:
                continue
            if chk.chunk_id in self.chunk_id_map:
                # Update existing chunk
                idx = self.chunk_id_map[chk.chunk_id]
                self.chunks[idx] = chk
                if self.vectors is not None:
                    self.vectors[idx] = np.array(chk.embedding, dtype=np.float32)
            else:
                new_chunks.append(chk)
                new_vecs.append(chk.embedding)

        if new_chunks:
            start_idx = len(self.chunks)
            self.chunks.extend(new_chunks)
            new_arr = np.array(new_vecs, dtype=np.float32)

            if self.vectors is None or len(self.vectors) == 0:
                self.vectors = new_arr
            else:
                self.vectors = np.vstack([self.vectors, new_arr])

            for i, chk in enumerate(new_chunks):
                global_idx = start_idx + i
                self.chunk_id_map[chk.chunk_id] = global_idx

                # Update inverted indices
                dom = chk.domain.lower() if chk.domain else "chemistry"
                self._domain_index.setdefault(dom, []).append(global_idx)
                self._doc_id_index.setdefault(chk.document_id, []).append(global_idx)

        self.save()
        return len(new_chunks)

    def search(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        filter_dict: Optional[Dict[str, Any]] = None,
    ) -> List[Tuple[Chunk, float]]:
        """Perform vectorized cosine similarity search with metadata filtering."""
        if self.vectors is None or len(self.chunks) == 0:
            return []

        q_vec = np.array(query_embedding, dtype=np.float32)
        q_norm = np.linalg.norm(q_vec)
        if q_norm > 1e-12:
            q_vec = q_vec / q_norm

        # Compute cosine similarity across all stored vectors
        # Note: stored vectors are pre-normalized, so dot product = cosine similarity
        similarities = np.dot(self.vectors, q_vec)

        # Apply metadata filters if provided
        candidate_indices = set(range(len(self.chunks)))
        if filter_dict:
            for key, val in filter_dict.items():
                if val is None:
                    continue
                matching = set()
                val_str = str(val).lower()
                for idx in candidate_indices:
                    chk = self.chunks[idx]
                    attr_val = str(getattr(chk, key, chk.metadata.get(key, ""))).lower()
                    if val_str in attr_val:
                        matching.add(idx)
                candidate_indices.intersection_update(matching)

        if not candidate_indices:
            return []

        # Sort filtered candidates by similarity descending
        sorted_pairs = sorted(
            [(idx, float(similarities[idx])) for idx in candidate_indices],
            key=lambda x: x[1],
            reverse=True,
        )

        results = []
        for idx, score in sorted_pairs[:top_k]:
            results.append((self.chunks[idx], score))

        return results

    def delete_document(self, document_id: str) -> int:
        """Remove all chunks of a document and rebuild indices."""
        indices_to_remove = set(self._doc_id_index.get(document_id, []))
        if not indices_to_remove:
            return 0

        remaining_chunks = [c for i, c in enumerate(self.chunks) if i not in indices_to_remove]
        self.clear()
        self.add_chunks(remaining_chunks)
        return len(indices_to_remove)

    def clear(self) -> None:
        """Clear all stored vectors and chunk metadata."""
        self.chunks.clear()
        self.vectors = None
        self.chunk_id_map.clear()
        self._domain_index.clear()
        self._doc_id_index.clear()
        self.save()

    def count(self) -> int:
        return len(self.chunks)

    def save(self, path: Optional[Path] = None) -> None:
        """Persist vectors to .npy and chunks to .json."""
        target_dir = Path(path or self.storage_dir)
        target_dir.mkdir(parents=True, exist_ok=True)

        # 1. Save vectors
        vec_file = target_dir / "vectors.npy"
        if self.vectors is not None and len(self.vectors) > 0:
            np.save(vec_file, self.vectors)
        elif vec_file.exists():
            vec_file.unlink()

        # 2. Save chunks
        chunks_file = target_dir / "chunks.json"
        serializable_chunks = [c.to_dict() for c in self.chunks]
        with open(chunks_file, "w", encoding="utf-8") as f:
            json.dump(serializable_chunks, f, indent=2)

    def load(self, path: Optional[Path] = None) -> None:
        """Reload vectors and chunks from disk if present."""
        target_dir = Path(path or self.storage_dir)
        vec_file = target_dir / "vectors.npy"
        chunks_file = target_dir / "chunks.json"

        if not chunks_file.exists():
            return

        try:
            with open(chunks_file, "r", encoding="utf-8") as f:
                data = json.load(f)

            loaded_chunks = []
            for item in data:
                # remove embedding_dim if present
                item.pop("embedding_dim", None)
                loaded_chunks.append(Chunk(**item))

            if vec_file.exists() and len(loaded_chunks) > 0:
                self.vectors = np.load(vec_file)
            else:
                self.vectors = None

            self.chunks = loaded_chunks
            self.chunk_id_map = {c.chunk_id: i for i, c in enumerate(self.chunks)}

            # Rebuild inverted index
            self._domain_index.clear()
            self._doc_id_index.clear()
            for i, chk in enumerate(self.chunks):
                dom = chk.domain.lower() if chk.domain else "chemistry"
                self._domain_index.setdefault(dom, []).append(i)
                self._doc_id_index.setdefault(chk.document_id, []).append(i)

            logger.info("Loaded %d chunks from vector store (%s)", len(self.chunks), target_dir)
        except Exception as e:
            logger.error("Failed to load vector store from %s: %s", target_dir, e)
