"""ChemNova Language Model wrapper and interface."""

from typing import Optional
from chemistry_llm.config.model_config import ChemNovaModelConfig
from .transformer import ChemNovaTransformerLM


class ChemNovaLanguageModel(ChemNovaTransformerLM):
    """ChemNova Decoder-Only Language Model Architecture.
    
    From-scratch trainable causal language model for scientific & chemistry AI.
    """

    def __init__(self, config: Optional[ChemNovaModelConfig] = None):
        super().__init__(config=config)


# Export both canonical names
__all__ = ["ChemNovaLanguageModel", "ChemNovaTransformerLM"]
