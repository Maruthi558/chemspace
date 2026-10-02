"""Text and Document Sanitizer for Chemistry RAG Pipeline."""

import html
import re
import unicodedata
from typing import Optional


class DocumentCleaner:
    """Sanitizes raw scientific documents while preserving chemical notation."""

    def __init__(self):
        # Strips dangerous script and HTML tags
        self._script_regex = re.compile(r"<(script|style|iframe|object|embed)[^>]*>.*?</\1>", re.IGNORECASE | re.DOTALL)
        self._tag_regex = re.compile(r"<[^>]+>")
        self._control_chars_regex = re.compile(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]")

    def clean(self, text: Optional[str]) -> str:
        """Sanitize text input into clean, normalized scientific text."""
        if not text:
            return ""

        # 1. Unescape HTML entities (e.g. &alpha; -> α, &Delta; -> Δ)
        clean_text = html.unescape(text)

        # 2. Strip scripts and embedded objects
        clean_text = self._script_regex.sub(" ", clean_text)

        # 3. Strip remaining generic HTML markup
        clean_text = self._tag_regex.sub(" ", clean_text)

        # 4. Remove binary control characters
        clean_text = self._control_chars_regex.sub("", clean_text)

        # 5. Unicode normalization (NFKC preserves characters like cm⁻¹ and °C)
        clean_text = unicodedata.normalize("NFKC", clean_text)

        # 6. Normalize whitespace: reduce multiple consecutive blank lines to 2, trim lines
        lines = [re.sub(r"[ \t]+", " ", line).strip() for line in clean_text.splitlines()]
        filtered_lines = []
        consecutive_blanks = 0

        for line in lines:
            if not line:
                consecutive_blanks += 1
                if consecutive_blanks <= 2:
                    filtered_lines.append("")
            else:
                consecutive_blanks = 0
                filtered_lines.append(line)

        return "\n".join(filtered_lines).strip()
