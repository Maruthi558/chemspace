"""ChemNova Chemistry Dataset Types, Domains, and Status Enums."""

from enum import Enum
from typing import Set


class DatasetType(str, Enum):
    """The 30 supported ChemNova chemistry dataset record types."""

    # 1. Core Knowledge
    CHEMISTRY_FACTS = "chemistry_facts"
    CHEMISTRY_DEFINITIONS = "chemistry_definitions"
    CHEMISTRY_CONCEPTS = "chemistry_concepts"
    CHEMISTRY_QA = "chemistry_qa"
    CHEMISTRY_REASONING = "chemistry_reasoning"
    NUMERICAL_CHEMISTRY_PROBLEMS = "numerical_chemistry_problems"
    WORKED_SOLUTIONS = "worked_solutions"

    # 2. Reactions & Equations
    CHEMICAL_EQUATIONS = "chemical_equations"
    CHEMICAL_REACTIONS = "chemical_reactions"
    REACTION_MECHANISMS = "reaction_mechanisms"

    # 3. Structural & Molecular
    MOLECULAR_INFORMATION = "molecular_information"
    COMPOUND_INFORMATION = "compound_information"
    ELEMENT_INFORMATION = "element_information"
    SPECTROSCOPY_INFORMATION = "spectroscopy_information"

    # 4. Traditional Chemistry Branches
    ORGANIC_CHEMISTRY = "organic_chemistry"
    INORGANIC_CHEMISTRY = "inorganic_chemistry"
    PHYSICAL_CHEMISTRY = "physical_chemistry"
    ANALYTICAL_CHEMISTRY = "analytical_chemistry"
    BIOCHEMISTRY = "biochemistry"
    MEDICINAL_CHEMISTRY = "medicinal_chemistry"
    MATERIALS_CHEMISTRY = "materials_chemistry"

    # 5. Advanced & Computational
    COMPUTATIONAL_CHEMISTRY = "computational_chemistry"
    QUANTUM_CHEMISTRY = "quantum_chemistry"

    # 6. Practice & Safety
    LABORATORY_KNOWLEDGE = "laboratory_knowledge"
    SAFETY_KNOWLEDGE = "safety_knowledge"
    CHEMISTRY_TERMINOLOGY = "chemistry_terminology"
    SCIENTIST_DISCOVERY = "scientist_discovery"

    # 7. Reasoning & Platform
    HYPOTHETICAL_CHEMISTRY_QUESTIONS = "hypothetical_chemistry_questions"
    MULTI_STEP_REASONING = "multi_step_reasoning"
    CHEMNOVA_WEBSITE_KNOWLEDGE = "chemnova_website_knowledge"

    @classmethod
    def all_types(cls) -> Set[str]:
        return {item.value for item in cls}


class ChemistryDomain(str, Enum):
    """Major scientific chemistry domains."""

    GENERAL_CHEMISTRY = "general_chemistry"
    ORGANIC_CHEMISTRY = "organic_chemistry"
    INORGANIC_CHEMISTRY = "inorganic_chemistry"
    PHYSICAL_CHEMISTRY = "physical_chemistry"
    ANALYTICAL_CHEMISTRY = "analytical_chemistry"
    BIOCHEMISTRY = "biochemistry"
    MEDICINAL_CHEMISTRY = "medicinal_chemistry"
    MATERIALS_CHEMISTRY = "materials_chemistry"
    COMPUTATIONAL_CHEMISTRY = "computational_chemistry"
    QUANTUM_CHEMISTRY = "quantum_chemistry"
    SPECTROSCOPY = "spectroscopy"
    CHEMICAL_SAFETY = "chemical_safety"
    LABORATORY_TECHNIQUES = "laboratory_techniques"
    HISTORY_AND_DISCOVERY = "history_and_discovery"
    CHEMNOVA_PLATFORM = "chemnova_platform"

    @classmethod
    def all_domains(cls) -> Set[str]:
        return {item.value for item in cls}


class LicenseStatus(str, Enum):
    """Provenance and license compliance classification."""

    VERIFIED = "verified"
    UNVERIFIED = "unverified"
    RESTRICTED = "restricted"
    UNKNOWN_LICENSE = "unknown_license"


class DatasetStatus(str, Enum):
    """Operational status of datasets in registry."""

    IMPORTED = "imported"
    VALIDATING = "validating"
    VALIDATED = "validated"
    APPROVED = "approved"
    REJECTED = "rejected"
    ARCHIVED = "archived"
