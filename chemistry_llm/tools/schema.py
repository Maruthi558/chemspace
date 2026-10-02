"""Structured Schema for ChemNova Tool Calling, Execution & Result Normalization."""

from dataclasses import asdict, dataclass, field
import time
from typing import Any, Callable, Dict, List, Optional, Union


@dataclass
class ToolCall:
    """Internal structured tool call specification."""

    tool: str
    operation: str
    arguments: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "tool": self.tool,
            "operation": self.operation,
            "arguments": self.arguments,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ToolCall":
        return cls(
            tool=str(data.get("tool", "")).strip().lower(),
            operation=str(data.get("operation", "")).strip().lower(),
            arguments=data.get("arguments", {}) or {},
        )


@dataclass
class ToolResult:
    """Normalized tool result container."""

    success: bool
    tool: str
    operation: str
    result: Dict[str, Any] = field(default_factory=dict)
    warnings: List[str] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    execution_time_ms: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "tool": self.tool,
            "operation": self.operation,
            "result": self.result,
            "warnings": self.warnings,
            "errors": self.errors,
            "metadata": self.metadata,
            "execution_time_ms": round(self.execution_time_ms, 2),
        }

    def format_context_for_llm(self) -> str:
        """Format verified tool result as structured context for LLM prompt insertion."""
        lines = [
            "<TOOL_RESULT>",
            f"Tool: {self.tool.upper()}",
            f"Operation: {self.operation}",
            f"Status: {'SUCCESS' if self.success else 'FAILED'}",
        ]
        if self.errors:
            lines.append(f"Errors: {'; '.join(self.errors)}")
        if self.warnings:
            lines.append(f"Warnings: {'; '.join(self.warnings)}")

        if self.success and self.result:
            for k, v in self.result.items():
                if isinstance(v, (str, int, float, bool)):
                    lines.append(f"{k}: {v}")
                elif isinstance(v, dict):
                    lines.append(f"{k}:")
                    for sub_k, sub_v in v.items():
                        lines.append(f"  {sub_k}: {sub_v}")
                elif isinstance(v, list) and v and isinstance(v[0], dict):
                    lines.append(f"{k}: [{len(v)} items]")
                elif isinstance(v, list):
                    lines.append(f"{k}: {', '.join(str(x) for x in v[:10])}")

        lines.append("</TOOL_RESULT>")
        return "\n".join(lines)


@dataclass
class ToolDefinition:
    """Specification of a registered chemistry tool."""

    tool_name: str
    description: str
    purpose: str
    supported_operations: List[str]
    input_schema: Dict[str, Any]
    output_schema: Dict[str, Any]
    required_fields: List[str]
    optional_fields: List[str] = field(default_factory=list)
    timeout_seconds: float = 10.0
    safety_level: str = "read_only_deterministic"  # read_only_deterministic, computational, external_service
    handler: Optional[Callable[[str, Dict[str, Any]], ToolResult]] = None
