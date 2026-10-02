"""Chemistry-Aware Document Chunker.

Preserves chemical reactions, molecular property cards, and spectroscopy records
as cohesive semantic units without splitting chemical equations or data tables.
"""

import re
from typing import List, Optional

from chemistry_llm.rag.configs.config import RAGConfig
from chemistry_llm.rag.documents.schema import Chunk, Document
from chemistry_llm.rag.normalization.normalizer import ChemicalNormalizer


class ChemistryAwareChunker:
    """Partitions chemistry documents while preserving atomic domain contexts."""

    def __init__(self, config: Optional[RAGConfig] = None):
        self.config = config or RAGConfig()
        self.normalizer = ChemicalNormalizer()

        # Major structural section headers (preserves complete reaction blocks with mechanisms)
        self._section_split_regex = re.compile(
            r"(?=(?:^|\n)(?:#{1,3}\s+|---+|\b(?:Reaction\s+\d+|Molecule\s+\d+|Experiment\s+\d+):))",
            re.IGNORECASE | re.MULTILINE
        )

    def chunk_document(self, doc: Document) -> List[Chunk]:
        """Split a document into chemistry-aware chunks preserving semantic integrity."""
        raw_text = doc.content.strip()
        if not raw_text:
            return []

        # 1. First split by logical chemistry sections
        raw_sections = self._section_split_regex.split(raw_text)
        sections = [s.strip() for s in raw_sections if s.strip()]

        if not sections:
            sections = [raw_text]

        chunks: List[Chunk] = []
        chunk_idx = 0

        for sec in sections:
            # Determine section type
            sec_type = self._detect_section_type(sec)

            # If section fits within configured chunk size, keep it intact
            if len(sec) <= self.config.chunk_size * 1.5:
                chunks.append(self._create_chunk(doc, sec, chunk_idx, sec_type))
                chunk_idx += 1
            else:
                # If too large, split by paragraphs or bullet items
                sub_blocks = [b.strip() for b in re.split(r"\n{2,}|\n(?=[-•*]|\d+\.)", sec) if b.strip()]
                if len(sub_blocks) <= 1:
                    sub_blocks = [b.strip() for b in sec.split("\n") if b.strip()]

                current_acc = ""

                for block in sub_blocks:
                    if len(current_acc) + len(block) + 2 <= self.config.chunk_size:
                        current_acc = f"{current_acc}\n{block}".strip()
                    else:
                        if current_acc:
                            chunks.append(self._create_chunk(doc, current_acc, chunk_idx, sec_type))
                            chunk_idx += 1
                        # If a single item is still larger than chunk_size, split by sentences
                        if len(block) > self.config.chunk_size:
                            sentence_chunks = self._split_by_sentences(block)
                            for sc in sentence_chunks:
                                chunks.append(self._create_chunk(doc, sc, chunk_idx, sec_type))
                                chunk_idx += 1
                            current_acc = ""
                        else:
                            current_acc = block

                if current_acc:
                    chunks.append(self._create_chunk(doc, current_acc, chunk_idx, sec_type))
                    chunk_idx += 1

        return chunks

    def _split_by_sentences(self, text: str) -> List[str]:
        """Split text by sentence boundaries without breaking numbers or chemical decimals."""
        sentences = re.split(r"(?<=[.!?])\s+(?=[A-Z])", text)
        result = []
        current = ""

        for s in sentences:
            if len(current) + len(s) + 1 <= self.config.chunk_size:
                current = f"{current} {s}".strip()
            else:
                if current:
                    result.append(current)
                current = s

        if current:
            result.append(current)
        return result or [text]

    def _detect_section_type(self, text: str) -> str:
        """Infer chemistry section classification from content."""
        lower = text.lower()
        if any(k in lower for k in ["reaction:", "reactants", "products", "catalyst", "yield:"]):
            return "reaction"
        if any(k in lower for k in ["mechanism", "nucleophilic", "electrophilic", "transition state"]):
            return "mechanism"
        if any(k in lower for k in ["ir spectrum", "infrared", "spectroscopy", "vibrational", "¹h nmr", "1h nmr", "13c nmr", "nmr shift", "mass spectrometry", "m/z", "uv-vis", "wavenumber", "cm⁻¹", "cm-1"]):
            return "spectroscopy"
        if any(k in lower for k in ["smiles:", "molecular weight", "formula:", "logp", "tpsa"]):
            return "molecule_property"
        if any(k in lower for k in ["safety", "hazard", "ghs", "toxic", "flammable", "ppe"]):
            return "safety"
        return "general"

    def _create_chunk(self, doc: Document, content: str, index: int, sec_type: str) -> Chunk:
        """Construct Chunk instance with chemical entities and metadata."""
        entities = self.normalizer.extract_chemical_entities(content)
        chunk_id = Chunk.create_id(doc.document_id, index, content)

        # Inherit document metadata and specify chunk details
        return Chunk(
            chunk_id=chunk_id,
            document_id=doc.document_id,
            content=content,
            chunk_index=index,
            title=doc.title,
            source=doc.source,
            source_url=doc.source_url,
            domain=doc.domain,
            subdomain=doc.subdomain,
            smiles=doc.smiles or (entities[0] if entities else None),
            molecule=doc.molecule,
            reaction=doc.reaction,
            verification_status=doc.verification_status,
            section_type=sec_type,
            chemical_entities=entities,
            metadata={
                **doc.metadata,
                "author": doc.author,
                "publication_date": doc.publication_date,
                "license": doc.license,
                "provenance": doc.provenance,
            }
        )
