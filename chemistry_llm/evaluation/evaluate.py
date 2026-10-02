"""Evaluation runner for ChemNova Local Chemistry AI Engine."""

import json
from pathlib import Path
from typing import Dict, List
import logging

from chemistry_llm.inference.response_pipeline import get_response_pipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("chemistry_llm.evaluation")


def run_evaluation(test_file: Path = None) -> Dict:
    """Run benchmark queries from test_questions.jsonl and compute metric scores."""
    if test_file is None:
        test_file = Path(__file__).parent / "test_questions.jsonl"

    if not test_file.exists():
        raise FileNotFoundError(f"Test file not found: {test_file}")

    pipeline = get_response_pipeline()

    results: List[Dict] = []
    total = 0
    intent_matches = 0
    non_empty_responses = 0

    with open(test_file, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            item = json.loads(line)
            total += 1
            prompt = item["prompt"]
            expected_intent = item.get("expected_intent")

            res = pipeline.process(prompt)
            matched = (res.intent == expected_intent) or (
                expected_intent in {"chemistry_concept", "chemistry_molecule"} and "chemistry" in res.intent
            )

            if matched:
                intent_matches += 1
            if res.response and len(res.response) > 5:
                non_empty_responses += 1

            results.append({
                "id": item.get("id"),
                "prompt": prompt,
                "expected_intent": expected_intent,
                "detected_intent": res.intent,
                "intent_match": matched,
                "response": res.response[:120] + "..." if len(res.response) > 120 else res.response,
            })

    summary = {
        "total_queries": total,
        "intent_accuracy": round((intent_matches / max(total, 1)) * 100, 2),
        "response_rate": round((non_empty_responses / max(total, 1)) * 100, 2),
        "results": results,
    }

    logger.info("Evaluation Complete: %d queries | Intent Acc: %.2f%% | Response Rate: %.2f%%",
                total, summary["intent_accuracy"], summary["response_rate"])
    return summary


# Alias for backward compatibility
evaluate_foundation_status = run_evaluation


if __name__ == "__main__":
    import pprint
    res = run_evaluation()
    pprint.pprint(res)
