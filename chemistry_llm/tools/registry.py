"""Central Tool Registry and Secure Execution Sandbox for ChemNova AI Suite.

Enforces:
- Strict allow-list of registered tools & operations (No arbitrary code execution)
- Pre-execution argument validation against registered schemas
- Thread-safe timeout protection
- Sanitized audit logging (Zero credential or secret leakage)
"""

import concurrent.futures
import json
import logging
from pathlib import Path
import re
import time
import uuid
from typing import Any, Callable, Dict, List, Optional, Set

from chemistry_llm.tools.handlers import (
    handle_chemdraw,
    handle_ibm_rxn,
    handle_quantum,
    handle_rdkit,
    handle_spectroscopy,
)
from chemistry_llm.tools.schema import ToolCall, ToolDefinition, ToolResult

logger = logging.getLogger("chemistry_llm.tool_registry")

FORBIDDEN_PATTERNS = [
    re.compile(r"__import__", re.IGNORECASE),
    re.compile(r"os\.system", re.IGNORECASE),
    re.compile(r"subprocess", re.IGNORECASE),
    re.compile(r"eval\(", re.IGNORECASE),
    re.compile(r"exec\(", re.IGNORECASE),
    re.compile(r"open\(", re.IGNORECASE),
    re.compile(r"select\s+.*from", re.IGNORECASE),
    re.compile(r"drop\s+table", re.IGNORECASE),
]

SENSITIVE_KEYS = {"password", "secret", "token", "key", "auth", "credential", "private"}


class ToolRegistry:
    """Production Tool Registry for ChemNova Chemistry AI."""

    def __init__(self, log_dir: str = "chemistry_llm/tools/logs"):
        self.tools: Dict[str, ToolDefinition] = {}
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self.audit_log_file = self.log_dir / "audit.jsonl"
        self._register_default_tools()

    def register_tool(self, tool_def: ToolDefinition) -> None:
        """Register a chemistry tool in the allow-list."""
        self.tools[tool_def.tool_name.lower()] = tool_def
        logger.info("Registered tool: '%s' (Operations: %s)", tool_def.tool_name, tool_def.supported_operations)

    def list_tools(self) -> List[Dict[str, Any]]:
        """Return public list of registered tools and capabilities."""
        return [
            {
                "tool_name": t.tool_name,
                "description": t.description,
                "purpose": t.purpose,
                "operations": t.supported_operations,
                "required_fields": t.required_fields,
                "optional_fields": t.optional_fields,
                "safety_level": t.safety_level,
            }
            for t in self.tools.values()
        ]

    def _register_default_tools(self) -> None:
        """Register the 5 primary ChemNova chemistry tools."""
        # 1. RDKit Laboratory
        self.register_tool(
            ToolDefinition(
                tool_name="rdkit",
                description="Exact cheminformatics calculations, SMILES validation, and physicochemical descriptors.",
                purpose="Calculate verified molecular properties, formulas, and weights.",
                supported_operations=[
                    "validate_smiles",
                    "calculate_molecular_properties",
                    "canonicalize_smiles",
                ],
                input_schema={"smiles": "string (SMILES notation)"},
                output_schema={"formula": "string", "molecular_weight": "float", "logP": "float"},
                required_fields=["smiles"],
                optional_fields=[],
                timeout_seconds=5.0,
                safety_level="read_only_deterministic",
                handler=handle_rdkit,
            )
        )

        # 2. ChemDraw
        self.register_tool(
            ToolDefinition(
                tool_name="chemdraw",
                description="2D/3D molecular structure graph and conformer coordinate generator.",
                purpose="Prepare 2D coordinate canvas diagrams and 3D optimized geometries.",
                supported_operations=[
                    "parse_molecule",
                    "generate_3d_conformer",
                ],
                input_schema={"smiles": "string (SMILES notation)"},
                output_schema={"atoms": "list of coordinates", "bonds": "list of connectivity"},
                required_fields=["smiles"],
                optional_fields=[],
                timeout_seconds=5.0,
                safety_level="read_only_deterministic",
                handler=handle_chemdraw,
            )
        )

        # 3. Spectroscopy Analysis
        self.register_tool(
            ToolDefinition(
                tool_name="spectroscopy",
                description="Infrared, NMR, Mass Spectrometry, and UV-Vis spectral analysis and prediction.",
                purpose="Identify functional group absorption bands and NMR chemical shifts.",
                supported_operations=[
                    "predict_spectra",
                    "lookup_ir_bands",
                ],
                input_schema={"smiles": "string (SMILES notation)"},
                output_schema={"infrared": "dict", "nmr_1H": "dict", "mass_spec": "dict"},
                required_fields=["smiles"],
                optional_fields=["techniques"],
                timeout_seconds=5.0,
                safety_level="read_only_deterministic",
                handler=handle_spectroscopy,
            )
        )

        # 4. IBM RXN
        self.register_tool(
            ToolDefinition(
                tool_name="ibm_rxn",
                description="Chemical reaction forward prediction and multi-step retrosynthetic pathway decomposition.",
                purpose="Forecast reaction products, yields, and retrosynthetic disconnections.",
                supported_operations=[
                    "predict_reaction",
                    "predict_retrosynthesis",
                ],
                input_schema={"reactants_smiles": "string", "target_smiles": "string"},
                output_schema={"predicted_product": "dict", "reaction_class": "string"},
                required_fields=[],
                optional_fields=["reactants_smiles", "reagents", "target_smiles"],
                timeout_seconds=8.0,
                safety_level="computational",
                handler=handle_ibm_rxn,
            )
        )

        # 5. Quantum Chemistry
        self.register_tool(
            ToolDefinition(
                tool_name="quantum",
                description="Electronic structure calculations: total energy, HOMO/LUMO frontier orbitals, and band gaps.",
                purpose="Compute quantum mechanical molecular properties and cost estimates.",
                supported_operations=[
                    "calculate_electronic_properties",
                    "estimate_calculation_cost",
                    "list_quantum_engines",
                ],
                input_schema={"smiles": "string", "method": "string", "basis_set": "string"},
                output_schema={"total_energy_hartree": "float", "homo_lumo_gap_ev": "float"},
                required_fields=[],
                optional_fields=["smiles", "method", "basis_set"],
                timeout_seconds=8.0,
                safety_level="computational",
                handler=handle_quantum,
            )
        )

    def execute_call(self, call: ToolCall, request_id: Optional[str] = None) -> ToolResult:
        """Securely dispatch a tool call through validation, timeout, and audit logging."""
        req_id = request_id or str(uuid.uuid4())
        tool_name = call.tool.lower().strip()
        operation = call.operation.lower().strip()
        arguments = call.arguments or {}

        start_time = time.time()

        # 1. Security Check: Block injection / arbitrary code patterns
        sec_error = self._check_security(arguments)
        if sec_error:
            result = ToolResult(
                success=False,
                tool=tool_name,
                operation=operation,
                errors=[f"Security Policy Violation: {sec_error}"],
                execution_time_ms=(time.time() - start_time) * 1000,
            )
            self._log_audit(req_id, call, result)
            return result

        # 2. Allow-list Check: Registered Tool
        if tool_name not in self.tools:
            result = ToolResult(
                success=False,
                tool=tool_name,
                operation=operation,
                errors=[f"Unregistered tool: '{tool_name}'. Allowed tools: {list(self.tools.keys())}"],
                execution_time_ms=(time.time() - start_time) * 1000,
            )
            self._log_audit(req_id, call, result)
            return result

        tool_def = self.tools[tool_name]

        # 3. Allow-list Check: Registered Operation
        if operation not in [op.lower() for op in tool_def.supported_operations]:
            result = ToolResult(
                success=False,
                tool=tool_name,
                operation=operation,
                errors=[f"Unsupported operation '{operation}' for tool '{tool_name}'. Supported: {tool_def.supported_operations}"],
                execution_time_ms=(time.time() - start_time) * 1000,
            )
            self._log_audit(req_id, call, result)
            return result

        # 4. Argument Validation
        for required_field in tool_def.required_fields:
            if required_field not in arguments or arguments[required_field] is None or arguments[required_field] == "":
                result = ToolResult(
                    success=False,
                    tool=tool_name,
                    operation=operation,
                    errors=[f"Missing required argument '{required_field}' for {tool_name}.{operation}"],
                    execution_time_ms=(time.time() - start_time) * 1000,
                )
                self._log_audit(req_id, call, result)
                return result

        # 5. Thread Execution with Timeout Protection
        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(tool_def.handler, operation, arguments)
                tool_res = future.result(timeout=tool_def.timeout_seconds)
        except concurrent.futures.TimeoutError:
            tool_res = ToolResult(
                success=False,
                tool=tool_name,
                operation=operation,
                errors=[f"Tool execution timed out after {tool_def.timeout_seconds} seconds."],
                execution_time_ms=(time.time() - start_time) * 1000,
            )
        except Exception as e:
            logger.error("Exception in tool %s.%s: %s", tool_name, operation, e, exc_info=True)
            tool_res = ToolResult(
                success=False,
                tool=tool_name,
                operation=operation,
                errors=[f"Tool execution failed with exception: {type(e).__name__}: {str(e)}"],
                execution_time_ms=(time.time() - start_time) * 1000,
            )

        self._log_audit(req_id, call, tool_res)
        return tool_res

    def _check_security(self, arguments: Dict[str, Any]) -> Optional[str]:
        """Scan arguments for dangerous patterns (shell injection, code execution, SQL)."""
        serialized = json.dumps(arguments)
        for pattern in FORBIDDEN_PATTERNS:
            if pattern.search(serialized):
                return f"Disallowed executable pattern detected: '{pattern.pattern}'"
        return None

    def _log_audit(self, request_id: str, call: ToolCall, result: ToolResult) -> None:
        """Write sanitized audit log entry without leaking credentials or secrets."""
        # Sanitize arguments
        sanitized_args = {}
        for k, v in call.arguments.items():
            if any(s in k.lower() for s in SENSITIVE_KEYS):
                sanitized_args[k] = "[REDACTED]"
            else:
                sanitized_args[k] = v

        entry = {
            "request_id": request_id,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "tool": call.tool,
            "operation": call.operation,
            "arguments": sanitized_args,
            "success": result.success,
            "errors": result.errors,
            "warnings": result.warnings,
            "execution_time_ms": result.execution_time_ms,
        }

        try:
            with open(self.audit_log_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(entry) + "\n")
        except Exception as e:
            logger.warning("Failed to write tool audit log: %s", e)
