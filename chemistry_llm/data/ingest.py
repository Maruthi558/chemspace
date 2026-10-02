"""ChemNova Dataset Ingestion System.

Imports datasets from multiple formats:
- JSON (arrays or wrapped dictionaries)
- JSONL (streaming line-delimited records)
- CSV (tabular data with column mapping)
- TXT (paragraph or block text)
- Markdown (headers as topics/questions and body as answers/content)

Converts imported data into the standardized ChemNova JSONL format.

Usage:
    python -m chemistry_llm.data.ingest --input <file_or_directory>
"""

import argparse
import csv
import json
import logging
from pathlib import Path
from typing import Any, Dict, Generator, List, Optional, Union
import uuid

from chemistry_llm.data.schema.record import ChemNovaRecord, current_iso_time
from chemistry_llm.data.schema.types import DatasetType, ChemistryDomain

logger = logging.getLogger("chemistry_llm.data.ingest")


class DataIngestor:
    """Ingests heterogeneous raw data formats into standardized ChemNova records."""

    def __init__(
        self,
        default_source: str = "local_ingest",
        default_license: str = "OpenAccess",
        default_type: str = DatasetType.CHEMISTRY_QA.value,
        default_domain: str = ChemistryDomain.GENERAL_CHEMISTRY.value,
    ):
        self.default_source = default_source
        self.default_license = default_license
        self.default_type = default_type
        self.default_domain = default_domain

    def _generate_id(self, prefix: str = "cn") -> str:
        """Generate unique UUID-based record identifier."""
        return f"{prefix}_{uuid.uuid4().hex[:12]}"

    def parse_jsonl(self, file_path: Union[str, Path]) -> Generator[Dict[str, Any], None, None]:
        """Read and yield objects from a JSONL file."""
        with open(file_path, "r", encoding="utf-8") as f:
            for line_no, line in enumerate(f, 1):
                clean = line.strip()
                if not clean:
                    continue
                try:
                    yield json.loads(clean)
                except json.JSONDecodeError as e:
                    logger.warning("Skipping invalid JSON line %d in %s: %s", line_no, file_path, e)

    def parse_json(self, file_path: Union[str, Path]) -> Generator[Dict[str, Any], None, None]:
        """Read and yield objects from a JSON file (list or wrapped dictionary)."""
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        if isinstance(data, list):
            for item in data:
                if isinstance(item, dict):
                    yield item
        elif isinstance(data, dict):
            # Check for common wrapper keys
            for key in ["records", "data", "items", "rows", "dataset"]:
                if key in data and isinstance(data[key], list):
                    for item in data[key]:
                        if isinstance(item, dict):
                            yield item
                    return
            # Single object
            yield data

    def parse_csv(self, file_path: Union[str, Path]) -> Generator[Dict[str, Any], None, None]:
        """Read and yield dictionary records from a CSV file."""
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Filter empty string values
                clean_row = {k.strip(): v.strip() for k, v in row.items() if k and v is not None}
                if clean_row:
                    yield clean_row

    def parse_txt(self, file_path: Union[str, Path]) -> Generator[Dict[str, Any], None, None]:
        """Read text paragraphs separated by double newlines into text records."""
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()

        paragraphs = [p.strip() for p in content.split("\n\n") if p.strip()]
        for idx, para in enumerate(paragraphs, 1):
            yield {
                "id": f"txt_{Path(file_path).stem}_{idx}",
                "type": DatasetType.CHEMISTRY_FACTS.value,
                "context": para,
                "question": f"Key facts from section {idx}",
                "answer": para,
            }

    def parse_markdown(self, file_path: Union[str, Path]) -> Generator[Dict[str, Any], None, None]:
        """Parse markdown headers and sections into question/answer or topic records."""
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()

        current_header = Path(file_path).stem.replace("_", " ").title()
        current_body: List[str] = []
        section_idx = 1

        for line in lines:
            stripped = line.strip()
            if stripped.startswith("#"):
                # Flush previous section
                body_text = "\n".join(current_body).strip()
                if body_text:
                    yield {
                        "id": f"md_{Path(file_path).stem}_{section_idx}",
                        "question": current_header,
                        "answer": body_text,
                        "context": body_text,
                        "type": DatasetType.CHEMISTRY_CONCEPTS.value,
                    }
                    section_idx += 1
                current_header = stripped.lstrip("#").strip()
                current_body = []
            else:
                current_body.append(line.rstrip())

        # Flush final section
        body_text = "\n".join(current_body).strip()
        if body_text:
            yield {
                "id": f"md_{Path(file_path).stem}_{section_idx}",
                "question": current_header,
                "answer": body_text,
                "context": body_text,
                "type": DatasetType.CHEMISTRY_CONCEPTS.value,
            }

    def convert_to_record(self, raw_data: Dict[str, Any], source_file: Optional[str] = None) -> ChemNovaRecord:
        """Map raw dictionary fields to a standard ChemNovaRecord."""
        rec_id = raw_data.get("id") or raw_data.get("record_id") or raw_data.get("_id") or self._generate_id()

        # Extract Question / Query / Topic
        question = (
            raw_data.get("question")
            or raw_data.get("prompt")
            or raw_data.get("instruction")
            or raw_data.get("query")
            or raw_data.get("topic")
            or raw_data.get("concept")
        )

        # Extract Answer / Response / Definition
        answer = (
            raw_data.get("answer")
            or raw_data.get("response")
            or raw_data.get("output")
            or raw_data.get("definition")
            or raw_data.get("text")
        )

        # Extract Context & Explanations
        context = raw_data.get("context") or raw_data.get("input")
        explanation = raw_data.get("explanation")
        reasoning = raw_data.get("reasoning") or raw_data.get("thought")

        # Chemical notations
        formula = raw_data.get("formula") or raw_data.get("molecular_formula")
        equation = raw_data.get("equation") or raw_data.get("chemical_equation")
        reaction = raw_data.get("reaction") or raw_data.get("reaction_smiles")
        smiles = raw_data.get("smiles")
        inchi = raw_data.get("inchi")
        molecule = raw_data.get("molecule") or raw_data.get("compound")

        # Provenance
        source = raw_data.get("source") or (Path(source_file).stem if source_file else self.default_source)
        source_url = raw_data.get("source_url") or raw_data.get("url")
        license_str = raw_data.get("license") or self.default_license

        # Classification
        rec_type = raw_data.get("type") or self.default_type
        domain = raw_data.get("domain") or self.default_domain
        subdomain = raw_data.get("subdomain")

        provenance_dict = raw_data.get("provenance") or {}
        if source_file:
            provenance_dict["source_file"] = str(source_file)
        provenance_dict["ingest_time"] = current_iso_time()

        return ChemNovaRecord(
            id=str(rec_id),
            type=rec_type,
            domain=domain,
            subdomain=subdomain,
            question=str(question).strip() if question else None,
            answer=str(answer).strip() if answer else None,
            context=str(context).strip() if context else None,
            explanation=str(explanation).strip() if explanation else None,
            reasoning=str(reasoning).strip() if reasoning else None,
            formula=str(formula).strip() if formula else None,
            equation=str(equation).strip() if equation else None,
            reaction=str(reaction).strip() if reaction else None,
            molecule=str(molecule).strip() if molecule else None,
            smiles=str(smiles).strip() if smiles else None,
            inchi=str(inchi).strip() if inchi else None,
            source=source,
            source_url=source_url,
            license=license_str,
            provenance=provenance_dict,
            verified=bool(raw_data.get("verified", False)),
            raw_record=raw_data,
        )

    def ingest_file(
        self,
        file_path: Union[str, Path],
        output_file: Optional[Union[str, Path]] = None,
    ) -> List[ChemNovaRecord]:
        """Ingest single file of any supported format into ChemNovaRecord list."""
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"Input file not found: {path}")

        suffix = path.suffix.lower()
        parser_map = {
            ".jsonl": self.parse_jsonl,
            ".json": self.parse_json,
            ".csv": self.parse_csv,
            ".txt": self.parse_txt,
            ".md": self.parse_markdown,
            ".markdown": self.parse_markdown,
        }

        parser = parser_map.get(suffix)
        if not parser:
            raise ValueError(f"Unsupported file format '{suffix}'. Supported: {list(parser_map.keys())}")

        records: List[ChemNovaRecord] = []
        for raw in parser(path):
            record = self.convert_to_record(raw, source_file=str(path))
            records.append(record)

        if output_file:
            out_p = Path(output_file)
            out_p.parent.mkdir(parents=True, exist_ok=True)
            with open(out_p, "w", encoding="utf-8") as f:
                for rec in records:
                    f.write(rec.to_jsonl_line() + "\n")
            logger.info("Ingested %d records from %s into %s", len(records), path, out_p)

        return records

    def ingest_directory(
        self,
        dir_path: Union[str, Path],
        output_file: Union[str, Path],
        extensions: Optional[List[str]] = None,
    ) -> List[ChemNovaRecord]:
        """Ingest all supported files in a directory into a single JSONL file."""
        root = Path(dir_path)
        if not root.is_dir():
            raise NotADirectoryError(f"Directory not found: {root}")

        exts = extensions or [".jsonl", ".json", ".csv", ".txt", ".md", ".markdown"]
        all_records: List[ChemNovaRecord] = []

        for p in sorted(root.rglob("*")):
            if p.is_file() and p.suffix.lower() in exts and not p.name.startswith("."):
                try:
                    recs = self.ingest_file(p)
                    all_records.extend(recs)
                except Exception as e:
                    logger.error("Failed to ingest %s: %s", p, e)

        out_p = Path(output_file)
        out_p.parent.mkdir(parents=True, exist_ok=True)
        with open(out_p, "w", encoding="utf-8") as f:
            for rec in all_records:
                f.write(rec.to_jsonl_line() + "\n")

        logger.info("Ingested %d total records across directory %s to %s", len(all_records), root, out_p)
        return all_records


def main():
    parser = argparse.ArgumentParser(description="ChemNova Dataset Ingestion CLI")
    parser.add_argument("--input", "-i", required=True, help="Input file or directory to ingest")
    parser.add_argument("--output", "-o", default=None, help="Output JSONL file path (default: data/imported/<stem>.jsonl)")
    parser.add_argument("--source", "-s", default="local_ingest", help="Dataset source attribution")
    parser.add_argument("--license", "-l", default="OpenAccess", help="Dataset license")
    parser.add_argument("--type", "-t", default=DatasetType.CHEMISTRY_QA.value, help="Dataset record type")
    parser.add_argument("--domain", "-d", default=ChemistryDomain.GENERAL_CHEMISTRY.value, help="Chemistry domain")

    args = parser.parse_args()
    input_path = Path(args.input)

    ingestor = DataIngestor(
        default_source=args.source,
        default_license=args.license,
        default_type=args.type,
        default_domain=args.domain,
    )

    if not args.output:
        out_dir = Path("chemistry_llm/data/imported")
        out_file = out_dir / f"{input_path.stem}_imported.jsonl"
    else:
        out_file = Path(args.output)

    if input_path.is_file():
        records = ingestor.ingest_file(input_path, output_file=out_file)
    else:
        records = ingestor.ingest_directory(input_path, output_file=out_file)

    print(f"Successfully ingested {len(records)} records -> {out_file}")


if __name__ == "__main__":
    main()
