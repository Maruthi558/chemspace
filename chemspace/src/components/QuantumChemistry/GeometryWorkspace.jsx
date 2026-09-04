import React, { useState } from 'react';
import {
  Box,
  Table as TableIcon,
  Ruler,
  Compass,
  RotateCcw,
  Plus,
  Trash2,
  Upload,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
  Check
} from 'lucide-react';
import ThreeMoleculeViewer from '../ThreeMoleculeViewer';
import { quantumService } from '../../services/quantumService';

export default function GeometryWorkspace({ atoms, coordinates, onUpdate }) {
  const [viewMode, setViewMode] = useState('3d'); // '3d' or 'table'
  const [measurementMode, setMeasurementMode] = useState('none'); // 'none', 'distance', 'angle', 'dihedral'
  const [selectedAtomIndices, setSelectedAtomIndices] = useState([]);
  const [measurementResult, setMeasurementResult] = useState(null);

  // SMILES / XYZ Import Input State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importType, setImportType] = useState('smiles'); // 'smiles' or 'xyz'

  // Construct molecule structure for ThreeMoleculeViewer
  const molecule = {
    id: 'qc_active_molecule',
    atoms: atoms.map((el, i) => ({
      id: i + 1,
      element: el,
      x: coordinates[i] ? coordinates[i][0] : 0,
      y: coordinates[i] ? coordinates[i][1] : 0,
      z: coordinates[i] ? coordinates[i][2] : 0
    })),
    bonds: [] // ThreeMoleculeViewer auto-detects covalent radii bonds
  };

  const handleCoordChange = (atomIdx, coordIdx, val) => {
    const next = coordinates.map((c, i) => (i === atomIdx ? [...c] : c));
    next[atomIdx][coordIdx] = parseFloat(val) || 0;
    onUpdate(atoms, next);
  };

  const handleAddAtom = () => {
    const newAtoms = [...atoms, 'H'];
    const newCoords = [...coordinates, [0.0, 0.0, 1.0]];
    onUpdate(newAtoms, newCoords);
  };

  const handleDeleteAtom = (idx) => {
    if (atoms.length <= 1) return;
    const newAtoms = atoms.filter((_, i) => i !== idx);
    const newCoords = coordinates.filter((_, i) => i !== idx);
    onUpdate(newAtoms, newCoords);
    setSelectedAtomIndices([]);
    setMeasurementResult(null);
  };

  const handleSelectAtom = (idx) => {
    if (measurementMode === 'none') {
      setSelectedAtomIndices([idx]);
      return;
    }

    let nextIndices = [...selectedAtomIndices];
    if (nextIndices.includes(idx)) {
      nextIndices = nextIndices.filter((i) => i !== idx);
    } else {
      const maxNeeded = measurementMode === 'distance' ? 2 : measurementMode === 'angle' ? 3 : 4;
      if (nextIndices.length >= maxNeeded) {
        nextIndices = [idx];
      } else {
        nextIndices.push(idx);
      }
    }

    setSelectedAtomIndices(nextIndices);

    // Compute measurements if ready
    if (measurementMode === 'distance' && nextIndices.length === 2) {
      const p1 = coordinates[nextIndices[0]];
      const p2 = coordinates[nextIndices[1]];
      const dist = quantumService.calculateDistance(p1, p2);
      setMeasurementResult({
        type: 'Bond Distance',
        value: `${dist} Å`,
        atoms: `${atoms[nextIndices[0]]}#${nextIndices[0] + 1} ↔ ${atoms[nextIndices[1]]}#${nextIndices[1] + 1}`
      });
    } else if (measurementMode === 'angle' && nextIndices.length === 3) {
      const p1 = coordinates[nextIndices[0]];
      const p2 = coordinates[nextIndices[1]];
      const p3 = coordinates[nextIndices[2]];
      const angle = quantumService.calculateAngle(p1, p2, p3);
      setMeasurementResult({
        type: 'Bond Angle',
        value: `${angle}°`,
        atoms: `${atoms[nextIndices[0]]}#${nextIndices[0] + 1} — ${atoms[nextIndices[1]]}#${nextIndices[1] + 1} (Vertex) — ${atoms[nextIndices[2]]}#${nextIndices[2] + 1}`
      });
    } else if (measurementMode === 'dihedral' && nextIndices.length === 4) {
      const p1 = coordinates[nextIndices[0]];
      const p2 = coordinates[nextIndices[1]];
      const p3 = coordinates[nextIndices[2]];
      const p4 = coordinates[nextIndices[3]];
      const dihedral = quantumService.calculateDihedral(p1, p2, p3, p4);
      setMeasurementResult({
        type: 'Dihedral Torsion Angle',
        value: `${dihedral}°`,
        atoms: `${atoms[nextIndices[0]]}#${nextIndices[0] + 1} - ${atoms[nextIndices[1]]}#${nextIndices[1] + 1} - ${atoms[nextIndices[2]]}#${nextIndices[2] + 1} - ${atoms[nextIndices[3]]}#${nextIndices[3] + 1}`
      });
    } else {
      setMeasurementResult(null);
    }
  };

  const handleImport = () => {
    if (!importText.trim()) return;

    if (importType === 'xyz') {
      // Parse XYZ Format
      const lines = importText.trim().split('\n');
      const parsedAtoms = [];
      const parsedCoords = [];
      lines.forEach((line) => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 4 && isNaN(parseFloat(parts[0]))) {
          parsedAtoms.push(parts[0]);
          parsedCoords.push([parseFloat(parts[1]) || 0, parseFloat(parts[2]) || 0, parseFloat(parts[3]) || 0]);
        }
      });
      if (parsedAtoms.length > 0) {
        onUpdate(parsedAtoms, parsedCoords);
        setShowImportModal(false);
        setImportText('');
      }
    } else {
      // Simple coordinate template generation from standard SMILES
      const s = importText.trim();
      let nAtoms = ['C'];
      let nCoords = [[0, 0, 0]];

      if (s === 'O' || s === '[H]O[H]' || s.toLowerCase() === 'water') {
        nAtoms = ['O', 'H', 'H'];
        nCoords = [[0, 0, 0.117], [0, 0.757, -0.469], [0, -0.757, -0.469]];
      } else if (s === 'C' || s.toLowerCase() === 'methane') {
        nAtoms = ['C', 'H', 'H', 'H', 'H'];
        nCoords = [[0, 0, 0], [0.629, 0.629, 0.629], [-0.629, -0.629, 0.629], [-0.629, 0.629, -0.629], [0.629, -0.629, -0.629]];
      } else if (s === 'c1ccccc1' || s.toLowerCase() === 'benzene') {
        nAtoms = ['C', 'C', 'C', 'C', 'C', 'C', 'H', 'H', 'H', 'H', 'H', 'H'];
        nCoords = [];
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          nCoords.push([1.39 * Math.cos(a), 1.39 * Math.sin(a), 0]);
        }
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          nCoords.push([2.47 * Math.cos(a), 2.47 * Math.sin(a), 0]);
        }
      } else if (s === 'CCO' || s.toLowerCase() === 'ethanol') {
        nAtoms = ['C', 'C', 'O', 'H', 'H', 'H', 'H', 'H', 'H'];
        nCoords = [
          [0.0, 0.0, 0.0],
          [1.52, 0.0, 0.0],
          [2.05, 1.35, 0.0],
          [-0.36, 1.02, 0.0],
          [-0.36, -0.51, 0.88],
          [-0.36, -0.51, -0.88],
          [1.88, -0.51, 0.88],
          [1.88, -0.51, -0.88],
          [3.01, 1.35, 0.0]
        ];
      } else {
        // Fallback linear 3D chain
        nAtoms = [];
        nCoords = [];
        for (let i = 0; i < Math.min(10, s.length); i++) {
          const char = s[i].toUpperCase();
          if (['C', 'N', 'O', 'S', 'P', 'F', 'H'].includes(char)) {
            nAtoms.push(char);
            nCoords.push([i * 1.35, (i % 2) * 0.45, 0]);
          }
        }
        if (nAtoms.length === 0) {
          nAtoms = ['C', 'H', 'H', 'H', 'H'];
          nCoords = [[0, 0, 0], [0.63, 0.63, 0.63], [-0.63, -0.63, 0.63], [-0.63, 0.63, -0.63], [0.63, -0.63, -0.63]];
        }
      }

      onUpdate(nAtoms, nCoords);
      setShowImportModal(false);
      setImportText('');
    }
  };

  return (
    <div className="glass-panel rounded-[32px] overflow-hidden flex flex-col border border-white/10 shadow-2xl h-full">
      {/* Header Controls */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Box className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Molecular Geometry Workspace</h3>
            <span className="text-[9px] text-gray-500 font-mono">{atoms.length} Atoms • Cartesian Coordinates</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Geometric Measurement Buttons */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => {
                setMeasurementMode(measurementMode === 'distance' ? 'none' : 'distance');
                setSelectedAtomIndices([]);
                setMeasurementResult(null);
              }}
              className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition ${
                measurementMode === 'distance' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
              title="Measure Bond Length (Select 2 atoms)"
            >
              <Ruler className="w-3 h-3" /> Distance
            </button>
            <button
              onClick={() => {
                setMeasurementMode(measurementMode === 'angle' ? 'none' : 'angle');
                setSelectedAtomIndices([]);
                setMeasurementResult(null);
              }}
              className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition ${
                measurementMode === 'angle' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
              title="Measure Bond Angle (Select 3 atoms)"
            >
              <Compass className="w-3 h-3" /> Angle
            </button>
            <button
              onClick={() => {
                setMeasurementMode(measurementMode === 'dihedral' ? 'none' : 'dihedral');
                setSelectedAtomIndices([]);
                setMeasurementResult(null);
              }}
              className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition ${
                measurementMode === 'dihedral' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
              title="Measure Dihedral Angle (Select 4 atoms)"
            >
              <Layers className="w-3 h-3" /> Dihedral
            </button>
          </div>

          {/* Import / Table View Toggle */}
          <button
            onClick={() => setShowImportModal(true)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-[10px] font-bold flex items-center gap-1"
            title="Import SMILES or XYZ Coordinates"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>

          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${viewMode === '3d' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
            >
              3D
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${viewMode === 'table' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 relative min-h-[420px] bg-[#050608] overflow-hidden">
        {viewMode === '3d' ? (
          <div className="w-full h-full relative">
            <ThreeMoleculeViewer molecule={molecule} styleMode="ball-stick" />

            {/* Measurement Status Overlay (Bottom Left) */}
            {measurementMode !== 'none' && (
              <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-cyan-500/30 text-xs shadow-2xl">
                <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-[10px]">
                  <Ruler className="w-3 h-3" />
                  Mode: {measurementMode.toUpperCase()}
                </div>
                <div className="text-[10px] text-gray-400 mt-1 font-mono">
                  Selected Atoms: {selectedAtomIndices.map((idx) => `${atoms[idx]}#${idx + 1}`).join(' → ') || 'Click in table or switch to list'}
                </div>
                {measurementResult && (
                  <div className="mt-2 pt-2 border-t border-white/10 text-white font-mono font-black text-sm flex items-center justify-between gap-4">
                    <span>{measurementResult.type}:</span>
                    <span className="text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">{measurementResult.value}</span>
                  </div>
                )}
              </div>
            )}

            {/* Atom Quick Selector Chips at bottom */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1.5 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10">
              <span className="text-[9px] font-black uppercase text-gray-500 px-2">Atoms:</span>
              {atoms.map((a, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectAtom(i)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition-all shrink-0 ${
                    selectedAtomIndices.includes(i)
                      ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30 scale-105'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
                >
                  {a}#{i + 1}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 overflow-auto max-h-[500px] custom-scrollbar bg-[#08090d] flex flex-col h-full justify-between">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-white/5 text-gray-400 font-black uppercase tracking-tighter sticky top-0 backdrop-blur-md">
                <tr>
                  <th className="p-3 border-b border-white/5">#</th>
                  <th className="p-3 border-b border-white/5">Element</th>
                  <th className="p-3 border-b border-white/5">X (Å)</th>
                  <th className="p-3 border-b border-white/5">Y (Å)</th>
                  <th className="p-3 border-b border-white/5">Z (Å)</th>
                  <th className="p-3 border-b border-white/5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {atoms.map((el, i) => (
                  <tr
                    key={i}
                    onClick={() => handleSelectAtom(i)}
                    className={`cursor-pointer transition-colors ${
                      selectedAtomIndices.includes(i) ? 'bg-cyan-500/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="p-3 text-gray-500">#{i + 1}</td>
                    <td className="p-3 font-bold text-white">
                      <input
                        type="text"
                        value={el}
                        onChange={(e) => {
                          const next = [...atoms];
                          next[i] = e.target.value.toUpperCase();
                          onUpdate(next, coordinates);
                        }}
                        className="w-10 bg-transparent text-white font-bold outline-none border-b border-white/20 focus:border-cyan-400"
                        maxLength={2}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        step="0.0001"
                        value={coordinates[i] ? coordinates[i][0] : 0}
                        onChange={(e) => handleCoordChange(i, 0, e.target.value)}
                        className="bg-transparent w-full p-2 text-cyan-400 font-mono outline-none focus:bg-white/5 rounded-lg"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        step="0.0001"
                        value={coordinates[i] ? coordinates[i][1] : 0}
                        onChange={(e) => handleCoordChange(i, 1, e.target.value)}
                        className="bg-transparent w-full p-2 text-cyan-400 font-mono outline-none focus:bg-white/5 rounded-lg"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        step="0.0001"
                        value={coordinates[i] ? coordinates[i][2] : 0}
                        onChange={(e) => handleCoordChange(i, 2, e.target.value)}
                        className="bg-transparent w-full p-2 text-cyan-400 font-mono outline-none focus:bg-white/5 rounded-lg"
                      />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAtom(i);
                        }}
                        className="text-rose-500 hover:text-rose-400 p-1"
                        title="Delete Atom"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pt-4 flex justify-between items-center border-t border-white/5">
              <span className="text-[10px] text-gray-500 font-mono">{atoms.length} Total Atoms in Hamiltonian</span>
              <button
                onClick={handleAddAtom}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Atom
              </button>
            </div>
          </div>
        )}
      </div>

      {/* IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#0c0d12] border border-white/20 rounded-[36px] p-8 max-w-lg w-full space-y-5 text-xs font-sans shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white uppercase tracking-tight">Import Geometry Coordinates</h3>
              <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="flex bg-black/50 p-1 rounded-2xl border border-white/10">
              <button
                onClick={() => setImportType('smiles')}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition ${
                  importType === 'smiles' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                SMILES / Molecule Name
              </button>
              <button
                onClick={() => setImportType('xyz')}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition ${
                  importType === 'xyz' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                XYZ Cartesian Coordinates
              </button>
            </div>

            <div className="space-y-2">
              <textarea
                rows={importType === 'xyz' ? 6 : 2}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={importType === 'xyz' ? "O  0.0  0.0  0.117\nH  0.0  0.757 -0.469\nH  0.0 -0.757 -0.469" : "e.g. c1ccccc1 or Benzene or CCO"}
                className="w-full bg-black border border-white/10 rounded-2xl p-4 text-cyan-300 font-mono text-xs outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setShowImportModal(false)} className="flex-1 py-3 bg-white/5 text-white font-bold rounded-2xl">Cancel</button>
              <button onClick={handleImport} className="flex-1 py-3 bg-cyan-500 text-black font-black rounded-2xl shadow-lg shadow-cyan-500/20">Load Geometry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
