"""ChemNova Local Chemistry AI Response Pipeline.

Orchestrates the response lifecycle:
User message -> Conversation manager -> Intent detection -> Chemistry router
-> Local knowledge / local model -> Response generation -> Final response.

Maintains a clean architectural separation between:
1. Temporary bootstrap behavior (deterministic chemistry tools + seed knowledge)
2. Future trained-model behavior (ChemNova Transformer LM autoregressive decoding)
"""

import logging
from dataclasses import dataclass
from typing import Dict, Optional, Tuple

from chemistry_llm.chemistry.chemistry_router import ChemistryRouter, IntentType
from chemistry_llm.chemistry.chemistry_scope import ChemistryScope
from chemistry_llm.chemistry.chemistry_knowledge import SeedKnowledgeBase
from chemistry_llm.chemistry.chemistry_tools import ChemistryTools
from chemistry_llm.config.settings import settings
from chemistry_llm.inference.context_manager import ContextManager
from chemistry_llm.inference.generate import generate_tokens
from chemistry_llm.model.model_loader import init_model, detect_device
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer

logger = logging.getLogger("chemistry_llm.pipeline")


@dataclass
class PipelineResponse:
    """Standardized response from the Chemistry AI pipeline."""
    response: str
    conversation_id: str
    intent: str
    confidence: float
    model_mode: str  # "bootstrap_knowledge" | "trained_transformer"


class ResponsePipeline:
    """End-to-end response orchestrator for ChemNova Local Chemistry AI."""

    def __init__(
        self,
        use_trained_model: bool = False,
        preload_model: bool = True,
    ):
        self.router = ChemistryRouter()
        self.context_manager = ContextManager()
        self.knowledge_base = SeedKnowledgeBase()
        self.tools = ChemistryTools()
        self.tokenizer = ChemNovaTokenizer()

        self.use_trained_model = use_trained_model
        self.device = detect_device()
        self.model = None

        if preload_model:
            try:
                self.model = init_model(device=self.device)
                logger.info("Initialized local Transformer LM on %s", self.device)
            except Exception as e:
                logger.warning("Could not pre-initialize Transformer LM: %s", e)

    def process(
        self,
        message: str,
        conversation_id: Optional[str] = None,
    ) -> PipelineResponse:
        """Process incoming user message through the Chemistry AI pipeline."""
        # 1. Conversation Manager
        conversation = self.context_manager.get_or_create(conversation_id)
        conversation.add_user_message(message)

        # 2. Intent Detection & Chemistry Router
        intent, confidence = self.router.route(message)
        logger.info(
            "Routed message [%s...] -> Intent: %s (confidence: %.2f)",
            message[:30],
            intent.value,
            confidence,
        )

        reply: str = ""
        model_mode: str = "bootstrap_knowledge"

        # 3. Route-Specific Handling
        if intent == IntentType.GREETING:
            reply = ChemistryScope.get_greeting_response()

        elif intent == IntentType.GENERAL_NON_CHEMISTRY:
            reply = ChemistryScope.get_non_chemistry_redirect(message)

        elif intent == IntentType.CHEMISTRY_TOOL:
            tool_res = self.tools.handle_tool_request(message)
            reply = tool_res or (
                "You can access ChemNova's interactive chemistry tools via the navigation bar: "
                "ChemDraw for sketching structures, Spectroscopy for spectral analysis, and "
                "Reaction Lab for reaction predictions."
            )

        elif intent == IntentType.CHEMISTRY_CALCULATION:
            calc_res = self.tools.calculate_molecular_weight(message)
            if calc_res:
                reply = calc_res
            else:
                # Check seed knowledge for calculation concepts (e.g. molar mass, pH, mole)
                kb_res = self.knowledge_base.lookup(message)
                reply = kb_res or (
                    "To calculate this chemical property, provide the chemical formula "
                    "(e.g., 'What is the molecular weight of H2O?' or 'What is the molar mass of glucose?')."
                )

        elif intent == IntentType.CHEMISTRY_MOLECULE:
            form_res = self.tools.get_formula_response(message)
            if form_res:
                reply = form_res
            else:
                kb_res = self.knowledge_base.lookup(message)
                reply = kb_res or (
                    f"Looking up formula and structural details for chemical query: '{message}'. "
                    "For standard molecular formulas, you can also query known compounds like water, glucose, aspirin, or ethanol."
                )

        elif intent in {IntentType.CHEMISTRY, IntentType.CHEMISTRY_CONCEPT}:
            # Check seed knowledge base first for verified scientific fact
            kb_res = self.knowledge_base.lookup(message)
            if kb_res:
                reply = kb_res
            elif self.use_trained_model and self.model is not None:
                # Future trained-model generation path
                model_mode = "trained_transformer"
                prompt_text = self.context_manager.format_chat_prompt(conversation)
                reply = generate_tokens(
                    model=self.model,
                    tokenizer=self.tokenizer,
                    prompt=prompt_text,
                    max_new_tokens=settings.max_new_tokens,
                    temperature=settings.temperature,
                    top_p=settings.top_p,
                )
            else:
                reply = (
                    f"That is an interesting chemistry topic regarding '{message}'. "
                    "In this Step 2 foundation, core chemistry concepts (such as atoms, covalent/ionic bonds, "
                    "acids/bases, molar mass, and spectroscopy) are active in our seed knowledge base. "
                    "Comprehensive textbook and scientific corpus training will be incorporated in future training stages."
                )

        # 4. Record Assistant Response in Conversation Memory
        conversation.add_assistant_message(reply)

        return PipelineResponse(
            response=reply,
            conversation_id=conversation.conversation_id,
            intent=intent.value,
            confidence=confidence,
            model_mode=model_mode,
        )


# Singleton pipeline instance for reuse across API calls
_global_pipeline: Optional[ResponsePipeline] = None


def get_response_pipeline() -> ResponsePipeline:
    """Return singleton response pipeline instance."""
    global _global_pipeline
    if _global_pipeline is None:
        _global_pipeline = ResponsePipeline()
    return _global_pipeline
