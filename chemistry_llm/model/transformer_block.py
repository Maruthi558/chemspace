"""Transformer Block for ChemNova Transformer."""

from typing import Optional
import torch
import torch.nn as nn
from chemistry_llm.config.model_config import ChemNovaModelConfig
from .attention import MultiHeadSelfAttention
from .feed_forward import FeedForward
from .normalization import get_normalization


class TransformerBlock(nn.Module):
    """Pre-LayerNorm / Pre-RMSNorm Transformer Block with residual connections."""

    def __init__(self, config: ChemNovaModelConfig):
        super().__init__()
        self.config = config
        dim = config.embedding_dimension
        eps = config.layer_norm_eps
        norm_type = getattr(config, "normalization_type", "layernorm")

        # Pre-attention normalization
        self.norm_1 = get_normalization(norm_type, dim, eps)
        # Causal multi-head self-attention
        self.attn = MultiHeadSelfAttention(config)
        # Pre-FFN normalization
        self.norm_2 = get_normalization(norm_type, dim, eps)
        # Position-wise feed-forward network
        self.mlp = FeedForward(config)

    def forward(
        self,
        x: torch.Tensor,
        attention_mask: Optional[torch.Tensor] = None,
    ) -> torch.Tensor:
        # Pre-Norm Self-Attention with residual connection
        x = x + self.attn(self.norm_1(x), attention_mask=attention_mask)
        # Pre-Norm Feed-Forward with residual connection
        x = x + self.mlp(self.norm_2(x))
        return x
