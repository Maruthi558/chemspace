"""Structured Context Builder for ChemNova Local LLM Prompt Insertion."""

from typing import List, Optional, Tuple

from chemistry_llm.rag.citation.citation_engine import Citation, CitationEngine
from chemistry_llm.rag.documents.schema import Chunk
from chemistry_llm.rag.security.prompt_defense import PromptInjectionDefense


class ContextBuilder:
    """Prepares sanitized, bounded scientific context for the ChemNova LLM."""

    def __init__(self, max_context_chars: int = 1500):
        self.max_context_chars = max_context_chars
        self.defense = PromptInjectionDefense()

    def build_context(
        self,
        ranked_chunks: List[Tuple[Chunk, float]],
        web_snippets: Optional[List[dict]] = None,
    ) -> Tuple[str, List[Citation]]:
        """Construct <RETRIEVED_CONTEXT> block and list of formal citations."""
        if not ranked_chunks and not web_snippets:
            return "", []

        context_lines = ["<RETRIEVED_CONTEXT>"]
        citations: List[Citation] = []
        current_len = 0
        source_idx = 1

        # 1. Add Local RAG Documents
        for chunk, score in ranked_chunks:
            citation = CitationEngine.create_citation_from_chunk(source_idx, chunk, score)
            citations.append(citation)

            # Sanitize content
            safe_text = self.defense.sanitize_untrusted_content(chunk.content.strip())
            entry_header = f"SOURCE {source_idx}\nTitle: {chunk.title}\nSource: {chunk.source}\nStatus: {chunk.verification_status.upper()}"
            entry = f"{entry_header}\nRelevant Information:\n{safe_text}\n"

            if current_len + len(entry) <= self.max_context_chars:
                context_lines.append(entry)
                current_len += len(entry)
                source_idx += 1
            else:
                # Add truncated excerpt if space allows
                remaining_space = self.max_context_chars - current_len - len(entry_header) - 30
                if remaining_space > 100:
                    context_lines.append(f"{entry_header}\nRelevant Information:\n{safe_text[:remaining_space]}...\n")
                break

        # 2. Add Web Research Snippets if present
        if web_snippets:
            for snippet in web_snippets:
                title = snippet.get("title", "Web Research Result")
                url = snippet.get("url", "")
                text = snippet.get("snippet", snippet.get("content", ""))
                safe_text = self.defense.sanitize_untrusted_content(text.strip())

                web_citation = Citation(
                    citation_id=f"SOURCE {source_idx} (WEB)",
                    title=title,
                    source=snippet.get("domain", "Web Source"),
                    source_url=url,
                    document_id=f"web_{source_idx}",
                    domain="chemistry_current_research",
                    knowledge_type="CURRENT_WEB_RESEARCH",
                    confidence=0.90,
                    excerpt=safe_text[:200] + "...",
                )
                citations.append(web_citation)

                entry = (
                    f"SOURCE {source_idx} (CURRENT WEB RESEARCH)\n"
                    f"Title: {title}\n"
                    f"Source: {snippet.get('domain', 'Web')}\n"
                    f"URL: {url}\n"
                    f"Relevant Information:\n{safe_text}\n"
                )

                if current_len + len(entry) <= self.max_context_chars + 500:
                    context_lines.append(entry)
                    current_len += len(entry)
                    source_idx += 1

        context_lines.append("</RETRIEVED_CONTEXT>")
        return "\n".join(context_lines), citations

    def format_llm_prompt(self, query: str, context_block: str) -> str:
        """Construct full prompt for the Step 6 ChemNova model."""
        if not context_block:
            return (
                f"<SYSTEM>\nYou are ChemNova, a chemistry-focused AI assistant.\n</SYSTEM>\n"
                f"<QUESTION>\n{query}\n</QUESTION>\n<ANSWER>\n"
            )

        return (
            f"<SYSTEM>\n"
            f"You are ChemNova, a chemistry-focused AI assistant. Use the verified retrieved context below to answer "
            f"the user's chemistry question accurately and concisely. Ground your explanation in the provided data. "
            f"If the information is insufficient, state the limitation clearly.\n"
            f"</SYSTEM>\n"
            f"{context_block}\n\n"
            f"<QUESTION>\n{query}\n</QUESTION>\n<ANSWER>\n"
        )
