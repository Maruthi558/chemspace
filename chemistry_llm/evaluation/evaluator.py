"""Evaluation Engine for ChemNova Benchmark & Chemistry Format Checks (Step 6)."""

import math
from typing import Any, Dict, List, Optional
import torch

from chemistry_llm.evaluation.benchmark_set import BENCHMARK_ITEMS, BenchmarkItem
from chemistry_llm.model.transformer import ChemNovaTransformerLM
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer

try:
    from rdkit import Chem
    HAS_RDKIT = True
except ImportError:
    HAS_RDKIT = False


def generate_response(
    model: ChemNovaTransformerLM,
    tokenizer: ChemNovaTokenizer,
    prompt: str,
    max_new_tokens: int = 64,
    device: Optional[torch.device] = None,
    temperature: float = 0.7,
    repetition_penalty: float = 1.2,
    top_k: int = 50,
) -> str:
    """Generate completion using autoregressive sampling with repetition penalty and top-k filtering."""
    dev = device or next(model.parameters()).device
    model.eval()

    token_ids = tokenizer.encode(f"<BOS>{prompt}")
    curr_ids = torch.tensor([token_ids], dtype=torch.long, device=dev)

    eos_id = tokenizer.vocab.get("<EOS>", 3)

    with torch.no_grad():
        for _ in range(max_new_tokens):
            if curr_ids.size(1) >= 512:
                break

            logits, _ = model(curr_ids)
            next_logits = logits[0, -1, :].clone()

            # Apply repetition penalty to already generated/prompt tokens
            if repetition_penalty > 1.0:
                generated_tokens = curr_ids[0].unique()
                for token_idx in generated_tokens:
                    if next_logits[token_idx] > 0:
                        next_logits[token_idx] /= repetition_penalty
                    else:
                        next_logits[token_idx] *= repetition_penalty

            # Top-k filtering
            if top_k > 0 and top_k < next_logits.size(-1):
                indices_to_remove = next_logits < torch.topk(next_logits, top_k)[0][..., -1, None]
                next_logits[indices_to_remove] = -float("Inf")

            if temperature > 0.0:
                probs = torch.softmax(next_logits / temperature, dim=-1)
                next_token_id = int(torch.multinomial(probs, num_samples=1).item())
            else:
                next_token_id = int(torch.argmax(next_logits).item())

            if next_token_id == eos_id:
                break

            next_tensor = torch.tensor([[next_token_id]], dtype=torch.long, device=dev)
            curr_ids = torch.cat([curr_ids, next_tensor], dim=1)

    generated_ids = curr_ids[0, len(token_ids):].tolist()
    return tokenizer.decode(generated_ids)


def evaluate_benchmark_item(
    model: ChemNovaTransformerLM,
    tokenizer: ChemNovaTokenizer,
    item: BenchmarkItem,
    device: Optional[torch.device] = None,
) -> Dict[str, Any]:
    """Evaluate a single benchmark question and perform automated checks."""
    if item.context:
        prompt_str = f"<SYSTEM>\nYou are ChemNova, a chemistry-focused AI assistant.\n</SYSTEM>\n<CONTEXT>\n{item.context}\n</CONTEXT>\n<QUESTION>\n{item.question}\n</QUESTION>\n<ANSWER>\n"
    else:
        prompt_str = f"<SYSTEM>\nYou are ChemNova, a chemistry-focused AI assistant.\n</SYSTEM>\n<QUESTION>\n{item.question}\n</QUESTION>\n<ANSWER>\n"

    completion = generate_response(model, tokenizer, prompt_str, max_new_tokens=48, device=device)

    # Automated Format & Quality Checks
    has_content = len(completion.strip()) > 0
    balanced_parens = completion.count("(") == completion.count(")")
    balanced_brackets = completion.count("[") == completion.count("]")

    # Keyword check
    keywords = item.expected_keywords or []
    keyword_hits = [k for k in keywords if k.lower() in completion.lower()]

    # SMILES validation
    smiles_valid = False
    if item.expected_smiles and HAS_RDKIT:
        mol = Chem.MolFromSmiles(item.expected_smiles)
        smiles_valid = mol is not None

    return {
        "category_code": item.category_code,
        "category_name": item.category_name,
        "question": item.question,
        "completion": completion.strip(),
        "reference_answer": item.reference_answer,
        "has_content": has_content,
        "balanced_parens": balanced_parens,
        "balanced_brackets": balanced_brackets,
        "keyword_hits": keyword_hits,
        "keyword_coverage": len(keyword_hits) / len(keywords) if keywords else 1.0,
        "smiles_valid": smiles_valid,
    }


def evaluate_full_benchmark(
    model: ChemNovaTransformerLM,
    tokenizer: ChemNovaTokenizer,
    device: Optional[torch.device] = None,
) -> List[Dict[str, Any]]:
    """Evaluate all 18 benchmark categories."""
    results = []
    for item in BENCHMARK_ITEMS:
        res = evaluate_benchmark_item(model, tokenizer, item, device=device)
        results.append(res)
    return results
