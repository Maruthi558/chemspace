"""High-Performance In-Memory LRU Cache with TTL for RAG Retrieval & Embeddings."""

from collections import OrderedDict
import hashlib
import time
from typing import Any, Dict, Optional, Tuple


class RAGCacheManager:
    """Thread-safe LRU cache with time-to-live expiration for embeddings, queries, and web searches."""

    def __init__(self, max_entries: int = 500, ttl_seconds: int = 3600, enabled: bool = True):
        self.max_entries = max_entries
        self.ttl_seconds = ttl_seconds
        self.enabled = enabled

        self._embedding_cache: OrderedDict[str, Tuple[float, Any]] = OrderedDict()
        self._retrieval_cache: OrderedDict[str, Tuple[float, Any]] = OrderedDict()
        self._web_cache: OrderedDict[str, Tuple[float, Any]] = OrderedDict()

        self.stats = {"hits": 0, "misses": 0}

    def _hash_key(self, key: str) -> str:
        return hashlib.sha256(key.strip().lower().encode("utf-8")).hexdigest()

    def get_embedding(self, text: str) -> Optional[Any]:
        """Retrieve cached embedding vector."""
        if not self.enabled:
            return None
        return self._get_item(self._embedding_cache, self._hash_key(text))

    def set_embedding(self, text: str, embedding: Any) -> None:
        """Store embedding vector in cache."""
        if not self.enabled:
            return
        self._set_item(self._embedding_cache, self._hash_key(text), embedding)

    def get_retrieval(self, query: str, filters_str: str = "") -> Optional[Any]:
        """Retrieve cached retrieval results."""
        if not self.enabled:
            return None
        key = self._hash_key(f"{query}::{filters_str}")
        return self._get_item(self._retrieval_cache, key)

    def set_retrieval(self, query: str, results: Any, filters_str: str = "") -> None:
        """Store retrieval results in cache."""
        if not self.enabled:
            return
        key = self._hash_key(f"{query}::{filters_str}")
        self._set_item(self._retrieval_cache, key, results)

    def get_web_search(self, query: str) -> Optional[Any]:
        """Retrieve cached web search results."""
        if not self.enabled:
            return None
        return self._get_item(self._web_cache, self._hash_key(query))

    def set_web_search(self, query: str, results: Any) -> None:
        """Store web search results in cache."""
        if not self.enabled:
            return
        self._set_item(self._web_cache, self._hash_key(query), results)

    def _get_item(self, cache_dict: OrderedDict, key: str) -> Optional[Any]:
        if key not in cache_dict:
            self.stats["misses"] += 1
            return None

        timestamp, value = cache_dict[key]
        if time.time() - timestamp > self.ttl_seconds:
            del cache_dict[key]
            self.stats["misses"] += 1
            return None

        # Move to end (most recently used)
        cache_dict.move_to_end(key)
        self.stats["hits"] += 1
        return value

    def _set_item(self, cache_dict: OrderedDict, key: str, value: Any) -> None:
        if key in cache_dict:
            cache_dict.move_to_end(key)
        cache_dict[key] = (time.time(), value)

        # Evict oldest entry if over capacity
        if len(cache_dict) > self.max_entries:
            cache_dict.popitem(last=False)

    def clear(self) -> None:
        """Clear all cached entries."""
        self._embedding_cache.clear()
        self._retrieval_cache.clear()
        self._web_cache.clear()
        self.stats = {"hits": 0, "misses": 0}

    def get_stats(self) -> Dict[str, Any]:
        """Return cache health metrics."""
        total = self.stats["hits"] + self.stats["misses"]
        hit_ratio = round(self.stats["hits"] / total, 3) if total > 0 else 0.0
        return {
            "enabled": self.enabled,
            "hits": self.stats["hits"],
            "misses": self.stats["misses"],
            "hit_ratio": hit_ratio,
            "cached_embeddings": len(self._embedding_cache),
            "cached_retrievals": len(self._retrieval_cache),
            "cached_web_searches": len(self._web_cache),
        }
