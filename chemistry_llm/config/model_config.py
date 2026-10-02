"""ChemNova LLM Model Configuration.

Defines the architecture hyperparameters and training configuration
for the from-scratch ChemNova Transformer Language Model.
"""

from pathlib import Path
from typing import Any, Dict, Optional, Union
import json
import torch


def detect_device(preferred_device: str = "auto") -> str:
    """Detect available compute device (CUDA GPU or CPU)."""
    if preferred_device == "cuda":
        return "cuda" if torch.cuda.is_available() else "cpu"
    if preferred_device == "cpu":
        return "cpu"
    return "cuda" if torch.cuda.is_available() else "cpu"


class ChemNovaModelConfig:
    """Configuration for ChemNova-LLM architecture and training hyperparameters.
    
    Supports both canonical names (vocabulary_size, context_length, etc.) and
    standard shorthand aliases (vocab_size, max_seq_len, d_model, etc.) in both
    initialization and property access.
    """

    def __init__(
        self,
        vocabulary_size: int = 4096,
        context_length: int = 512,
        embedding_dimension: int = 128,
        number_of_layers: int = 4,
        number_of_attention_heads: int = 4,
        feed_forward_dimension: int = 512,
        dropout: float = 0.1,
        tie_weights: bool = True,
        layer_norm_eps: float = 1e-5,
        normalization_type: str = "layernorm",
        initializer_range: float = 0.02,
        device: str = "auto",
        dtype: str = "float32",
        learning_rate: float = 3e-4,
        weight_decay: float = 0.01,
        batch_size: int = 4,
        gradient_accumulation_steps: int = 1,
        grad_clip: float = 1.0,
        model_name: str = "ChemNova-LLM",
        version: str = "0.1.0-step1-empty",
        **kwargs,
    ):
        # Resolve aliases in kwargs if provided
        self.vocabulary_size = kwargs.get("vocab_size", vocabulary_size)
        self.context_length = kwargs.get("max_seq_len", context_length)
        self.embedding_dimension = kwargs.get("d_model", embedding_dimension)
        self.number_of_layers = kwargs.get("n_layers", number_of_layers)
        self.number_of_attention_heads = kwargs.get("n_heads", number_of_attention_heads)
        self.feed_forward_dimension = kwargs.get("d_ff", feed_forward_dimension)

        self.dropout = dropout
        self.tie_weights = tie_weights
        self.layer_norm_eps = layer_norm_eps
        self.normalization_type = normalization_type
        self.initializer_range = initializer_range
        self.device = device
        self.dtype = dtype
        self.learning_rate = learning_rate
        self.weight_decay = weight_decay
        self.batch_size = batch_size
        self.gradient_accumulation_steps = gradient_accumulation_steps
        self.grad_clip = grad_clip
        self.model_name = model_name
        self.version = version

        assert self.embedding_dimension % self.number_of_attention_heads == 0, (
            f"embedding_dimension ({self.embedding_dimension}) must be divisible by "
            f"number_of_attention_heads ({self.number_of_attention_heads})"
        )

    # Shorthand alias property accessors and setters
    @property
    def vocab_size(self) -> int:
        return self.vocabulary_size

    @vocab_size.setter
    def vocab_size(self, val: int):
        self.vocabulary_size = val

    @property
    def max_seq_len(self) -> int:
        return self.context_length

    @max_seq_len.setter
    def max_seq_len(self, val: int):
        self.context_length = val

    @property
    def d_model(self) -> int:
        return self.embedding_dimension

    @d_model.setter
    def d_model(self, val: int):
        self.embedding_dimension = val

    @property
    def n_layers(self) -> int:
        return self.number_of_layers

    @n_layers.setter
    def n_layers(self, val: int):
        self.number_of_layers = val

    @property
    def n_heads(self) -> int:
        return self.number_of_attention_heads

    @n_heads.setter
    def n_heads(self, val: int):
        self.number_of_attention_heads = val

    @property
    def d_ff(self) -> int:
        return self.feed_forward_dimension

    @d_ff.setter
    def d_ff(self, val: int):
        self.feed_forward_dimension = val

    def get_torch_device(self) -> torch.device:
        """Resolve device string to torch.device object."""
        resolved = detect_device(self.device)
        return torch.device(resolved)

    def get_torch_dtype(self) -> torch.dtype:
        """Resolve dtype string to torch.dtype."""
        mapping = {
            "float32": torch.float32,
            "float16": torch.float16,
            "bfloat16": torch.bfloat16,
        }
        return mapping.get(self.dtype, torch.float32)

    def to_dict(self) -> Dict[str, Any]:
        """Convert config to dictionary."""
        return {
            "model_name": self.model_name,
            "version": self.version,
            "vocabulary_size": self.vocabulary_size,
            "context_length": self.context_length,
            "embedding_dimension": self.embedding_dimension,
            "number_of_layers": self.number_of_layers,
            "number_of_attention_heads": self.number_of_attention_heads,
            "feed_forward_dimension": self.feed_forward_dimension,
            "dropout": self.dropout,
            "tie_weights": self.tie_weights,
            "layer_norm_eps": self.layer_norm_eps,
            "normalization_type": self.normalization_type,
            "initializer_range": self.initializer_range,
            "device": self.device,
            "dtype": self.dtype,
            "learning_rate": self.learning_rate,
            "weight_decay": self.weight_decay,
            "batch_size": self.batch_size,
            "gradient_accumulation_steps": self.gradient_accumulation_steps,
            "grad_clip": self.grad_clip,
            # include aliases for external consumers
            "vocab_size": self.vocabulary_size,
            "max_seq_len": self.context_length,
            "d_model": self.embedding_dimension,
            "n_layers": self.number_of_layers,
            "n_heads": self.number_of_attention_heads,
            "d_ff": self.feed_forward_dimension,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ChemNovaModelConfig":
        """Instantiate config from dictionary, handling alias key mappings."""
        d = dict(data)
        return cls(**d)

    @classmethod
    def from_settings(cls, settings=None):
        """Build config from centralized settings if available."""
        if settings is None:
            from chemistry_llm.config.settings import settings
        return cls(
            vocabulary_size=settings.vocab_size,
            context_length=settings.max_context_length,
            embedding_dimension=settings.d_model,
            number_of_layers=settings.n_layers,
            number_of_attention_heads=settings.n_heads,
            feed_forward_dimension=settings.d_ff,
            dropout=settings.dropout,
            tie_weights=settings.tie_weights,
        )

    def save_json(self, path: Union[str, Path]) -> None:
        """Save configuration to JSON file."""
        p = Path(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        with open(p, "w", encoding="utf-8") as f:
            json.dump(self.to_dict(), f, indent=2)

    @classmethod
    def from_json(cls, path: Union[str, Path]) -> "ChemNovaModelConfig":
        """Load configuration from JSON file."""
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return cls.from_dict(data)


# Convenient alias
ModelConfig = ChemNovaModelConfig
