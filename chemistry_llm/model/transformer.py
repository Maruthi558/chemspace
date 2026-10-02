"""ChemNova Transformer Backbone and Language Model Architecture."""

from typing import Any, Dict, Optional, Tuple
import torch
import torch.nn as nn
import torch.nn.functional as F

from chemistry_llm.config.model_config import ChemNovaModelConfig
from .embeddings import TransformerEmbedding
from .transformer_block import TransformerBlock
from .normalization import get_normalization


class Transformer(nn.Module):
    """Core Transformer backbone (Embeddings + Stack of Transformer Blocks + Final Norm)."""

    def __init__(self, config: ChemNovaModelConfig):
        super().__init__()
        self.config = config

        # 1. Embeddings (Token + Positional)
        self.embeddings = TransformerEmbedding(config)

        # 2. Transformer Blocks
        self.blocks = nn.ModuleList(
            [TransformerBlock(config) for _ in range(config.number_of_layers)]
        )

        # 3. Final Normalization
        norm_type = getattr(config, "normalization_type", "layernorm")
        self.final_norm = get_normalization(
            norm_type, config.embedding_dimension, config.layer_norm_eps
        )

    def forward(
        self,
        input_ids: torch.Tensor,
        attention_mask: Optional[torch.Tensor] = None,
        position_ids: Optional[torch.Tensor] = None,
    ) -> torch.Tensor:
        x = self.embeddings(input_ids, position_ids=position_ids)
        for block in self.blocks:
            x = block(x, attention_mask=attention_mask)
        x = self.final_norm(x)
        return x


class ChemNovaTransformerLM(nn.Module):
    """From-scratch Decoder-style Transformer Language Model for ChemNova-LLM.
    
    Contains actual trainable neural network parameters with no external pretrained weights.
    """

    def __init__(self, config: Optional[ChemNovaModelConfig] = None):
        super().__init__()
        self.config = config or ChemNovaModelConfig()

        # Core Transformer backbone
        self.transformer = Transformer(self.config)

        # Backward compatibility alias for embedding layers
        self.embeddings = self.transformer.embeddings
        self.blocks = self.transformer.blocks
        self.ln_f = self.transformer.final_norm

        # Language Model output projection head
        self.lm_head = nn.Linear(
            self.config.embedding_dimension,
            self.config.vocabulary_size,
            bias=False,
        )

        # Weight tying: share weights between token embeddings and LM head if configured
        if self.config.tie_weights:
            self.lm_head.weight = self.embeddings.token_embeddings.embedding.weight

        # Initialize trainable parameters
        self.apply(self._init_weights)

    def _init_weights(self, module: nn.Module) -> None:
        """Initialize weights with gaussian distribution for stable training."""
        std = getattr(self.config, "initializer_range", 0.02)
        if isinstance(module, nn.Linear):
            nn.init.normal_(module.weight, mean=0.0, std=std)
            if module.bias is not None:
                nn.init.zeros_(module.bias)
        elif isinstance(module, nn.Embedding):
            nn.init.normal_(module.weight, mean=0.0, std=std)
        elif isinstance(module, nn.LayerNorm):
            if module.bias is not None:
                nn.init.zeros_(module.bias)
            if module.weight is not None:
                nn.init.ones_(module.weight)

    def forward(
        self,
        input_ids: torch.Tensor,
        targets: Optional[torch.Tensor] = None,
        attention_mask: Optional[torch.Tensor] = None,
        position_ids: Optional[torch.Tensor] = None,
    ) -> Tuple[torch.Tensor, Optional[torch.Tensor]]:
        """Forward pass through Transformer Language Model.
        
        Args:
            input_ids: Tensor of shape (batch_size, seq_len)
            targets: Optional ground-truth next token IDs (batch_size, seq_len)
            attention_mask: Optional padding mask (batch_size, seq_len)
            position_ids: Optional explicit position IDs
            
        Returns:
            Tuple of (logits, loss). Loss is None if targets is None.
        """
        batch_size, seq_len = input_ids.shape
        max_seq = self.config.context_length
        assert seq_len <= max_seq, (
            f"Input sequence length {seq_len} exceeds model context length {max_seq}"
        )

        # 1. Forward through transformer backbone
        hidden_states = self.transformer(
            input_ids,
            attention_mask=attention_mask,
            position_ids=position_ids,
        )

        # 2. Output projection to vocabulary logits
        logits = self.lm_head(hidden_states)  # (batch_size, seq_len, vocab_size)

        # 3. Compute cross-entropy loss if targets provided
        loss = None
        if targets is not None:
            vocab_size = self.config.vocabulary_size
            loss = F.cross_entropy(
                logits.view(-1, vocab_size),
                targets.view(-1),
                ignore_index=0,  # PAD_ID
            )

        return logits, loss

    def get_num_params(self, non_embedding: bool = False) -> int:
        """Calculate total number of trainable parameters."""
        n_params = sum(p.numel() for p in self.parameters() if p.requires_grad)
        if non_embedding:
            n_params -= self.embeddings.position_embeddings.embedding.weight.numel()
        return n_params

    def inspect_parameters(self) -> Dict[str, Any]:
        """Return detailed parameter inspection report dictionary."""
        total_params = sum(p.numel() for p in self.parameters())
        trainable_params = sum(p.numel() for p in self.parameters() if p.requires_grad)

        return {
            "model_name": self.config.model_name,
            "version": self.config.version,
            "total_parameters": total_params,
            "trainable_parameters": trainable_params,
            "model_layers": self.config.number_of_layers,
            "hidden_dimension": self.config.embedding_dimension,
            "attention_heads": self.config.number_of_attention_heads,
            "context_length": self.config.context_length,
            "vocabulary_size": self.config.vocabulary_size,
            "feed_forward_dimension": self.config.feed_forward_dimension,
            "dropout": self.config.dropout,
            "tie_weights": self.config.tie_weights,
            "normalization_type": getattr(self.config, "normalization_type", "layernorm"),
            "device": str(next(self.parameters()).device),
        }

    def configure_optimizers(
        self,
        weight_decay: Optional[float] = None,
        learning_rate: Optional[float] = None,
        betas: Tuple[float, float] = (0.9, 0.95),
    ) -> torch.optim.Optimizer:
        """Group parameters into weight decay and no-decay for AdamW."""
        wd = self.config.weight_decay if weight_decay is None else weight_decay
        lr = self.config.learning_rate if learning_rate is None else learning_rate

        decay_params = []
        nodecay_params = []

        for name, param in self.named_parameters():
            if not param.requires_grad:
                continue
            if param.dim() >= 2:
                decay_params.append(param)
            else:
                nodecay_params.append(param)

        optim_groups = [
            {"params": decay_params, "weight_decay": wd},
            {"params": nodecay_params, "weight_decay": 0.0},
        ]

        optimizer = torch.optim.AdamW(
            optim_groups,
            lr=lr,
            betas=betas,
        )
        return optimizer
