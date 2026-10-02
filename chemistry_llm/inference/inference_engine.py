"""ChemNova Local Inference Engine.

Loads our from-scratch ChemNova-LLM model and tokenizer locally,
executing autoregressive decoding with configurable sampling parameters
without calling any external AI APIs.
"""

from pathlib import Path
from typing import Any, Dict, Optional, Union
import logging
import torch

from chemistry_llm.config.model_config import ChemNovaModelConfig, detect_device
from chemistry_llm.model.language_model import ChemNovaLanguageModel
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer
from chemistry_llm.training.checkpoint import load_checkpoint
from .generate import generate_tokens

logger = logging.getLogger("chemistry_llm.inference_engine")


class ChemNovaInferenceEngine:
    """Standalone local inference engine for ChemNova-LLM."""

    def __init__(
        self,
        config: Optional[ChemNovaModelConfig] = None,
        checkpoint_dir: Optional[Union[str, Path]] = None,
        device: Optional[Union[str, torch.device]] = None,
    ):
        self.config = config or ChemNovaModelConfig()
        
        # Device resolution
        if device is None:
            self.device = torch.device(detect_device(self.config.device))
        elif isinstance(device, str):
            self.device = torch.device(detect_device(device))
        else:
            self.device = device

        # Initialize local tokenizer and model
        self.tokenizer = ChemNovaTokenizer()
        self.model = ChemNovaLanguageModel(self.config).to(self.device)
        self.checkpoint_status = "initialized_empty"

        if checkpoint_dir and Path(checkpoint_dir).exists():
            self.load_from_checkpoint(checkpoint_dir)

    def load_from_checkpoint(self, checkpoint_dir: Union[str, Path]) -> Dict[str, Any]:
        """Load weights from local checkpoint."""
        res = load_checkpoint(
            checkpoint_dir=checkpoint_dir,
            model=self.model,
            device=self.device,
        )
        self.checkpoint_status = f"loaded_step_{res.get('step', 0)}"
        logger.info("Loaded model checkpoint from %s", checkpoint_dir)
        return res

    def generate(
        self,
        prompt: str,
        max_new_tokens: int = 64,
        temperature: float = 0.7,
        top_k: Optional[int] = 50,
        top_p: float = 0.9,
        repetition_penalty: float = 1.1,
    ) -> str:
        """Autoregressively generate text continuation using local ChemNova-LLM."""
        return generate_tokens(
            model=self.model,
            tokenizer=self.tokenizer,
            prompt=prompt,
            max_new_tokens=max_new_tokens,
            temperature=temperature,
            top_k=top_k,
            top_p=top_p,
            repetition_penalty=repetition_penalty,
        )

    def get_status(self) -> Dict[str, Any]:
        """Return engine operational status and parameter metadata."""
        return {
            "model_name": self.config.model_name,
            "version": self.config.version,
            "model_initialized": self.model is not None,
            "tokenizer_initialized": self.tokenizer is not None,
            "device": str(self.device),
            "checkpoint_status": self.checkpoint_status,
            "model_parameter_count": self.model.get_num_params(),
            "vocab_size": self.tokenizer.vocab_size,
            "training_status": "ready",
            "local": True,
        }


# Global singleton instance
_engine_instance: Optional[ChemNovaInferenceEngine] = None


def get_inference_engine(
    config: Optional[ChemNovaModelConfig] = None,
    checkpoint_dir: Optional[Union[str, Path]] = None,
) -> ChemNovaInferenceEngine:
    """Return singleton instance of ChemNovaInferenceEngine."""
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = ChemNovaInferenceEngine(
            config=config, checkpoint_dir=checkpoint_dir
        )
    return _engine_instance
