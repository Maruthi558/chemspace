"""Configuration settings for the ChemNova Self-Hosted Chemistry LLM.

All model, tokenizer, training, inference, and runtime parameters are centralized
and configurable here.
"""

import os
from pathlib import Path
from typing import Literal
from pydantic import BaseModel, Field

# Locate base directory for chemistry_llm
CHEMISTRY_LLM_DIR = Path(__file__).resolve().parent.parent


def _load_env_fallback():
    """Load .env files if present without hard requiring python-dotenv."""
    env_paths = [
        CHEMISTRY_LLM_DIR / ".env",
        CHEMISTRY_LLM_DIR.parent / ".env",
    ]
    for p in env_paths:
        if p.exists():
            try:
                with open(p, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k = k.strip()
                            v = v.strip().strip('"').strip("'")
                            if k and k not in os.environ:
                                os.environ[k] = v
            except Exception:
                pass


_load_env_fallback()


class ChemistryLLMSettings(BaseModel):
    """Runtime, architecture, and training configuration settings for ChemNova Chemistry LLM."""

    # -------------------------------------------------------------------------
    # Core Architecture Parameters (Small Educational / Self-Hosted Transformer)
    # -------------------------------------------------------------------------
    vocab_size: int = Field(
        default_factory=lambda: int(os.getenv("VOCAB_SIZE", "4096")),
        description="Total vocabulary size including special tokens and chemistry alphabet",
    )
    max_context_length: int = Field(
        default_factory=lambda: int(os.getenv("MAX_CONTEXT_LENGTH", "512")),
        description="Maximum sequence / context length in tokens",
    )
    d_model: int = Field(
        default_factory=lambda: int(os.getenv("D_MODEL", "128")),
        description="Embedding / hidden dimension of transformer",
    )
    n_layers: int = Field(
        default_factory=lambda: int(os.getenv("N_LAYERS", "4")),
        description="Number of transformer layers / blocks",
    )
    n_heads: int = Field(
        default_factory=lambda: int(os.getenv("N_HEADS", "4")),
        description="Number of multi-head self-attention heads",
    )
    d_ff: int = Field(
        default_factory=lambda: int(os.getenv("D_FF", "512")),
        description="Feed-forward intermediate hidden dimension (usually 4x d_model)",
    )
    dropout: float = Field(
        default_factory=lambda: float(os.getenv("DROPOUT", "0.1")),
        description="Dropout rate for attention and residual connections",
    )
    tie_weights: bool = Field(
        default_factory=lambda: os.getenv("TIE_WEIGHTS", "True").lower() == "true",
        description="Whether to tie token embedding weights with language model output head",
    )

    # -------------------------------------------------------------------------
    # Paths
    # -------------------------------------------------------------------------
    model_path: Path = Field(
        default_factory=lambda: Path(
            os.getenv("MODEL_PATH", str(CHEMISTRY_LLM_DIR / "models" / "base"))
        ),
        description="Path to base local model weights directory or artifact",
    )
    tokenizer_path: Path = Field(
        default_factory=lambda: Path(
            os.getenv("TOKENIZER_PATH", str(CHEMISTRY_LLM_DIR / "tokenizer" / "vocab.json"))
        ),
        description="Path to local tokenizer vocabulary file",
    )
    seed_knowledge_path: Path = Field(
        default_factory=lambda: Path(
            os.getenv("SEED_KNOWLEDGE_PATH", str(CHEMISTRY_LLM_DIR / "chemistry" / "seed_knowledge.jsonl"))
        ),
        description="Path to starter bootstrap seed chemistry knowledge jsonl file",
    )
    data_path: Path = Field(
        default_factory=lambda: Path(
            os.getenv("DATA_PATH", str(CHEMISTRY_LLM_DIR / "data" / "processed"))
        ),
        description="Path to processed training / evaluation dataset directory",
    )
    checkpoint_path: Path = Field(
        default_factory=lambda: Path(
            os.getenv(
                "CHECKPOINT_PATH", str(CHEMISTRY_LLM_DIR / "models" / "checkpoints")
            )
        ),
        description="Directory for saving training checkpoints and model weights",
    )

    # -------------------------------------------------------------------------
    # Hardware & Device Detection
    # -------------------------------------------------------------------------
    device: Literal["auto", "cpu", "cuda", "mps"] = Field(
        default_factory=lambda: os.getenv("DEVICE", "auto").lower(),  # type: ignore
        description="Hardware execution target: auto, cpu, cuda, or mps",
    )

    # -------------------------------------------------------------------------
    # Sampling & Generation Parameters
    # -------------------------------------------------------------------------
    temperature: float = Field(
        default_factory=lambda: float(os.getenv("TEMPERATURE", "0.2")),
        description="Sampling temperature (lower = more deterministic scientific output)",
    )
    top_p: float = Field(
        default_factory=lambda: float(os.getenv("TOP_P", "0.9")),
        description="Nucleus sampling probability threshold",
    )
    max_new_tokens: int = Field(
        default_factory=lambda: int(os.getenv("MAX_NEW_TOKENS", "128")),
        description="Maximum new tokens generated per turn",
    )

    # -------------------------------------------------------------------------
    # Server API Settings
    # -------------------------------------------------------------------------
    llm_host: str = Field(
        default_factory=lambda: os.getenv("LLM_HOST", "127.0.0.1"),
        description="API bind host",
    )
    llm_port: int = Field(
        default_factory=lambda: int(os.getenv("LLM_PORT", "8001")),
        description="API bind port",
    )

    model_config = {
        "arbitrary_types_allowed": True,
        "validate_default": True,
    }

    def get_resolved_device(self) -> str:
        """Resolve 'auto' to 'cuda' if torch.cuda.is_available() else 'cpu'."""
        if self.device == "cuda":
            return "cuda"
        if self.device == "cpu":
            return "cpu"
        # Auto detect
        try:
            import torch
            return "cuda" if torch.cuda.is_available() else "cpu"
        except ImportError:
            return "cpu"


def get_settings() -> ChemistryLLMSettings:
    """Return a fresh instance of ChemistryLLMSettings."""
    return ChemistryLLMSettings()


# Singleton instance for import across packages
settings = get_settings()
