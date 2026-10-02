import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  RotateCcw,
  Plus,
  Terminal,
  FileCode,
  Box,
  Layers,
  Activity,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Atom,
  Trash2
} from 'lucide-react';
import NotebookHeader from '../components/notebook/NotebookHeader';
import NotebookCell from '../components/notebook/NotebookCell';
import { executePythonScript, resetNotebookSession } from '../services/api';
import { logActivity } from '../services/activityStore';
import { useTheme } from '../context/ThemeContext';

/**
 * INITIAL SCIENTIFIC NOTEBOOK WORKFLOW
 * Demonstrates imports, SMILES parsing, 2D Kekulé rendering,
 * cross-cell state sharing (Descriptors), and MMFF94 3D conformer generation.
 */
const DEFAULT_INITIAL_CELLS = [
  {
    id: 'cell-init-1',
    code: `from rdkit import Chem
from rdkit.Chem import Descriptors, AllChem
print("RDKit 2026.03.5 scientific kernel connected successfully.")`,
    status: 'idle',
    executionCount: null,
    executionTime: null,
    output: null
  },
  {
    id: 'cell-init-2',
    code: `# Enter target molecular structure (SMILES)
smiles = "CC(=O)Oc1ccccc1C(=O)O"  # Aspirin
mol = Chem.MolFromSmiles(smiles)
mol`,
    status: 'idle',
    executionCount: null,
    executionTime: null,
    output: null
  },
  {
    id: 'cell-init-3',
    code: `# Compute physicochemical descriptors from the active 'mol'
mw = round(Descriptors.MolWt(mol), 2)
logp = round(Descriptors.MolLogP(mol), 2)
tpsa = round(Descriptors.TPSA(mol), 2)
hbd = Descriptors.NumHDonors(mol)
hba = Descriptors.NumHAcceptors(mol)
rot = Descriptors.NumRotatableBonds(mol)

print(f"Molecular Weight: {mw} g/mol | LogP: {logp} | TPSA: {tpsa} Å²")

# Return structured Lipinski Ro5 compliance table
[{"Descriptor": "Molecular Weight", "Value": f"{mw} g/mol", "Rule_of_5": "<= 500 Da"},
 {"Descriptor": "LogP (Lipophilicity)", "Value": str(logp), "Rule_of_5": "<= 5.0"},
 {"Descriptor": "Polar Surface Area", "Value": f"{tpsa} Å²", "Rule_of_5": "<= 140 Å²"},
 {"Descriptor": "H-Bond Donors", "Value": str(hbd), "Rule_of_5": "<= 5"},
 {"Descriptor": "H-Bond Acceptors", "Value": str(hba), "Rule_of_5": "<= 10"},
 {"Descriptor": "Rotatable Bonds", "Value": str(rot), "Rule_of_5": "<= 10"}]`,
    status: 'idle',
    executionCount: null,
    executionTime: null,
    output: null
  },
  {
    id: 'cell-init-4',
    code: `# Generate 3D energy-minimized conformer with MMFF94 force field
mol_3d = Chem.AddHs(mol)
AllChem.EmbedMolecule(mol_3d, randomSeed=42)
AllChem.MMFFOptimizeMolecule(mol_3d)
mol_3d`,
    status: 'idle',
    executionCount: null,
    executionTime: null,
    output: null
  }
];

const TEMPLATES = {
  aspirin: [
    {
      code: `from rdkit import Chem
from rdkit.Chem import Descriptors, AllChem

smiles = "CC(=O)Oc1ccccc1C(=O)O"  # 2-Acetyloxybenzoic acid (Aspirin)
mol = Chem.MolFromSmiles(smiles)
mol`
    },
    {
      code: `print(f"Chemical Formula: {Chem.rdMolDescriptors.CalcMolFormula(mol)}")
print(f"Molecular Weight: {Descriptors.MolWt(mol):.2f} g/mol")
print(f"Exact Monoisotopic Mass: {Descriptors.ExactMolWt(mol):.4f}")`
    },
    {
      code: `mol_3d = Chem.AddHs(mol)
AllChem.EmbedMolecule(mol_3d, randomSeed=42)
AllChem.MMFFOptimizeMolecule(mol_3d)
mol_3d`
    }
  ],
  lipinski: [
    {
      code: `from rdkit import Chem
from rdkit.Chem import Descriptors

# Compare drug-likeness across benchmark compounds
specimens = {
    "Aspirin": "CC(=O)Oc1ccccc1C(=O)O",
    "Caffeine": "CN1C=NC2=C1C(=O)N(C(=O)N2C)C",
    "Paracetamol": "CC(=O)Nc1ccc(O)cc1",
    "Ibuprofen": "CC(C)Cc1ccc(cc1)C(C)C(=O)O"
}

rows = []
for name, smi in specimens.items():
    m = Chem.MolFromSmiles(smi)
    mw = Descriptors.MolWt(m)
    logp = Descriptors.MolLogP(m)
    tpsa = Descriptors.TPSA(m)
    hbd = Descriptors.NumHDonors(m)
    hba = Descriptors.NumHAcceptors(m)
    passed = mw <= 500 and logp <= 5.0 and hbd <= 5 and hba <= 10
    rows.append({
        "Molecule": name,
        "SMILES": smi,
        "MW (g/mol)": round(mw, 2),
        "LogP": round(logp, 2),
        "TPSA (Å²)": round(tpsa, 2),
        "Ro5 Status": "PASS" if passed else "FAIL"
    })

rows`
    }
  ],
  conformer: [
    {
      code: `from rdkit import Chem
from rdkit.Chem import AllChem

# Conformation search: Benzene ring with conjugated sidechain
mol = Chem.MolFromSmiles("c1ccccc1C(=O)NCC")
mol_3d = Chem.AddHs(mol)
AllChem.EmbedMolecule(mol_3d, randomSeed=101)
AllChem.MMFFOptimizeMolecule(mol_3d, maxIters=500)
mol_3d`
    }
  ],
  descriptors: [
    {
      code: `from rdkit import Chem
from rdkit.Chem import Descriptors
import matplotlib.pyplot as plt

smiles_list = ["c1ccccc1", "CCO", "CC(=O)O", "CCN", "c1ccc(O)cc1", "c1ccc(Cl)cc1"]
mols = [Chem.MolFromSmiles(s) for s in smiles_list]
weights = [Descriptors.MolWt(m) for m in mols]
logps = [Descriptors.MolLogP(m) for m in mols]

fig, ax = plt.subplots(figsize=(6, 3.5))
ax.scatter(weights, logps, color="#10b981", s=80, edgecolors="#0f172a")
for i, txt in enumerate(smiles_list):
    ax.annotate(txt, (weights[i] + 1, logps[i] + 0.05), fontsize=8)
ax.set_xlabel("Molecular Weight (g/mol)")
ax.set_ylabel("LogP (Octanol/Water)")
ax.set_title("RDKit Descriptors Distribution", fontsize=11, fontweight="bold")
ax.grid(True, linestyle="--", alpha=0.5)
plt.tight_layout()
plt.show()`
    }
  ]
};

export default function AIChemistryLab() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Persistent unique session ID for this notebook session
  const [sessionId] = useState(() => {
    try {
      const stored = sessionStorage.getItem('chemspace_notebook_session');
      if (stored) return stored;
      const newId = 'session_' + Math.random().toString(36).substring(2, 10);
      sessionStorage.setItem('chemspace_notebook_session', newId);
      return newId;
    } catch {
      return 'session_' + Math.random().toString(36).substring(2, 10);
    }
  });

  const [cells, setCells] = useState(DEFAULT_INITIAL_CELLS);
  const [globalExecutionCount, setGlobalExecutionCount] = useState(1);
  const [kernelStatus, setKernelStatus] = useState('ready'); // 'ready' | 'busy'
  const [isExecutingAll, setIsExecutingAll] = useState(false);

  /**
   * Run a specific cell by its unique ID
   */
  const handleRunCell = useCallback(async (cellId) => {
    const targetCell = cells.find((c) => c.id === cellId);
    if (!targetCell || !targetCell.code.trim()) return;

    setKernelStatus('busy');

    // Update target cell state to running
    setCells((prev) =>
      prev.map((c) =>
        c.id === cellId
          ? { ...c, status: 'running' }
          : c
      )
    );

    const startTime = performance.now();

    try {
      const result = await executePythonScript(targetCell.code, sessionId, cellId);
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2) + 's';

      const execCount = globalExecutionCount;
      setGlobalExecutionCount((n) => n + 1);

      setCells((prev) =>
        prev.map((c) =>
          c.id === cellId
            ? {
                ...c,
                status: result.status === 'success' ? 'success' : 'error',
                executionCount: execCount,
                executionTime: elapsed,
                output: result
              }
            : c
        )
      );

      logActivity('RDKit Lab', 'Executed Notebook Cell', `Session: ${sessionId}`, 'rdkit');
    } catch (err) {
      setCells((prev) =>
        prev.map((c) =>
          c.id === cellId
            ? {
                ...c,
                status: 'error',
                executionTime: '0.0s',
                output: {
                  status: 'error',
                  error: err.message || 'Execution error in Python runtime.',
                  traceback: err.stack || ''
                }
              }
            : c
        )
      );
    } finally {
      setKernelStatus('ready');
    }
  }, [cells, sessionId, globalExecutionCount]);

  /**
   * Run current cell and move to or create the next cell
   */
  const handleRunAndAdvance = useCallback(async (cellIndex) => {
    const currentCell = cells[cellIndex];
    if (!currentCell) return;

    await handleRunCell(currentCell.id);

    // If there is no next cell, append a new cell automatically
    if (cellIndex === cells.length - 1) {
      const newCellId = `cell-${Date.now()}`;
      setCells((prev) => [
        ...prev,
        {
          id: newCellId,
          code: '',
          status: 'idle',
          executionCount: null,
          executionTime: null,
          output: null
        }
      ]);
    }
  }, [cells, handleRunCell]);

  /**
   * Run all cells sequentially in order, updating state between each
   */
  const handleRunAll = async () => {
    setIsExecutingAll(true);
    setKernelStatus('busy');

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      if (!cell.code.trim()) continue;

      setCells((prev) =>
        prev.map((c) => (c.id === cell.id ? { ...c, status: 'running' } : c))
      );

      const startTime = performance.now();
      try {
        const result = await executePythonScript(cell.code, sessionId, cell.id);
        const elapsed = ((performance.now() - startTime) / 1000).toFixed(2) + 's';

        setCells((prev) =>
          prev.map((c) =>
            c.id === cell.id
              ? {
                  ...c,
                  status: result.status === 'success' ? 'success' : 'error',
                  executionCount: i + 1,
                  executionTime: elapsed,
                  output: result
                }
              : c
          )
        );
      } catch (err) {
        setCells((prev) =>
          prev.map((c) =>
            c.id === cell.id
              ? {
                  ...c,
                  status: 'error',
                  output: { status: 'error', error: err.message }
                }
              : c
          )
        );
      }
    }

    setGlobalExecutionCount(cells.length + 1);
    setIsExecutingAll(false);
    setKernelStatus('ready');
  };

  /**
   * Add a new code cell at the end or at a specific index
   */
  const handleAddCell = (afterIndex = null) => {
    const newCell = {
      id: `cell-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: '',
      status: 'idle',
      executionCount: null,
      executionTime: null,
      output: null
    };

    setCells((prev) => {
      if (afterIndex === null || afterIndex === undefined || afterIndex >= prev.length - 1) {
        return [...prev, newCell];
      }
      const copy = [...prev];
      copy.splice(afterIndex + 1, 0, newCell);
      return copy;
    });
  };

  /**
   * Update code of a cell
   */
  const handleCodeChange = (cellId, newCode) => {
    setCells((prev) =>
      prev.map((c) => (c.id === cellId ? { ...c, code: newCode } : c))
    );
  };

  /**
   * Delete a cell
   */
  const handleDeleteCell = (cellId) => {
    setCells((prev) => {
      if (prev.length <= 1) {
        // Keep at least one empty cell
        return [
          {
            id: `cell-${Date.now()}`,
            code: '',
            status: 'idle',
            executionCount: null,
            executionTime: null,
            output: null
          }
        ];
      }
      return prev.filter((c) => c.id !== cellId);
    });
  };

  /**
   * Duplicate a cell
   */
  const handleDuplicateCell = (cellId) => {
    const targetIdx = cells.findIndex((c) => c.id === cellId);
    if (targetIdx === -1) return;

    const source = cells[targetIdx];
    const duplicated = {
      id: `cell-${Date.now()}`,
      code: source.code,
      status: 'idle',
      executionCount: null,
      executionTime: null,
      output: null
    };

    setCells((prev) => {
      const copy = [...prev];
      copy.splice(targetIdx + 1, 0, duplicated);
      return copy;
    });
  };

  /**
   * Move cell up or down
   */
  const handleMoveCell = (cellId, direction) => {
    setCells((prev) => {
      const idx = prev.findIndex((c) => c.id === cellId);
      if (idx === -1) return prev;
      if (direction === 'up' && idx === 0) return prev;
      if (direction === 'down' && idx === prev.length - 1) return prev;

      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      const copy = [...prev];
      const [moved] = copy.splice(idx, 1);
      copy.splice(targetIdx, 0, moved);
      return copy;
    });
  };

  /**
   * Clear output of single cell
   */
  const handleClearCellOutput = (cellId) => {
    setCells((prev) =>
      prev.map((c) =>
        c.id === cellId
          ? { ...c, status: 'idle', output: null, executionTime: null }
          : c
      )
    );
  };

  /**
   * Clear all outputs in the notebook
   */
  const handleClearAllOutputs = () => {
    setCells((prev) =>
      prev.map((c) => ({
        ...c,
        status: 'idle',
        executionCount: null,
        executionTime: null,
        output: null
      }))
    );
  };

  /**
   * Reset kernel session (clears backend variables)
   */
  const handleRestartKernel = async () => {
    setKernelStatus('busy');
    try {
      await resetNotebookSession(sessionId);
      handleClearAllOutputs();
      setGlobalExecutionCount(1);
    } catch (e) {
      console.warn('Failed to reset kernel:', e);
    } finally {
      setKernelStatus('ready');
    }
  };

  /**
   * Load chemistry templates into notebook
   */
  const handleLoadTemplate = (templateKey) => {
    const tmplCells = TEMPLATES[templateKey];
    if (!tmplCells) return;

    const formatted = tmplCells.map((t, idx) => ({
      id: `cell-tmpl-${Date.now()}-${idx}`,
      code: t.code,
      status: 'idle',
      executionCount: null,
      executionTime: null,
      output: null
    }));

    setCells(formatted);
    handleRestartKernel();
  };

  return (
    <div className="w-full min-h-screen relative select-none bg-[var(--home-bg-base)] text-[var(--home-text-primary)] transition-colors duration-300 font-sans">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
        
        {/* ── Minimal Professional Scientific Notebook Header ── */}
        <NotebookHeader
          kernelStatus={kernelStatus}
          isExecutingAll={isExecutingAll}
          onAddCell={() => handleAddCell()}
          onRunAll={handleRunAll}
          onRestartKernel={handleRestartKernel}
          onClearAllOutputs={handleClearAllOutputs}
          onLoadTemplate={handleLoadTemplate}
        />

        {/* ── Continuous Scientific Notebook Cells Stream ── */}
        <div className="space-y-4">
          {cells.map((cell, idx) => (
            <NotebookCell
              key={cell.id}
              cell={cell}
              cellIndex={idx + 1}
              isFirst={idx === 0}
              isLast={idx === cells.length - 1}
              onRun={() => handleRunCell(cell.id)}
              onRunAndAdvance={() => handleRunAndAdvance(idx)}
              onChangeCode={(newCode) => handleCodeChange(cell.id, newCode)}
              onDelete={() => handleDeleteCell(cell.id)}
              onDuplicate={() => handleDuplicateCell(cell.id)}
              onMoveUp={() => handleMoveCell(cell.id, 'up')}
              onMoveDown={() => handleMoveCell(cell.id, 'down')}
              onClearOutput={() => handleClearCellOutput(cell.id)}
              onInsertCellBelow={() => handleAddCell(idx)}
            />
          ))}
        </div>

        {/* ── Bottom Notebook Action Strip ── */}
        <div className="pt-4 border-t border-inherit flex items-center justify-between text-xs font-mono text-[var(--home-text-muted)]">
          <button
            onClick={() => handleAddCell()}
            className="btn-orange py-2 px-4 text-xs font-bold font-mono flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Code Cell</span>
          </button>

          <div className="flex items-center gap-3">
            <span>Shift+Enter to Run &amp; Advance</span>
            <span>•</span>
            <span>Ctrl+Enter to Run</span>
          </div>
        </div>

      </div>
    </div>
  );
}
