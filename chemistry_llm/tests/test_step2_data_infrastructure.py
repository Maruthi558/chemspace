"""Comprehensive Test Suite for ChemNova Step 2 Dataset Infrastructure.

Validates all 12+ architectural and operational requirements:
1. JSONL import
2. JSON import
3. CSV import
4. TXT & Markdown import
5. Record validation (valid records)
6. Record validation & rejected-record handling
7. Duplicate detection & audit logging
8. Scientific data normalization (whitespace, unicode, arrows, units, formulas)
9. Provenance & license compliance tracking
10. Dataset registry (lifecycle management)
11. Train / Validation / Test reproducible splitting & leakage prevention
12. Dataset statistics calculation
13. Future tokenization bridge connection
14. Future training bridge connection (PyTorch Dataset & forward pass)
15. Full end-to-end DataQualityPipeline execution
"""

import csv
import json
from pathlib import Path
import shutil
import tempfile
import unittest
import torch

from chemistry_llm.data.schema.types import DatasetType, ChemistryDomain, LicenseStatus, DatasetStatus
from chemistry_llm.data.schema.record import ChemNovaRecord
from chemistry_llm.data.ingest import DataIngestor
from chemistry_llm.data.validate import DataValidator
from chemistry_llm.data.deduplicate import DuplicateDetector
from chemistry_llm.data.normalize import DataNormalizer
from chemistry_llm.data.provenance import ProvenanceTracker, DatasetManifest
from chemistry_llm.data.split import DatasetSplitter
from chemistry_llm.data.statistics import analyze_records, compute_dataset_statistics
from chemistry_llm.data.registry import DatasetRegistry, DatasetEntry
from chemistry_llm.data.bridge import DatasetTokenizationBridge, DatasetTrainingBridge
from chemistry_llm.data.pipeline import DataQualityPipeline
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer
from chemistry_llm.model.language_model import ChemNovaLanguageModel
from chemistry_llm.config.model_config import ChemNovaModelConfig


class TestStep2DataInfrastructure(unittest.TestCase):
    """Test suite for Step 2 dataset infrastructure."""

    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.base_path = Path(self.temp_dir)
        self.tokenizer = ChemNovaTokenizer()

    def tearDown(self):
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_01_jsonl_import(self):
        """1. Ingest JSONL format into standardized ChemNovaRecords."""
        jsonl_file = self.base_path / "sample.jsonl"
        items = [
            {
                "id": "q1",
                "question": "What is the molar mass of H2O?",
                "answer": "18.015 g/mol",
                "type": DatasetType.NUMERICAL_CHEMISTRY_PROBLEMS.value,
                "domain": ChemistryDomain.GENERAL_CHEMISTRY.value,
                "source": "OpenStax",
                "license": "CC-BY-4.0",
            },
            {
                "id": "q2",
                "question": "What is benzene?",
                "answer": "An aromatic hydrocarbon with formula C6H6",
                "smiles": "c1ccccc1",
                "source": "IUPAC",
                "license": "CC0",
            },
        ]
        with open(jsonl_file, "w", encoding="utf-8") as f:
            for item in items:
                f.write(json.dumps(item) + "\n")

        ingestor = DataIngestor()
        out_file = self.base_path / "imported.jsonl"
        records = ingestor.ingest_file(jsonl_file, output_file=out_file)

        self.assertEqual(len(records), 2)
        self.assertEqual(records[0].id, "q1")
        self.assertEqual(records[0].question, "What is the molar mass of H2O?")
        self.assertEqual(records[1].smiles, "c1ccccc1")
        self.assertTrue(out_file.exists())

    def test_02_json_import(self):
        """2. Ingest JSON array and wrapped JSON into ChemNovaRecords."""
        json_file = self.base_path / "sample.json"
        data = {
            "records": [
                {
                    "id": "json_1",
                    "question": "Define activation energy.",
                    "answer": "The minimum energy required to initiate a chemical reaction.",
                    "type": DatasetType.CHEMISTRY_DEFINITIONS.value,
                    "source": "Physical Chemistry",
                }
            ]
        }
        with open(json_file, "w", encoding="utf-8") as f:
            json.dump(data, f)

        ingestor = DataIngestor()
        records = ingestor.ingest_file(json_file)
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0].id, "json_1")
        self.assertEqual(records[0].type, DatasetType.CHEMISTRY_DEFINITIONS.value)

    def test_03_csv_import(self):
        """3. Ingest CSV format mapping columns to ChemNovaRecord fields."""
        csv_file = self.base_path / "sample.csv"
        with open(csv_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["id", "question", "answer", "smiles", "source", "license"])
            writer.writerow(["c1", "Identify aspirin structure", "Acetylsalicylic acid", "CC(=O)Oc1ccccc1C(=O)O", "ChEMBL", "CC-BY"])
            writer.writerow(["c2", "Methane formula", "CH4", "C", "PubChem", "Public Domain"])

        ingestor = DataIngestor()
        records = ingestor.ingest_file(csv_file)
        self.assertEqual(len(records), 2)
        self.assertEqual(records[0].smiles, "CC(=O)Oc1ccccc1C(=O)O")
        self.assertEqual(records[1].formula or records[1].answer, "CH4")

    def test_04_txt_markdown_import(self):
        """4. Ingest plain text paragraphs and markdown sections."""
        txt_file = self.base_path / "notes.txt"
        with open(txt_file, "w", encoding="utf-8") as f:
            f.write("Water is a polar solvent.\n\nEthanol forms hydrogen bonds.")

        md_file = self.base_path / "doc.md"
        with open(md_file, "w", encoding="utf-8") as f:
            f.write("# Chemical Equilibrium\nWhen rates of forward and reverse reactions are equal.\n\n# Le Chatelier Principle\nA system at equilibrium responds to stress.")

        ingestor = DataIngestor()
        txt_recs = ingestor.ingest_file(txt_file)
        self.assertEqual(len(txt_recs), 2)

        md_recs = ingestor.ingest_file(md_file)
        self.assertEqual(len(md_recs), 2)
        self.assertEqual(md_recs[0].question, "Chemical Equilibrium")
        self.assertIn("forward and reverse", md_recs[0].answer)

    def test_05_record_validation_success(self):
        """5. Verify that valid records pass schema validation."""
        validator = DataValidator()
        valid_rec = ChemNovaRecord(
            id="v1",
            question="What is an acid?",
            answer="A proton donor according to Bronsted-Lowry theory.",
            type=DatasetType.CHEMISTRY_DEFINITIONS.value,
            domain=ChemistryDomain.GENERAL_CHEMISTRY.value,
            source="OpenStax",
            license="CC-BY-4.0",
        )
        is_valid, issue, rec = validator.validate_record(valid_rec)
        self.assertTrue(is_valid)
        self.assertIsNone(issue)
        self.assertIsNotNone(rec)

    def test_06_record_validation_rejection(self):
        """6. Verify that invalid records are quarantined into rejected output with reasons."""
        validator = DataValidator()
        seen = set()

        # Missing ID
        bad_rec1 = {"id": "", "question": "Q?", "answer": "A", "source": "S", "license": "CC0"}
        v1, issue1, _ = validator.validate_record(bad_rec1, seen_ids=seen)
        self.assertFalse(v1)
        self.assertEqual(issue1.reason, "missing_id")

        # Empty question for QA type
        bad_rec2 = {"id": "bad2", "question": "  ", "answer": "A", "type": "chemistry_qa", "source": "S", "license": "CC0"}
        v2, issue2, _ = validator.validate_record(bad_rec2, seen_ids=seen)
        self.assertFalse(v2)
        self.assertEqual(issue2.reason, "empty_question")

        # Unsupported dataset type
        bad_rec3 = {"id": "bad3", "question": "Q3", "answer": "A3", "type": "nonexistent_type", "source": "S", "license": "CC0"}
        v3, issue3, _ = validator.validate_record(bad_rec3, seen_ids=seen)
        self.assertFalse(v3)
        self.assertEqual(issue3.reason, "unsupported_type")

        # Missing source
        bad_rec4 = {"id": "bad4", "question": "Q4", "answer": "A4", "source": "", "license": "CC0"}
        v4, issue4, _ = validator.validate_record(bad_rec4, seen_ids=seen)
        self.assertFalse(v4)
        self.assertEqual(issue4.reason, "missing_source")

        # File validation test
        test_file = self.base_path / "mixed.jsonl"
        with open(test_file, "w", encoding="utf-8") as f:
            f.write(json.dumps({"id": "ok1", "question": "What is salt?", "answer": "NaCl", "source": "Book", "license": "MIT"}) + "\n")
            f.write(json.dumps(bad_rec2) + "\n")
            f.write(json.dumps(bad_rec3) + "\n")

        val_file = self.base_path / "val.jsonl"
        rej_file = self.base_path / "rej.jsonl"
        rep = validator.validate_file(test_file, validated_file=val_file, rejected_file=rej_file)

        self.assertEqual(rep["valid_count"], 1)
        self.assertEqual(rep["rejected_count"], 2)
        self.assertTrue(rej_file.exists())

    def test_07_duplicate_detection(self):
        """7. Detect duplicate IDs, QA pairs, and molecules, producing an audit log."""
        detector = DuplicateDetector()
        records = [
            ChemNovaRecord(id="dup1", question="What is H2O?", answer="Water", source="S1", license="MIT"),
            ChemNovaRecord(id="dup1", question="What is H2O?", answer="Water", source="S1", license="MIT"),  # Dup ID
            ChemNovaRecord(id="dup2", question="what is h2o?", answer="water", source="S2", license="MIT"),  # Dup QA
            ChemNovaRecord(id="uniq3", question="What is CO2?", answer="Carbon dioxide", source="S3", license="MIT"),
        ]

        unique, dups, summary = detector.process_records(records)
        self.assertEqual(len(unique), 2)  # dup1 (original) and uniq3
        self.assertEqual(len(dups), 2)
        self.assertIn("duplicate_id", summary["duplicate_breakdown"])
        self.assertIn("duplicate_qa_pair", summary["duplicate_breakdown"])

    def test_08_normalization(self):
        """8. Verify scientific normalization preserves raw data and fixes symbols/units."""
        normalizer = DataNormalizer()
        raw_rec = ChemNovaRecord(
            id="norm1",
            question="What is the   enthalpy   change for  A --> B?",
            answer="It is 42.5 kj / mol at 25 deg C with 6.022 x 10^23 molecules.",
            reaction="2H2 + O2 --> 2H2O",
            formula="h2o",
            smiles="  CC(=O)O  ",
            source="Test",
            license="CC0",
        )

        norm_rec = normalizer.normalize_record(raw_rec)

        # 1. Whitespace
        self.assertNotIn("   ", norm_rec.question)
        # 2. Arrows
        self.assertIn("→", norm_rec.question)
        self.assertIn("→", norm_rec.reaction)
        # 3. Units
        self.assertIn("kJ/mol", norm_rec.answer)
        self.assertIn("°C", norm_rec.answer)
        # 4. Scientific notation
        self.assertIn("6.022e23", norm_rec.answer)
        # 5. Formula
        self.assertEqual(norm_rec.formula, "H2O")
        # 6. SMILES
        self.assertEqual(norm_rec.smiles, "CC(=O)O")
        # 7. Raw preservation
        self.assertIsNotNone(norm_rec.raw_record)
        self.assertEqual(norm_rec.raw_record["question"], raw_rec.question)

    def test_09_provenance_and_licensing(self):
        """9. Verify provenance tracking and license classification."""
        tracker = ProvenanceTracker()
        self.assertEqual(tracker.classify_license("CC-BY-4.0"), LicenseStatus.VERIFIED)
        self.assertEqual(tracker.classify_license("Public Domain"), LicenseStatus.VERIFIED)
        self.assertEqual(tracker.classify_license("Proprietary - All Rights Reserved"), LicenseStatus.RESTRICTED)
        self.assertEqual(tracker.classify_license(""), LicenseStatus.UNKNOWN_LICENSE)

        manifest = DatasetManifest(
            dataset_id="test_ds",
            dataset_name="Test Chemistry",
            source_name="PubChem",
            license_type="CC0",
            license_status=LicenseStatus.VERIFIED,
        )
        man_path = self.base_path / "manifest.json"
        manifest.save_json(man_path)
        loaded = DatasetManifest.load_json(man_path)
        self.assertEqual(loaded.dataset_id, "test_ds")
        self.assertEqual(loaded.license_status, LicenseStatus.VERIFIED)

    def test_10_dataset_registry(self):
        """10. Verify dataset registry lifecycle and persistence."""
        reg_file = self.base_path / "registry.json"
        reg = DatasetRegistry(reg_file)

        entry = DatasetEntry(
            dataset_id="chem_test_1",
            dataset_name="Test Dataset",
            source="Lab",
            record_count=100,
            validated_count=95,
            rejected_count=5,
            status=DatasetStatus.VALIDATED,
        )
        reg.register(entry)

        self.assertEqual(len(reg.list_datasets()), 1)
        retrieved = reg.get("chem_test_1")
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved.validated_count, 95)

        # Update status
        reg.update_status("chem_test_1", DatasetStatus.APPROVED)
        self.assertEqual(reg.get("chem_test_1").status, DatasetStatus.APPROVED)

    def test_11_dataset_splitting(self):
        """11. Verify reproducible train/val/test splitting with zero cross-split leakage."""
        splitter = DatasetSplitter(train_ratio=0.80, val_ratio=0.10, test_ratio=0.10, seed=123)

        records = [
            ChemNovaRecord(id=f"r_{i}", question=f"Question {i}?", answer=f"Answer {i}", source="S", license="MIT")
            for i in range(50)
        ]

        train_recs, val_recs, test_recs, meta = splitter.split_records(records)

        self.assertEqual(len(train_recs) + len(val_recs) + len(test_recs), 50)
        self.assertTrue(meta["leakage_check_passed"])
        self.assertGreater(len(train_recs), len(val_recs))
        self.assertGreater(len(train_recs), len(test_recs))

        # Test reproducibility with identical seed
        t2, v2, s2, _ = splitter.split_records(records)
        self.assertEqual([r.id for r in train_recs], [r.id for r in t2])

    def test_12_statistics_generation(self):
        """12. Verify statistics calculation across records."""
        records = [
            ChemNovaRecord(
                id="s1",
                question="What is ethanol?",
                answer="C2H5OH",
                domain=ChemistryDomain.ORGANIC_CHEMISTRY.value,
                type=DatasetType.CHEMISTRY_QA.value,
                source="PubChem",
                license="CC0",
            ),
            ChemNovaRecord(
                id="s2",
                question="Calculate Gibbs free energy.",
                answer="Delta G = Delta H - T Delta S",
                reasoning="Step 1: calculate enthalpy...",
                domain=ChemistryDomain.PHYSICAL_CHEMISTRY.value,
                type=DatasetType.NUMERICAL_CHEMISTRY_PROBLEMS.value,
                source="NIST",
                license="Public Domain",
            ),
        ]

        stats = analyze_records(records)
        self.assertEqual(stats["total_records"], 2)
        self.assertIn(ChemistryDomain.ORGANIC_CHEMISTRY.value, stats["records_by_domain"])
        self.assertIn(ChemistryDomain.PHYSICAL_CHEMISTRY.value, stats["records_by_domain"])
        self.assertGreater(stats["average_text_length"], 0)

    def test_13_tokenization_bridge(self):
        """13. Verify dataset connects to Step 1 tokenizer producing valid token IDs."""
        bridge = DatasetTokenizationBridge(tokenizer=self.tokenizer)
        records = [
            ChemNovaRecord(
                id="tok1",
                question="What is water?",
                answer="Water is H2O with density 1.0 g/mol.",
                source="Test",
                license="MIT",
            )
        ]

        tokenized = bridge.tokenize_records(records)
        self.assertEqual(len(tokenized), 1)
        self.assertIsInstance(tokenized[0]["token_ids"], list)
        self.assertGreater(len(tokenized[0]["token_ids"]), 0)
        self.assertIn("H2O", tokenized[0]["text"])

    def test_14_training_dataset_bridge(self):
        """14. Verify dataset connects to PyTorch DataLoader and computes forward loss."""
        records = [
            ChemNovaRecord(
                id=f"train_rec_{i}",
                question=f"Describe chemical phenomenon {i}.",
                answer=f"Phenomenon {i} involves reactions with energy transfer and atomic rearrangement.",
                source="Science",
                license="CC0",
            )
            for i in range(10)
        ]

        train_bridge = DatasetTrainingBridge(tokenizer=self.tokenizer)
        dataloader = train_bridge.create_training_dataloader(
            source=records, seq_len=32, batch_size=2
        )

        batch = next(iter(dataloader))
        self.assertIn("input_ids", batch)
        self.assertIn("targets", batch)
        self.assertIn("attention_mask", batch)

        # Test dry-run pass through Step 1 model
        config = ChemNovaModelConfig(
            vocabulary_size=max(4096, self.tokenizer.vocab_size + 50),
            context_length=64,
            embedding_dimension=64,
            number_of_layers=2,
            number_of_attention_heads=2,
            feed_forward_dimension=128,
            device="cpu",
        )
        model = ChemNovaLanguageModel(config)
        res = train_bridge.dry_run_model_batch(model=model, dataloader=dataloader)

        self.assertEqual(res["status"], "success")
        self.assertIsNotNone(res["loss"])
        self.assertGreater(res["loss"], 0.0)

    def test_15_full_pipeline(self):
        """15. End-to-end quality pipeline runs RAW -> IMPORT -> VALIDATE -> DEDUP -> NORM -> SPLIT -> REGISTRY."""
        raw_file = self.base_path / "raw_corpus.json"
        raw_items = [
            {"id": "p1", "question": "What is NaCl?", "answer": "Sodium chloride   table salt.", "source": "OpenStax", "license": "CC0"},
            {"id": "p1_dup", "question": "What is NaCl?", "answer": "Sodium chloride   table salt.", "source": "OpenStax", "license": "CC0"},  # duplicate QA
            {"id": "p2", "type": "chemical_reactions", "question": "Water reaction", "reaction": "2H2 + O2 -> 2H2O", "source": "OpenStax", "license": "CC0"},
            {"id": "p3", "question": "", "answer": "Broken record", "source": "BadSource", "license": "None"},  # invalid, empty question
        ]
        with open(raw_file, "w", encoding="utf-8") as f:
            json.dump(raw_items, f)

        pipeline = DataQualityPipeline(base_dir=self.base_path)
        summary = pipeline.run(
            input_path=raw_file,
            dataset_id="test_pipeline_ds",
            dataset_name="Test Pipeline Dataset",
            split_data=True,
            approve_for_training=True,
        )

        self.assertEqual(summary["total_ingested"], 4)
        self.assertEqual(summary["rejected_count"], 1)  # p3 rejected
        self.assertEqual(summary["duplicates_removed"], 1)  # p1 dup removed
        self.assertEqual(summary["final_processed_count"], 2)  # p1 and p2 clean
        self.assertEqual(summary["status"], DatasetStatus.APPROVED.value)
        self.assertTrue(summary["split_executed"])


if __name__ == "__main__":
    unittest.main()
