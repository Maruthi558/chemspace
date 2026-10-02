"""Loss functions for ChemNova language model training."""

from typing import Tuple
import math
import torch
import torch.nn as nn
import torch.nn.functional as F
from chemistry_llm.tokenizer.special_tokens import PAD_ID


class CausalLanguageModelLoss(nn.Module):
    """Cross-entropy loss for causal language modeling with token padding masking."""

    def __init__(self, ignore_index: int = -100):
        super().__init__()
        self.ignore_index = ignore_index

    def forward(
        self,
        logits: torch.Tensor,
        targets: torch.Tensor,
    ) -> Tuple[torch.Tensor, float]:
        """Compute cross-entropy loss and perplexity.
        
        Args:
            logits: Predicted logits of shape (batch_size, seq_len, vocab_size)
            targets: Ground-truth target token IDs of shape (batch_size, seq_len)
            
        Returns:
            Tuple of (loss_tensor, perplexity_float)
        """
        vocab_size = logits.size(-1)
        loss = F.cross_entropy(
            logits.view(-1, vocab_size),
            targets.view(-1),
            ignore_index=self.ignore_index,
        )

        try:
            ppl = math.exp(min(loss.item(), 100.0))
        except (OverflowError, ValueError):
            ppl = float("inf")

        return loss, ppl
