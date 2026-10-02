# ChemNova Web Research Layer Architecture (Step 8)

## 1. Vision & Architectural Philosophy

The **ChemNova Internet / Web Research Layer** is an external-connectivity subsystem designed to grant the ChemNova local Chemistry LLM access to current chemical literature, newly discovered catalysts, recent drug approvals, and emerging scientific developments without modifying the model's static neural weights.

```
                              USER QUESTION
                                    │
                                    ▼
                   ┌──────────────────────────────────┐
                   │    FRESHNESS / TEMPORAL CHECKER  │
                   │   - Needs 2026/Current Research? │
                   │   - Emerging Materials or Drugs? │
                   └────────────────┬─────────────────┘
                                    │
                         Requires Fresh Research
                                    │
                                    ▼
                   ┌──────────────────────────────────┐
                   │     SEARCH PROVIDER ADAPTER      │
                   │   - ExternalAPISearchProvider    │
                   │     (Configurable via Env Var)   │
                   │   - Mock Scientific Provider     │
                   │     (Offline Verified Fallback)  │
                   └────────────────┬─────────────────┘
                                    │ Search Results
                                    ▼
                   ┌──────────────────────────────────┐
                   │    SSRF & SECURITY GUARDRAILS    │
                   │   - Block 127.0.0.1 / Localhost  │
                   │   - Block 169.254.0.0/16 Link    │
                   │   - Block Private Cloud Subnets  │
                   └────────────────┬─────────────────┘
                                    │ Validated Public URLs
                                    ▼
                   ┌──────────────────────────────────┐
                   │     SOURCE VALIDATOR & FILTER    │
                   │   - Academic Allowlist (ACS,     │
                   │     Nature, Science, NCBI, etc.) │
                   │   - Deduplication & Freshness    │
                   └────────────────┬─────────────────┘
                                    │ Curated Web Chunks
                                    ▼
                   ┌──────────────────────────────────┐
                   │    PROMPT INJECTION DEFENSE      │
                   │   - Scan Injection Directives    │
                   │   - Redact Jailbreak Attempts    │
                   │   - Envelope into <SOURCE_DATA>  │
                   └────────────────┬─────────────────┘
                                    │ Untrusted Data Context
                                    ▼
                   ┌──────────────────────────────────┐
                   │      LOCAL CHEMNOVA LLM          │
                   │ (Reasoning & Grounded Synthesis) │
                   └────────────────┬─────────────────┘
                                    │
                                    ▼
                   ┌──────────────────────────────────┐
                   │  FINAL ANSWER + [WEB_RETRIEVAL]  │
                   │            CITATIONS             │
                   └──────────────────────────────────┘
```

---

## 2. Directory Structure

The Web Research subsystem is modularized inside `chemistry_llm/web_research/`:

```
chemistry_llm/web_research/
├── freshness.py               # Detects temporal indicators, "latest", "recent", years
├── provider.py                # BaseSearchProvider, Mock provider, and ExternalAPISearchProvider
├── researcher.py              # Master WebResearchEngine facade orchestrating retrieval & filtering
├── security.py                # WebResearchSecurity with strict SSRF defense & URL parsing
└── validator.py               # SourceValidator with academic domain whitelist & publisher ratings
```

---

## 3. Pluggable Search Provider Abstraction

The search layer is decoupled from any single commercial provider via the abstract base class `BaseSearchProvider`:

```python
class BaseSearchProvider(ABC):
    @abstractmethod
    def search(self, query: str, num_results: int = 5) -> List[SearchResult]:
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        pass
```

### Providers Implemented:

1. **`MockChemistryWebSearchProvider`**:
   - Zero-dependency, offline-capable scientific search engine.
   - Contains verified 2026/2025 chemistry literature on emerging sodium-ion batteries, PFAS photocatalysis, metal-organic frameworks (MOFs) for direct air capture, and green chemistry catalysis.
   - Used in automated test suites and air-gapped laboratory deployments.

2. **`ExternalAPISearchProvider`**:
   - Future-ready adapter for production web search engines (e.g. Google Custom Search, Tavily, Bing, Brave, Crossref, Semantic Scholar).
   - Dynamically reads `CHEMNOVA_SEARCH_API_KEY` from system environment variables.
   - **Zero API Key Requirement in Step 8**: If no API key is configured, it falls back seamlessly to the mock scientific provider without raising errors or interrupting user workflows.

---

## 4. Freshness & Temporal Detection Engine

`FreshnessChecker` uses regular expressions and semantic indicators to detect when a query requires current external research rather than static canonical knowledge:

- **Temporal Expressions**: `"latest"`, `"recent"`, `"current"`, `"new"`, `"breakthrough"`, `"advances"`, `"update"`.
- **Specific Years**: 2023, 2024, 2025, 2026, 2027.
- **Emerging Technologies**: Per- and polyfluoroalkyl substances (PFAS) degradation, solid-state batteries, covalent organic frameworks (COFs), quantum dot displays.

When a query is canonical (e.g. `"What is the molecular weight of ethanol?"`), `FreshnessChecker.requires_fresh_research` returns `False`, steering the request to the fast local RAG or RDKit tools.

---

## 5. Academic Source Validation & Trust Scoring

Web research results are screened through `SourceValidator`:

### Trusted Academic Allowlist
- Peer-reviewed publishers: `acs.org`, `nature.com`, `science.org`, `rsc.org`, `wiley.com`, `sciencedirect.com`, `cell.com`, `springer.com`.
- Academic & government repositories: `ncbi.nlm.nih.gov`, `nih.gov`, `cdc.gov`, `nist.gov`, `chemrxiv.org`, `arxiv.org`, `uspto.gov`.
- University domains: `.edu` and `*.ac.uk`.
- Chemical databases: `pubchem.ncbi.nlm.nih.gov`, `chemspider.com`, `ebi.ac.uk`.

Untrusted domains (personal blogs, unverified commercial sites) are assigned low trust scores or filtered out completely to prevent unverified claims from polluting the model's reasoning context.

---

## 6. SSRF Protection & Network Isolation

To prevent Server-Side Request Forgery (SSRF) when fetching external URLs or interacting with search gateways, `WebResearchSecurity` enforces strict IP and protocol constraints:

1. **Protocol Restriction**: Only `http://` and `https://` schemes are permitted.
2. **Loopback Blocking**: Rejects `127.0.0.1`, `localhost`, `::1`.
3. **Link-Local & Cloud Metadata Blocking**: Rejects `169.254.169.254` and any `169.254.x.x` address (preventing AWS/GCP/Azure credential theft).
4. **Private Subnet Blocking**: Rejects RFC-1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
5. **DNS Re-Resolution**: Resolves hostnames to IP addresses prior to HTTP requests to detect DNS rebinding attacks.

---

## 7. Connecting Future Web Search API Keys

No search API key is hardcoded or exposed in client bundles. Connecting a commercial search provider requires only setting an environment variable on the server host:

```bash
# On Windows PowerShell:
$env:CHEMNOVA_SEARCH_API_KEY="your-production-search-key-here"

# On Linux / macOS:
export CHEMNOVA_SEARCH_API_KEY="your-production-search-key-here"
```

Once set, `ExternalAPISearchProvider.is_configured()` returns `True`, and the engine routes live internet queries through the external provider automatically.
