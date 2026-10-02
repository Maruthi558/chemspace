"""Token and positional embedding layers for ChemNova Transformer."""

from typing import Optional
import torch
import torch.nn as nn
from chemistry_llm.config.model_config import ChemNovaModelConfig


class TokenEmbedding(nn.Module):
    """Token embedding lookup table."""

    def __init__(self, vocab_size: int, d_model: int):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, d_model)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.embedding(x)


class PositionalEmbedding(nn.Module):
    """Learned positional embedding up to context_length."""

    def __init__(self, context_length: int, d_model: int):
        super().__init__()
        self.embedding = nn.Embedding(context_length, d_model)

    def forward(self, positions: torch.Tensor) -> torch.Tensor:
        return self.embedding(positions)


class TransformerEmbedding(nn.Module):
    """Combines token and positional representations with dropout."""

    def __init__(self, config: ChemNovaModelConfig):
        super().__init__()
        self.config = config
        vocab_size = config.vocabulary_size
        context_len = config.context_length
        d_model = config.embedding_dimension

        self.token_embeddings = TokenEmbedding(vocab_size, d_model)
        self.position_embeddings = PositionalEmbedding(context_len, d_model)
        self.dropout = nn.Dropout(config.dropout)

    def forward(
        self,
        input_ids: torch.Tensor,
        position_ids: Optional[torch.Tensor] = None,
    ) -> torch.Tensor:
        batch_size, seq_len = input_ids.shape
        if position_ids is None:
            position_ids = torch.arange(
                0, seq_len, dtype=torch.long, device=input_ids.device
            )
            position_ids = position_ids.unsqueeze(0).expand(batch_size, -1)

        tok_emb = self.token_embeddings(input_ids)
        pos_emb = self.position_embeddings(position_ids)
        embeddings = tok_emb + pos_emb
        return self.dropout(embeddings)
