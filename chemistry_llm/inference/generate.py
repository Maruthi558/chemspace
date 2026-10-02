"""Autoregressive text generation for ChemNova-LLM."""

from typing import List, Optional, Set
import torch
import torch.nn.functional as F

from chemistry_llm.model.transformer import ChemNovaTransformerLM
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer


@torch.no_grad()
def generate_tokens(
    model: ChemNovaTransformerLM,
    tokenizer: ChemNovaTokenizer,
    prompt: str,
    max_new_tokens: int = 64,
    temperature: float = 0.7,
    top_k: Optional[int] = 50,
    top_p: float = 0.9,
    repetition_penalty: float = 1.1,
    stop_tokens: Optional[Set[int]] = None,
) -> str:
    """Autoregressively sample tokens from the ChemNova Transformer model.
    
    Pipeline:
        input text -> tokenizer -> token IDs -> Transformer -> logits
        -> repetition penalty & temperature -> top_k & top_p filtering
        -> sampling -> decoded text

    Args:
        model: ChemNovaTransformerLM instance
        tokenizer: ChemNovaTokenizer instance
        prompt: Input text prompt
        max_new_tokens: Maximum number of tokens to generate
        temperature: Sampling temperature (<= 0.01 triggers greedy argmax)
        top_k: Top-k filtering threshold (None or 0 disables)
        top_p: Nucleus sampling probability mass threshold
        repetition_penalty: Penalty factor for previously generated tokens (1.0 = none)
        stop_tokens: Set of token IDs that terminate generation

    Returns:
        Generated text continuation string
    """
    model.eval()
    device = next(model.parameters()).device

    if stop_tokens is None:
        stop_tokens = {tokenizer.eos_token_id, tokenizer.pad_token_id}

    input_ids = tokenizer.encode(prompt, add_special_tokens=False)
    if not input_ids:
        # Fallback if empty prompt
        input_ids = [tokenizer.bos_token_id]

    idx = torch.tensor([input_ids], dtype=torch.long, device=device)
    generated_ids: List[int] = []

    context_limit = getattr(model.config, "context_length", 512)

    for _ in range(max_new_tokens):
        # Crop context to model's maximum sequence length
        idx_cond = idx if idx.size(1) <= context_limit else idx[:, -context_limit:]

        # Forward pass through local Transformer model
        logits, _ = model(idx_cond)
        # Select logits for the last token position
        logits = logits[:, -1, :].clone()  # Shape: (1, vocab_size)

        # Apply repetition penalty
        if repetition_penalty != 1.0 and repetition_penalty > 0.0:
            seen_tokens = set(idx[0].tolist())
            for token_id in seen_tokens:
                if 0 <= token_id < logits.size(-1):
                    val = logits[0, token_id]
                    if val > 0:
                        logits[0, token_id] = val / repetition_penalty
                    else:
                        logits[0, token_id] = val * repetition_penalty

        if temperature <= 0.01:
            # Greedy argmax selection
            next_token = torch.argmax(logits, dim=-1, keepdim=True)
        else:
            # Scale by temperature
            logits = logits / max(temperature, 1e-5)

            # Top-k filtering
            if top_k is not None and top_k > 0:
                k = min(top_k, logits.size(-1))
                v, _ = torch.topk(logits, k)
                logits[logits < v[:, [-1]]] = float("-inf")

            # Top-p (nucleus) filtering
            if top_p < 1.0 and top_p > 0.0:
                sorted_logits, sorted_indices = torch.sort(logits, descending=True)
                cumulative_probs = torch.cumsum(F.softmax(sorted_logits, dim=-1), dim=-1)

                # Remove tokens with cumulative probability above top_p threshold
                sorted_indices_to_remove = cumulative_probs > top_p
                # Shift right to keep the first token above threshold
                sorted_indices_to_remove[..., 1:] = sorted_indices_to_remove[..., :-1].clone()
                sorted_indices_to_remove[..., 0] = 0

                indices_to_remove = sorted_indices[sorted_indices_to_remove]
                logits[0, indices_to_remove] = float("-inf")

            # Compute softmax probabilities
            probs = F.softmax(logits, dim=-1)
            # Sample next token
            next_token = torch.multinomial(probs, num_samples=1)

        token_id = next_token.item()
        if token_id in stop_tokens:
            break

        generated_ids.append(token_id)
        idx = torch.cat((idx, next_token), dim=1)

    return tokenizer.decode(generated_ids, skip_special_tokens=True)
