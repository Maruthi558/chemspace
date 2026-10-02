"""Command-line script to build and verify the ChemNova Chemistry Knowledge Corpus.

Usage:
    python -m chemistry_llm.data.build_corpus
"""

import argparse
import sys
import json
from pathlib import Path
from chemistry_llm.data.corpus_builder import ChemNovaCorpusBuilder


def main():
    parser = argparse.ArgumentParser(description="ChemNova Master Chemistry Corpus Builder")
    parser.add_argument(
        "--data-dir",
        type=str,
        default="chemistry_llm/data",
        help="Base chemistry_llm/data directory",
    )
    args = parser.parse_args()

    print("================================================================================")
    print("STEP 3: BUILDING CHEMNOVA COMPREHENSIVE CHEMISTRY KNOWLEDGE CORPUS")
    print("================================================================================")

    builder = ChemNovaCorpusBuilder(base_dir=args.data_dir)
    manifest = builder.build()

    print("\n[OK] Corpus Build Completed Successfully!")
    print(f"Total Raw Records Collected:       {manifest['total_records_collected']}")
    print(f"Valid Records:                     {manifest['valid_records_count']}")
    print(f"Rejected Records:                  {manifest['rejected_records_count']}")
    print(f"Duplicates Removed:                {manifest['duplicate_records_removed']}")
    print(f"Final Clean Training-Ready Records:{manifest['final_clean_records_count']}")
    print(f"Scientific Conflicts Documented:   {manifest['scientific_conflicts_count']}")
    print(f"Subdirectories Populated:          {manifest.get('subdirectories_populated_count', 0)}")
    print(f"Provenance Coverage:               {manifest.get('provenance_coverage_percent', 100.0)}%")
    print(f"RDKit Structure Validation Active: {manifest['structure_validation_summary']['rdkit_active']}")
    print(f"SMILES Checked / Valid:            {manifest['structure_validation_summary']['smiles_checked']} / {manifest['structure_validation_summary']['smiles_valid']}")

    print("\n--- Domain Breakdown ---")
    domains = manifest.get("domain_counts", manifest.get("domain_distribution", {}))
    for dom, cnt in domains.items():
        print(f"  - {dom:<30}: {cnt} records")

    print("\n--- Output Files Created ---")
    for name, path in manifest["output_files"].items():
        print(f"  - {name:<20}: {path}")

    print("\n[OK] Manifest exported to: CHEMNOVA_CHEMISTRY_CORPUS_MANIFEST.json")
    print("================================================================================")


if __name__ == "__main__":
    main()
