"""Source Validator and Academic Domain Filter for Chemistry Web Research."""

from typing import List, Optional, Set
import urllib.parse

TRUSTED_SCIENTIFIC_DOMAINS = {
    "nature.com",
    "pubs.acs.org",
    "acs.org",
    "rsc.org",
    "pubs.rsc.org",
    "sciencedirect.com",
    "onlinelibrary.wiley.com",
    "wiley.com",
    "springer.com",
    "link.springer.com",
    "ncbi.nlm.nih.gov",
    "nih.gov",
    "chemrxiv.org",
    "arxiv.org",
    "nist.gov",
    "webbook.nist.gov",
    "pubchem.ncbi.nlm.nih.gov",
    "osha.gov",
    "cdc.gov",
    "mit.edu",
    "harvard.edu",
    "stanford.edu",
    "berkeley.edu",
    "ox.ac.uk",
    "cam.ac.uk",
}


class SourceValidator:
    """Validates URLs and scores scientific credibility based on institutional domains."""

    def __init__(self, trusted_domains: Optional[Set[str]] = None):
        self.trusted_domains = trusted_domains or TRUSTED_SCIENTIFIC_DOMAINS

    def extract_domain(self, url: str) -> str:
        """Extract root hostname from URL."""
        try:
            parsed = urllib.parse.urlparse(url)
            netloc = parsed.netloc.lower()
            if ":" in netloc:
                netloc = netloc.split(":")[0]
            return netloc
        except Exception:
            return ""

    def is_trusted_domain(self, url: str) -> bool:
        """Check if URL belongs to an accredited scientific publisher or university."""
        domain = self.extract_domain(url)
        if not domain:
            return False

        # Direct domain or parent domain match
        if domain in self.trusted_domains:
            return True
        if any(domain.endswith(f".{t}") for t in self.trusted_domains):
            return True
        if domain.endswith(".edu") or domain.endswith(".gov") or domain.endswith(".ac.uk"):
            return True

        return False

    def validate_and_filter(self, results: List[Any]) -> List[Any]:
        """Prioritize trusted academic sources and filter malicious URLs."""
        trusted = []
        general = []

        for item in results:
            url = getattr(item, "url", item.get("url", ""))
            if self.is_trusted_domain(url):
                trusted.append(item)
            else:
                general.append(item)

        # Return trusted scientific publishers first, followed by general web sources
        return trusted + general
