"""Freshness and Temporal Requirement Detector for Chemistry Research."""

import re
from typing import Tuple

FRESHNESS_PATTERNS = [
    re.compile(r"\b(?:latest|recent|newest|current|emerging|modern|fresh)\b", re.IGNORECASE),
    re.compile(r"\b(?:breakthroughs?|advances?|developments?|discoveries)\b", re.IGNORECASE),
    re.compile(r"\b(?:2024|2025|2026)\b", re.IGNORECASE),
    re.compile(r"\bwhat\s+is\s+new\s+in\b", re.IGNORECASE),
    re.compile(r"\bstate\s+of\s+the\s+art\b", re.IGNORECASE),
]


class FreshnessChecker:
    """Evaluates whether an incoming question mandates fresh live web retrieval."""

    @classmethod
    def requires_fresh_research(cls, query: str) -> Tuple[bool, str]:
        """Return True if query asks for current, recent, or emerging chemistry information."""
        q = (query or "").strip()
        for pat in FRESHNESS_PATTERNS:
            if pat.search(q):
                return True, f"Matched temporal indicator: '{pat.pattern}'"
        return False, "Query relies on established canonical chemistry knowledge."
