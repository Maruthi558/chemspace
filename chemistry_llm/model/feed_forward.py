"""Position-wise Feed-Forward Network for ChemNova Transformer."""

import torch
import torch.nn as nn
from chemistry_llm.config.model_config import ChemNovaModelConfig


class FeedForward(nn.Module):
    """Position-wise Feed-Forward Network with GELU activation and dropout."""

    def __init__(self, config: ChemNovaModelConfig):
        super().__init__()
        self.d_model = config.embedding_dimension
        self.d_ff = config.feed_forward_dimension
        self.dropout = config.dropout

        self.fc1 = nn.Linear(self.d_model, self.d_ff, bias=False)
        self.act = nn.GELU()
        self.fc2 = nn.Linear(self.d_ff, self.d_model, bias=False)
        self.drop = nn.Dropout(self.dropout)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass through feed-forward network.
        
        Args:
            x: Input tensor of shape (batch_size, seq_len, d_model)
            
        Returns:
            Output tensor of shape (batch_size, seq_len, d_model)
        """
        hidden = self.act(self.fc1(x))
        out = self.fc2(hidden)
        return self.drop(out)
