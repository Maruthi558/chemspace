"""Chemical notation and formula formatting helpers."""

import re


def format_chemical_formula(raw_formula: str, target_format: str = "markdown") -> str:
    """Format an empirical chemical formula into Markdown or HTML with proper subscripts.

    Example: 'C9H8O4' -> 'C~9~H~8~O~4~' (Markdown) or 'C<sub>9</sub>H<sub>8</sub>O<sub>4</sub>' (HTML)
    """
    if not raw_formula:
        return ""

    if target_format == "html":
        return re.sub(r"([A-Za-z\)])(\d+)", r"\1<sub>\2</sub>", raw_formula)
    elif target_format == "markdown":
        # Standard GFM subscript syntax
        return re.sub(r"([A-Za-z\)])(\d+)", r"\1~\2~", raw_formula)
    elif target_format == "latex":
        return re.sub(r"([A-Za-z\)])(\d+)", r"\1_{\2}", raw_formula)
    return raw_formula


def format_molecular_weight(mw: float) -> str:
    """Format molecular weight float into standard chemistry display string."""
    return f"{mw:.2f} g/mol"
