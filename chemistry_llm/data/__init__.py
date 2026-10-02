"""ChemNova Chemistry Dataset Infrastructure Package."""

__all__ = [
    "DatasetType",
    "ChemistryDomain",
    "LicenseStatus",
    "DatasetStatus",
    "ChemNovaRecord",
    "DataIngestor",
    "DataValidator",
    "ValidationIssue",
    "DuplicateDetector",
    "DuplicateRecordEntry",
    "DataNormalizer",
    "ProvenanceTracker",
    "DatasetManifest",
    "DatasetSplitter",
    "compute_dataset_statistics",
    "analyze_records",
    "DatasetRegistry",
    "DatasetEntry",
    "DataQualityPipeline",
    "DatasetTokenizationBridge",
    "DatasetTrainingBridge",
    "ChemNovaCorpusBuilder",
    "ChemicalStructureValidator",
    "ConflictDetector",
    "CurrentScienceManager",
]


def __getattr__(name: str):
    if name in {"DatasetType", "ChemistryDomain", "LicenseStatus", "DatasetStatus", "ChemNovaRecord"}:
        from . import schema
        return getattr(schema, name)
    if name == "DataIngestor":
        from .ingest import DataIngestor
        return DataIngestor
    if name in {"DataValidator", "ValidationIssue"}:
        from . import validate
        return getattr(validate, name)
    if name in {"DuplicateDetector", "DuplicateRecordEntry"}:
        from . import deduplicate
        return getattr(deduplicate, name)
    if name == "DataNormalizer":
        from .normalize import DataNormalizer
        return DataNormalizer
    if name in {"ProvenanceTracker", "DatasetManifest"}:
        from . import provenance
        return getattr(provenance, name)
    if name == "DatasetSplitter":
        from .split import DatasetSplitter
        return DatasetSplitter
    if name in {"compute_dataset_statistics", "analyze_records"}:
        from . import statistics
        return getattr(statistics, name)
    if name in {"DatasetRegistry", "DatasetEntry"}:
        from . import registry
        return getattr(registry, name)
    if name == "DataQualityPipeline":
        from .pipeline import DataQualityPipeline
        return DataQualityPipeline
    if name in {"DatasetTokenizationBridge", "DatasetTrainingBridge"}:
        from . import bridge
        return getattr(bridge, name)
    if name == "ChemNovaCorpusBuilder":
        from .corpus_builder import ChemNovaCorpusBuilder
        return ChemNovaCorpusBuilder
    if name == "ChemicalStructureValidator":
        from .structure_validator import ChemicalStructureValidator
        return ChemicalStructureValidator
    if name == "ConflictDetector":
        from .conflict_detector import ConflictDetector
        return ConflictDetector
    if name == "CurrentScienceManager":
        from .current_science import CurrentScienceManager
        return CurrentScienceManager
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")

