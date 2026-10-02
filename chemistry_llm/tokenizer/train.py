"""Command-line training pipeline for ChemNova BPE Tokenizer.

Usage:
    python -m chemistry_llm.tokenizer.train --input chemistry_llm/data/processed/chemistry_corpus_clean.jsonl --output chemistry_llm/tokenizer/chemnova_tokenizer_v1 --vocab-size 4096 --min-freq 2
"""

import argparse
import json
import logging
import sys
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from pathlib import Path
from typing import Any, Dict, List

from chemistry_llm.tokenizer.bpe import ChemNovaBPETokenizer
from chemistry_llm.data.schema.record import ChemNovaRecord

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("chemistry_llm.tokenizer.train")

# Mandatory Chemical Strings for Verification (Directive 8)
MANDATORY_TEST_STRINGS = [
    "H2O",
    "C6H6",
    "CH3COOH",
    "NaCl",
    "CCO",
    "CC(=O)O",
    "c1ccccc1",
    "C=C",
    "C#N",
    "C(=O)O",
    "[Na+]",
    "[OH-]",
    "ΔG = ΔH - TΔS",
    "1H NMR",
    "13C NMR",
    "m/z",
    "kJ/mol",
    "mol/L",
    "A + B -> C",
    "6.022 × 10²³",
    "1.75 × 10⁻⁵",
]


def load_corpus_texts(jsonl_path: Path) -> List[str]:
    """Extract clean training texts from approved ChemNova JSONL dataset."""
    texts: List[str] = []
    logger.info("Loading approved training texts from: %s", jsonl_path)
    with open(jsonl_path, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            rec = ChemNovaRecord.from_jsonl_line(line)
            # Add question, answer, reasoning, and context
            if rec.question:
                texts.append(rec.question)
            if rec.answer:
                texts.append(rec.answer)
            if rec.reasoning:
                texts.append(rec.reasoning)
            if rec.context:
                texts.append(rec.context)
            if rec.smiles:
                texts.append(rec.smiles)
            if rec.reaction:
                texts.append(rec.reaction)
            if rec.formula:
                texts.append(rec.formula)
    logger.info("Extracted %d textual excerpts from %s", len(texts), jsonl_path.name)
    return texts


def verify_chemical_strings(tokenizer: ChemNovaBPETokenizer) -> Dict[str, Any]:
    """Execute round-trip encoding/decoding tests on critical chemistry strings."""
    results = {
        "total_tested": len(MANDATORY_TEST_STRINGS),
        "passed": 0,
        "failed": 0,
        "details": [],
    }

    for test_str in MANDATORY_TEST_STRINGS:
        token_ids = tokenizer.encode(test_str, add_special_tokens=False)
        tokens = tokenizer.convert_ids_to_tokens(token_ids)
        decoded = tokenizer.decode(token_ids, skip_special_tokens=False)

        exact_match = (decoded == test_str)
        if exact_match:
            results["passed"] += 1
        else:
            results["failed"] += 1

        results["details"].append({
            "original": test_str,
            "tokens": tokens,
            "token_ids": token_ids,
            "decoded": decoded,
            "exact_match": exact_match,
        })

    return results


def compute_vocabulary_statistics(tokenizer: ChemNovaBPETokenizer, corpus_texts: List[str]) -> Dict[str, Any]:
    """Compute detailed vocabulary coverage and distribution statistics."""
    total_tokens = 0
    token_freqs: Dict[int, int] = {}
    unk_count = 0
    unk_id = tokenizer.unk_token_id

    for text in corpus_texts:
        ids = tokenizer.encode(text, add_special_tokens=False)
        total_tokens += len(ids)
        for tid in ids:
            token_freqs[tid] = token_freqs.get(tid, 0) + 1
            if tid == unk_id:
                unk_count += 1

    unk_percentage = (unk_count / max(total_tokens, 1)) * 100.0

    return {
        "vocabulary_size": tokenizer.vocab_size,
        "merges_count": len(tokenizer.merges),
        "total_corpus_tokens": total_tokens,
        "unique_tokens_used": len(token_freqs),
        "vocabulary_utilization_rate": round(len(token_freqs) / max(tokenizer.vocab_size, 1) * 100.0, 2),
        "unknown_tokens_count": unk_count,
        "unknown_token_frequency_percent": round(unk_percentage, 4),
        "average_tokens_per_sample": round(total_tokens / max(len(corpus_texts), 1), 2),
    }


def main():
    parser = argparse.ArgumentParser(description="Train ChemNova BPE Tokenizer on Chemistry Corpus")
    parser.add_argument(
        "--input",
        type=str,
        default="chemistry_llm/data/processed/chemistry_corpus_clean.jsonl",
        help="Path to validated chemistry corpus JSONL",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="chemistry_llm/tokenizer/chemnova_tokenizer_v1",
        help="Output directory for versioned tokenizer artifacts",
    )
    parser.add_argument(
        "--vocab-size",
        type=int,
        default=4096,
        help="Target vocabulary size (default: 4096)",
    )
    parser.add_argument(
        "--min-freq",
        type=int,
        default=2,
        help="Minimum subword pair frequency for BPE merges (default: 2)",
    )
    parser.add_argument(
        "--version",
        type=str,
        default="1.0.0",
        help="Tokenizer artifact version tag",
    )

    args = parser.parse_args()

    input_path = Path(args.input)
    output_dir = Path(args.output)

    if not input_path.exists():
        logger.error("Input corpus file not found: %s", input_path)
        sys.exit(1)

    print("================================================================================")
    print("STEP 4: TRAINING CHEMNOVA BPE SUBWORD TOKENIZER")
    print("================================================================================")
    print(f"Input Corpus:         {input_path}")
    print(f"Output Directory:     {output_dir}")
    print(f"Target Vocab Size:    {args.vocab_size}")
    print(f"Minimum Frequency:    {args.min_freq}")
    print(f"Tokenizer Version:    {args.version}")
    print("--------------------------------------------------------------------------------")

    # 1. Load texts
    texts = load_corpus_texts(input_path)

    # 2. Instantiate and train BPE
    tokenizer = ChemNovaBPETokenizer()
    train_summary = tokenizer.train_bpe(
        corpus_texts=texts,
        target_vocab_size=args.vocab_size,
        min_frequency=args.min_freq,
    )

    print(f"[OK] BPE Training Finished!")
    print(f"Initial Base Vocab:   {train_summary['initial_vocab_size']}")
    print(f"Subword Merges Learned:{train_summary['merges_count']}")
    print(f"Final Vocab Size:     {train_summary['final_vocab_size']}")

    # 3. Verify Chemical Strings
    print("\n--- Running Mandatory Chemical String Round-Trip Tests ---")
    rt_results = verify_chemical_strings(tokenizer)
    for d in rt_results["details"]:
        status = "[PASS]" if d["exact_match"] else "[FAIL]"
        print(f"  {status} {d['original']:<20} -> {d['tokens']}")

    print(f"\nChemical String Verification: {rt_results['passed']} / {rt_results['total_tested']} passed.")
    if rt_results["failed"] > 0:
        logger.error("One or more chemical string round-trip tests failed!")
        sys.exit(1)

    # 4. Vocabulary statistics
    print("\n--- Computing Vocabulary Statistics ---")
    vocab_stats = compute_vocabulary_statistics(tokenizer, texts)
    for k, v in vocab_stats.items():
        print(f"  - {k:<32}: {v}")

    # 5. Save Artifacts
    print(f"\n--- Saving Artifacts to {output_dir} ---")
    tokenizer.save(output_dir, version=args.version)

    # Save stats file
    stats_file = output_dir / "vocab_stats.json"
    with open(stats_file, "w", encoding="utf-8") as f:
        json.dump({
            "training_summary": train_summary,
            "round_trip_tests": rt_results,
            "vocabulary_statistics": vocab_stats,
        }, f, indent=2)

    print(f"[OK] Tokenizer successfully trained, validated, and saved to {output_dir}!")
    print("================================================================================")


if __name__ == "__main__":
    main()
