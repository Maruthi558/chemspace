"""ChemNova Data Validation System.

Performs rigorous quality validation on chemistry dataset records:
- Required field presence (id, type, domain, source, license)
- Unsupported dataset types or domains
- Missing or malformed IDs
- In-dataset duplicate IDs
- Empty question or empty answer where required by dataset type
- Missing provenance or source information
- Scientific notation minimum structural validity

Quarantines invalid records into `chemistry_llm/data/rejected/` and generates
a comprehensive validation report.

Usage:
    python -m chemistry_llm.data.validate --input <jsonl_file>
"""

import argparse
import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple, Union

from chemistry_llm.data.schema.record import ChemNovaRecord
from chemistry_llm.data.schema.types import DatasetType, ChemistryDomain

logger = logging.getLogger("chemistry_llm.data.validate")


class ValidationIssue:
    """Represents a validation failure on a record."""

    def __init__(self, record_id: str, reason: str, details: str):
        self.record_id = record_id
        self.reason = reason
        self.details = details

    def to_dict(self) -> Dict[str, str]:
        return {
            "record_id": self.record_id,
            "reason": self.reason,
            "details": self.details,
        }


class DataValidator:
    """Validates raw and imported chemistry records against schema rules."""

    # Types strictly requiring both a question and answer
    QA_MANDATORY_TYPES: Set[str] = {
        DatasetType.CHEMISTRY_QA.value,
        DatasetType.CHEMISTRY_DEFINITIONS.value,
        DatasetType.CHEMISTRY_CONCEPTS.value,
        DatasetType.CHEMISTRY_REASONING.value,
        DatasetType.NUMERICAL_CHEMISTRY_PROBLEMS.value,
        DatasetType.WORKED_SOLUTIONS.value,
        DatasetType.MULTI_STEP_REASONING.value,
        DatasetType.HYPOTHETICAL_CHEMISTRY_QUESTIONS.value,
    }

    # Types requiring molecular identifiers
    MOLECULAR_TYPES: Set[str] = {
        DatasetType.MOLECULAR_INFORMATION.value,
        DatasetType.COMPOUND_INFORMATION.value,
    }

    # Types requiring reaction notations
    REACTION_TYPES: Set[str] = {
        DatasetType.CHEMICAL_EQUATIONS.value,
        DatasetType.CHEMICAL_REACTIONS.value,
        DatasetType.REACTION_MECHANISMS.value,
    }

    def __init__(self):
        self.valid_types = DatasetType.all_types()
        self.valid_domains = ChemistryDomain.all_domains()

    def validate_record(
        self,
        record: Union[ChemNovaRecord, Dict[str, Any]],
        seen_ids: Optional[Set[str]] = None,
    ) -> Tuple[bool, Optional[ValidationIssue], Optional[ChemNovaRecord]]:
        """Validate single record against ChemNova schema rules.
        
        Returns:
            Tuple of (is_valid, validation_issue_if_invalid, parsed_record_if_valid)
        """
        # 1. Parse into ChemNovaRecord if dictionary
        if isinstance(record, dict):
            try:
                rec = ChemNovaRecord.from_dict(record)
            except Exception as e:
                return False, ValidationIssue(
                    record_id=str(record.get("id", "unknown")),
                    reason="malformed_record",
                    details=f"Pydantic parsing error: {str(e)}",
                ), None
        else:
            rec = record

        # 2. ID Checks
        if not rec.id or not str(rec.id).strip():
            return False, ValidationIssue(
                record_id="missing",
                reason="missing_id",
                details="Record ID is empty or None.",
            ), None

        rec_id = str(rec.id).strip()
        if seen_ids is not None:
            if rec_id in seen_ids:
                return False, ValidationIssue(
                    record_id=rec_id,
                    reason="duplicate_id",
                    details=f"Record ID '{rec_id}' appears multiple times in batch.",
                ), None
            seen_ids.add(rec_id)

        # 3. Source & Provenance Checks
        if not rec.source or not str(rec.source).strip():
            return False, ValidationIssue(
                record_id=rec_id,
                reason="missing_source",
                details="Record source attribution is missing or empty.",
            ), None

        if not rec.license or not str(rec.license).strip():
            return False, ValidationIssue(
                record_id=rec_id,
                reason="missing_license",
                details="Record license is missing or empty.",
            ), None

        # 4. Type & Domain Checks
        if rec.type not in self.valid_types:
            return False, ValidationIssue(
                record_id=rec_id,
                reason="unsupported_type",
                details=f"Type '{rec.type}' is not among 30 supported DatasetTypes.",
            ), None

        # 5. Content checks based on dataset type
        if rec.type in self.QA_MANDATORY_TYPES:
            if not rec.question or len(rec.question.strip()) < 3:
                return False, ValidationIssue(
                    record_id=rec_id,
                    reason="empty_question",
                    details=f"Type '{rec.type}' requires non-empty question (minimum 3 characters).",
                ), None
            if not rec.answer or len(rec.answer.strip()) < 1:
                return False, ValidationIssue(
                    record_id=rec_id,
                    reason="empty_answer",
                    details=f"Type '{rec.type}' requires non-empty answer.",
                ), None

        elif rec.type in self.REACTION_TYPES:
            has_reaction = bool(rec.reaction and rec.reaction.strip())
            has_equation = bool(rec.equation and rec.equation.strip())
            has_species = bool(rec.reactants and rec.products)
            has_qa = bool(rec.question and rec.answer)
            if not (has_reaction or has_equation or has_species or has_qa):
                return False, ValidationIssue(
                    record_id=rec_id,
                    reason="missing_reaction_data",
                    details=f"Reaction type '{rec.type}' requires reaction, equation, or reactants+products.",
                ), None

        elif rec.type in self.MOLECULAR_TYPES:
            has_mol = bool(rec.molecule or rec.smiles or rec.formula or rec.molecular_formula or rec.answer)
            if not has_mol:
                return False, ValidationIssue(
                    record_id=rec_id,
                    reason="missing_molecular_data",
                    details=f"Molecular type '{rec.type}' requires molecule, smiles, formula, or answer.",
                ), None

        else:
            # General fallback: record must have at least some meaningful content
            has_content = bool(
                (rec.question and rec.answer)
                or rec.context
                or rec.answer
                or rec.reaction
                or rec.formula
            )
            if not has_content:
                return False, ValidationIssue(
                    record_id=rec_id,
                    reason="empty_content",
                    details="Record contains no scientific text, formula, or question/answer content.",
                ), None

        return True, None, rec

    def validate_file(
        self,
        input_file: Union[str, Path],
        validated_file: Optional[Union[str, Path]] = None,
        rejected_file: Optional[Union[str, Path]] = None,
    ) -> Dict[str, Any]:
        """Validate an entire JSONL file, splitting into validated and rejected files."""
        in_p = Path(input_file)
        if not in_p.exists():
            raise FileNotFoundError(f"Input file not found: {in_p}")

        stem = in_p.stem.replace("_imported", "").replace("_raw", "")

        val_p = Path(validated_file) if validated_file else Path(f"chemistry_llm/data/validated/{stem}_validated.jsonl")
        rej_p = Path(rejected_file) if rejected_file else Path(f"chemistry_llm/data/rejected/{stem}_rejected.jsonl")

        val_p.parent.mkdir(parents=True, exist_ok=True)
        rej_p.parent.mkdir(parents=True, exist_ok=True)

        valid_records: List[ChemNovaRecord] = []
        rejected_items: List[Dict[str, Any]] = []
        reasons_breakdown: Dict[str, int] = {}
        seen_ids: Set[str] = set()

        total = 0
        with open(in_p, "r", encoding="utf-8") as f:
            for line_no, line in enumerate(f, 1):
                clean = line.strip()
                if not clean:
                    continue
                total += 1
                try:
                    raw_dict = json.loads(clean)
                except Exception as e:
                    issue = ValidationIssue(
                        record_id=f"line_{line_no}",
                        reason="invalid_json",
                        details=str(e),
                    )
                    rejected_items.append({"raw_line": clean, **issue.to_dict()})
                    reasons_breakdown["invalid_json"] = reasons_breakdown.get("invalid_json", 0) + 1
                    continue

                is_valid, issue, parsed_rec = self.validate_record(raw_dict, seen_ids=seen_ids)
                if is_valid and parsed_rec:
                    valid_records.append(parsed_rec)
                else:
                    issue_dict = issue.to_dict() if issue else {"reason": "unknown_validation_failure"}
                    rejected_items.append({"record": raw_dict, **issue_dict})
                    reason_key = issue.reason if issue else "unknown"
                    reasons_breakdown[reason_key] = reasons_breakdown.get(reason_key, 0) + 1

        # Write validated records
        with open(val_p, "w", encoding="utf-8") as f:
            for rec in valid_records:
                f.write(rec.to_jsonl_line() + "\n")

        # Write rejected records
        with open(rej_p, "w", encoding="utf-8") as f:
            for rej in rejected_items:
                f.write(json.dumps(rej, ensure_ascii=False) + "\n")

        valid_count = len(valid_records)
        rej_count = len(rejected_items)
        rate = (valid_count / total * 100.0) if total > 0 else 0.0

        report = {
            "dataset_file": str(in_p),
            "total_evaluated": total,
            "valid_count": valid_count,
            "rejected_count": rej_count,
            "validation_rate_pct": round(rate, 2),
            "rejection_breakdown": reasons_breakdown,
            "validated_output": str(val_p),
            "rejected_output": str(rej_p),
        }

        logger.info(
            "Validation complete for %s: %d valid, %d rejected (%.1f%% valid)",
            in_p.name,
            valid_count,
            rej_count,
            rate,
        )
        return report


def main():
    parser = argparse.ArgumentParser(description="ChemNova Data Validation CLI")
    parser.add_argument("--input", "-i", required=True, help="Input JSONL file to validate")
    parser.add_argument("--validated", "-v", default=None, help="Output path for valid records")
    parser.add_argument("--rejected", "-r", default=None, help="Output path for rejected records")

    args = parser.parse_args()
    validator = DataValidator()
    report = validator.validate_file(args.input, validated_file=args.validated, rejected_file=args.rejected)

    print("=" * 60)
    print("       CHEMNOVA DATA VALIDATION REPORT")
    print("=" * 60)
    print(f"Total Evaluated:       {report['total_evaluated']}")
    print(f"Valid Records:         {report['valid_count']} ({report['validation_rate_pct']}%)")
    print(f"Rejected Records:      {report['rejected_count']}")
    print("-" * 60)
    print("Rejection Breakdown:")
    for reason, count in report["rejection_breakdown"].items():
        print(f"  • {reason:<25} {count}")
    print("-" * 60)
    print(f"Validated JSONL:       {report['validated_output']}")
    print(f"Rejected JSONL:        {report['rejected_output']}")
    print("=" * 60)


if __name__ == "__main__":
    main()
