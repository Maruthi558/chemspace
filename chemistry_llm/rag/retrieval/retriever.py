"""Hybrid Chemistry Retrieval Engine combining Dense Vector Search & Exact Chemical Entity Matching."""

import math
import re
from typing import Any, Dict, List, Optional, Tuple

from chemistry_llm.rag.configs.config import RAGConfig
from chemistry_llm.rag.documents.schema import Chunk
from chemistry_llm.rag.embeddings.base import BaseEmbeddingModel
from chemistry_llm.rag.embeddings.local_embedding import get_embedding_model
from chemistry_llm.rag.query.analyzer import AnalyzedQuery, ChemistryQueryAnalyzer
from chemistry_llm.rag.vector_store.base import BaseVectorStore
from chemistry_llm.rag.vector_store.local_store import ChemNovaLocalVectorStore


class ChemistryRetriever:
    """Retrieves relevant chemistry context using hybrid dense semantic + keyword scoring."""

    def __init__(
        self,
        config: Optional[RAGConfig] = None,
        vector_store: Optional[BaseVectorStore] = None,
        embedding_model: Optional[BaseEmbeddingModel] = None,
        analyzer: Optional[ChemistryQueryAnalyzer] = None,
    ):
        self.config = config or RAGConfig()
        self.vector_store = vector_store or ChemNovaLocalVectorStore(storage_dir=self.config.storage_dir)
        self.embedding_model = embedding_model or get_embedding_model(
            model_name=self.config.embedding_model_name,
            dimension=self.config.embedding_dimension,
        )
        self.analyzer = analyzer or ChemistryQueryAnalyzer()

    def retrieve(
        self,
        query: str,
        top_k: Optional[int] = None,
        filter_dict: Optional[Dict[str, Any]] = None,
    ) -> List[Tuple[Chunk, float]]:
        """Retrieve most relevant chunks for a chemistry query."""
        analyzed: AnalyzedQuery = self.analyzer.analyze(query)
        effective_top_k = top_k or self.config.top_k

        # 1. Embed query (using query expansion terms if available)
        query_text = " ".join(analyzed.expanded_terms) if analyzed.expanded_terms else analyzed.normalized_query
        q_emb = self.embedding_model.embed_text(query_text)

        # 2. Dense Vector Retrieval
        merged_filters = {**analyzed.metadata_filters, **(filter_dict or {})}
        dense_results = self.vector_store.search(
            query_embedding=q_emb,
            top_k=min(self.config.max_rerank_candidates, max(effective_top_k * 3, 10)),
            filter_dict=merged_filters if merged_filters else None,
        )

        if not dense_results:
            # Fallback search without strict domain filter if initial search was empty
            dense_results = self.vector_store.search(
                query_embedding=q_emb,
                top_k=effective_top_k * 2,
                filter_dict=None,
            )

        # 3. Hybrid Scoring with Chemical Keyword & Entity Bonus
        scored_chunks: List[Tuple[Chunk, float]] = []
        q_tokens = set(re.findall(r"\w+", analyzed.normalized_query.lower()))

        for chunk, dense_sim in dense_results:
            chunk_text_lower = chunk.content.lower()

            # Keyword overlap score
            chunk_tokens = set(re.findall(r"\w+", chunk_text_lower))
            overlap = len(q_tokens.intersection(chunk_tokens))
            kw_score = overlap / max(len(q_tokens), 1)

            # Chemical entity match bonus (SMILES, exact formula, exact chemical name)
            entity_bonus = 0.0
            for ent in analyzed.chemical_entities:
                if ent.lower() in chunk_text_lower:
                    entity_bonus += 0.25
            if analyzed.smiles and chunk.smiles and analyzed.smiles == chunk.smiles:
                entity_bonus += 0.35

            # Intent & Domain alignment bonus
            chunk_domain_lower = (chunk.domain or "").lower()
            if analyzed.intent == "spectroscopy" and (
                chunk.section_type == "spectroscopy"
                or "spectroscopy" in chunk_domain_lower
                or "analytical" in chunk_domain_lower
            ):
                entity_bonus += 0.30
            elif analyzed.intent == "reaction_mechanism" and (
                chunk.section_type in ("reaction", "mechanism")
                or "organic" in chunk_domain_lower
            ):
                entity_bonus += 0.15
            elif analyzed.intent == "molecular_property" and (
                chunk.section_type == "molecule_property"
                or chunk.molecule
                or chunk.smiles
            ):
                entity_bonus += 0.15

            # Combined hybrid score
            hybrid_score = (
                self.config.dense_weight * dense_sim
                + self.config.keyword_weight * kw_score
                + entity_bonus
            )

            # Enforce similarity threshold
            if hybrid_score >= self.config.similarity_threshold or dense_sim >= self.config.similarity_threshold:
                scored_chunks.append((chunk, round(hybrid_score, 4)))

        # Sort descending by hybrid score
        scored_chunks.sort(key=lambda x: x[1], reverse=True)
        return scored_chunks[:effective_top_k]
