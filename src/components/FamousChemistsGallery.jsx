import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Sparkles,
  Quote,
  Globe,
  ArrowRight,
  UserCheck,
  Box,
  Search,
  Filter,
  Calendar,
  Layers,
  Activity,
  Sliders,
  CheckCircle2,
  Atom,
  Clock,
  FileText,
  ExternalLink,
  ChevronRight,
  GitCompare,
  List,
  Compass,
  X,
  Star,
  Eye,
  Bot,
  Zap,
  TrendingUp,
  Bookmark,
  MapPin,
  FlaskConical,
  Microscope,
  Users,
  Building2,
  GitBranch,
  Cpu
} from 'lucide-react';
import {
  FAMOUS_CHEMISTS,
  SCIENTIST_FIELDS,
  SCIENTIST_ERAS,
  CURATED_COLLECTIONS
} from '../data/chemistsData';
import ScientistPortrait, { getFieldColor } from './scientists/ScientistPortrait';
import ScientistDetailModal from './scientists/ScientistDetailModal';
import ScientificLineageView from './scientists/ScientificLineageView';
import ScientistCompareView from './scientists/ScientistCompareView';
import GlobalTimelineView from './scientists/GlobalTimelineView';
import ScientistsBackground from './scientists/ScientistsBackground';
import { useTheme } from '../context/ThemeContext';

/* ─── 3D Perspective Tilt Card Wrapper ───────────────────────────────── */
function ChemistCard3D({ scientist, fc, isHovered, onSelect, onHoverChange, children }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    try {
      const rect = cardRef.current.getBoundingClientRect();
      if (!rect || rect.width === 0) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const normX = (x / rect.width) * 2 - 1;
      const normY = (y / rect.height) * 2 - 1;

      setTilt({
        rotateX: -normY * 8,
        rotateY: normX * 8,
        glareX: (x / rect.width) * 100,
        glareY: (y / rect.height) * 100
      });
    } catch {
      // safe fallback
    }
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
    onHoverChange(null);
  };

  return (
    <div
      ref={cardRef}
      onClick={onSelect}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => onHoverChange(scientist.id)}
      onMouseLeave={handleMouseLeave}
      className="group cursor-pointer rounded-3xl overflow-hidden relative flex flex-col transition-all duration-200"
      style={{
        background: 'rgba(10, 14, 22, 0.9)',
        border: `1px solid ${isHovered ? fc.accent + '80' : 'rgba(255, 255, 255, 0.08)'}`,
        boxShadow: isHovered
          ? `0 0 28px ${fc.accent}30, 0 16px 36px rgba(0,0,0,0.6)`
          : '0 4px 20px rgba(0,0,0,0.3)',
        transform: isHovered
          ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateY(-5px)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)',
        willChange: 'transform'
      }}
    >
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.1) 0%, transparent 65%)`
          }}
        />
      )}
      {children}
    </div>
  );
}

/* ─── Metric Badge Pill ──────────────────────────────────────────────── */
function MetricPill({ label, count, color }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold"
      style={{
        background: `${color}18`,
        border: `1px solid ${color}40`,
        color
      }}
    >
      {count} {label}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN MASTER ARCHIVE COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export default function FamousChemistsGallery() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  /* View & Filter States */
  const [viewMode, setViewMode]             = useState('grid'); // 'grid' | 'timeline' | 'lineage' | 'compare'
  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedField, setSelectedField]   = useState('All Fields');
  const [selectedEra, setSelectedEra]       = useState('All Eras');
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [nobelOnly, setNobelOnly]           = useState(false);
  const [portraitMode, setPortraitMode]     = useState('real'); // 'real' | 'animated'

  /* Profile Modal State */
  const [selectedScientist, setSelectedScientist] = useState(null);
  const [hoveredId, setHoveredId]                 = useState(null);

  /* Summary Analytics */
  const totalScientists = FAMOUS_CHEMISTS.length;
  const totalNobelLaureates = useMemo(
    () => FAMOUS_CHEMISTS.filter(s => s.isNobelLaureate).length,
    []
  );
  const totalDiscoveries = useMemo(
    () => FAMOUS_CHEMISTS.reduce((acc, s) => acc + (s.discoveries?.length || 0), 0),
    []
  );
  const totalEquations = useMemo(
    () => FAMOUS_CHEMISTS.reduce((acc, s) => acc + (s.equations?.length || 0), 0),
    []
  );

  /* Filtered Scientists Calculation */
  const filteredScientists = useMemo(() => {
    return FAMOUS_CHEMISTS.filter(s => {
      const q = searchQuery.toLowerCase().trim();

      // Deep search matching
      const matchesQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.fullName && s.fullName.toLowerCase().includes(q)) ||
        s.field.toLowerCase().includes(q) ||
        (s.subfields && s.subfields.some(sf => sf.toLowerCase().includes(q))) ||
        s.summary.toLowerCase().includes(q) ||
        s.nationality.toLowerCase().includes(q) ||
        s.institutions?.some(inst => inst.toLowerCase().includes(q)) ||
        s.discoveries?.some(d => d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)) ||
        (s.molecule && (s.molecule.name.toLowerCase().includes(q) || s.molecule.formula.toLowerCase().includes(q))) ||
        s.equations?.some(eq => eq.name.toLowerCase().includes(q));

      // Field & Era filter
      const matchesField = selectedField === 'All Fields' || s.field === selectedField;
      const matchesEra   = selectedEra === 'All Eras' || s.era === selectedEra;
      const matchesNobel = !nobelOnly || s.isNobelLaureate;

      // Curated Collections Preset Filter
      let matchesCollection = true;
      if (selectedCollection === 'nobel') {
        matchesCollection = s.isNobelLaureate;
      } else if (selectedCollection === 'women') {
        matchesCollection = ['curie', 'hodgkin', 'franklin', 'doudna', 'arnold', 'tuyouyou', 'bertozzi'].includes(s.id);
      } else if (selectedCollection === 'quantum') {
        matchesCollection = ['bohr', 'schrodinger', 'planck', 'pauling', 'pople', 'kohn', 'lewis'].includes(s.id);
      } else if (selectedCollection === 'organic') {
        matchesCollection = ['woodward', 'pasteur', 'bertozzi', 'tuyouyou', 'farooq', 'vanthoff'].includes(s.id);
      } else if (selectedCollection === 'spectroscopy') {
        matchesCollection = ['zewail', 'hodgkin', 'thomson', 'karplus', 'arrhenius'].includes(s.id);
      } else if (selectedCollection === 'computational') {
        matchesCollection = ['kohn', 'pople', 'karplus'].includes(s.id);
      } else if (selectedCollection === 'biotech') {
        matchesCollection = ['doudna', 'arnold', 'franklin', 'bertozzi'].includes(s.id);
      }

      return matchesQuery && matchesField && matchesEra && matchesNobel && matchesCollection;
    });
  }, [searchQuery, selectedField, selectedEra, nobelOnly, selectedCollection]);

  return (
    <div className="relative min-h-screen font-mono select-none space-y-6 pb-12">
      {/* Ambient Canvas Molecular Lattice */}
      <ScientistsBackground />

      <div className="relative z-10 space-y-6">
        {/* ─── 1. ARCHIVE HEADER & TITLE ───────────────────────────────── */}
        <div className="workspace-header">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Award className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-wider text-white">
                  Scientific Encyclopedia &amp; History Archive
                </h1>
                <span className="telemetry-pill text-[10px] font-bold">
                  {FAMOUS_CHEMISTS.length} PIONEERS CATALOGED
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                Museum-grade scientific encyclopedia: authentic portraits, structured discoveries, reaction schemes, mathematical equations, and interactive simulations.
              </p>
            </div>
          </div>

          {/* Portrait Mode Toggle & View Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Real Archive vs AI Hologram Switch */}
            <div className="flex items-center gap-1 bg-black/70 p-1 rounded-2xl border border-white/15 shadow-inner">
              <button
                type="button"
                onClick={() => setPortraitMode('real')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  portraitMode === 'real'
                    ? 'bg-white text-black shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="View Verified Historical Archival Photographs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Archival Photos</span>
              </button>

              <button
                type="button"
                onClick={() => setPortraitMode('animated')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  portraitMode === 'animated'
                    ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black shadow-lg font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="View Futuristic Animated Quantum Hologram Avatars"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>AI Holograms</span>
              </button>
            </div>

            {/* View Modes */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 shadow-inner">
              {[
                { id: 'grid', label: 'Museum Grid', icon: List },
                { id: 'timeline', label: 'Global Timeline', icon: Clock },
                { id: 'lineage', label: 'Lineage Tree', icon: GitBranch },
                { id: 'compare', label: 'Compare Matrix', icon: GitCompare }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setViewMode(id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    viewMode === id
                      ? 'bg-cyan-500 text-black shadow-md font-black'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── 2. METRICS TALLY BAR ────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              icon: UserCheck,
              color: '#06b6d4',
              label: 'Cataloged Pioneers',
              value: `${totalScientists} Icons`
            },
            {
              icon: Star,
              color: '#f59e0b',
              label: 'Nobel Laureates',
              value: `${totalNobelLaureates} Laureates`
            },
            {
              icon: Sparkles,
              color: '#10b981',
              label: 'Milestone Discoveries',
              value: `${totalDiscoveries} Discoveries`
            },
            {
              icon: Atom,
              color: '#8b5cf6',
              label: 'Theories & Models',
              value: `${totalEquations} Formulations`
            }
          ].map(({ icon: Icon, color, label, value }) => (
            <div
              key={label}
              className="glass-panel p-3.5 rounded-2xl border border-white/10 flex items-center gap-3 shadow-lg"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}18`, color }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">
                  {label}
                </div>
                <div className="text-sm font-black text-white">{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ─── 3. CURATED PRESET COLLECTIONS BAR ───────────────────────── */}
        <div className="glass-panel p-3 rounded-2xl border border-white/10 flex items-center gap-2 overflow-x-auto custom-scrollbar shadow-lg">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase shrink-0 px-2 flex items-center gap-1">
            <Filter className="w-3 h-3 text-cyan-400" /> Presets:
          </span>
          {CURATED_COLLECTIONS.map(col => (
            <button
              key={col.id}
              type="button"
              onClick={() => setSelectedCollection(col.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                selectedCollection === col.id
                  ? 'bg-cyan-500 text-black shadow-md font-black'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>{col.label}</span>
            </button>
          ))}
        </div>

        {/* ─── 4. SEARCH & DISCIPLINE FILTERS (GRID ONLY) ──────────────── */}
        {viewMode === 'grid' && (
          <div className="glass-panel p-4 rounded-3xl border border-white/10 space-y-3 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search input */}
              <div className="flex-1 relative w-full">
                <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by name, discovery, molecule, equation, institution, or country..."
                  className="input-control rounded-2xl pl-10 pr-4 py-2.5 text-xs font-mono w-full"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-white text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Era Selector & Nobel Toggle */}
              <div className="w-full md:w-auto shrink-0 flex items-center gap-2">
                <select
                  value={selectedEra}
                  onChange={e => setSelectedEra(e.target.value)}
                  className="input-control rounded-2xl py-2 px-3 text-xs font-mono font-bold w-full md:w-auto"
                >
                  {SCIENTIST_ERAS.map(era => (
                    <option key={era} value={era}>
                      {era}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setNobelOnly(!nobelOnly)}
                  className={`px-3 py-2 rounded-2xl text-xs font-mono font-bold transition flex items-center gap-1.5 shrink-0 border ${
                    nobelOnly
                      ? 'bg-amber-500 text-black border-amber-400 font-black shadow-md'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                  title="Filter to Nobel Laureates only"
                >
                  <Star className={`w-3.5 h-3.5 ${nobelOnly ? 'fill-current text-black' : 'text-amber-400'}`} />
                  <span>Nobel Only</span>
                </button>
              </div>
            </div>

            {/* Discipline Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {SCIENTIST_FIELDS.map(field => (
                <button
                  key={field}
                  type="button"
                  onClick={() => setSelectedField(field)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold whitespace-nowrap transition ${
                    selectedField === field
                      ? 'bg-white text-black shadow-md font-black'
                      : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {field}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── 5. MAIN MUSEUM GRID VIEW ────────────────────────────────── */}
        {viewMode === 'grid' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
              <span>
                Displaying <strong className="text-white">{filteredScientists.length}</strong> verified scientific pioneers
              </span>
              {nobelOnly && <span className="text-amber-400 font-bold">★ Nobel Laureates Filter Active</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredScientists.map(scientist => {
                const fc = getFieldColor(scientist.field);
                const isHovered = hoveredId === scientist.id;
                const discCount = scientist.discoveries?.length || 0;
                const eqCount   = scientist.equations?.length || 0;

                return (
                  <ChemistCard3D
                    key={scientist.id}
                    scientist={scientist}
                    fc={fc}
                    isHovered={isHovered}
                    onSelect={() => setSelectedScientist(scientist)}
                    onHoverChange={setHoveredId}
                  >
                    {/* Hero Portrait Area */}
                    <div className="relative h-56 w-full">
                      <ScientistPortrait
                        scientist={scientist}
                        className="absolute inset-0 w-full h-full"
                        size="card"
                        mode={portraitMode}
                      />

                      {/* Top Field Glow Line */}
                      <div
                        className="absolute top-0 inset-x-0 h-1 rounded-t-3xl"
                        style={{ background: `linear-gradient(90deg, transparent, ${fc.accent}, transparent)` }}
                      />

                      {/* Nobel Star Badge */}
                      {scientist.isNobelLaureate && (
                        <div
                          className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center shadow-lg"
                          style={{
                            background: 'rgba(245,158,11,0.25)',
                            border: '1px solid rgba(245,158,11,0.5)',
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                        </div>
                      )}

                      {/* Lifetime Span */}
                      <div
                        className="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg text-[10px] font-black font-mono shadow"
                        style={{
                          background: 'rgba(5,10,20,0.85)',
                          color: fc.accent,
                          border: `1px solid ${fc.accent}40`,
                          backdropFilter: 'blur(8px)'
                        }}
                      >
                        {scientist.years}
                      </div>

                      {/* Nationality */}
                      <div
                        className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold text-slate-300 border border-white/10"
                        style={{ background: 'rgba(5,10,20,0.8)', backdropFilter: 'blur(8px)' }}
                      >
                        <Globe className="w-2.5 h-2.5" />
                        <span>{scientist.nationality.split('/')[0].trim()}</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-col flex-1 p-4 space-y-3 justify-between">
                      <div className="space-y-1.5">
                        <h3 className="text-sm font-black text-white leading-tight group-hover:text-cyan-400 transition">
                          {scientist.name}
                        </h3>

                        <span
                          className="text-[10px] font-bold font-mono inline-block px-1.5 py-0.5 rounded-md truncate max-w-full"
                          style={{ background: fc.bg, color: fc.accent, border: `1px solid ${fc.border}` }}
                        >
                          {scientist.field}
                        </span>

                        <p className="text-[11px] text-slate-300 leading-relaxed font-sans line-clamp-2">
                          {scientist.summary}
                        </p>
                      </div>

                      {/* Metrics Badges */}
                      <div className="space-y-2 pt-2 border-t border-white/10">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <MetricPill count={discCount} label="Discoveries" color={fc.accent} />
                          {eqCount > 0 && <MetricPill count={eqCount} label="Equations" color="#a855f7" />}
                          {scientist.molecule && (
                            <MetricPill count={scientist.molecule.formula} label="" color="#10b981" />
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono font-bold pt-1" style={{ color: fc.accent }}>
                          <span>Inspect Full Dossier</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </ChemistCard3D>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── 6. GLOBAL TIMELINE VIEW ─────────────────────────────────── */}
        {viewMode === 'timeline' && (
          <GlobalTimelineView onSelectScientist={setSelectedScientist} />
        )}

        {/* ─── 7. SCIENTIFIC LINEAGE & INFLUENCE NETWORK ───────────────── */}
        {viewMode === 'lineage' && (
          <ScientificLineageView onSelectScientist={setSelectedScientist} />
        )}

        {/* ─── 8. SIDE-BY-SIDE COMPARATIVE MATRIX ───────────────────────── */}
        {viewMode === 'compare' && (
          <ScientistCompareView onSelectScientist={setSelectedScientist} />
        )}

        {/* ─── 9. CINEMATIC SCIENTIST DETAIL DOSSIER MODAL ─────────────── */}
        {selectedScientist && (
          <ScientistDetailModal
            scientist={selectedScientist}
            onClose={() => setSelectedScientist(null)}
            onSelectScientist={setSelectedScientist}
          />
        )}
      </div>

      {/* Global CSS keyframes for scanlines */}
      <style>{`
        @keyframes scanlineMove {
          0% { top: 0%; opacity: 0.8; }
          50% { opacity: 0.3; }
          100% { top: 100%; opacity: 0.8; }
        }
        @keyframes spinReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
