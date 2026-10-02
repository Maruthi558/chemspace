"""Seed chemistry knowledge base loader and query matcher for ChemNova."""

import json
import logging
from pathlib import Path
from typing import Dict, List, Optional
import re

from chemistry_llm.config.settings import settings

logger = logging.getLogger("chemistry_llm.knowledge")


class SeedKnowledgeBase:
    """Manages bootstrap seed chemistry knowledge from seed_knowledge.jsonl."""

    def __init__(self, seed_file: Optional[Path] = None):
        self.seed_file = seed_file or settings.seed_knowledge_path
        self.entries: List[Dict] = []
        self.topic_map: Dict[str, Dict] = {}
        self.keyword_map: Dict[str, List[Dict]] = {}
        self.load()

    def load(self) -> None:
        """Load knowledge entries from JSONL file."""
        if not self.seed_file.exists():
            logger.warning("Seed knowledge file not found at %s", self.seed_file)
            return

        with open(self.seed_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    data = json.loads(line)
                    self.entries.append(data)
                    topic = data.get("topic", "").lower()
                    self.topic_map[topic] = data

                    for kw in data.get("keywords", []):
                        kw_lower = kw.lower()
                        if kw_lower not in self.keyword_map:
                            self.keyword_map[kw_lower] = []
                        self.keyword_map[kw_lower].append(data)
                except Exception as e:
                    logger.error("Failed to parse seed knowledge line: %s", e)

        logger.info("Loaded %d seed chemistry knowledge entries", len(self.entries))

    def lookup(self, query: str) -> Optional[str]:
        """Find the most relevant chemistry answer for a given user query."""
        if not query:
            return None

        q = query.lower().strip()
        # Clean punctuation
        q_clean = re.sub(r"[?!.,;:\'\"()\[\]{}]", " ", q).strip()
        words = q_clean.split()

        # 1. Exact topic match (longest match first)
        for topic in sorted(self.topic_map.keys(), key=len, reverse=True):
            if re.search(rf"\b{re.escape(topic)}\b", q_clean):
                return self.topic_map[topic]["answer"]

        # 2. Keyword match (longest match first)
        for kw in sorted(self.keyword_map.keys(), key=len, reverse=True):
            if re.search(rf"\b{re.escape(kw)}\b", q_clean):
                return self.keyword_map[kw][0]["answer"]

        # 3. Best token overlap
        best_entry = None
        max_score = 0
        for entry in self.entries:
            score = 0
            topic = entry.get("topic", "").lower()
            if topic in words:
                score += 3
            for kw in entry.get("keywords", []):
                for kw_word in kw.lower().split():
                    if kw_word in words and len(kw_word) > 2:
                        score += 1
            if score > max_score:
                max_score = score
                best_entry = entry

        if best_entry and max_score >= 2:
            return best_entry["answer"]

        return None
