"""RAG Evaluation Suite for Benchmarking Retrieval, Precision, and Grounding."""

import time
from typing import Any, Dict, List, Optional, Tuple

from chemistry_llm.rag.documents.schema import Chunk
from chemistry_llm.rag.retrieval.retriever import ChemistryRetriever


BENCHMARK_EVALUATION_CASES = [
    {
        "query": "What is the molecular weight and boiling point of ethanol?",
        "expected_entity": "CCO",
        "expected_keywords": ["46.069", "78.37", "alcohol"],
        "domain": "organic_chemistry",
    },
    {
        "query": "What are the characteristic IR absorption peaks of an alcohol?",
        "expected_entity": "O-H",
        "expected_keywords": ["3200", "3600", "stretch"],
        "domain": "analytical_chemistry",
    },
    {
        "query": "Explain the Diels-Alder reaction mechanism and stereochemistry.",
        "expected_entity": "Diels-Alder",
        "expected_keywords": ["cycloaddition", "diene", "dienophile", "endo"],
        "domain": "organic_chemistry",
    },
    {
        "query": "What is the equation for Gibbs Free Energy spontaneity?",
        "expected_entity": "Gibbs",
        "expected_keywords": ["enthalpy", "entropy", "spontaneous", "equilibrium"],
        "domain": "physical_chemistry",
    },
]


class RAGEvaluator:
    """Evaluates RAG retrieval relevance, precision, recall, and grounding without external LLMs."""

    def __init__(self, retriever: ChemistryRetriever):
        self.retriever = retriever

    def evaluate_retrieval(self, test_cases: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """Run standard evaluation benchmark across chemistry test queries."""
        cases = test_cases or BENCHMARK_EVALUATION_CASES
        results = []
        total_precision = 0.0
        total_recall = 0.0
        total_latency_ms = 0.0

        for case in cases:
            q = case["query"]
            t0 = time.perf_counter()
            retrieved = self.retriever.retrieve(q, top_k=3)
            latency = (time.perf_counter() - t0) * 1000
            total_latency_ms += latency

            retrieved_text = " ".join([c[0].content for c in retrieved]).lower()

            # Check keyword hit rate (Recall)
            expected_kws = [k.lower() for k in case["expected_keywords"]]
            hits = sum(1 for kw in expected_kws if kw in retrieved_text)
            recall = hits / len(expected_kws) if expected_kws else 1.0

            # Check entity hit rate (Precision)
            exp_ent = case["expected_entity"].lower()
            precision = 1.0 if any(exp_ent in c[0].content.lower() for c in retrieved) else 0.5

            total_precision += precision
            total_recall += recall

            results.append({
                "query": q,
                "retrieved_count": len(retrieved),
                "precision": round(precision, 2),
                "recall": round(recall, 2),
                "latency_ms": round(latency, 2),
                "top_score": round(retrieved[0][1], 3) if retrieved else 0.0,
            })

        n = len(cases)
        return {
            "cases_evaluated": n,
            "mean_precision": round(total_precision / n, 3) if n > 0 else 0.0,
            "mean_recall": round(total_recall / n, 3) if n > 0 else 0.0,
            "mean_latency_ms": round(total_latency_ms / n, 2) if n > 0 else 0.0,
            "detailed_results": results,
        }

    def compute_grounding_score(self, answer: str, context: str) -> float:
        """Measure what fraction of factual terms in the answer are supported by context."""
        if not answer or not context:
            return 0.0
        ans_words = set(answer.lower().split())
        ctx_words = set(context.lower().split())
        overlap = ans_words.intersection(ctx_words)
        return round(len(overlap) / max(len(ans_words), 1), 3)
