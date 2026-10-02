"""Run script for instruction data pipeline."""

from chemistry_llm.instruction_data.pipeline import InstructionDataPipeline

def main():
    pipe = InstructionDataPipeline()
    manifest = pipe.run_pipeline()
    print("=== INSTRUCTION DATASET PIPELINE RESULTS ===")
    print(f"Total Examples:   {manifest['total_examples']}")
    print(f"Train Count:      {manifest['splits']['train']['count']}")
    print(f"Validation Count: {manifest['splits']['validation']['count']}")
    print(f"Test Count:       {manifest['splits']['test']['count']}")
    print(f"Pass Rate:        {manifest['statistics']['validation_pass_rate'] * 100:.1f}%")
    print(f"Categories:       {len(manifest['statistics']['domain_distribution'])}")

if __name__ == "__main__":
    main()
