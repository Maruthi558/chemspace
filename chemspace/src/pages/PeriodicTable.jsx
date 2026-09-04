import React, { useState } from 'react';
import { PERIODIC_ELEMENTS, CATEGORY_COLORS } from '../data/periodicData';
import ThreeAtomShell from '../components/ThreeAtomShell';
import { Grid, Sparkles, Layers, Search, Info, Atom, Eye, CheckCircle2, Sliders } from 'lucide-react';
import { logActivity } from '../services/activityStore';

export default function PeriodicTable() {
  const [selectedElement, setSelectedElement] = useState(PERIODIC_ELEMENTS[0]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [activePhaseFilter, setActivePhaseFilter] = useState('All');
  const [trendOverlay, setTrendOverlay] = useState('none'); // none, electronegativity, radius, ionEnergy, meltingPoint
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', ...new Set(PERIODIC_ELEMENTS.map((e) => e.category))];
  const phases = ['All', 'Solid', 'Gas', 'Liquid', 'Synthetic'];

  const filteredElements = PERIODIC_ELEMENTS.filter((e) => {
    const matchesCategory = activeCategoryFilter === 'All' || e.category === activeCategoryFilter;
    const matchesPhase = activePhaseFilter === 'All' || e.phase === activePhaseFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      e.name.toLowerCase().includes(query) ||
      e.symbol.toLowerCase().includes(query) ||
      String(e.number) === query;
    return matchesCategory && matchesPhase && matchesSearch;
  });

  const handleSelectElement = (el) => {
    setSelectedElement(el);
    logActivity('Periodic Table', `Inspected Element (${el.name})`, `Atomic #${el.number} [${el.symbol}], Mass: ${el.mass} u, Config: ${el.config}`, 'general');
  };

  return (
    <div className="workspace-container font-mono select-none">
      {/* 1. WORKSPACE HEADER */}
      <div className="workspace-header">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/15">
            <Grid className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white tracking-wider">PERIODIC TABLE OF ELEMENTS</span>
              <span className="text-[10px] bg-white text-black font-bold px-1.5 py-0.5 rounded">
                118 ELEMENTS • 3D ATOMIC SHELLS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Complete 118-element Mendeleev periodic grid, electron orbital configurations, Pauling electronegativities, and 3D revolving Bohr atomic orbits.
            </p>
          </div>
        </div>

        {/* Heatmap Overlay & Phase Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-sans">Trend Mode:</span>
            <select
              value={trendOverlay}
              onChange={(e) => setTrendOverlay(e.target.value)}
              className="px-2.5 py-1 bg-[#02040a] border border-white/15 rounded-xl text-xs font-mono text-white focus:border-white focus:outline-none"
            >
              <option value="none">Standard Group Colors</option>
              <option value="electronegativity">Electronegativity (Pauling)</option>
              <option value="radius">Atomic Radius (pm)</option>
              <option value="ionEnergy">Ionization Energy (kJ/mol)</option>
              <option value="meltingPoint">Melting Point (K)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & FILTER CONTROLS BAR */}
      <div className="glass-panel p-3 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search symbol, name, or #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-control pl-8 py-1.5 text-xs"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition ${
                activeCategoryFilter === cat
                  ? 'bg-white text-black font-black shadow-md'
                  : 'bg-[#02040a] text-slate-400 border border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. DUAL-PANE WORKSPACE: Left (Periodic Grid) + Right (Element Inspector & 3D Shell) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        {/* LEFT COLUMN: 118 Elements Mendeleev Grid (8 Cols) */}
        <div className="lg:col-span-8 glass-panel p-4 rounded-2xl border border-white/15 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/10 pb-2">
            <span>Showing {filteredElements.length} of 118 Elements</span>
            <span className="text-[10px] text-cyan-400 font-mono">Click element card to inspect</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-8 gap-2 max-h-[560px] overflow-y-auto pr-1">
            {filteredElements.map((el) => {
              const isSelected = selectedElement.number === el.number;
              let trendColor = null;

              if (trendOverlay === 'electronegativity' && el.electronegativity) {
                const ratio = Math.min(1, Math.max(0, el.electronegativity / 4.0));
                trendColor = `hsl(${Math.round(240 - ratio * 240)}, 80%, 55%)`;
              } else if (trendOverlay === 'radius' && el.radius) {
                const ratio = Math.min(1, Math.max(0, (el.radius - 30) / 240));
                trendColor = `hsl(${Math.round(180 - ratio * 180)}, 80%, 55%)`;
              } else if (trendOverlay === 'ionEnergy' && el.ionEnergy) {
                const ratio = Math.min(1, Math.max(0, (el.ionEnergy - 350) / 2000));
                trendColor = `hsl(${Math.round(280 - ratio * 280)}, 80%, 55%)`;
              }

              return (
                <div
                  key={el.number}
                  onClick={() => handleSelectElement(el)}
                  className={`p-2.5 rounded-xl cursor-pointer border transition-all duration-150 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white text-black border-white shadow-xl scale-105 z-10'
                      : 'bg-[#02040a] border-white/10 hover:border-white/40 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-400">
                    <span className={isSelected ? 'text-black' : 'text-slate-400'}>{el.number}</span>
                    <span className={isSelected ? 'text-slate-700' : 'text-slate-500'}>
                      {typeof el.mass === 'number' ? el.mass.toFixed(1) : el.mass}
                    </span>
                  </div>
                  <div
                    className={`text-lg font-black text-center my-0.5 ${
                      isSelected ? 'text-black' : trendColor ? '' : 'text-white'
                    }`}
                    style={{ color: !isSelected && trendColor ? trendColor : undefined }}
                  >
                    {el.symbol}
                  </div>
                  <div className={`text-[9px] font-medium text-center truncate ${isSelected ? 'text-slate-800' : 'text-slate-400'}`}>
                    {el.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Element Inspector & 3D Atomic Shell (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="glass-panel p-5 rounded-2xl border border-white/15 space-y-4 shadow-2xl flex-1">
            {/* Header with Symbol & Name */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-2xl font-black text-white">{selectedElement.name}</span>
                <span className="text-xs text-cyan-400 block font-sans mt-0.5">
                  {selectedElement.category} • Group {selectedElement.group}, Period {selectedElement.period}
                </span>
              </div>
              <div className="w-13 h-13 p-3 rounded-2xl bg-white text-black flex items-center justify-center text-xl font-black shadow-lg">
                {selectedElement.symbol}
              </div>
            </div>

            {/* 3D Revolving Bohr Atom Shell */}
            <div className="h-[200px] w-full rounded-xl overflow-hidden bg-[#02040a] border border-white/10 relative">
              <ThreeAtomShell element={selectedElement} />
              <div className="absolute top-2 left-2 z-10 telemetry-pill text-[9px]">
                3D Bohr Orbitals
              </div>
            </div>

            {/* Element Properties Dossier */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 inner-box">
                <span className="opacity-60 text-[10px] block">Atomic Number</span>
                <span className="font-bold text-sm text-white">#{selectedElement.number}</span>
              </div>
              <div className="p-3 inner-box">
                <span className="opacity-60 text-[10px] block">Atomic Weight</span>
                <span className="font-bold text-sm text-white">{selectedElement.mass} u</span>
              </div>
              <div className="p-3 inner-box">
                <span className="opacity-60 text-[10px] block">Electronegativity</span>
                <span className="text-emerald-400 font-bold text-sm">{selectedElement.electronegativity || 'N/A'}</span>
              </div>
              <div className="p-3 inner-box">
                <span className="opacity-60 text-[10px] block">Atomic Radius</span>
                <span className="font-bold text-sm text-cyan-400">{selectedElement.radius} pm</span>
              </div>
              <div className="p-3 inner-box">
                <span className="opacity-60 text-[10px] block">Ionization Energy</span>
                <span className="font-bold text-sm text-violet-400">{selectedElement.ionEnergy} kJ/mol</span>
              </div>
              <div className="p-3 inner-box">
                <span className="opacity-60 text-[10px] block">Standard State</span>
                <span className="font-bold text-sm text-amber-400">{selectedElement.phase}</span>
              </div>
            </div>

            {/* Electron Configuration */}
            <div className="p-3 inner-box text-xs space-y-1">
              <span className="opacity-60 text-[10px] block font-sans">Electron Configuration:</span>
              <div className="font-mono font-bold text-cyan-300">
                {selectedElement.config || '1s² 2s² 2p⁶...'}
              </div>
            </div>

            {/* Discovery Information */}
            <div className="text-[11px] opacity-70 font-sans flex items-center justify-between pt-1 border-t border-white/10">
              <span>Discovered: {selectedElement.discovered}</span>
              <span>MP: {selectedElement.meltingPoint ? `${selectedElement.meltingPoint} K` : 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
