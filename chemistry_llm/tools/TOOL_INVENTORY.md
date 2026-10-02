# ChemNova Chemistry Tools Inventory (Step 7)

**Generated:** 2026-10-01  
**Author:** ChemNova System Architecture  
**Scope:** Complete inventory of verified chemistry tools, endpoints, and frontend components in ChemNova.

---

## 1. RDKit Laboratory Engine

- **Tool Name:** `rdkit`
- **Purpose:** Rigorous cheminformatics calculations: SMILES validation, 2D/3D structure embedding, molecular formula calculation, exact molecular weight, physicochemical descriptors (LogP, TPSA, HBD, HBA, rotatable bonds, Lipinski Rule of 5), and substructure/similarity search.
- **Frontend Location:** 
  - `src/pages/AIChemistryLab.jsx`
  - `src/components/RDKit/Molecule2DViewer.jsx`
- **Backend Location:**
  - `backend/main.py` (Lines 978–1165, 1464–1509)
  - `chemistry_llm/tools/chemistry/rdkit_tools.py`
- **API Routes:**
  - `POST /api/molecule/properties` (Input: `{"smiles": "..."}`)
  - `POST /api/molecule/parse` (Input: `{"smiles": "..."}`)
  - `POST /api/molecule/3d` (Input: `{"smiles": "..."}`)
  - `POST /api/molecule/standardize` (Input: `{"smiles": "..."}`)
  - `POST /api/search/similarity` (Input: `{"query_smiles": "...", "target_smiles_list": [...]}`)
  - `POST /api/search/substructure` (Input: `{"query_smarts": "...", "target_smiles_list": [...]}`)
  - `POST /api/rdkit/execute` (Input: `{"code": "..."}`)
- **Input Format:** JSON with `smiles` string or `query_smiles` / `query_smarts`.
- **Output Format:** JSON with status, formula, molWeight, logP, tpsa, hbd, hba, rotatableBonds, lipinskiPassed, atom/bond coordinates.
- **Dependencies:** RDKit C++ kernel (`rdkit.Chem`, `Descriptors`, `rdMolDescriptors`, `AllChem`).
- **Current Status:** Production Ready & Operational.
- **Validation Method:** `Chem.MolFromSmiles(smiles)` with strict parsing and error capture.
- **Limitations:** Constrained to chemical structures representable as valence-consistent molecular graphs.

---

## 2. ChemDraw 2D/3D Molecular Studio

- **Tool Name:** `chemdraw`
- **Purpose:** Interactive molecular structure sketching, 2D diagram depiction, 3D conformation generation, and chemical file format exchange (SMILES, Molfile, InChI).
- **Frontend Location:**
  - `src/pages/ChemDraw.jsx`
  - `src/components/ChemDrawStudio.jsx` (94 KB canvas engine)
- **Backend Location:**
  - `backend/main.py` (`/api/molecule/parse`, `/api/molecule/3d`, `/api/molecule/standardize`)
- **API Routes:**
  - `POST /api/molecule/parse`
  - `POST /api/molecule/3d`
- **Input Format:** Molecule representation (SMILES, Molblock, coordinates).
- **Output Format:** JSON containing parsed 2D/3D atomic coordinate graph (`atoms: [{id, element, x, y, z}]`, `bonds: [{from, to, order}]`).
- **Dependencies:** Canvas 2D, Three.js, RDKit coordinate generation (`AllChem.EmbedMolecule`).
- **Current Status:** Production Ready & Operational.
- **Validation Method:** Atom coordinate bounds and bond valence checks.
- **Limitations:** Complex bio-macromolecules (e.g., Ribosomes) require external PDB visualizers.

---

## 3. Spectroscopy Analysis Suite

- **Tool Name:** `spectroscopy`
- **Purpose:** Multi-technique spectroscopy analysis and prediction: Infrared (IR) functional group absorption bands, $^1$H NMR chemical shifts and multiplicities, $^{13}$C NMR, Mass Spectrometry (MS) fragmentation ($M^+$ and base peak), and UV-Vis absorption ($\lambda_{max}$).
- **Frontend Location:**
  - `src/pages/Spectroscopy.jsx`
  - `src/components/SpectroscopySuite.jsx` (41 KB interactive viewer)
- **Backend Location:**
  - `backend/main.py` (Lines 1426–1463)
  - `chemistry_llm/tools/chemistry/spectroscopy_tools.py`
- **API Routes:**
  - `POST /api/spectroscopy/predict` (Input: `{"smiles": "...", "techniques": [...]}`)
- **Input Format:** JSON with `smiles` string and optional list of requested spectroscopic methods.
- **Output Format:** JSON containing `ir.keyBands`, `nmr1H.signals` (`shift`, `multiplicity`, `integration`), `massSpec` (`molecularIon`, `basePeak`, `peaks`), and `uvVis` (`lambdaMax`, `molarExtinction`).
- **Dependencies:** RDKit, NumPy.
- **Current Status:** Production Ready & Operational.
- **Validation Method:** Molecular formula validation and functional group correlation.
- **Limitations:** Heuristic and simulation-based; clearly distinguished from experimental spectral measurements.

---

## 4. IBM RXN Reaction & Retrosynthesis Engine

- **Tool Name:** `ibm_rxn`
- **Purpose:** Forward chemical reaction prediction, product outcome forecasting, reaction class categorization, mechanism step decomposition, and multi-step retrosynthetic pathway planning.
- **Frontend Location:**
  - `src/pages/IbmRxnPage.jsx`
  - `src/components/IbmRxn/IbmRxnUnifiedStudio.jsx`
  - `src/components/IbmRxn/ReactionCanvasDrawer.jsx`
  - `src/components/IbmRxn/MechanismWorkspace.jsx`
  - `src/components/IbmRxn/RetrosynthesisTreeExplorer.jsx`
- **Backend Location:**
  - `backend/main.py` (Lines 1166–1219)
- **API Routes:**
  - `POST /api/reaction/predict` (Input: `{"reactants_smiles": "...", "reagents": "..."}`)
  - `POST /api/reaction/retrosynthesis` (Input: `{"target_smiles": "...", "max_steps": int}`)
- **Input Format:** Reactant SMILES string (e.g. `"CC(=O)O.c1ccccc1"`) and optional reagents.
- **Output Format:** Predicted product (`name`, `smiles`, `formula`, `confidenceScore`, `yield`, `byproducts`), `reactionClass`, and `mechanismSteps`. Retrosynthesis returns recursive precursor tree.
- **Dependencies:** Reaction rule heuristics, Transformer prediction models.
- **Current Status:** Operational.
- **Validation Method:** Reactant SMILES verification and stoichiometry checks.
- **Limitations:** Novel catalytic systems and complex organometallic reactions require experimental verification.

---

## 5. Quantum Chemistry Engine / Calculator

- **Tool Name:** `quantum`
- **Purpose:** High-level electronic structure calculations: Hartree-Fock (RHF/UHF), Density Functional Theory (DFT: B3LYP, PBE0, M06-2X), MP2, Coupled Cluster (CCSD, CCSD(T)), basis sets (STO-3G up to cc-pVTZ), HOMO/LUMO frontier orbitals, band gaps, dipole moments, chemical hardness, and zero-point vibrational energy (ZPVE).
- **Frontend Location:**
  - `src/pages/QuantumLab.jsx`
  - `src/components/QuantumChemistryLab.jsx` (25 KB)
  - `src/components/QuantumChemistry/`
- **Backend Location:**
  - `backend/quantum_chemistry_engine.py` (33.6 KB research-grade layer)
  - `backend/main.py` (Lines 1220–1425)
- **API Routes:**
  - `POST /api/quantum/calculate` (Input: `{"smiles": "...", "method": "...", "basis_set": "..."}`)
  - `GET /api/quantum/engines`
  - `POST /api/quantum/run`
  - `POST /api/quantum/generate-input`
  - `POST /api/quantum/estimate-cost`
  - `POST /api/quantum/pes-scan`
- **Input Format:** JSON specifying `smiles`, `method` (e.g., `"DFT (B3LYP)"`), and `basis_set` (e.g., `"6-31G(d)"`).
- **Output Format:** JSON containing `total_energy_hartree`, `total_energy_kcal_mol`, `homo_energy_ev`, `lumo_energy_ev`, `homo_lumo_gap_ev`, `dipole_moment_debye`, `chemical_hardness_ev`, and `zero_point_energy_kcal_mol`.
- **Dependencies:** `backend/quantum_chemistry_engine.py`, PySCF, NumPy.
- **Current Status:** Production Ready & Operational.
- **Validation Method:** Method and basis set validation against strict enumerations (`QuantumMethod`, `BasisSet`).
- **Limitations:** High-level electron correlation methods (e.g. CCSD(T)) on large molecules require high memory and computational cluster execution.
