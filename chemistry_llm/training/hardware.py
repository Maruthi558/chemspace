"""Hardware detection and system profiling for ChemNova-LLM training."""

import logging
import os
import platform
from typing import Any, Dict
import torch

logger = logging.getLogger("chemistry_llm.training.hardware")


def detect_hardware(preferred_device: str = "auto") -> Dict[str, Any]:
    """Detect available compute hardware, memory, and accelerator capabilities."""
    info: Dict[str, Any] = {
        "os": platform.system(),
        "os_release": platform.release(),
        "architecture": platform.machine(),
        "python_version": platform.python_version(),
        "torch_version": torch.__version__,
        "cpu_count": os.cpu_count() or 1,
        "cuda_available": torch.cuda.is_available(),
        "mps_available": getattr(torch.backends, "mps", None) is not None and torch.backends.mps.is_available(),
    }

    if preferred_device.lower() == "cuda" and torch.cuda.is_available():
        selected_device = "cuda"
    elif preferred_device.lower() == "mps" and info["mps_available"]:
        selected_device = "mps"
    elif preferred_device.lower() == "cpu":
        selected_device = "cpu"
    else:
        # Auto mode
        if torch.cuda.is_available():
            selected_device = "cuda"
        elif info["mps_available"]:
            selected_device = "mps"
        else:
            selected_device = "cpu"

    info["device"] = selected_device

    if selected_device == "cuda":
        info["device_name"] = torch.cuda.get_device_name(0)
        info["device_count"] = torch.cuda.device_count()
        vram_bytes = torch.cuda.get_device_properties(0).total_memory
        info["vram_total_gb"] = round(vram_bytes / (1024**3), 2)
        info["supports_bfloat16"] = torch.cuda.is_bf16_supported()
        info["supports_fp16"] = True
    else:
        info["device_name"] = platform.processor() or "Generic CPU"
        info["device_count"] = 1
        info["vram_total_gb"] = 0.0
        info["supports_bfloat16"] = False
        info["supports_fp16"] = False

    logger.info("Hardware Detected: %s on %s (%s)", info["device_name"], info["device"], info["torch_version"])
    return info


def get_torch_device(preferred_device: str = "auto") -> torch.device:
    """Return torch.device instance based on hardware detection."""
    hw = detect_hardware(preferred_device)
    return torch.device(hw["device"])
