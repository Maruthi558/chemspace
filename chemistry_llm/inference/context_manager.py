"""Context Manager for handling conversation sessions and context windows."""

import logging
from typing import Dict, List, Optional
from .conversation import Conversation, Message
from chemistry_llm.config.settings import settings
from chemistry_llm.tokenizer.special_tokens import (
    USER_TOKEN,
    ASSISTANT_TOKEN,
    BOS_TOKEN,
    EOS_TOKEN,
)

logger = logging.getLogger("chemistry_llm.context")


class ContextManager:
    """Manages active conversation sessions and context window token truncation."""

    def __init__(self, max_context_length: Optional[int] = None):
        self.max_context_length = max_context_length or settings.max_context_length
        self._conversations: Dict[str, Conversation] = {}

    def get_or_create(self, conversation_id: Optional[str] = None) -> Conversation:
        """Retrieve existing conversation by ID or instantiate a new one."""
        if conversation_id and conversation_id in self._conversations:
            return self._conversations[conversation_id]

        new_conv = Conversation(conversation_id=conversation_id) if conversation_id else Conversation()
        self._conversations[new_conv.conversation_id] = new_conv
        return new_conv

    def format_chat_prompt(self, conversation: Conversation) -> str:
        """Format chronological message turns into structured prompt format with special tokens."""
        prompt_parts: List[str] = [BOS_TOKEN]

        for msg in conversation.messages:
            if msg.role == "user":
                prompt_parts.append(f"{USER_TOKEN} {msg.content}")
            elif msg.role == "assistant":
                prompt_parts.append(f"{ASSISTANT_TOKEN} {msg.content} {EOS_TOKEN}")

        # End with assistant prompt token to trigger continuation
        prompt_parts.append(f"{ASSISTANT_TOKEN}")
        return " ".join(prompt_parts)

    def prepare_input_tokens(
        self,
        conversation: Conversation,
        tokenizer,
        max_length: Optional[int] = None,
    ) -> List[int]:
        """Convert chat history to token IDs and enforce context window limit."""
        limit = max_length or self.max_context_length
        prompt_text = self.format_chat_prompt(conversation)
        token_ids = tokenizer.encode(prompt_text, add_special_tokens=False)

        # Enforce sliding window truncation if token_ids exceeds max_length
        if len(token_ids) > limit:
            token_ids = token_ids[-limit:]

        return token_ids

    def delete_conversation(self, conversation_id: str) -> bool:
        """Remove conversation from active memory."""
        if conversation_id in self._conversations:
            del self._conversations[conversation_id]
            return True
        return False
