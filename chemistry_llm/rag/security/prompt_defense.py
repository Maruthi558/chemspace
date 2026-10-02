"""Security and Prompt-Injection Defense Layer for RAG and Web Retrieval.

Enforces strict containment of untrusted external text and prevents
retrieved documents or webpages from overriding ChemNova core instructions.
"""

import re
from typing import List, Optional, Tuple

# Suspicious directive patterns attempting prompt injection
INJECTION_DIRECTIVES = [
    re.compile(r"ignore\s+(?:previous|all|above|prior)\s+instructions?", re.IGNORECASE),
    re.compile(r"disregard\s+(?:system|previous|all)\s+(?:prompts?|instructions?)", re.IGNORECASE),
    re.compile(r"system\s+(?:override|prompt\s*injection)", re.IGNORECASE),
    re.compile(r"you\s+are\s+now\s+(?:an?\s+unrestricted|in\s+developer\s+mode|dan\b)", re.IGNORECASE),
    re.compile(r"(?:reveal|print|output|display)\s+(?:all\s+)?(?:secret|password|api[_\s]?key|credentials|system\s+prompt)", re.IGNORECASE),
    re.compile(r"execute\s+(?:arbitrary|code|command|shell)", re.IGNORECASE),
    re.compile(r"bypass\s+all\s+(?:filters|safety|guardrails)", re.IGNORECASE),
    re.compile(r"admin\s+mode\s+enabled", re.IGNORECASE),
]


class PromptInjectionDefense:
    """Detects, sanitizes, and neutralizes prompt-injection payloads in retrieved texts."""

    @classmethod
    def scan_for_injection(cls, text: str) -> Tuple[bool, List[str]]:
        """Inspect text for prompt-injection signatures."""
        detected = []
        for pattern in INJECTION_DIRECTIVES:
            matches = pattern.findall(text)
            if matches:
                detected.append(pattern.pattern)
        return len(detected) > 0, detected

    @classmethod
    def sanitize_untrusted_content(cls, text: str) -> str:
        """Sanitize text by neutralizing injection patterns and tag escaping."""
        cleaned = text

        # 1. Defend against tag injection / envelope breakout
        cleaned = cleaned.replace("</SOURCE_DATA>", "&lt;/SOURCE_DATA&gt;")
        cleaned = cleaned.replace("<SOURCE_DATA", "&lt;SOURCE_DATA")
        cleaned = cleaned.replace("</RETRIEVED_CONTEXT>", "&lt;/RETRIEVED_CONTEXT&gt;")
        cleaned = cleaned.replace("<SYSTEM>", "&lt;SYSTEM&gt;")
        cleaned = cleaned.replace("</SYSTEM>", "&lt;/SYSTEM&gt;")

        # 2. Neutralize suspicious override directives
        for pattern in INJECTION_DIRECTIVES:
            cleaned = pattern.sub("[REDACTED_INJECTION_ATTEMPT]", cleaned)

        return cleaned

    @classmethod
    def wrap_in_data_envelope(
        cls,
        source_id: str,
        title: str,
        content: str,
        source_url: Optional[str] = None,
        verification_status: str = "verified",
    ) -> str:
        """Wrap retrieved content into an immutable, passive data boundary."""
        safe_content = cls.sanitize_untrusted_content(content)
        url_line = f"URL: {source_url}\n" if source_url else ""

        return (
            f'<SOURCE_DATA id="{source_id}" status="{verification_status}" type="PASSIVE_DATA_ONLY">\n'
            f"Title: {title}\n"
            f"{url_line}"
            f"Content:\n{safe_content}\n"
            f"</SOURCE_DATA>"
        )
