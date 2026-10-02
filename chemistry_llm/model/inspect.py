"""Model parameter and architecture inspection tool for ChemNova-LLM.

Usage:
    python -m chemistry_llm.model.inspect
"""

import sys
from chemistry_llm.config.model_config import ChemNovaModelConfig, detect_device
from chemistry_llm.model.language_model import ChemNovaLanguageModel


def format_number(n: int) -> str:
    """Format large numbers with commas and approximate suffix."""
    if n >= 1_000_000:
        return f"{n:,} ({n / 1_000_000:.2f}M)"
    if n >= 1_000:
        return f"{n:,} ({n / 1_000:.2f}K)"
    return f"{n:,}"


def generate_inspection_report(config: ChemNovaModelConfig = None) -> str:
    """Generate human-readable architecture and parameter inspection report."""
    if config is None:
        config = ChemNovaModelConfig()

    model = ChemNovaLanguageModel(config)
    info = model.inspect_parameters()
    device = detect_device()

    lines = [
        "=" * 60,
        "   CHEMNOVA-LLM ARCHITECTURE & PARAMETER INSPECTION REPORT",
        "=" * 60,
        f"Model Identity:           {info['model_name']} (v{info['version']})",
        f"Architecture Type:        Decoder-Only Causal Transformer",
        f"Trainable Weights:        Initialized From Scratch (No Pretrained Weights)",
        "-" * 60,
        f"Total Parameters:         {format_number(info['total_parameters'])}",
        f"Trainable Parameters:     {format_number(info['trainable_parameters'])}",
        f"Model Layers (Blocks):    {info['model_layers']}",
        f"Hidden Dimension (d_model):{info['hidden_dimension']}",
        f"Attention Heads:          {info['attention_heads']} (head_dim = {info['hidden_dimension'] // info['attention_heads']})",
        f"Context Length:           {info['context_length']} tokens",
        f"Vocabulary Size:          {info['vocabulary_size']} tokens",
        f"Feed-Forward Dimension:   {info['feed_forward_dimension']}",
        f"Dropout Rate:             {info['dropout']}",
        f"Weight Tying:             {'Enabled (Embedding & LM-Head Shared)' if info['tie_weights'] else 'Disabled'}",
        f"Normalization:            {info['normalization_type']}",
        f"Compute Device Detected:  {device.upper()}",
        "-" * 60,
        "Layer Breakdown:",
    ]

    for name, param in model.named_parameters():
        shape_str = str(list(param.shape))
        lines.append(f"  • {name:<40} {shape_str:<22} {param.numel():>10,} params")

    lines.extend([
        "=" * 60,
        "Status: EMPTY / TRAINABLE LLM BRAIN (Ready for training pipeline)",
        "=" * 60,
    ])

    return "\n".join(lines)


def main():
    report = generate_inspection_report()
    print(report)


if __name__ == "__main__":
    main()
