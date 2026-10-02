import React, { useState } from 'react';
import { PERIODIC_ELEMENTS, CATEGORY_COLORS, CATEGORY_THEMES } from '../data/periodicData';
import ThreeAtomShell from '../components/ThreeAtomShell';
import { Grid, Layers, Search, Info, Atom, Eye, CheckCircle2, Sliders, Flame, Droplets, Wind, Zap } from 'lucide-react';
import { logActivity } from '../services/activityStore';
import { useTheme } from '../context/ThemeContext';

export default function PeriodicTable() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 select-none font-sans">
      {/* 1. WORKSPACE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-300 shadow-sm"
            style={{
              background: `${selectedTheme.color}20`,
              borderColor: `${selectedTheme.color}50`
            }}
          >
            <Atom className="w-5 h-5" style={{ color: selectedTheme.color }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[var(--text-primary)] tracking-tight">PERIODIC TABLE OF ELEMENTS</span>
              <span
                className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border"
                style={{
                  background: `${selectedTheme.color}15`,
                  color: selectedTheme.color,
                  borderColor: `${selectedTheme.color}35`
                }}
              >
                118 ELEMENTS • 3D ATOMIC SHELLS
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-normal mt-0.5">
              Dynamic category color system, interactive 3D Bohr & Quantum probability cloud models, Pauling electronegativities, and orbital telemetry.
            </p>
          </div>
        </div>

        {/* View Mode & Heatmap Overlay */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Table vs Grid Switcher */}
          <div className="flex items-center gap-1 bg-[var(--bg-inner)] p-1 rounded-xl border border-[var(--border-subtle)] text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === 'table'
                  ? 'btn-orange py-1 px-3 text-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              18-Col IUPAC Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'btn-orange py-1 px-3 text-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Card Grid
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[var(--text-muted)] font-mono">Trend:</span>
            <select
              value={trendOverlay}
              onChange={(e) => setTrendOverlay(e.target.value)}
              className="px-2.5 py-1.5 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl text-xs font-sans text-[var(--text-primary)] focus:border-orange-500 focus:outline-none transition cursor-pointer"
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
      <div className="card-scientific p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Search Input & Phase Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search symbol, name, or #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-control pl-8 py-1.5 text-xs w-full"
            />
          </div>

          {/* Phase Filter Chips */}
          <div className="flex items-center gap-1 bg-[var(--bg-inner)] p-1 rounded-xl border border-[var(--border-subtle)] text-[10px] font-mono">
            {phases.map((ph) => (
              <button
                key={ph}
                onClick={() => setActivePhaseFilter(ph)}
                className={`px-2 py-0.5 rounded-lg font-semibold transition ${
                  activePhaseFilter === ph
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-bold shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {ph}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Chips with Vibrant Color Badges */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full no-scrollbar">
          {categories.map((cat) => {
            const catColor = CATEGORY_COLORS[cat];
            const isCatActive = activeCategoryFilter === cat;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 border ${
                  isCatActive
                    ? 'shadow-sm'
                    : 'bg-[var(--bg-inner)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:border-[var(--border-medium)]'
                }`}
                style={
                  isCatActive
                    ? {
                        background: catColor ? `${catColor}25` : 'var(--bg-hover)',
                        borderColor: catColor || 'var(--border-strong)',
                        color: catColor || 'var(--text-primary)'
                      }
                    : {}
                }
              >
                {catColor && (
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ background: catColor }}
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
        <div className="lg:col-span-8 card-scientific p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] border-b border-[var(--border-subtle)] pb-2.5">
            <span className="font-mono">
              Showing <strong className="text-[var(--text-primary)]">{filteredElements.length}</strong> of 118 Elements
            </span>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Solid
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Gas
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Liquid
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Synthetic
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
                trendColor = `hsl(${Math.round(240 - ratio * 240)}, 85%, 55%)`;
              } else if (trendOverlay === 'radius' && el.radius) {
                const ratio = Math.min(1, Math.max(0, (el.radius - 30) / 240));
                trendColor = `hsl(${Math.round(180 - ratio * 180)}, 85%, 55%)`;
              } else if (trendOverlay === 'ionEnergy' && el.ionEnergy) {
                const ratio = Math.min(1, Math.max(0, (el.ionEnergy - 350) / 2000));
                trendColor = `hsl(${Math.round(280 - ratio * 280)}, 85%, 55%)`;
              } else if (trendOverlay === 'meltingPoint' && el.meltingPoint) {
                const ratio = Math.min(1, Math.max(0, el.meltingPoint / 4000));
                trendColor = `hsl(${Math.round(200 - ratio * 200)}, 90%, 55%)`;
              }

              const displayColor = trendColor || catTheme.color;

              return (
                <div
                  key={el.number}
                  onClick={() => handleSelectElement(el)}
                  className={`p-1.5 rounded-xl cursor-pointer transition-all duration-150 flex flex-col justify-between relative group select-none ${
                    !isMatch ? 'opacity-20 grayscale hover:opacity-100 hover:grayscale-0' : ''
                  } ${
                    isSelected
                      ? 'scale-105 z-20 shadow-[0_0_18px_rgba(249,115,22,0.45)]'
                      : 'hover:scale-[1.04] hover:z-10'
                  }`}
                  style={{
                    background: isSelected
                      ? isDark
                        ? `linear-gradient(135deg, ${displayColor}35 0%, #121520 100%)`
                        : `linear-gradient(135deg, ${displayColor}20 0%, #ffffff 100%)`
                      : isDark
                      ? catTheme.bg
                      : `${displayColor}10`,
                    border: isSelected
                      ? '2px solid #f97316'
                      : `1px solid ${isDark ? catTheme.border : `${displayColor}35`}`,
                    boxShadow: isSelected
                      ? `0 0 16px ${displayColor}55, inset 0 0 8px ${displayColor}25`
                      : '0 1px 3px rgba(0,0,0,0.04)',
                    minHeight: '52px',
                    ...customStyle
                  }}
                >
                  {/* Top: Atomic Number & Mass */}
                  <div className="flex items-center justify-between text-[8.5px] font-mono font-bold leading-none">
                    <span
                      style={{
                        color: displayColor,
                      }}
                    >
                      {el.number}
                    </span>
                    <span className="text-[var(--text-muted)] text-[7.5px] truncate max-w-[28px]">
                      {typeof el.mass === 'number' ? el.mass.toFixed(1) : el.mass}
                    </span>
                  </div>

                  {/* Center: Chemical Symbol */}
                  <div
                    className="text-base font-black text-center my-0.5 tracking-tight transition-transform group-hover:scale-105"
                    style={{
                      color: isDark ? (isSelected ? '#ffffff' : displayColor) : (isSelected ? '#0f172a' : displayColor)
                    }}
                  >
                    {el.symbol}
                  </div>

                  {/* Bottom: Element Name & Phase Indicator */}
                  <div className="flex items-center justify-between text-[8px] font-medium truncate pt-0.5 border-t border-[var(--border-subtle)] leading-none">
                    <span className="truncate text-[var(--text-secondary)]">
                      {el.name}
                    </span>
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 ml-0.5"
                      style={{
                        background:
                          el.phase === 'Gas'
                            ? '#f59e0b'
                            : el.phase === 'Liquid'
                            ? '#0ea5e9'
                            : el.phase === 'Synthetic'
                            ? '#f43f5e'
                            : '#10b981'
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
                      className="p-1.5 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/10 flex flex-col items-center justify-center text-center cursor-default select-none"
                      style={{ gridRow: 6, gridColumn: 3 }}
                      title="Lanthanide Series Elements (57-71)"
                    >
                      <span className="text-[8px] font-mono text-amber-500 font-bold">57-71</span>
                      <span className="text-[9px] font-bold text-[var(--text-primary)]">La-Lu</span>
                      <span className="text-[7px] text-amber-500/80 font-mono">f-block</span>
                    </div>

                    {/* Actinide series indicator (Row 7, Col 3) */}
                    <div
                      className="p-1.5 rounded-xl border border-dashed border-rose-500/40 bg-rose-500/10 flex flex-col items-center justify-center text-center cursor-default select-none"
                      style={{ gridRow: 7, gridColumn: 3 }}
                      title="Actinide Series Elements (89-103)"
                    >
                      <span className="text-[8px] font-mono text-rose-500 font-bold">89-103</span>
                      <span className="text-[9px] font-bold text-[var(--text-primary)]">Ac-Lr</span>
                      <span className="text-[7px] text-rose-500/80 font-mono">f-block</span>
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
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="card-scientific p-5 space-y-4 flex-1">
            {/* Header with Symbol & Name */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div>
                <span className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                  {selectedElement.name}
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full border"
                    style={{
                      background: `${selectedTheme.color}15`,
                      color: selectedTheme.color,
                      borderColor: `${selectedTheme.color}35`
                    }}
                  >
                    #{selectedElement.number}
                  </span>
                </span>
                <span className="text-xs block font-sans mt-0.5" style={{ color: selectedTheme.color }}>
                  {selectedElement.category} • Group {selectedElement.group}, Period {selectedElement.period}
                </span>
              </div>

              {/* Glowing Hero Symbol Card */}
              <div
                className="w-14 h-14 p-2 rounded-2xl border flex flex-col items-center justify-center shadow-md relative overflow-hidden"
                style={{
                  background: isDark
                    ? `linear-gradient(135deg, ${selectedTheme.color}35 0%, #121520 100%)`
                    : `linear-gradient(135deg, ${selectedTheme.color}20 0%, #ffffff 100%)`,
                  borderColor: selectedTheme.color,
                  boxShadow: `0 2px 14px ${selectedTheme.color}35`
                }}
              >
                <span className="text-xl font-black" style={{ color: selectedTheme.color }}>
                  {selectedElement.symbol}
                </span>
                <span className="text-[8px] font-mono text-[var(--text-muted)]">
                  {typeof selectedElement.mass === 'number' ? selectedElement.mass.toFixed(2) : selectedElement.mass}
                </span>
              </div>
            </div>

            {/* 3D Revolving Bohr Atom & Quantum Shell with Mode Switcher */}
            <div className="h-[270px] w-full rounded-2xl overflow-hidden bg-[var(--bg-inner)] border border-[var(--border-subtle)] relative shadow-inner">
              <ThreeAtomShell element={selectedElement} />
            </div>

            {/* Element Properties Dossier */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)] text-[10px] block font-sans">Atomic Number</span>
                <span className="font-bold text-sm text-[var(--text-primary)] font-mono">#{selectedElement.number}</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)] text-[10px] block font-sans">Atomic Weight</span>
                <span className="font-bold text-sm text-[var(--text-primary)] font-mono">{selectedElement.mass} u</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)] text-[10px] block font-sans">Electronegativity</span>
                <span className="text-emerald-500 font-bold text-sm font-mono">{selectedElement.electronegativity || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)] text-[10px] block font-sans">Atomic Radius</span>
                <span className="text-sky-500 font-bold text-sm font-mono">{selectedElement.radius} pm</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)] text-[10px] block font-sans">Ionization Energy</span>
                <span className="text-purple-500 font-bold text-sm font-mono">{selectedElement.ionEnergy} kJ/mol</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)] text-[10px] block font-sans">Standard State</span>
                <span className="text-amber-500 font-bold text-sm font-mono">{selectedElement.phase}</span>
              </div>
            </div>

            {/* Electron Configuration */}
            <div className="p-3 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-xs space-y-1">
              <span className="text-[var(--text-muted)] text-[10px] block font-sans">Electron Configuration:</span>
              <div className="font-mono font-bold" style={{ color: selectedTheme.color }}>
                {selectedElement.config || '1s² 2s² 2p⁶...'}
              </div>
            </div>

            {/* Discovery Information */}
            <div className="text-[11px] text-[var(--text-secondary)] font-sans flex items-center justify-between pt-1 border-t border-[var(--border-subtle)]">
              <span>Discovered: {selectedElement.discovered}</span>
              <span>MP: {selectedElement.meltingPoint ? `${selectedElement.meltingPoint} K` : 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
