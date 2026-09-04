import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Plus,
  Sparkles,
  FlaskConical,
  Filter,
  CheckCircle2,
  Sliders,
  Thermometer,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import { REAGENT_CATEGORIES, REAGENTS_DATABASE } from '../../data/reagentLibrary';

export default function ReagentSelectorModal({
  isOpen,
  onClose,
  onSelectReagent,
  onSelectCondition
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState('Custom Reagent');
  const [customTemp, setCustomTemp] = useState('');
  const [customSolvent, setCustomSolvent] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  const filteredReagents = useMemo(() => {
    return REAGENTS_DATABASE.filter((r) => {
      const matchCat = selectedCategory === 'all' || r.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.formula.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.typicalUse.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;

    if (onSelectReagent) {
      onSelectReagent({
        name: customName.trim(),
        formula: customName.trim(),
        type: customType,
        solvent: customSolvent,
        temperature: customTemp,
        notes: customNotes
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md font-mono select-none">
      <div className="relative w-full max-w-4xl glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] space-y-5 shadow-2xl bg-[#080d1a] max-h-[90vh] flex flex-col text-xs text-[var(--text-primary)]">
        {/* 1. MODAL HEADER & SEARCH */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-inherit pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">
                Synthetic Reagent, Catalyst &amp; Condition Palette
              </h2>
              <p className="text-[10px] text-[var(--text-secondary)] font-sans">
                Search verified chemical reagents, acids, bases, oxidants, reductants, cross-coupling catalysts, solvents &amp; conditions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. SEARCH FILTER BAR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reagents (e.g. PCC, NaBH4, H2SO4, LAH, Pd/C, DMF, Reflux)..."
              className="input-control pl-9 pr-3 py-2 text-xs rounded-xl w-full"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[10px] text-slate-400 hover:text-white px-2"
            >
              Clear
            </button>
          )}
        </div>

        {/* 3. CATEGORY SWITCHER TABS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar shrink-0">
          {REAGENT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold font-mono transition whitespace-nowrap border ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-md'
                  : 'bg-white/5 border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 4. REAGENTS GRID & CUSTOM CREATOR */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredReagents.map((reagent) => (
              <div
                key={reagent.id}
                onClick={() => {
                  if (reagent.category === 'conditions' && onSelectCondition) {
                    onSelectCondition(reagent.name);
                  } else if (onSelectReagent) {
                    onSelectReagent(reagent);
                  }
                  onClose();
                }}
                className="p-3.5 rounded-2xl inner-box border border-[var(--border-subtle)] hover:border-cyan-500/50 hover:bg-cyan-500/5 transition cursor-pointer space-y-1.5 group shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-cyan-300 font-bold group-hover:text-cyan-200">
                    {reagent.name}
                  </strong>
                  <span className="px-2 py-0.5 rounded-md bg-black/40 text-cyan-400 font-mono font-bold text-[10px] border border-white/5">
                    {reagent.formula}
                  </span>
                </div>

                <div className="text-[10px] text-slate-400 font-mono">
                  {reagent.type} {reagent.pKa !== undefined && `• pKa: ${reagent.pKa}`}
                </div>

                <p className="text-[11px] text-[var(--text-secondary)] font-sans line-clamp-2">
                  <strong>Use: </strong>{reagent.typicalUse}
                </p>
              </div>
            ))}
          </div>

          {filteredReagents.length === 0 && (
            <div className="p-8 rounded-2xl text-center text-slate-500 italic">
              No matching reagents found in library for "{searchQuery}". You can define a custom reagent below.
            </div>
          )}

          {/* 5. USER-DEFINED CUSTOM REAGENT FORM */}
          <div className="p-4 rounded-2xl border border-dashed border-cyan-500/30 bg-cyan-500/5 space-y-3">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold uppercase text-[10px]">
              <Plus className="w-3.5 h-3.5" />
              <span>Define Custom Reaction Reagent / Condition</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Reagent Name (e.g. Sc(OTf)3, NBS)"
                className="input-control px-2.5 py-1.5 text-xs rounded-xl"
              />
              <input
                type="text"
                value={customSolvent}
                onChange={(e) => setCustomSolvent(e.target.value)}
                placeholder="Solvent (e.g. Anhydrous MeCN)"
                className="input-control px-2.5 py-1.5 text-xs rounded-xl"
              />
              <input
                type="text"
                value={customTemp}
                onChange={(e) => setCustomTemp(e.target.value)}
                placeholder="Temperature / Time (e.g. 60 °C, 2h)"
                className="input-control px-2.5 py-1.5 text-xs rounded-xl"
              />
            </div>

            <button
              onClick={handleAddCustom}
              disabled={!customName.trim()}
              className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-black text-xs font-mono transition flex items-center gap-1 shadow-md"
            >
              <Plus className="w-3.5 h-3.5" /> Add Custom Reagent to Reaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
