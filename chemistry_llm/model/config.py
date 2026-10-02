"""Configuration dataclass for ChemNova Small Transformer Architecture."""

from chemistry_llm.config.model_config import (
    ChemNovaModelConfig,
    ModelConfig,
    detect_device,
)

__all__ = ["ChemNovaModelConfig", "ModelConfig", "detect_device"]
