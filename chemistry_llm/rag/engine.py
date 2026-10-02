"""Unified ChemNova RAG Engine Coordinating Ingestion, Retrieval, Reranking, and Context Synthesis."""

import logging
from typing import Any, Dict, List, Optional, Tuple

from chemistry_llm.rag.cache.cache_manager import RAGCacheManager
from chemistry_llm.rag.configs.config import RAGConfig
from chemistry_llm.rag.context.context_builder import ContextBuilder
from chemistry_llm.rag.documents.knowledge_base import load_curated_knowledge_base
from chemistry_llm.rag.documents.schema import Chunk, Document
from chemistry_llm.rag.embeddings.base import BaseEmbeddingModel
from chemistry_llm.rag.embeddings.local_embedding import get_embedding_model
from chemistry_llm.rag.ingestion.pipeline import DocumentIngestionPipeline
from chemistry_llm.rag.query.analyzer import AnalyzedQuery, ChemistryQueryAnalyzer
from chemistry_llm.rag.reranking.reranker import ChemistryReranker
from chemistry_llm.rag.retrieval.retriever import ChemistryRetriever
from chemistry_llm.rag.security.prompt_defense import PromptInjectionDefense
from chemistry_llm.rag.vector_store.base import BaseVectorStore
from chemistry_llm.rag.vector_store.local_store import ChemNovaLocalVectorStore

logger = logging.getLogger("chemistry_llm.rag.engine")


class ChemNovaRAGEngine:
    """Master orchestrator for ChemNova Chemistry Retrieval-Augmented Generation."""

    def __init__(self, config: Optional[RAGConfig] = None):
        self.config = config or RAGConfig()

        # Core subsystems
        self.embedding_model: BaseEmbeddingModel = get_embedding_model(
            model_name=self.config.embedding_model_name,
            dimension=self.config.embedding_dimension,
        )
        self.vector_store: BaseVectorStore = ChemNovaLocalVectorStore(storage_dir=self.config.storage_dir)
        self.analyzer = ChemistryQueryAnalyzer()
        self.retriever = ChemistryRetriever(
            config=self.config,
            vector_store=self.vector_store,
            embedding_model=self.embedding_model,
            analyzer=self.analyzer,
        )
        self.reranker = ChemistryReranker()
        self.context_builder = ContextBuilder()
        self.cache = RAGCacheManager(
            max_entries=self.config.cache_max_entries,
            ttl_seconds=self.config.cache_ttl_seconds,
            enabled=self.config.cache_enabled,
        )
        self.defense = PromptInjectionDefense()
        self.ingestion_pipeline = DocumentIngestionPipeline(
            config=self.config,
            vector_store=self.vector_store,
            embedding_model=self.embedding_model,
        )

        # Automatically bootstrap curated knowledge base if store is empty
        if self.vector_store.count() == 0:
            logger.info("Vector store is empty. Bootstrapping curated chemistry knowledge base...")
            self.bootstrap_knowledge_base()

    def bootstrap_knowledge_base(self) -> int:
        """Seed vector database with curated verified scientific documents."""
        curated_docs = load_curated_knowledge_base()
        total_chunks = self.ingestion_pipeline.ingest_batch(curated_docs)
        logger.info("Bootstrapped %d chunks across %d curated documents.", total_chunks, len(curated_docs))
        return total_chunks

    def search_and_build_context(
        self,
        query: str,
        top_k: Optional[int] = None,
        filter_dict: Optional[Dict[str, Any]] = None,
        web_snippets: Optional[List[dict]] = None,
    ) -> Dict[str, Any]:
        """Execute end-to-end RAG workflow: Query Analysis -> Hybrid Retrieval -> Reranking -> Context Envelope."""
        # 1. Check cache
        filter_key = str(filter_dict or {})
        cached_result = self.cache.get_retrieval(query, filters_str=filter_key)
        if cached_result and not web_snippets:
            return cached_result

        # 2. Analyze Query
        analyzed: AnalyzedQuery = self.analyzer.analyze(query)

        # 3. Retrieve Candidate Chunks
        k = top_k or self.config.top_k
        raw_candidates = self.retriever.retrieve(
            query=query,
            top_k=max(k * 2, 6),
            filter_dict=filter_dict,
        )

        # 4. Rerank Candidates
        if self.config.reranking_enabled and raw_candidates:
            ranked_chunks = self.reranker.rerank(raw_candidates, analyzed, top_k=k)
        else:
            ranked_chunks = raw_candidates[:k]

        # 5. Build Bounded Context Envelope and Formal Citations
        context_block, citations = self.context_builder.build_context(
            ranked_chunks=ranked_chunks,
            web_snippets=web_snippets,
        )

        # 6. Format LLM Prompt
        prompt = self.context_builder.format_llm_prompt(query, context_block)

        result = {
            "query": query,
            "intent": analyzed.intent,
            "smiles": analyzed.smiles,
            "requires_web_research": analyzed.requires_web_research,
            "retrieved_count": len(ranked_chunks),
            "chunks": [c[0].to_dict() for c in ranked_chunks],
            "scores": [c[1] for c in ranked_chunks],
            "citations": [c.to_dict() for c in citations],
            "context_block": context_block,
            "prompt": prompt,
        }

        # Cache result
        self.cache.set_retrieval(query, result, filters_str=filter_key)
        return result
