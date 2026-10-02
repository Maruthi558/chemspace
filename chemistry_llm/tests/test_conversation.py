"""Tests for ChemNova Conversation Memory and Context Manager."""

import unittest
from chemistry_llm.inference.conversation import Message, Conversation
from chemistry_llm.inference.context_manager import ContextManager
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer
from chemistry_llm.tokenizer.special_tokens import USER_TOKEN, ASSISTANT_TOKEN


class TestConversationMemory(unittest.TestCase):

    def setUp(self):
        self.context_manager = ContextManager(max_context_length=128)
        self.tokenizer = ChemNovaTokenizer()

    def test_message_creation(self):
        """Verify Message data structure and timestamps."""
        msg = Message(role="user", content="What is ethanol?")
        self.assertEqual(msg.role, "user")
        self.assertEqual(msg.content, "What is ethanol?")
        self.assertIsNotNone(msg.timestamp)

    def test_conversation_turns(self):
        """Verify adding conversation turns preserves ordering."""
        conv = Conversation()
        conv.add_user_message("Hello")
        conv.add_assistant_message("Hi! How can I help you with chemistry today?")
        conv.add_user_message("What is H2O?")

        history = conv.get_history()
        self.assertEqual(len(history), 3)
        self.assertEqual(history[0].role, "user")
        self.assertEqual(history[1].role, "assistant")
        self.assertEqual(history[2].role, "user")

    def test_context_manager_prompt_formatting(self):
        """Verify special token insertion in chat prompt formatting."""
        conv = self.context_manager.get_or_create("test-conv-1")
        conv.add_user_message("What is an atom?")
        conv.add_assistant_message("An atom is the basic unit of a chemical element.")

        prompt = self.context_manager.format_chat_prompt(conv)
        self.assertIn(USER_TOKEN, prompt)
        self.assertIn(ASSISTANT_TOKEN, prompt)
        self.assertIn("What is an atom?", prompt)

    def test_context_window_truncation(self):
        """Verify sliding window truncation when token count exceeds max_length."""
        conv = self.context_manager.get_or_create("test-conv-2")
        # Add a very long text sequence
        for i in range(20):
            conv.add_user_message(f"Turn {i}: Describe element with atomic number {i}.")
            conv.add_assistant_message(f"Element {i} has specific chemical properties.")

        token_ids = self.context_manager.prepare_input_tokens(
            conversation=conv,
            tokenizer=self.tokenizer,
            max_length=64,
        )
        self.assertLessEqual(len(token_ids), 64)


if __name__ == "__main__":
    unittest.main()
