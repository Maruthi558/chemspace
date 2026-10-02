import React, { useState } from 'react';
import { PERIODIC_ELEMENTS, CATEGORY_COLORS, CATEGORY_THEMES } from '../data/periodicData';
import ThreeAtomShell from '../components/ThreeAtomShell';
import { Grid, Layers, Search, Info, Atom, Eye, CheckCircle2, Sliders, Flame, Droplets, Wind, Zap } from 'lucide-react';
import { logActivity } from '../services/activityStore';

export default function PeriodicTable() {
  const [selectedElement, setSelectedElement] = useState(PERIODIC_ELEMENTS[0]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [activePhaseFilter, setActivePhaseFilter] = useState('All');
  const [trendOverlay, setTrendOverlay] = useState('none'); // none, electronegativity, radius, ionEnergy, meltingPoint
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' (18-column real table) | 'grid' (compact cards)

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

  const selectedTheme = CATEGORY_THEMES[selectedElement.category] || {
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.14)',
    border: 'rgba(16, 185, 129, 0.4)',
    glow: 'rgba(16, 185, 129, 0.6)'
  };

  return (
    <div className="workspace-container font-mono select-none">
      {/* 1. WORKSPACE HEADER */}
      <div className="workspace-header">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl border transition-all duration-300"
            style={{
              background: `${selectedTheme.color}20`,
              borderColor: `${selectedTheme.color}60`,
              boxShadow: `0 0 16px ${selectedTheme.color}40`
            }}
          >
            <Atom className="w-5 h-5" style={{ color: selectedTheme.color }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white tracking-wider">PERIODIC TABLE OF ELEMENTS</span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-md border"
                style={{
                  background: `${selectedTheme.color}25`,
                  color: selectedTheme.color,
                  borderColor: `${selectedTheme.color}50`
                }}
              >
                118 ELEMENTS • 3D ATOMIC SHELLS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Dynamic category color system, interactive 3D Bohr & Quantum probability cloud models, Pauling electronegativities, and orbital telemetry.
            </p>
          </div>
        </div>

        {/* Heatmap Overlay & Phase Selector */}
        {/* View Mode & Heatmap Overlay */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Table vs Grid Switcher */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              18-Col IUPAC Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Card Grid
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-sans">Trend Mode:</span>
            <select
              value={trendOverlay}
              onChange={(e) => setTrendOverlay(e.target.value)}
              className="px-2.5 py-1 bg-[#02040a] border border-white/20 rounded-xl text-xs font-mono text-white focus:border-orange-400 focus:outline-none transition cursor-pointer"
            >
              <option value="none">Standard Category Colors</option>
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
        {/* Search Input & Phase Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search symbol, name, or #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-control pl-8 py-1.5 text-xs w-full"
            />
          </div>

          {/* Phase Filter Chips */}
          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10 text-[10px]">
            {phases.map((ph) => (
              <button
                key={ph}
                onClick={() => setActivePhaseFilter(ph)}
                className={`px-2 py-0.5 rounded-lg font-bold transition ${
                  activePhaseFilter === ph
                    ? 'bg-white text-black font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {ph}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Chips with Vibrant Color Badges */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full">
          {categories.map((cat) => {
            const catColor = CATEGORY_COLORS[cat];
            const isCatActive = activeCategoryFilter === cat;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition flex items-center gap-1.5 border ${
                  isCatActive
                    ? 'text-white font-black shadow-md'
                    : 'bg-[#02040a] text-slate-400 border-white/10 hover:border-white/30 hover:text-white'
                }`}
                style={
                  isCatActive
                    ? {
                        background: catColor ? `${catColor}30` : 'rgba(255,255,255,0.2)',
                        borderColor: catColor || '#ffffff',
                        boxShadow: catColor ? `0 0 12px ${catColor}55` : '0 0 10px rgba(255,255,255,0.2)'
                      }
                    : {}
                }
              >
                {catColor && (
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ background: catColor, boxShadow: `0 0 6px ${catColor}` }}
                  />
                )}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. DUAL-PANE WORKSPACE: Left (Periodic Grid) + Right (Element Inspector & 3D Shell) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        {/* LEFT COLUMN: 118 Elements Mendeleev Grid (8 Cols) */}
        <div className="lg:col-span-8 glass-panel p-4 rounded-2xl border border-white/15 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/10 pb-2">
            <span className="font-mono">
              Showing <strong className="text-white">{filteredElements.length}</strong> of 118 Elements
            </span>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Solid
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Gas
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" /> Liquid
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Synthetic
              </span>
            </div>
          </div>

          {/* Helper function to render an element card in either Table or Grid mode */}
          {(() => {
            const renderCard = (el, isMatch = true, customStyle = {}) => {
              const isSelected = selectedElement.number === el.number;
              const catTheme = CATEGORY_THEMES[el.category] || {
                color: '#10b981',
                bg: 'rgba(16, 185, 129, 0.14)',
                border: 'rgba(16, 185, 129, 0.35)',
                glow: 'rgba(16, 185, 129, 0.55)'
              };

              let trendColor = null;
              if (trendOverlay === 'electronegativity' && el.electronegativity) {
                const ratio = Math.min(1, Math.max(0, el.electronegativity / 4.0));
                trendColor = `hsl(${Math.round(240 - ratio * 240)}, 85%, 60%)`;
              } else if (trendOverlay === 'radius' && el.radius) {
                const ratio = Math.min(1, Math.max(0, (el.radius - 30) / 240));
                trendColor = `hsl(${Math.round(180 - ratio * 180)}, 85%, 60%)`;
              } else if (trendOverlay === 'ionEnergy' && el.ionEnergy) {
                const ratio = Math.min(1, Math.max(0, (el.ionEnergy - 350) / 2000));
                trendColor = `hsl(${Math.round(280 - ratio * 280)}, 85%, 60%)`;
              } else if (trendOverlay === 'meltingPoint' && el.meltingPoint) {
                const ratio = Math.min(1, Math.max(0, el.meltingPoint / 4000));
                trendColor = `hsl(${Math.round(200 - ratio * 200)}, 90%, 60%)`;
              }

              const displayColor = trendColor || catTheme.color;

              return (
                <div
                  key={el.number}
                  onClick={() => handleSelectElement(el)}
                  className={`p-1.5 rounded-lg cursor-pointer transition-all duration-150 flex flex-col justify-between relative group select-none ${
                    !isMatch ? 'opacity-20 grayscale hover:opacity-100 hover:grayscale-0' : ''
                  } ${
                    isSelected
                      ? 'scale-105 z-20 shadow-[0_0_16px_rgba(249,115,22,0.6)]'
                      : 'hover:scale-[1.04] hover:z-10'
                  }`}
                  style={{
                    background: isSelected
                      ? `linear-gradient(135deg, ${displayColor}40 0%, #060a14 100%)`
                      : catTheme.bg,
                    border: isSelected
                      ? '2px solid #f97316'
                      : `1px solid ${catTheme.border}`,
                    boxShadow: isSelected
                      ? `0 0 16px ${displayColor}77, inset 0 0 8px ${displayColor}33`
                      : '0 1px 4px rgba(0,0,0,0.2)',
                    minHeight: '52px',
                    ...customStyle
                  }}
                >
                  {/* Top: Atomic Number & Mass */}
                  <div className="flex items-center justify-between text-[8px] font-mono font-bold leading-none">
                    <span
                      style={{
                        color: isSelected ? '#ffffff' : displayColor,
                      }}
                    >
                      {el.number}
                    </span>
                    <span className="text-slate-400 text-[7px] truncate max-w-[28px]">
                      {typeof el.mass === 'number' ? el.mass.toFixed(1) : el.mass}
                    </span>
                  </div>

                  {/* Center: Chemical Symbol */}
                  <div
                    className="text-base font-black text-center my-0.5 tracking-tight transition-transform group-hover:scale-105"
                    style={{
                      color: isSelected ? '#ffffff' : displayColor,
                      textShadow: `0 0 8px ${displayColor}66`
                    }}
                  >
                    {el.symbol}
                  </div>

                  {/* Bottom: Element Name & Phase Indicator */}
                  <div className="flex items-center justify-between text-[7.5px] font-medium truncate pt-0.5 border-t border-white/10 leading-none">
                    <span className="truncate text-slate-300">
                      {el.name}
                    </span>
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 ml-0.5"
                      style={{
                        background:
                          el.phase === 'Gas'
                            ? '#22d3ee'
                            : el.phase === 'Liquid'
                            ? '#38bdf8'
                            : el.phase === 'Synthetic'
                            ? '#f43f5e'
                            : '#34d399'
                      }}
                      title={`Phase: ${el.phase}`}
                    />
                  </div>
                </div>
              );
            };

            if (viewMode === 'table') {
              return (
                <div className="overflow-x-auto pb-4 no-scrollbar">
                  <div
                    className="min-w-[840px] select-none"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(18, minmax(42px, 1fr))',
                      gridTemplateRows: 'repeat(10, minmax(52px, auto))',
                      gap: '4px'
                    }}
                  >
                    {/* Lanthanide series indicator (Row 6, Col 3) */}
                    <div
                      className="p-1.5 rounded-lg border border-dashed border-amber-500/40 bg-amber-500/10 flex flex-col items-center justify-center text-center cursor-default select-none"
                      style={{ gridRow: 6, gridColumn: 3 }}
                      title="Lanthanide Series Elements (57-71)"
                    >
                      <span className="text-[8px] font-mono text-amber-400 font-bold">57-71</span>
                      <span className="text-[9px] font-bold text-slate-200">La-Lu</span>
                      <span className="text-[6.5px] text-amber-300/70 font-mono">f-block</span>
                    </div>

                    {/* Actinide series indicator (Row 7, Col 3) */}
                    <div
                      className="p-1.5 rounded-lg border border-dashed border-rose-500/40 bg-rose-500/10 flex flex-col items-center justify-center text-center cursor-default select-none"
                      style={{ gridRow: 7, gridColumn: 3 }}
                      title="Actinide Series Elements (89-103)"
                    >
                      <span className="text-[8px] font-mono text-rose-400 font-bold">89-103</span>
                      <span className="text-[9px] font-bold text-slate-200">Ac-Lr</span>
                      <span className="text-[6.5px] text-rose-300/70 font-mono">f-block</span>
                    </div>

                    {/* All 118 Elements placed in authentic IUPAC Coordinates */}
                    {PERIODIC_ELEMENTS.map((el) => {
                      let row = el.period;
                      let col = el.group;

                      if (el.number >= 57 && el.number <= 71) {
                        row = 9;
                        col = (el.number - 57) + 4;
                      } else if (el.number >= 89 && el.number <= 103) {
                        row = 10;
                        col = (el.number - 89) + 4;
                      }

                      const isMatch = filteredElements.some((fe) => fe.number === el.number);
                      return renderCard(el, isMatch, { gridRow: row, gridColumn: col });
                    })}
                  </div>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-8 gap-2 max-h-[580px] overflow-y-auto pr-1">
                {filteredElements.map((el) => renderCard(el, true))}
              </div>
            );
          })()}
        </div>

        {/* RIGHT COLUMN: Element Inspector & 3D Atomic Shell (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="glass-panel p-5 rounded-2xl border border-white/15 space-y-4 shadow-2xl flex-1">
            {/* Header with Symbol & Name */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-2xl font-black text-white flex items-center gap-2">
                  {selectedElement.name}
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md border"
                    style={{
                      background: `${selectedTheme.color}25`,
                      color: selectedTheme.color,
                      borderColor: `${selectedTheme.color}50`
                    }}
                  >
                    #{selectedElement.number}
                  </span>
                </span>
                <span className="text-xs block font-sans mt-1" style={{ color: selectedTheme.color }}>
                  {selectedElement.category} • Group {selectedElement.group}, Period {selectedElement.period}
                </span>
              </div>

              {/* Glowing Hero Symbol Card */}
              <div
                className="w-14 h-14 p-2 rounded-2xl border flex flex-col items-center justify-center shadow-xl relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${selectedTheme.color}35 0%, #03060f 100%)`,
                  borderColor: selectedTheme.color,
                  boxShadow: `0 0 24px ${selectedTheme.glow}`
                }}
              >
                <span className="text-xl font-black text-white" style={{ textShadow: `0 0 10px ${selectedTheme.color}` }}>
                  {selectedElement.symbol}
                </span>
                <span className="text-[8px] font-mono text-slate-300">
                  {typeof selectedElement.mass === 'number' ? selectedElement.mass.toFixed(2) : selectedElement.mass}
                </span>
              </div>
            </div>

            {/* Upgraded 3D Revolving Bohr Atom & Quantum Shell with Mode Switcher */}
            <div className="h-[270px] w-full rounded-xl overflow-hidden bg-[#02040a] border border-white/15 relative shadow-inner">
              <ThreeAtomShell element={selectedElement} />
            </div>

            {/* Element Properties Dossier */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 inner-box">
                <span className="opacity-60 text-[10px] block font-sans">Atomic Number</span>
                <span className="font-bold text-sm text-white font-mono">#{selectedElement.number}</span>
              </div>
              <div className="p-3 inner-box">
                <span className="opacity-60 text-[10px] block font-sans">Atomic Weight</span>
                <span className="font-bold text-sm text-white font-mono">{selectedElement.mass} u</span>
              </div>
              <div className="p-3 inner-box">
                <span className="opacity-60 text-[10px] block font-sans">Electronegativity</span>
                <span className="text-emerald-400 font-bold text-sm font-mono">{selectedElement.electronegativity || 'N/A'}</span>
              </div>
              <div className="p-3 inner-box">
                <span className="opacity-60 text-[10px] block font-sans">Atomic Radius</span>
                <span className="text-teal-400 font-bold text-sm font-mono">{selectedElement.radius} pm</span>
              </div>
              <div className="p-3 inner-box">
                <span className="opacity-60 text-[10px] block font-sans">Ionization Energy</span>
                <span className="text-violet-400 font-bold text-sm font-mono">{selectedElement.ionEnergy} kJ/mol</span>
              </div>
              <div className="p-3 inner-box">
                <span className="opacity-60 text-[10px] block font-sans">Standard State</span>
                <span className="text-amber-400 font-bold text-sm font-mono">{selectedElement.phase}</span>
              </div>
            </div>

            {/* Electron Configuration */}
            <div className="p-3 inner-box text-xs space-y-1">
              <span className="opacity-60 text-[10px] block font-sans">Electron Configuration:</span>
              <div className="font-mono font-bold" style={{ color: selectedTheme.color }}>
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

