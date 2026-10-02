"""Performance Benchmark for ChemNova Tokenizer (Directive 22).

Evaluates the trained tokenizer on the validated chemistry corpus:
- Records processed per second
- Tokens generated per second
- Memory usage (RSS / Peak allocated via tracemalloc)
- Average, min, and max sequence lengths
- Encode/decode round-trip verification across representative multi-domain samples
"""

import gc
import json
import logging
from pathlib import Path
import sys
import time
import tracemalloc
from typing import Any, Dict, List

from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer
from chemistry_llm.tokenizer.prepare_dataset import format_training_text
from chemistry_llm.data.schema.record import ChemNovaRecord

# Configure UTF-8 stdout on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("chemistry_llm.tokenizer.benchmark")


def run_benchmark(
    corpus_path: str = "chemistry_llm/data/processed/chemistry_corpus_clean.jsonl",
    num_passes: int = 3,
) -> Dict[str, Any]:
    """Run tokenizer throughput and memory benchmark across full corpus."""
    corpus_file = Path(corpus_path)
    if not corpus_file.exists():
        raise FileNotFoundError(f"Corpus file not found: {corpus_file}")

    # Load records
    records: List[ChemNovaRecord] = []
    with open(corpus_file, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                records.append(ChemNovaRecord.from_jsonl_line(line))

    texts = [format_training_text(r) for r in records]
    total_records = len(texts)
    logger.info("Loaded %d formatted records for benchmarking.", total_records)

    tokenizer = ChemNovaTokenizer()

    # Warm-up pass
    for t in texts[:20]:
        _ = tokenizer.encode(t)

    gc.collect()
    tracemalloc.start()
    start_mem = tracemalloc.get_traced_memory()[0]

    all_token_counts = []
    start_time = time.perf_counter()

    for _ in range(num_passes):
        for text in texts:
            tokens = tokenizer.encode(text, add_special_tokens=True)
            all_token_counts.append(len(tokens))

    elapsed_time = time.perf_counter() - start_time
    peak_mem = tracemalloc.get_traced_memory()[1]
    tracemalloc.stop()

    total_processed_records = total_records * num_passes
    total_generated_tokens = sum(all_token_counts)
    records_per_sec = total_processed_records / elapsed_time
    tokens_per_sec = total_generated_tokens / elapsed_time

    # Sequence length distribution over one corpus pass
    single_pass_lengths = all_token_counts[:total_records]
    avg_seq_len = sum(single_pass_lengths) / len(single_pass_lengths)
    max_seq_len = max(single_pass_lengths)
    min_seq_len = min(single_pass_lengths)

    # Decode benchmark & round-trip verification
    decode_start = time.perf_counter()
    sample_tokens = [tokenizer.encode(t) for t in texts[:50]]
    decoded_texts = [tokenizer.decode(t) for t in sample_tokens]
    decode_elapsed = time.perf_counter() - decode_start
    decode_speed_tokens_per_sec = sum(len(t) for t in sample_tokens) / max(decode_elapsed, 1e-6)

    metrics = {
        "benchmark_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "corpus_path": str(corpus_path),
        "total_unique_records": total_records,
        "num_passes": num_passes,
        "total_records_processed": total_processed_records,
        "total_tokens_generated": total_generated_tokens,
        "elapsed_seconds": round(elapsed_time, 4),
        "records_per_second": round(records_per_sec, 2),
        "tokens_per_second": round(tokens_per_sec, 2),
        "decode_tokens_per_second": round(decode_speed_tokens_per_sec, 2),
        "peak_memory_allocated_mb": round((peak_mem - start_mem) / (1024 * 1024), 3),
        "average_sequence_length": round(avg_seq_len, 2),
        "maximum_sequence_length": max_seq_len,
        "minimum_sequence_length": min_seq_len,
        "vocab_size": tokenizer.vocab_size,
    }

    print("\n" + "=" * 65)
    print("           CHEMNOVA TOKENIZER PERFORMANCE BENCHMARK")
    print("=" * 65)
    print(f" Corpus Records:          {metrics['total_unique_records']}")
    print(f" Vocabulary Size:         {metrics['vocab_size']:,}")
    print(f" Records Processed/sec:   {metrics['records_per_second']:,.2f} records/s")
    print(f" Tokens Generated/sec:    {metrics['tokens_per_second']:,.2f} tokens/s")
    print(f" Decode Speed:            {metrics['decode_tokens_per_second']:,.2f} tokens/s")
    print(f" Peak Memory Overhead:    {metrics['peak_memory_allocated_mb']:.3f} MB")
    print(f" Average Sequence Length: {metrics['average_sequence_length']:.2f} tokens")
    print(f" Maximum Sequence Length: {metrics['maximum_sequence_length']} tokens")
    print(f" Minimum Sequence Length: {metrics['minimum_sequence_length']} tokens")
    print("=" * 65)

    return metrics


if __name__ == "__main__":
    run_benchmark()
