"""Model and Tokenizer Loader Interface for ChemNova Chemistry LLM.

STEP 1 NOTICE:
This file defines a clean, standardized interface for loading the future local model.
No base model is selected, downloaded, or initialized in Step 1.
The actual base model (e.g. 1B-7B parameter small model) will be selected and
integrated in a subsequent technical step.
"""

from pathlib import Path
from typing import Any, Dict, Optional
from ..config.settings import settings


class ModelNotConnectedError(RuntimeError):
    """Raised when inference is attempted before a local model is connected."""

    pass


# Global handles for runtime model & tokenizer instances (future phase)
_LOADED_MODEL: Optional[Any] = None
_LOADED_TOKENIZER: Optional[Any] = None
_MODEL_METADATA: Dict[str, Any] = {
    "connected": False,
    "step": 1,
    "status": "Foundation Initialized - Base model selection scheduled for subsequent phase",
    "base_model_name": None,
    "quantization": None,
    "device": settings.device,
}


def is_model_loaded() -> bool:
    """Check if a real local model has been loaded into memory.

    Returns False during Step 1.
    """
    return _LOADED_MODEL is not None


def get_model_info() -> Dict[str, Any]:
    """Retrieve metadata regarding the currently configured model foundation."""
    return {
        **_MODEL_METADATA,
        "model_path": str(settings.model_path),
        "tokenizer_path": str(settings.tokenizer_path),
        "max_context_length": settings.max_context_length,
        "temperature": settings.temperature,
        "top_p": settings.top_p,
    }


def load_model(
    model_path: Optional[Path] = None, device: Optional[str] = None
) -> Any:
    """Load the self-hosted local model into memory.

    In Step 1, this raises ModelNotConnectedError with explicit guidance that
    base model selection is deferred to a future phase.
    """
    target_path = model_path or settings.model_path
    target_device = device or settings.device

    # Step 1 Guardrail: Do not load or download base models yet
    raise ModelNotConnectedError(
        f"[ChemNova Step 1 Foundation] Base model at '{target_path}' is not yet connected. "
        f"Execution target is '{target_device}'. Base model selection and local weights "
        f"will be configured in a subsequent phase."
    )


def load_tokenizer(tokenizer_path: Optional[Path] = None) -> Any:
    """Load the local tokenizer corresponding to the base model.

    In Step 1, this raises ModelNotConnectedError with explicit guidance.
    """
    target_path = tokenizer_path or settings.tokenizer_path

    raise ModelNotConnectedError(
        f"[ChemNova Step 1 Foundation] Tokenizer at '{target_path}' is not yet connected. "
        f"Tokenizer setup will be configured alongside the base model selection."
    )
