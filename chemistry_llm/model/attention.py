"""Causal Multi-Head Self-Attention for ChemNova Transformer."""

from typing import Optional
import math
import torch
import torch.nn as nn
from chemistry_llm.config.model_config import ChemNovaModelConfig


class MultiHeadSelfAttention(nn.Module):
    """Causal Multi-Head Self-Attention module."""

    def __init__(self, config: ChemNovaModelConfig):
        super().__init__()
        self.config = config
        self.d_model = config.embedding_dimension
        self.n_heads = config.number_of_attention_heads
        self.head_dim = self.d_model // self.n_heads
        assert self.d_model % self.n_heads == 0, (
            f"d_model ({self.d_model}) must be divisible by n_heads ({self.n_heads})"
        )

        # Combined Q, K, V linear projection
        self.qkv_proj = nn.Linear(self.d_model, 3 * self.d_model, bias=False)
        # Output projection
        self.out_proj = nn.Linear(self.d_model, self.d_model, bias=False)

        # Regularization
        self.attn_dropout = nn.Dropout(config.dropout)
        self.resid_dropout = nn.Dropout(config.dropout)

        # Causal lower-triangular mask buffer
        max_seq = config.context_length
        self.register_buffer(
            "causal_mask",
            torch.tril(torch.ones(max_seq, max_seq)).view(1, 1, max_seq, max_seq),
            persistent=False,
        )

    def forward(
        self,
        x: torch.Tensor,
        attention_mask: Optional[torch.Tensor] = None,
    ) -> torch.Tensor:
        batch_size, seq_len, d_model = x.shape

        # Linear projection to Q, K, V
        qkv = self.qkv_proj(x)
        q, k, v = qkv.chunk(3, dim=-1)

        # Reshape to (B, n_heads, seq_len, head_dim)
        q = q.view(batch_size, seq_len, self.n_heads, self.head_dim).transpose(1, 2)
        k = k.view(batch_size, seq_len, self.n_heads, self.head_dim).transpose(1, 2)
        v = v.view(batch_size, seq_len, self.n_heads, self.head_dim).transpose(1, 2)

        # Scaled dot-product attention
        scale = 1.0 / math.sqrt(self.head_dim)
        scores = torch.matmul(q, k.transpose(-2, -1)) * scale

        # Apply causal mask (tokens attend only to previous and current positions)
        causal_mask = self.causal_mask[:, :, :seq_len, :seq_len]
        scores = scores.masked_fill(causal_mask == 0, float("-inf"))

        # Optional padding mask
        if attention_mask is not None:
            if attention_mask.dim() == 2:
                pad_mask = attention_mask.unsqueeze(1).unsqueeze(2)
            else:
                pad_mask = attention_mask
            scores = scores.masked_fill(pad_mask == 0, float("-inf"))

        attn_weights = torch.softmax(scores, dim=-1)
        attn_weights = self.attn_dropout(attn_weights)

        # Context output
        out = torch.matmul(attn_weights, v)
        out = out.transpose(1, 2).contiguous().view(batch_size, seq_len, d_model)

        return self.resid_dropout(self.out_proj(out))
