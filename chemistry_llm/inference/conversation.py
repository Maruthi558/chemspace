"""Conversation and Message data structures for local session memory."""

from dataclasses import dataclass, field
import time
from typing import List, Literal, Optional, Dict
import uuid


@dataclass
class Message:
    """Represents a single message in a conversation turn."""
    role: Literal["user", "assistant", "system"]
    content: str
    timestamp: float = field(default_factory=time.time)

    def to_dict(self) -> Dict:
        return {
            "role": self.role,
            "content": self.content,
            "timestamp": self.timestamp,
        }

    @classmethod
    def from_dict(cls, data: Dict) -> "Message":
        return cls(
            role=data["role"],
            content=data["content"],
            timestamp=data.get("timestamp", time.time()),
        )


@dataclass
class Conversation:
    """Maintains message ordering and history for a conversation session."""
    conversation_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    messages: List[Message] = field(default_factory=list)
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)

    def add_message(self, role: Literal["user", "assistant", "system"], content: str) -> Message:
        """Append a message to the conversation."""
        msg = Message(role=role, content=content)
        self.messages.append(msg)
        self.updated_at = time.time()
        return msg

    def add_user_message(self, content: str) -> Message:
        return self.add_message("user", content)

    def add_assistant_message(self, content: str) -> Message:
        return self.add_message("assistant", content)

    def get_history(self, max_turns: Optional[int] = None) -> List[Message]:
        """Return chronological history, optionally capped by max_turns."""
        if max_turns is not None and max_turns > 0:
            return self.messages[-max_turns:]
        return self.messages

    def clear(self) -> None:
        self.messages.clear()
        self.updated_at = time.time()
