"""Comprehensive Integration and Security Test Suite for ChemNova Step 7 Chemistry Tools.

Covers:
A. No-tool question ("What is a covalent bond?") -> No tool invoked.
B. RDKit question ("What is the molecular weight of CCO?") -> RDKit invoked, verified MW.
C. Invalid SMILES ("Analyze this: invalid_smiles") -> Clear validation error.
D. ChemDraw request ("Draw ethanol.") -> ChemDraw 2D coordinates.
E. Spectroscopy request ("Analyze IR spectrum of CCO") -> Spectroscopy key absorption bands.
F. Reaction request ("Predict reaction of CC(=O)O and c1ccccc1") -> IBM RXN reaction prediction.
G. Quantum request ("Calculate HOMO and LUMO of CCO") -> Quantum electronic properties.
H. Ambiguous request ("What happens with acetone?") -> Clarification requested, no tool.
I. Tool failure -> Transparent error returned, no invented results.
J. Multi-tool sequential workflow ("Analyze ethanol and tell me its molecular weight and expected IR features.") -> Sequential execution.
K. Security and sandboxing tests (injection, arbitrary code, SQL, unregistered tools, credential sanitization).
L. Performance measurements (tool selection time, tool execution time, total response time).
"""

import json
from pathlib import Path
import time
import unittest

from chemistry_llm.tools.assistant import ChemNovaToolAssistant
from chemistry_llm.tools.registry import ToolRegistry
from chemistry_llm.tools.router import ToolRouter
from chemistry_llm.tools.schema import ToolCall, ToolResult


class TestChemNovaStep7Tools(unittest.TestCase):
    """Test suite verifying Step 7 safe chemistry tool integration."""

    @classmethod
    def setUpClass(cls):
        cls.registry = ToolRegistry(log_dir="chemistry_llm/tools/logs")
        cls.router = ToolRouter(registry=cls.registry)
        cls.assistant = ChemNovaToolAssistant(registry=cls.registry, router=cls.router, device="cpu")

    # ========================================================================
    # A. NO-TOOL QUESTION
    # ========================================================================
    def test_case_a_no_tool_question(self):
        """Test A: Broad chemistry concept requires no tool."""
        query = "What is a covalent bond?"
        calls = self.router.route_query(query)
        self.assertEqual(len(calls), 0, "No tools should be routed for conceptual question.")

        res = self.assistant.process_request(query)
        self.assertFalse(res["tool_used"])
        self.assertEqual(len(res["tools"]), 0)
        self.assertIn("answer", res)
        self.assertTrue(len(res["answer"]) > 0)

    # ========================================================================
    # B. RDKIT QUESTION
    # ========================================================================
    def test_case_b_rdkit_molecular_weight(self):
        """Test B: Molecular property calculation routes to RDKit and returns verified value."""
        query = "What is the molecular weight of CCO?"
        calls = self.router.route_query(query)
        self.assertEqual(len(calls), 1)
        self.assertEqual(calls[0].tool, "rdkit")
        self.assertEqual(calls[0].operation, "calculate_molecular_properties")
        self.assertEqual(calls[0].arguments["smiles"], "CCO")

        res = self.assistant.process_request(query)
        self.assertTrue(res["tool_used"])
        self.assertEqual(len(res["tools"]), 1)
        self.assertTrue(res["tools"][0]["success"])
        self.assertEqual(res["tools"][0]["result"]["formula"], "C2H6O")
        self.assertAlmostEqual(res["tools"][0]["result"]["molecular_weight"], 46.069, places=2)
        self.assertIn("46.069", res["answer"])
        self.assertIn("C2H6O", res["answer"])

    # ========================================================================
    # C. INVALID SMILES
    # ========================================================================
    def test_case_c_invalid_smiles_validation(self):
        """Test C: Invalid SMILES yields structured error without fabricated properties."""
        query = "Analyze this: invalid_smiles"
        calls = self.router.route_query(query)
        self.assertGreaterEqual(len(calls), 1)
        self.assertEqual(calls[0].tool, "rdkit")

        res = self.assistant.process_request(query)
        self.assertTrue(res["tool_used"])
        self.assertFalse(res["tools"][0]["success"])
        self.assertIn("Invalid SMILES string", res["tools"][0]["errors"][0])
        self.assertIn("couldn't complete that calculation", res["answer"])

    # ========================================================================
    # D. CHEMDRAW REQUEST
    # ========================================================================
    def test_case_d_chemdraw_drawing(self):
        """Test D: Drawing request connects to ChemDraw handler and computes 2D coordinates."""
        query = "Draw ethanol."
        calls = self.router.route_query(query)
        self.assertEqual(len(calls), 1)
        self.assertEqual(calls[0].tool, "chemdraw")
        self.assertEqual(calls[0].arguments["smiles"], "CCO")

        res = self.assistant.process_request(query)
        self.assertTrue(res["tool_used"])
        self.assertTrue(res["tools"][0]["success"])
        self.assertEqual(res["tools"][0]["result"]["canvas_status"], "ready_to_render")
        self.assertGreater(len(res["tools"][0]["result"]["atoms"]), 0)
        self.assertIn("ChemDraw 2D Structure Representation", res["answer"])

    # ========================================================================
    # E. SPECTROSCOPY REQUEST
    # ========================================================================
    def test_case_e_spectroscopy_analysis(self):
        """Test E: Spectroscopy analysis identifies functional group bands."""
        query = "Analyze IR spectrum of CCO"
        calls = self.router.route_query(query)
        self.assertEqual(len(calls), 1)
        self.assertEqual(calls[0].tool, "spectroscopy")

        res = self.assistant.process_request(query)
        self.assertTrue(res["tool_used"])
        self.assertTrue(res["tools"][0]["success"])
        spec_result = res["tools"][0]["result"]
        self.assertIn("infrared", spec_result)
        self.assertIn("mass_spec", spec_result)
        self.assertEqual(spec_result["mass_spec"]["molecular_ion_mz"], 46)
        self.assertIn("Spectroscopy Analysis", res["answer"])

    # ========================================================================
    # F. REACTION REQUEST
    # ========================================================================
    def test_case_f_ibm_rxn_prediction(self):
        """Test F: Reaction prediction routes to IBM RXN."""
        query = "Predict reaction of CC(=O)O and c1ccccc1"
        calls = self.router.route_query(query)
        self.assertEqual(len(calls), 1)
        self.assertEqual(calls[0].tool, "ibm_rxn")

        res = self.assistant.process_request(query)
        self.assertTrue(res["tool_used"])
        self.assertTrue(res["tools"][0]["success"])
        self.assertIn("predicted_product", res["tools"][0]["result"])
        self.assertIn("IBM RXN", res["answer"])

    # ========================================================================
    # G. QUANTUM REQUEST
    # ========================================================================
    def test_case_g_quantum_properties(self):
        """Test G: Quantum chemical calculations return electronic structure."""
        query = "Calculate HOMO and LUMO of CCO"
        calls = self.router.route_query(query)
        self.assertEqual(len(calls), 1)
        self.assertEqual(calls[0].tool, "quantum")

        res = self.assistant.process_request(query)
        self.assertTrue(res["tool_used"])
        self.assertTrue(res["tools"][0]["success"])
        q_res = res["tools"][0]["result"]
        self.assertIn("homo_energy_ev", q_res)
        self.assertIn("lumo_energy_ev", q_res)
        self.assertIn("homo_lumo_gap_ev", q_res)
        self.assertIn("Quantum Mechanical Electronic Structure", res["answer"])

    # ========================================================================
    # H. AMBIGUOUS REQUEST
    # ========================================================================
    def test_case_h_ambiguous_request(self):
        """Test H: Ambiguous request triggers clarification engine without running tools."""
        query = "What happens with acetone?"
        calls = self.router.route_query(query)
        self.assertEqual(len(calls), 0)

        res = self.assistant.process_request(query)
        self.assertFalse(res["tool_used"])
        self.assertEqual(res["metadata"].get("intent"), "clarification_required")
        self.assertIn("ambiguous", res["answer"].lower())

    # ========================================================================
    # I. TOOL FAILURE TRANSPARENCY
    # ========================================================================
    def test_case_i_tool_failure_transparency(self):
        """Test I: Tool failure is transparently communicated without hallucination."""
        call = ToolCall(tool="rdkit", operation="calculate_molecular_properties", arguments={"smiles": "BAD_SMILES_!!!"})
        result = self.registry.execute_call(call)
        self.assertFalse(result.success)
        self.assertGreater(len(result.errors), 0)
        self.assertNotIn("46.069", str(result.result))

    # ========================================================================
    # J. MULTI-TOOL SEQUENTIAL WORKFLOW
    # ========================================================================
    def test_case_j_multi_tool_workflow(self):
        """Test J: Multi-tool request executes sequentially and merges results."""
        query = "Analyze ethanol and tell me its molecular weight and expected IR features."
        calls = self.router.route_query(query)
        self.assertGreaterEqual(len(calls), 2)
        tool_names = [c.tool for c in calls]
        self.assertIn("rdkit", tool_names)
        self.assertIn("spectroscopy", tool_names)

        res = self.assistant.process_request(query)
        self.assertTrue(res["tool_used"])
        self.assertGreaterEqual(len(res["tools"]), 2)
        self.assertTrue(all(t["success"] for t in res["tools"]))
        self.assertIn("RDKit Cheminformatics Analysis", res["answer"])
        self.assertIn("Spectroscopy Analysis", res["answer"])

    # ========================================================================
    # CONVERSATIONAL CONTEXT TRACKING
    # ========================================================================
    def test_conversational_context_tracking(self):
        """Test context tracking across consecutive turns ('its molecular weight')."""
        conv_id = "test_conversation_context_turn_1"
        # Turn 1: Mention ethanol
        self.router.route_query("What is ethanol?", conversation_id=conv_id)
        self.assertEqual(self.router.conversation_memory[conv_id]["last_smiles"], "CCO")

        # Turn 2: Refer to 'its molecular weight'
        calls_t2 = self.router.route_query("Calculate its molecular weight", conversation_id=conv_id)
        self.assertEqual(len(calls_t2), 1)
        self.assertEqual(calls_t2[0].tool, "rdkit")
        self.assertEqual(calls_t2[0].arguments["smiles"], "CCO")

    # ========================================================================
    # K. SECURITY & SANDBOXING TESTS
    # ========================================================================
    def test_security_os_system_injection(self):
        """Security: Block shell command injection."""
        call = ToolCall(tool="rdkit", operation="calculate_molecular_properties", arguments={"smiles": "CCO; os.system('calc.exe')"})
        res = self.registry.execute_call(call)
        self.assertFalse(res.success)
        self.assertIn("Security Policy Violation", res.errors[0])

    def test_security_subprocess_injection(self):
        """Security: Block subprocess execution."""
        call = ToolCall(tool="rdkit", operation="calculate_molecular_properties", arguments={"smiles": "CCO; subprocess.Popen('cmd')"})
        res = self.registry.execute_call(call)
        self.assertFalse(res.success)
        self.assertIn("Security Policy Violation", res.errors[0])

    def test_security_python_eval_exec(self):
        """Security: Block python eval/exec injection."""
        call = ToolCall(tool="chemdraw", operation="parse_molecule", arguments={"smiles": "eval('__import__(\"os\").remove(\"file\")')"})
        res = self.registry.execute_call(call)
        self.assertFalse(res.success)
        self.assertIn("Security Policy Violation", res.errors[0])

    def test_security_sql_injection(self):
        """Security: Block SQL injection attempt."""
        call = ToolCall(tool="rdkit", operation="calculate_molecular_properties", arguments={"smiles": "CCO'; DROP TABLE users;--"})
        res = self.registry.execute_call(call)
        self.assertFalse(res.success)
        self.assertIn("Security Policy Violation", res.errors[0])

    def test_security_unregistered_tool(self):
        """Security: Reject unregistered tools."""
        call = ToolCall(tool="malicious_unregistered_tool", operation="run_root_payload", arguments={"data": "test"})
        res = self.registry.execute_call(call)
        self.assertFalse(res.success)
        self.assertIn("Unregistered tool", res.errors[0])

    def test_security_unsupported_operation(self):
        """Security: Reject unsupported operations on valid tools."""
        call = ToolCall(tool="rdkit", operation="format_hard_drive", arguments={"smiles": "CCO"})
        res = self.registry.execute_call(call)
        self.assertFalse(res.success)
        self.assertIn("Unsupported operation", res.errors[0])

    def test_security_audit_log_redaction(self):
        """Security: Verify credentials and passwords are never logged."""
        call = ToolCall(tool="rdkit", operation="validate_smiles", arguments={"smiles": "CCO", "password": "super_secret_password", "token": "xyz123"})
        self.registry.execute_call(call)

        log_path = Path("chemistry_llm/tools/logs/audit.jsonl")
        self.assertTrue(log_path.exists())
        with open(log_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
            last_entry = json.loads(lines[-1])
            self.assertEqual(last_entry["arguments"].get("password"), "[REDACTED]")
            self.assertEqual(last_entry["arguments"].get("token"), "[REDACTED]")
            self.assertNotIn("super_secret_password", json.dumps(last_entry))

    # ========================================================================
    # LOOP PROTECTION
    # ========================================================================
    def test_loop_protection(self):
        """Verify tool calls are bounded by MAX_TOOL_CALLS_PER_TURN = 3."""
        calls = self.router.route_query("Calculate molecular weight, draw 3d conformer, predict spectrum, predict reaction, calculate quantum of CCO")
        self.assertLessEqual(len(calls), 3)

    # ========================================================================
    # PERFORMANCE MEASUREMENTS
    # ========================================================================
    def test_performance_benchmarks(self):
        """Benchmark router selection, tool execution, and total response time."""
        query = "What is the molecular weight of CCO?"

        # 1. Router Selection Time
        t0 = time.perf_counter()
        calls = self.router.route_query(query)
        route_time_ms = (time.perf_counter() - t0) * 1000

        # 2. Tool Execution Time
        t1 = time.perf_counter()
        res_tool = self.registry.execute_call(calls[0])
        tool_time_ms = (time.perf_counter() - t1) * 1000

        # 3. Total Response Time
        t2 = time.perf_counter()
        full_res = self.assistant.process_request(query)
        total_time_ms = (time.perf_counter() - t2) * 1000

        print("\n--- ChemNova Step 7 Performance Benchmark ---")
        print(f"Tool Selection Time: {route_time_ms:.3f} ms")
        print(f"Tool Execution Time: {tool_time_ms:.3f} ms (RDKit)")
        print(f"Total Response Time: {total_time_ms:.3f} ms")
        print("---------------------------------------------")

        self.assertLess(route_time_ms, 50.0, "Tool routing should take < 50ms")
        self.assertLess(tool_time_ms, 200.0, "RDKit execution should take < 200ms")


if __name__ == "__main__":
    unittest.main()
