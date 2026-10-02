"""Deterministic Chemistry Relevance Reranker."""

from typing import List, Optional, Tuple

from chemistry_llm.rag.documents.schema import Chunk
from chemistry_llm.rag.query.analyzer import AnalyzedQuery


class ChemistryReranker:
    """Reranks retrieved candidate chunks based on chemical specificity and provenance credibility."""

    def __init__(self, diversity_penalty: float = 0.15):
        self.diversity_penalty = diversity_penalty

    def rerank(
        self,
        candidates: List[Tuple[Chunk, float]],
        analyzed_query: AnalyzedQuery,
        top_k: int = 3,
    ) -> List[Tuple[Chunk, float]]:
        """Rerank candidates using domain heuristics, intent alignment, and deduplication."""
        if not candidates:
            return []

        reranked = []
        seen_documents = set()

        for chunk, base_score in candidates:
            score = base_score

            # 1. Exact SMILES match bonus
            if analyzed_query.smiles and chunk.smiles:
                if analyzed_query.smiles.strip() == chunk.smiles.strip():
                    score += 0.30

            # 2. Section type / Intent alignment bonus
            if analyzed_query.intent == "spectroscopy" and chunk.section_type == "spectroscopy":
                score += 0.25
            elif analyzed_query.intent == "reaction_mechanism" and chunk.section_type in ("reaction", "mechanism"):
                score += 0.25
            elif analyzed_query.intent == "molecular_property" and chunk.section_type == "molecule_property":
                score += 0.20

            # 3. Verification status bonus
            if chunk.verification_status == "verified":
                score += 0.10
            elif chunk.verification_status == "experimental":
                score += 0.08

            # 4. Diversity penalty for repeated chunks from the exact same document
            if chunk.document_id in seen_documents:
                score -= self.diversity_penalty
            else:
                seen_documents.add(chunk.document_id)

            reranked.append((chunk, round(score, 4)))

        # Sort descending by updated score
        reranked.sort(key=lambda x: x[1], reverse=True)
        return reranked[:top_k]
