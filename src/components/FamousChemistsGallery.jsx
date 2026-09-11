import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  BookOpen,
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
        background: 'var(--bg-card)',
        border: `1px solid ${isHovered ? 'var(--border-strong)' : 'var(--border-subtle)'}`,
        boxShadow: isHovered
          ? 'var(--card-shadow-hover)'
          : 'var(--card-shadow)',
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
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.06) 0%, transparent 65%)`
          }}
        />
      )}
      {children}
    </div>
  );
}

/* ─── Metric Badge Pill ──────────────────────────────────────────────── */
function MetricPill({ label, count }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
      <span className="text-[var(--text-primary)] font-black">{count}</span>
      {label && <span>{label}</span>}
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
            <div className="p-2.5 rounded-2xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
              <Award className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-wider text-[var(--text-primary)]">
                  Scientific Encyclopedia &amp; History Archive
                </h1>
                <span className="telemetry-pill text-[10px] font-bold">
                  {FAMOUS_CHEMISTS.length} PIONEERS CATALOGED
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] font-sans mt-0.5">
                Museum-grade scientific encyclopedia: authentic portraits, structured discoveries, reaction schemes, mathematical equations, and interactive simulations.
              </p>
            </div>
          </div>

          {/* Portrait Mode Toggle & View Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Real Archive vs AI Hologram Switch */}
            <div className="flex items-center gap-1 bg-[var(--bg-card)] p-1 rounded-2xl border border-[var(--border-subtle)] shadow-inner">
              <button
                type="button"
                onClick={() => setPortraitMode('real')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  portraitMode === 'real'
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-sm font-black'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-sm font-black'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="View Futuristic Animated Quantum Hologram Avatars"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>AI Holograms</span>
              </button>
            </div>

            {/* View Modes */}
            <div className="flex items-center gap-1 bg-[var(--bg-card)] p-1 rounded-2xl border border-[var(--border-subtle)] shadow-inner">
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
                      ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-sm font-black'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
              label: 'Cataloged Pioneers',
              value: `${totalScientists} Icons`
            },
            {
              icon: Award,
              label: 'Nobel Laureates',
              value: `${totalNobelLaureates} Laureates`
            },
            {
              icon: FlaskConical,
              label: 'Milestone Discoveries',
              value: `${totalDiscoveries} Discoveries`
            },
            {
              icon: Atom,
              label: 'Theories & Models',
              value: `${totalEquations} Formulations`
            }
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="glass-panel p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] flex items-center gap-3 shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-[var(--text-muted)] uppercase font-mono font-bold tracking-wider">
                  {label}
                </div>
                <div className="text-sm font-black text-[var(--text-primary)]">{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ─── 3. CURATED PRESET COLLECTIONS BAR ───────────────────────── */}
        <div className="glass-panel p-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] flex items-center gap-2 overflow-x-auto custom-scrollbar shadow-sm">
          <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase shrink-0 px-2 flex items-center gap-1.5">
            <Filter className="w-3 h-3 text-[var(--text-muted)]" /> Presets:
          </span>
          {CURATED_COLLECTIONS.map(col => (
            <button
              key={col.id}
              type="button"
              onClick={() => setSelectedCollection(col.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                selectedCollection === col.id
                  ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-sm font-black'
                  : 'bg-[var(--bg-inner)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>{col.label}</span>
            </button>
          ))}
        </div>

        {/* ─── 4. SEARCH & DISCIPLINE FILTERS (GRID ONLY) ──────────────── */}
        {viewMode === 'grid' && (
          <div className="glass-panel p-4 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-3 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search input */}
              <div className="flex-1 relative w-full">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3" />
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
                    className="absolute right-3.5 top-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-bold"
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
                      ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-[var(--border-strong)] font-black shadow-sm'
                      : 'bg-[var(--bg-inner)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                  }`}
                  title="Filter to Nobel Laureates only"
                >
                  <Award className={`w-3.5 h-3.5 ${nobelOnly ? 'text-amber-500' : 'text-amber-400'}`} />
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
                      ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-sm font-black'
                      : 'bg-[var(--bg-inner)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
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
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono px-1">
              <span>
                Displaying <strong className="text-[var(--text-primary)]">{filteredScientists.length}</strong> verified scientific pioneers
              </span>
              {nobelOnly && <span className="text-amber-500 font-bold">★ Nobel Laureates Filter Active</span>}
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
                        className="absolute top-0 inset-x-0 h-0.5 rounded-t-3xl pointer-events-none"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
                      />

                      {/* Nobel Star Badge */}
                      {scientist.isNobelLaureate && (
                        <div
                          className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center shadow-lg"
                          style={{
                            background: 'rgba(0,0,0,0.7)',
                            border: '1px solid rgba(245,158,11,0.45)',
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                      )}

                      {/* Lifetime Span */}
                      <div
                        className="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono shadow"
                        style={{
                          background: 'rgba(0,0,0,0.8)',
                          color: '#f8fafc',
                          border: '1px solid rgba(255,255,255,0.15)',
                          backdropFilter: 'blur(8px)'
                        }}
                      >
                        {scientist.years}
                      </div>

                      {/* Nationality */}
                      <div
                        className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold text-slate-200 border border-white/10"
                        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
                      >
                        <Globe className="w-2.5 h-2.5" />
                        <span>{scientist.nationality.split('/')[0].trim()}</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-col flex-1 p-4 space-y-3 justify-between">
                      <div className="space-y-1.5">
                        <h3 className="text-sm font-black text-[var(--text-primary)] leading-tight group-hover:text-emerald-400 transition">
                          {scientist.name}
                        </h3>

                        <span
                          className="text-[10px] font-bold font-mono inline-block px-2 py-0.5 rounded-md truncate max-w-full bg-[var(--bg-inner)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                        >
                          {scientist.field}
                        </span>

                        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-sans line-clamp-2">
                          {scientist.summary}
                        </p>
                      </div>

                      {/* Metrics Badges */}
                      <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <MetricPill count={discCount} label="Discoveries" />
                          {eqCount > 0 && <MetricPill count={eqCount} label="Equations" />}
                          {scientist.molecule && (
                            <MetricPill count={scientist.molecule.formula} label="" />
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono font-bold pt-1 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
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
