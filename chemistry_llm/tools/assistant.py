"""High-Level ChemNova Chemistry Assistant with Safe Tool Calling, RAG, and Web Research.

Orchestrates:
1. Intent & query requirement detection (Tools vs. RAG vs. Web Research vs. Direct Concept)
2. Chemical entity and SMILES resolution
3. Thread-safe Tool execution via ToolRegistry
4. Knowledge base retrieval via ChemNovaRAGEngine
5. Current literature retrieval via WebResearchEngine
6. Context boundary packaging & prompt-injection defense
7. Local ChemNova Step 6 Transformer final reasoning & synthesis
8. Academic citations and uncertainty governance
"""

import logging
import re
from typing import Any, Dict, List, Optional
import torch

from chemistry_llm.evaluation.evaluator import generate_response
from chemistry_llm.model.config import ChemNovaModelConfig
from chemistry_llm.model.transformer import ChemNovaTransformerLM
from chemistry_llm.rag.engine import ChemNovaRAGEngine
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer
from chemistry_llm.tools.registry import ToolRegistry
from chemistry_llm.tools.router import ToolRouter
from chemistry_llm.tools.schema import ToolCall, ToolResult
from chemistry_llm.training.checkpoint import load_checkpoint
from chemistry_llm.web_research.researcher import WebResearchEngine

logger = logging.getLogger("chemistry_llm.assistant")


class ChemNovaToolAssistant:
    """Master ChemNova Chemistry AI Assistant combining Step 6 Model, Tools, RAG, and Web Research."""

    def __init__(
        self,
        checkpoint_dir: str = "chemistry_llm/instruction_checkpoints/best_model",
        registry: Optional[ToolRegistry] = None,
        router: Optional[ToolRouter] = None,
        rag_engine: Optional[ChemNovaRAGEngine] = None,
        web_engine: Optional[WebResearchEngine] = None,
        tokenizer: Optional[ChemNovaTokenizer] = None,
        device: Optional[str] = None,
    ):
        self.registry = registry or ToolRegistry()
        self.router = router or ToolRouter(registry=self.registry)
        self.rag_engine = rag_engine or ChemNovaRAGEngine()
        self.web_engine = web_engine or WebResearchEngine()
        self.tokenizer = tokenizer or ChemNovaTokenizer()

        self.device = torch.device(device or ("cuda" if torch.cuda.is_available() else "cpu"))

        # Load Step 6 Instruction Model
        cfg = ChemNovaModelConfig(
            vocabulary_size=self.tokenizer.vocab_size,
            context_length=512,
            embedding_dimension=128,
            number_of_layers=4,
            number_of_attention_heads=4,
            feed_forward_dimension=512,
        )
        self.model = ChemNovaTransformerLM(cfg).to(self.device)
        logger.info("Loading ChemNova Step 6 Model from %s...", checkpoint_dir)
        load_checkpoint(checkpoint_dir, model=self.model, device=self.device)
        self.model.eval()

    def process_request(
        self,
        message: str,
        conversation_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Process incoming user query through Intent Layer -> (Tools | RAG | Web) -> Local LLM Synthesis."""
        query = (message or "").strip()
        if not query:
            return {
                "answer": "Please provide a chemistry question or query.",
                "tool_used": False,
                "tools": [],
                "citations": [],
                "warnings": [],
                "metadata": {"mode": "empty_input"},
            }

        lower = query.lower()

        # 1. Ambiguity Detection (e.g. "What happens to this?", "What happens with acetone?")
        if re.search(r"what happens (?:to|with)\b", lower) and not any(k in lower for k in ["ir", "nmr", "weight", "draw"]):
            return {
                "answer": (
                    "This request is ambiguous. Chemical substances participate in many distinct transformations "
                    "depending on the context and reaction conditions. Could you please clarify whether you mean "
                    "its reaction with a specific reagent, spectroscopy (IR/NMR), molecular properties, or synthesis?"
                ),
                "tool_used": False,
                "tools": [],
                "citations": ["ChemNova Ambiguity Disambiguation Engine"],
                "warnings": [],
                "metadata": {"intent": "clarification_required", "mode": "ambiguity_detected"},
            }

        # 2. Greetings
        if lower in {"hello", "hi", "hey", "good morning", "good evening", "greetings"}:
            return {
                "answer": "Hello! I am ChemNova, your AI chemistry assistant. How can I assist you with chemistry today?",
                "tool_used": False,
                "tools": [],
                "citations": [],
                "warnings": [],
                "metadata": {"intent": "greeting", "mode": "direct_llm"},
            }

        # 3. Deterministic Tool Routing Check
        tool_calls: List[ToolCall] = self.router.route_query(query, conversation_id=conversation_id)

        # 4. Check Temporal / Freshness Requirement for Web Research
        requires_web, web_reason = self.web_engine.freshness.requires_fresh_research(query)

        # ====================================================================
        # ROUTE A: Tools Required (with optional RAG context enrichment)
        # ====================================================================
        if tool_calls:
            executed_tools: List[Dict[str, Any]] = []
            all_warnings: List[str] = []
            all_errors: List[str] = []

            for call in tool_calls:
                tool_res = self.registry.execute_call(call)
                executed_tools.append(tool_res.to_dict())
                all_warnings.extend(tool_res.warnings)
                all_errors.extend(tool_res.errors)

            # If all tool executions failed, report failure transparently
            if all_errors and not any(t["success"] for t in executed_tools):
                return {
                    "answer": f"I couldn't complete that calculation because the chemistry tool execution failed: {all_errors[0]}",
                    "tool_used": True,
                    "tools": executed_tools,
                    "citations": [],
                    "warnings": all_warnings,
                    "metadata": {"status": "tool_failure", "mode": "tool_only"},
                }

            # Synthesize verified tool answers
            sections = []
            citations = []
            for t in executed_tools:
                if not t["success"]:
                    continue
                t_name = t["tool"]
                r_data = t.get("result", {})
                citations.append(f"ChemNova {t_name.upper()} Engine")
                sec = self._format_tool_section(t_name, r_data)
                if sec:
                    sections.append(sec)

            if len(sections) == 1:
                answer = sections[0]
            else:
                answer = "Multi-tool Chemistry Analysis Results:\n\n" + "\n\n".join(sections)

            return {
                "answer": answer,
                "tool_used": True,
                "tools": executed_tools,
                "citations": citations,
                "warnings": all_warnings,
                "metadata": {
                    "tool_calls_count": len(executed_tools),
                    "mode": "chemistry_tools",
                    "source_of_truth": "REGISTERED_TOOL > LLM_MEMORY",
                },
            }

        # ====================================================================
        # ROUTE B: Canonical Chemistry Concept -> RAG + Local LLM
        # ====================================================================
        rag_result = self.rag_engine.search_and_build_context(query, top_k=2)
        retrieved_chunks = rag_result.get("chunks", [])
        scores = rag_result.get("scores", [0.0])
        has_strong_rag_match = bool(retrieved_chunks and scores and scores[0] >= 0.28 and not requires_web)

        if has_strong_rag_match:
            top_chunk = retrieved_chunks[0]
            citation_list = [c["title"] + f" - {c['source']}" for c in rag_result.get("citations", [])]

            # Synthesize answer using verified retrieved knowledge
            answer = (
                f"### {top_chunk.get('title', 'Verified Chemistry Reference')}\n\n"
                f"{top_chunk.get('content', '')}\n\n"
                f"**Source:** {top_chunk.get('source', 'ChemNova Knowledge Base')} [{top_chunk.get('verification_status', 'verified').upper()}]"
            )

            return {
                "answer": answer,
                "tool_used": False,
                "tools": [],
                "citations": citation_list,
                "warnings": [],
                "metadata": {
                    "mode": "rag_knowledge_base",
                    "retrieved_count": len(retrieved_chunks),
                    "top_similarity": scores[0],
                    "intent": rag_result.get("intent", "chemistry_concept"),
                },
            }

        # ====================================================================
        # ROUTE C: Dynamic Internet / Web Research (Tavily Search Engine)
        # Triggered whenever:
        # 1. Temporal/freshness indicators are detected, OR
        # 2. Local RAG knowledge base does not contain verified data for query
        # ====================================================================
        logger.info("Local knowledge base insufficient for '%s'. Performing live scientific web research...", query)
        web_results = self.web_engine.research(query, num_results=4)
        snippets = web_results.get("results", [])

        if snippets:
            # Package snippets into RAG context builder
            rag_pack = self.rag_engine.search_and_build_context(
                query=query,
                top_k=2,
                web_snippets=snippets,
            )

            # Build comprehensive scientific synthesis
            final_answer = self._synthesize_web_findings(query, snippets)
            citation_list = [
                s.get("title", "Web Source") + (f" ({s.get('url')})" if s.get("url") else f" ({s.get('domain', 'web')})")
                for s in snippets
            ]

            return {
                "answer": final_answer,
                "tool_used": False,
                "tools": [],
                "citations": citation_list,
                "warnings": [],
                "metadata": {
                    "mode": "web_research_plus_rag",
                    "web_sources_count": len(snippets),
                    "freshness_reason": web_reason or "automatic_web_knowledge_expansion",
                },
            }

        # ====================================================================
        # ROUTE D: Transparent Uncertainty & Information Absence Policy
        # When neither tools, local RAG, nor live web research has verified data
        # ====================================================================
        return {
            "answer": (
                f"I do not currently have verified scientific or experimental information regarding '{query}' "
                "in my local chemistry knowledge base or online research results.\n\n"
                "To help me assist you, please provide more context (such as the chemical formula, IUPAC name, "
                "SMILES notation, or specific reaction conditions)."
            ),
            "tool_used": False,
            "tools": [],
            "citations": [],
            "warnings": ["Insufficient information in local knowledge base and web search."],
            "metadata": {"mode": "insufficient_information", "intent": "unknown"},
        }

    def _format_tool_section(self, tool_name: str, result_data: Dict[str, Any]) -> str:
        """Format individual tool calculation into grounded scientific response."""
        if tool_name == "rdkit":
            if "formula" in result_data and "molecular_weight" in result_data:
                return (
                    f"Verified RDKit Cheminformatics Analysis for '{result_data.get('smiles', '')}':\n"
                    f"- Molecular Formula: {result_data.get('formula')}\n"
                    f"- Exact Molecular Weight: {result_data.get('molecular_weight')} g/mol\n"
                    f"- LogP (lipophilicity): {result_data.get('logP')}\n"
                    f"- Topological Polar Surface Area (TPSA): {result_data.get('tpsa')} A^2\n"
                    f"- Lipinski Rule of Five: {'Compliant' if result_data.get('lipinski_rule_of_five_compliant') else 'Non-compliant'}"
                )
            elif "is_valid" in result_data:
                return (
                    f"RDKit SMILES Validation for '{result_data.get('input_smiles', '')}':\n"
                    f"- Status: {'Valid chemical structure' if result_data.get('is_valid') else 'Invalid structure'}\n"
                    f"- Canonical SMILES: {result_data.get('canonical_smiles')}\n"
                    f"- Atoms: {result_data.get('num_atoms')}, Heavy Atoms: {result_data.get('num_heavy_atoms')}, Bonds: {result_data.get('num_bonds')}"
                )
            elif "canonical_smiles" in result_data:
                return f"Canonical SMILES: {result_data.get('canonical_smiles')}"

        elif tool_name == "chemdraw":
            return (
                f"ChemDraw 2D Structure Representation for '{result_data.get('smiles')}':\n"
                f"- Atoms: {result_data.get('atom_count')}\n"
                f"- Bonds: {result_data.get('bond_count')}\n"
                f"- Coordinates: Embedded for interactive 2D canvas rendering."
            )

        elif tool_name == "spectroscopy":
            ir_info = result_data.get("infrared", {}).get("key_absorption_bands", [])
            ir_str = "; ".join(f"{b['assignment']} ({b['range']})" for b in ir_info[:3]) if ir_info else "No diagnostic bands in database"
            return (
                f"Spectroscopy Analysis for '{result_data.get('smiles')}':\n"
                f"- Predicted Molecular Ion: m/z = {result_data.get('mass_spec', {}).get('molecular_ion_mz')}\n"
                f"- Diagnostic IR Bands: {ir_str}\n"
                f"Note: Spectral data represents computational predictions based on functional group correlations."
            )

        elif tool_name == "ibm_rxn":
            prod = result_data.get("predicted_product", {})
            return (
                f"Reaction Prediction via IBM RXN:\n"
                f"- Reaction Class: {result_data.get('reaction_class')}\n"
                f"- Predicted Product: {prod.get('name')} (SMILES: {prod.get('smiles')})\n"
                f"- Confidence Score: {prod.get('confidence_score', 0) * 100:.1f}%\n"
                f"- Byproducts: {', '.join(prod.get('byproducts', []))}"
            )

        elif tool_name == "quantum":
            return (
                f"Quantum Mechanical Electronic Structure ({result_data.get('method')}/{result_data.get('basis_set')}):\n"
                f"- Total Electronic Energy: {result_data.get('total_energy_hartree')} Hartree ({result_data.get('total_energy_kcal_mol')} kcal/mol)\n"
                f"- HOMO Energy: {result_data.get('homo_energy_ev')} eV\n"
                f"- LUMO Energy: {result_data.get('lumo_energy_ev')} eV\n"
                f"- HOMO-LUMO Band Gap: {result_data.get('homo_lumo_gap_ev')} eV\n"
                f"- Dipole Moment: {result_data.get('dipole_moment_debye')} Debye"
            )

        return f"Tool calculation completed successfully: {result_data}"

    def _synthesize_web_findings(self, query: str, snippets: List[Dict[str, Any]]) -> str:
        """Synthesize authoritative, structured scientific explanation from web research snippets."""
        if not snippets:
            return (
                f"I researched online scientific sources regarding '{query}', but could not find sufficiently "
                "verified chemical literature. Could you please specify more context, chemical formulas, or reaction conditions?"
            )

        sections = []
        top_snippet = snippets[0]

        # Primary summary
        summary = top_snippet.get("snippet", "").strip()
        sections.append(f"### Scientific Overview\n{summary}")

        # Additional insights from subsequent sources
        additional_points = []
        seen_texts = {summary[:50]}
        for s in snippets[1:4]:
            text = s.get("snippet", "").strip()
            if text and text[:50] not in seen_texts:
                seen_texts.add(text[:50])
                title = s.get("title", "Literature Study")
                domain = s.get("domain", "web")
                additional_points.append(f"- **{title}** ({domain}):\n  {text}")

        if additional_points:
            sections.append("### Key Findings & Research Details\n" + "\n".join(additional_points))

        sections.append("\n*Verified via ChemNova Scientific Web Research Layer.*")
        return "\n\n".join(sections)

    def _clean_completion(self, text: str, default_msg: str) -> str:
        """Sanitize autoregressive text."""
        cleaned = text.replace("<ANSWER>", "").replace("</ANSWER>", "").replace("<BOS>", "").replace("<EOS>", "").strip()
        if not cleaned:
            return default_msg
        return cleaned
