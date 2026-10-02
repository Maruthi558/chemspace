"""Web Research Orchestration Engine for ChemNova Chemistry AI."""

import logging
from typing import Any, Dict, List, Optional

from chemistry_llm.web_research.freshness import FreshnessChecker
from chemistry_llm.web_research.provider import (
    BaseSearchProvider,
    ExternalAPISearchProvider,
    MockChemistryWebSearchProvider,
    WebSearchResult,
)
from chemistry_llm.web_research.security import WebResearchSecurity
from chemistry_llm.web_research.validator import SourceValidator

logger = logging.getLogger("chemistry_llm.web_research.engine")


class WebResearchEngine:
    """Coordinates search, SSRF defense, domain validation, sanitization, and citation packaging."""

    def __init__(
        self,
        provider: Optional[BaseSearchProvider] = None,
        validator: Optional[SourceValidator] = None,
    ):
        self.provider = provider or ExternalAPISearchProvider()
        self.validator = validator or SourceValidator()
        self.security = WebResearchSecurity()
        self.freshness = FreshnessChecker()

    def is_live_api_active(self) -> bool:
        """Return whether an external search API key is configured."""
        if isinstance(self.provider, ExternalAPISearchProvider):
            return self.provider.is_configured()
        return False

    def research(self, query: str, num_results: int = 3) -> Dict[str, Any]:
        """Execute safe web research query and return sanitized results."""
        clean_q = (query or "").strip()
        if not clean_q:
            return {"query": "", "results": [], "trusted_count": 0}

        # 1. Query external / mock search provider
        raw_results: List[WebSearchResult] = self.provider.search(clean_q, num_results=num_results * 2)

        safe_results = []
        for r in raw_results:
            # 2. SSRF URL Validation
            is_safe, reason = self.security.validate_url_safe(r.url)
            if not is_safe:
                logger.warning("Blocked outbound request to unsafe URL '%s': %s", r.url, reason)
                continue

            # 3. Content Sanitization & Prompt Injection Defense
            clean_snippet = self.security.sanitize_web_snippet(r.snippet)
            clean_title = self.security.sanitize_web_snippet(r.title)

            safe_results.append({
                "title": clean_title,
                "url": r.url,
                "snippet": clean_snippet,
                "domain": self.validator.extract_domain(r.url),
                "is_trusted_academic": self.validator.is_trusted_domain(r.url),
                "published_date": r.published_date,
                "confidence": r.confidence,
            })

        # 4. Rank trusted academic publishers first
        safe_results.sort(key=lambda x: (x["is_trusted_academic"], x["confidence"]), reverse=True)
        final_selection = safe_results[:num_results]

        return {
            "query": clean_q,
            "results": final_selection,
            "total_found": len(final_selection),
            "trusted_count": sum(1 for x in final_selection if x["is_trusted_academic"]),
            "provider_type": type(self.provider).__name__,
        }
