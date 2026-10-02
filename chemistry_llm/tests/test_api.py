"""Tests for ChemNova Local Chemistry AI REST API."""

import unittest
from fastapi.testclient import TestClient
from chemistry_llm.api.app import app


class TestChemistryAPI(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)

    def test_health_endpoint(self):
        """GET /api/health returns ok status and engine name."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["engine"], "ChemNova Local Chemistry AI")

    def test_chat_atom_question(self):
        """POST /api/chat with 'What is an atom?' returns 200 and chemistry response."""
        payload = {"message": "What is an atom?"}
        response = self.client.post("/api/chat", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("response", data)
        self.assertIn("conversation_id", data)
        self.assertIn("intent", data)
        self.assertIn("atom", data["response"].lower())

    def test_chat_greeting(self):
        """POST /api/chat with 'Hi' returns 200 and chemistry greeting."""
        payload = {"message": "Hi"}
        response = self.client.post("/api/chat", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["intent"], "greeting")
        self.assertTrue(len(data["response"]) > 0)

    def test_chat_non_chemistry_redirect(self):
        """POST /api/chat with off-topic question redirects to chemistry."""
        payload = {"message": "What is the capital of France?"}
        response = self.client.post("/api/chat", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["intent"], "general_non_chemistry")
        self.assertIn("chemistry", data["response"].lower())

    def test_empty_message_validation(self):
        """POST /api/chat with empty string returns 400 Bad Request."""
        payload = {"message": ""}
        response = self.client.post("/api/chat", json=payload)
        self.assertEqual(response.status_code, 400)


if __name__ == "__main__":
    unittest.main()
