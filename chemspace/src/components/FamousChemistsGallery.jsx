import React, { useState, useMemo, useEffect } from 'react';
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
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  FAMOUS_CHEMISTS,
  SCIENTIST_FIELDS,
  SCIENTIST_ERAS
} from '../data/chemistsData';
import { MOLECULES } from '../data/moleculeData';
import ThreeMoleculeViewer from './ThreeMoleculeViewer';
import Molecule2DViewer from './RDKit/Molecule2DViewer';
import { parseSmilesTo2D } from '../services/chemicalGraph';
import { useTheme } from '../context/ThemeContext';

/* ─── Field colour palette ─────────────────────────────────────────────── */
const FIELD_COLORS = {
  'Quantum Chemistry':        { accent: '#06b6d4', bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.3)' },
  'Physical Chemistry':       { accent: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  'Organic Chemistry':        { accent: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
  'Inorganic Chemistry':      { accent: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)' },
  'Biochemistry':             { accent: '#ec4899', bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.3)' },
  'Analytical & Spectroscopy':{ accent: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)' },
  'Computational Chemistry':  { accent: '#06b6d4', bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.3)' },
  'Nuclear & Materials':      { accent: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)' },
};
const fieldColor = (field) => FIELD_COLORS[field] || { accent: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' };

/* ─── Reliable portrait via Wikimedia REST API (CORS-safe) ─────────────── */
function ScientistPortrait({ scientist, className = '', size = 'card' }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const { accent } = fieldColor(scientist.field);
  const initials = scientist.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: `linear-gradient(135deg, ${accent}22 0%, #0a0f1a 100%)` }}>
      {/* Loading shimmer */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 1 }}>
          <div style={{
            width: size === 'modal' ? '64px' : '40px',
            height: size === 'modal' ? '64px' : '40px',
            borderRadius: '50%',
            border: `3px solid ${accent}`,
            borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite'
          }} />
        </div>
      )}

      {/* Actual portrait image */}
      {scientist.photo && !error && (
        <img
          src={scientist.photo}
          alt={`${scientist.name} portrait`}
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => { setError(true); setLoaded(false); }}
          className="w-full h-full object-cover object-top transition-all duration-700"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'scale(1)' : 'scale(1.05)',
            filter: loaded ? 'none' : 'blur(4px)'
          }}
        />
      )}

      {/* Fallback avatar */}
      {(!scientist.photo || error) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span style={{
            fontSize: size === 'modal' ? '3rem' : '1.5rem',
            fontWeight: 900,
            color: accent,
            fontFamily: 'monospace',
            textShadow: `0 0 20px ${accent}88`
          }}>{initials}</span>
          <span style={{ fontSize: '9px', color: accent + '99', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
            PORTRAIT
          </span>
        </div>
      )}

      {/* Subtle gradient overlay at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(5,10,20,0.9) 0%, transparent 100%)' }} />
    </div>
  );
}

/* ─── Animated Discovery Count Badge ───────────────────────────────────── */
function DiscoveryBadge({ count, label, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 8px', borderRadius: '20px',
      background: `${color}18`, border: `1px solid ${color}40`,
      color: color, fontSize: '9px', fontWeight: 700,
      fontFamily: 'monospace', letterSpacing: '0.05em'
    }}>
      {count} {label}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export default function FamousChemistsGallery() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  /* Navigation & Filtering */
  const [viewMode, setViewMode]         = useState('grid');
  const [searchQuery, setSearchQuery]   = useState('');
  const [selectedField, setSelectedField] = useState('All Fields');
  const [selectedEra, setSelectedEra]   = useState('All Eras');
  const [nobelOnly, setNobelOnly]       = useState(false);

  /* Profile modal */
  const [selectedChemist, setSelectedChemist] = useState(null);
  const [profileTab, setProfileTab]           = useState('story');

  /* Comparison tool */
  const [compareIdA, setCompareIdA] = useState('mendeleev');
  const [compareIdB, setCompareIdB] = useState('pauling');

  /* Hover card for preview */
  const [hoveredId, setHoveredId] = useState(null);

  /* ── Summary metrics ── */
  const totalScientists    = FAMOUS_CHEMISTS.length;
  const totalNobelLaureates = useMemo(() => FAMOUS_CHEMISTS.filter(s => s.isNobelLaureate).length, []);
  const totalDiscoveries   = useMemo(() => FAMOUS_CHEMISTS.reduce((a,s) => a + (s.discoveries?.length||0), 0), []);
  const totalEquations     = useMemo(() => FAMOUS_CHEMISTS.reduce((a,s) => a + (s.equations?.length||0), 0), []);

  /* ── Filtered list ── */
  const filteredChemists = useMemo(() => {
    return FAMOUS_CHEMISTS.filter(s => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        s.name.toLowerCase().includes(q) ||
        s.field.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.nationality.toLowerCase().includes(q) ||
        s.institutions.some(i => i.toLowerCase().includes(q)) ||
        (s.molecule?.name.toLowerCase().includes(q));

      return matchesSearch &&
        (selectedField === 'All Fields' || s.field === selectedField) &&
        (selectedEra   === 'All Eras'   || s.era  === selectedEra)   &&
        (!nobelOnly || s.isNobelLaureate);
    });
  }, [searchQuery, selectedField, selectedEra, nobelOnly]);

  /* ── Global timeline ── */
  const globalTimelineItems = useMemo(() => {
    const items = [];
    FAMOUS_CHEMISTS.forEach(s => {
      (s.timeline||[]).forEach(t => {
        const y = parseInt(t.year.replace(/[^0-9]/g,''), 10);
        if (!isNaN(y)) items.push({ year: y, yearStr: t.year, event: t.event,
          scientistName: s.name, scientistId: s.id, field: s.field, photo: s.photo });
      });
    });
    return items.sort((a,b) => a.year - b.year);
  }, []);

  const chemistA = FAMOUS_CHEMISTS.find(s => s.id === compareIdA) || FAMOUS_CHEMISTS[0];
  const chemistB = FAMOUS_CHEMISTS.find(s => s.id === compareIdB) || FAMOUS_CHEMISTS[1];

  /* ── 2D / 3D molecule for profile modal ── */
  const selectedMolecule2D = useMemo(() => {
    if (!selectedChemist?.molecule?.smiles) return null;
    return parseSmilesTo2D(selectedChemist.molecule.smiles);
  }, [selectedChemist]);

  const selectedMolecule3D = useMemo(() => {
    if (!selectedChemist?.molecule) return null;
    const existing = MOLECULES.find(m => m.id === selectedChemist.id || m.formula === selectedChemist.molecule.formula);
    if (existing) return existing;
    if (selectedMolecule2D?.atoms?.length > 0) {
      return {
        id: selectedChemist.id,
        name: selectedChemist.molecule.name,
        formula: selectedChemist.molecule.formula,
        atoms: selectedMolecule2D.atoms.map((a,i) => ({
          id: a.id, element: a.element||'C',
          x: Number(((a.x-350)/45).toFixed(3)),
          y: Number((-(a.y-250)/45).toFixed(3)),
          z: Number(((i%2===0?0.3:-0.3)).toFixed(3))
        })),
        bonds: selectedMolecule2D.bonds
      };
    }
    return MOLECULES[0];
  }, [selectedChemist, selectedMolecule2D]);

  /* ── lock body scroll when modal open ── */
  useEffect(() => {
    if (selectedChemist) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedChemist]);

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="workspace-container font-mono select-none space-y-6">

      {/* ── HEADER ── */}
      <div className="workspace-header">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Award className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-wider text-[var(--text-primary)]">
                Scientific Encyclopedia &amp; History Archive
              </h1>
              <span className="telemetry-pill text-[9px] font-bold">
                {FAMOUS_CHEMISTS.length} PIONEERS CATALOGED
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] font-sans mt-0.5">
              Verified historical biographies, animated portraits, discoveries, equations, and signature molecular structures.
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-[var(--border-subtle)]">
          {[
            { id: 'grid', label: 'Directory Grid', icon: List },
            { id: 'timeline', label: 'Global Timeline', icon: Clock },
            { id: 'compare', label: 'Compare', icon: GitCompare }
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setViewMode(id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === id
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>
      </div>

      {/* ── METRICS TALLY BAR ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: UserCheck, color: '#06b6d4', label: 'Pioneers',          value: `${totalScientists} Cataloged` },
          { icon: Star,      color: '#f59e0b', label: 'Nobel Laureates',    value: `${totalNobelLaureates} Laureates` },
          { icon: Sparkles,  color: '#10b981', label: 'Discoveries',        value: `${totalDiscoveries} Breakthroughs` },
          { icon: Atom,      color: '#8b5cf6', label: 'Theories & Models',  value: `${totalEquations} Formulations` }
        ].map(({ icon: Icon, color, label, value }) => (
          <div key={label} className="glass-panel p-3.5 rounded-2xl border border-[var(--border-subtle)] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0"
              style={{ background: `${color}18`, color }}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">{label}</div>
              <div className="text-sm font-black text-[var(--text-primary)]">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── SEARCH & FILTER (grid only) ── */}
      {viewMode === 'grid' && (
        <div className="glass-panel p-4 rounded-3xl border border-[var(--border-subtle)] space-y-3 shadow-xl">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="flex-1 relative w-full">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, discovery, molecule, equation, institution, or topic..."
                className="input-control rounded-2xl pl-10 pr-4 py-2.5 text-xs font-mono w-full" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs">✕</button>
              )}
            </div>
            <div className="w-full md:w-auto shrink-0 flex items-center gap-2">
              <select value={selectedEra} onChange={e => setSelectedEra(e.target.value)}
                className="input-control rounded-2xl py-2 px-3 text-xs font-bold w-full md:w-auto">
                {SCIENTIST_ERAS.map(era => <option key={era} value={era}>{era}</option>)}
              </select>
              <button onClick={() => setNobelOnly(!nobelOnly)}
                className={`btn-horizontal text-xs shrink-0 ${nobelOnly ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md' : 'btn-secondary'}`}
                title="Filter Nobel Laureates only">
                <Star className={`w-3.5 h-3.5 ${nobelOnly ? 'fill-current' : 'text-amber-400'}`} />
                <span>Nobel Laureates</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {SCIENTIST_FIELDS.map(field => (
              <button key={field} onClick={() => setSelectedField(field)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                  selectedField === field
                    ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] shadow-sm'
                    : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
                }`}>
                {field}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          4. CINEMATIC DIRECTORY GRID
      ══════════════════════════════════════════ */}
      {viewMode === 'grid' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-mono px-1">
            <span>Showing {filteredChemists.length} scientist profiles</span>
            {nobelOnly && <span className="text-amber-400 font-bold">★ Filtered to Nobel Laureates</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredChemists.map(scientist => {
              const fc = fieldColor(scientist.field);
              const isHovered = hoveredId === scientist.id;
              const discCount = scientist.discoveries?.length || 0;
              const eqCount   = scientist.equations?.length  || 0;

              return (
                <div key={scientist.id}
                  onClick={() => { setSelectedChemist(scientist); setProfileTab('story'); }}
                  onMouseEnter={() => setHoveredId(scientist.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="group cursor-pointer rounded-3xl overflow-hidden relative flex flex-col"
                  style={{
                    background: 'var(--bg-card-glass)',
                    border: `1px solid ${isHovered ? fc.accent + '60' : 'var(--border-subtle)'}`,
                    boxShadow: isHovered ? `0 0 32px ${fc.accent}22, 0 12px 40px rgba(0,0,0,0.4)` : '0 4px 20px rgba(0,0,0,0.2)',
                    transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                    transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}>

                  {/* ── HERO PORTRAIT AREA ── */}
                  <div className="relative" style={{ height: '200px' }}>
                    <ScientistPortrait scientist={scientist} className="absolute inset-0" size="card" />

                    {/* Field glow strip at top */}
                    <div className="absolute top-0 inset-x-0 h-1 rounded-t-3xl"
                      style={{ background: `linear-gradient(90deg, transparent, ${fc.accent}, transparent)` }} />

                    {/* Nobel star */}
                    {scientist.isNobelLaureate && (
                      <div className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.5)', backdropFilter: 'blur(8px)' }}>
                        <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                      </div>
                    )}

                    {/* Years badge */}
                    <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg text-[10px] font-black font-mono"
                      style={{ background: 'rgba(5,10,20,0.8)', color: fc.accent, border: `1px solid ${fc.accent}40`, backdropFilter: 'blur(8px)' }}>
                      {scientist.years}
                    </div>

                    {/* Nationality badge */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold"
                      style={{ background: 'rgba(5,10,20,0.75)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
                      <Globe className="w-2.5 h-2.5" />{scientist.nationality.split('/')[0].trim()}
                    </div>
                  </div>

                  {/* ── CARD CONTENT ── */}
                  <div className="flex flex-col flex-1 p-4 space-y-3">
                    {/* Name & Field */}
                    <div>
                      <h3 className="text-sm font-black text-[var(--text-primary)] leading-tight"
                        style={{ transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = fc.accent}
                        onMouseLeave={e => e.currentTarget.style.color = ''}>
                        {scientist.name}
                      </h3>
                      <span className="text-[10px] font-bold font-mono mt-0.5 inline-block px-1.5 py-0.5 rounded-md"
                        style={{ background: fc.bg, color: fc.accent, border: `1px solid ${fc.border}` }}>
                        {scientist.field}
                      </span>
                    </div>

                    {/* Summary excerpt */}
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-sans line-clamp-2 flex-1">
                      {scientist.summary}
                    </p>

                    {/* Tally badges row */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <DiscoveryBadge count={discCount} label="Discoveries" color={fc.accent} />
                      {eqCount > 0 && <DiscoveryBadge count={eqCount} label="Equations" color="#8b5cf6" />}
                      {scientist.molecule && (
                        <DiscoveryBadge count={scientist.molecule.formula} label="" color="#10b981" />
                      )}
                    </div>

                    {/* Footer CTA */}
                    <div className="pt-2 border-t flex items-center justify-between"
                      style={{ borderColor: 'var(--border-subtle)' }}>
                      <span className="text-[10px] font-bold" style={{ color: fc.accent }}>
                        View Full Dossier
                      </span>
                      <div className="flex items-center gap-1 text-[10px] font-bold"
                        style={{
                          color: fc.accent,
                          transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                          transition: 'transform 0.2s'
                        }}>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          5. GLOBAL CHRONOLOGY TIMELINE VIEW
      ══════════════════════════════════════════ */}
      {viewMode === 'timeline' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] space-y-6 shadow-xl">
          <div className="border-b border-inherit pb-4">
            <h2 className="text-base font-black text-[var(--text-primary)]">
              Historical Timeline of Scientific Chemistry
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
              Chronological milestones from atomic theory foundations to modern quantum chemistry and genome editing.
            </p>
          </div>

          <div className="relative pl-6 border-l-2 border-cyan-500/30 space-y-5">
            {globalTimelineItems.map((item, idx) => {
              const fc = fieldColor(item.field);
              const scientist = FAMOUS_CHEMISTS.find(s => s.id === item.scientistId);
              return (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[var(--bg-main)] shadow-lg"
                    style={{ background: fc.accent, boxShadow: `0 0 12px ${fc.accent}88` }} />

                  <div onClick={() => { if (scientist) { setSelectedChemist(scientist); setProfileTab('timeline'); } }}
                    className="p-4 rounded-2xl cursor-pointer transition-all flex items-start gap-4 shadow-md hover:shadow-lg"
                    style={{
                      background: 'var(--bg-inner)',
                      border: `1px solid var(--border-subtle)`,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = fc.accent + '60'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'none'; }}>

                    {/* Mini portrait */}
                    {scientist && (
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border"
                        style={{ borderColor: fc.accent + '40' }}>
                        <ScientistPortrait scientist={scientist} className="w-full h-full" size="mini" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black font-mono"
                          style={{ background: fc.bg, color: fc.accent, border: `1px solid ${fc.border}` }}>
                          {item.yearStr}
                        </span>
                        <strong className="text-xs text-[var(--text-primary)] font-mono">{item.scientistName}</strong>
                        <span className="text-[9px] text-[var(--text-secondary)] font-mono hidden sm:inline">({item.field})</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] font-sans">{item.event}</p>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-bold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: fc.accent }}>
                      <span>Inspect</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          6. SIDE-BY-SIDE COMPARISON TOOL
      ══════════════════════════════════════════ */}
      {viewMode === 'compare' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] space-y-6 shadow-xl">
          <div className="border-b border-inherit pb-4">
            <h2 className="text-base font-black text-[var(--text-primary)] flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-cyan-400" />
              Side-by-Side Scientist Comparison
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
              Compare theories, discoveries, formulations, and historical impact between two pioneers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: compareIdA, setId: setCompareIdA, label: 'Scientist A', color: '#06b6d4', scientist: chemistA },
              { id: compareIdB, setId: setCompareIdB, label: 'Scientist B', color: '#8b5cf6', scientist: chemistB }
            ].map(({ id, setId, label, color, scientist: ch }) => (
              <div key={label} className="rounded-3xl overflow-hidden border"
                style={{ borderColor: `${color}40`, background: 'var(--bg-card-glass)' }}>
                {/* Portrait hero */}
                <div className="relative" style={{ height: '180px' }}>
                  <ScientistPortrait scientist={ch} className="absolute inset-0" size="compare" />
                  <div className="absolute top-0 inset-x-0 h-1"
                    style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
                  <div className="absolute bottom-3 left-4">
                    <div className="text-base font-black" style={{ color }}>{ch.name}</div>
                    <div className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {ch.years} • {ch.nationality}
                    </div>
                  </div>
                </div>

                {/* Selector */}
                <div className="p-4 border-b" style={{ borderColor: `${color}20` }}>
                  <span className="text-[10px] uppercase font-black mb-1 block" style={{ color }}>{label}:</span>
                  <select value={id} onChange={e => setId(e.target.value)}
                    className="input-control w-full py-2 px-3 text-xs font-bold rounded-xl">
                    {FAMOUS_CHEMISTS.map(s => <option key={s.id} value={s.id}>{s.name} ({s.field})</option>)}
                  </select>
                </div>

                {/* Data */}
                <div className="p-4 space-y-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <span className="text-[10px] font-bold uppercase" style={{ color }}>Major Discoveries:</span>
                    <ul className="list-disc pl-4 space-y-1 text-[var(--text-secondary)] font-sans">
                      {ch.discoveries?.map((d,i) => <li key={i}><strong>{d.title}:</strong> {d.description}</li>)}
                    </ul>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold uppercase" style={{ color }}>Key Equation / Model:</span>
                    <div className="font-bold text-[var(--text-primary)]">{ch.equations?.[0]?.name || 'N/A'}</div>
                    <div className="p-2 rounded bg-black/40 font-mono text-[11px]" style={{ color }}>{ch.equations?.[0]?.formula || 'N/A'}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold uppercase" style={{ color }}>Associated Molecule:</span>
                    <div className="font-bold text-[var(--text-primary)]">{ch.molecule?.name || 'N/A'}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold uppercase" style={{ color }}>Nobel &amp; Honors:</span>
                    <div className="text-[var(--text-primary)] font-sans text-xs">{ch.nobel}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          7. FULL PROFILE DOSSIER MODAL
      ══════════════════════════════════════════ */}
      {selectedChemist && (() => {
        const fc = fieldColor(selectedChemist.field);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-mono select-none"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
            onClick={e => { if (e.target === e.currentTarget) setSelectedChemist(null); }}>

            <div className="relative max-w-4xl w-full rounded-[36px] overflow-hidden shadow-2xl"
              style={{
                background: 'var(--bg-card-glass)',
                border: `1px solid ${fc.accent}40`,
                maxHeight: '92vh',
                display: 'flex',
                flexDirection: 'column'
              }}>

              {/* ── IMMERSIVE HERO PORTRAIT HEADER ── */}
              <div className="relative shrink-0" style={{ height: '280px' }}>
                <ScientistPortrait scientist={selectedChemist} className="absolute inset-0 w-full h-full" size="modal" />

                {/* Top accent strip */}
                <div className="absolute top-0 inset-x-0 h-1.5 rounded-t-[36px]"
                  style={{ background: `linear-gradient(90deg, transparent 0%, ${fc.accent} 40%, ${fc.accent} 60%, transparent 100%)` }} />

                {/* Gradient overlay for text legibility */}
                <div className="absolute inset-0 rounded-t-[36px]"
                  style={{ background: 'linear-gradient(to top, rgba(5,10,20,1) 0%, rgba(5,10,20,0.7) 40%, rgba(5,10,20,0.15) 100%)' }} />

                {/* Close button */}
                <button onClick={() => setSelectedChemist(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center transition"
                  style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.8)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}>
                  <X className="w-4 h-4" />
                </button>

                {/* Nobel badge */}
                {selectedChemist.isNobelLaureate && (
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b', backdropFilter: 'blur(8px)' }}>
                    <Star className="w-3.5 h-3.5 fill-current" />
                    Nobel Laureate
                  </div>
                )}

                {/* Scientist name & meta overlay at bottom of portrait */}
                <div className="absolute bottom-0 inset-x-0 p-6">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg mb-2 inline-block"
                        style={{ background: fc.bg, color: fc.accent, border: `1px solid ${fc.border}` }}>
                        {selectedChemist.field}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-lg">
                        {selectedChemist.name}
                      </h2>
                      <div className="text-sm text-white/70 font-mono mt-1 flex items-center gap-3">
                        <span>{selectedChemist.years}</span>
                        <span style={{ color: fc.accent }}>•</span>
                        <span>{selectedChemist.nationality}</span>
                        <span style={{ color: fc.accent }}>•</span>
                        <span className="opacity-80">{selectedChemist.era}</span>
                      </div>
                    </div>

                    {/* Discovery tally stats */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-center px-3 py-2 rounded-xl"
                        style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${fc.accent}30` }}>
                        <div className="text-xl font-black" style={{ color: fc.accent }}>
                          {selectedChemist.discoveries?.length || 0}
                        </div>
                        <div className="text-[9px] text-white/60 uppercase font-bold">Discoveries</div>
                      </div>
                      <div className="text-center px-3 py-2 rounded-xl"
                        style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(139,92,246,0.3)' }}>
                        <div className="text-xl font-black text-violet-400">
                          {selectedChemist.equations?.length || 0}
                        </div>
                        <div className="text-[9px] text-white/60 uppercase font-bold">Equations</div>
                      </div>
                      <div className="text-center px-3 py-2 rounded-xl"
                        style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(16,185,129,0.3)' }}>
                        <div className="text-xl font-black text-emerald-400">
                          {selectedChemist.awards?.length || 0}
                        </div>
                        <div className="text-[9px] text-white/60 uppercase font-bold">Awards</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Biography strip */}
              <div className="px-6 py-4 shrink-0 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                  {selectedChemist.biography}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  <span className="text-[9px] text-[var(--text-muted)] font-mono">Institutions:</span>
                  {selectedChemist.institutions?.map((inst, i) => (
                    <span key={i} className="telemetry-pill text-[9px]">{inst}</span>
                  ))}
                </div>
              </div>

              {/* Tab navigation */}
              <div className="flex items-center gap-1.5 px-6 py-2 border-b overflow-x-auto custom-scrollbar shrink-0"
                style={{ borderColor: 'var(--border-subtle)', background: 'rgba(0,0,0,0.2)' }}>
                {[
                  { id: 'story',      label: 'Scientific Story',   icon: BookOpen },
                  { id: 'discoveries',label: 'Discoveries',        icon: Sparkles },
                  { id: 'molecule',   label: 'Signature Molecule', icon: Atom },
                  { id: 'equations',  label: 'Equations',          icon: FileText },
                  { id: 'timeline',   label: 'Timeline',           icon: Clock },
                  { id: 'awards',     label: 'Awards',             icon: Award },
                  { id: 'sources',    label: 'References',         icon: Bookmark }
                ].map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setProfileTab(id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0"
                    style={profileTab === id
                      ? { background: fc.accent, color: '#03050a', fontWeight: 900 }
                      : { background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                    <Icon className="w-3.5 h-3.5" />{label}
                  </button>
                ))}
              </div>

              {/* Tab content – scrollable */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">

                {/* ── SCIENTIFIC STORY ── */}
                {profileTab === 'story' && selectedChemist.story && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {[
                      { key: 'who',         label: '1. Who They Were',          color: fc.accent },
                      { key: 'problem',     label: '2. The Fundamental Problem', color: '#f59e0b' },
                      { key: 'discovery',   label: '3. What They Discovered',    color: '#10b981' },
                      { key: 'how',         label: '4. How They Discovered It',  color: '#8b5cf6' },
                      { key: 'why',         label: '5. Why It Mattered',         color: '#3b82f6' },
                      { key: 'modernUse',   label: '6. Modern Application',      color: '#ec4899' }
                    ].map(({ key, label, color }) => (
                      <div key={key} className="p-4 rounded-2xl space-y-1.5"
                        style={{ background: 'var(--bg-inner)', border: `1px solid ${color}30` }}>
                        <span className="text-[10px] font-bold uppercase" style={{ color }}>{label}</span>
                        <p className="text-[var(--text-secondary)] font-sans leading-relaxed">
                          {selectedChemist.story[key]}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── DISCOVERIES ── */}
                {profileTab === 'discoveries' && (
                  <div className="space-y-3">
                    {selectedChemist.discoveries?.map((disc, idx) => (
                      <div key={idx} className="p-4 rounded-2xl border shadow-md"
                        style={{ background: 'var(--bg-inner)', borderColor: 'var(--border-subtle)' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono"
                            style={{ background: fc.bg, color: fc.accent, border: `1px solid ${fc.border}` }}>
                            {disc.type}
                          </span>
                          <strong className="text-sm font-bold text-[var(--text-primary)] font-mono">{disc.title}</strong>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">{disc.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── SIGNATURE MOLECULE ── */}
                {profileTab === 'molecule' && selectedChemist.molecule && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl flex items-center justify-between"
                      style={{ background: 'var(--bg-inner)', border: `1px solid ${fc.accent}30` }}>
                      <div>
                        <h3 className="text-sm font-black font-mono" style={{ color: fc.accent }}>
                          {selectedChemist.molecule.name}
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
                          {selectedChemist.molecule.description}
                        </p>
                      </div>
                      <span className="telemetry-pill font-mono font-bold text-xs shrink-0">
                        {selectedChemist.molecule.formula}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="h-[320px] rounded-2xl overflow-hidden border"
                        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-inner)' }}>
                        {selectedMolecule2D && (
                          <Molecule2DViewer atoms={selectedMolecule2D.atoms} bonds={selectedMolecule2D.bonds}
                            smiles={selectedChemist.molecule.smiles} formula={selectedChemist.molecule.formula} />
                        )}
                      </div>
                      <div className="h-[320px] rounded-2xl overflow-hidden border"
                        style={{ borderColor: 'var(--border-subtle)', background: '#03050a' }}>
                        {selectedMolecule3D && (
                          <ThreeMoleculeViewer molecule={selectedMolecule3D} styleMode="ball-stick" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── EQUATIONS & THEORIES ── */}
                {profileTab === 'equations' && (
                  <div className="space-y-3 text-xs">
                    {selectedChemist.equations?.length > 0 ? (
                      selectedChemist.equations.map((eq, idx) => (
                        <div key={idx} className="p-5 rounded-2xl border space-y-3 shadow-md"
                          style={{ background: 'var(--bg-inner)', borderColor: 'var(--border-subtle)' }}>
                          <div className="text-xs font-bold font-mono" style={{ color: fc.accent }}>{eq.name}</div>
                          <div className="p-4 rounded-xl text-center font-bold font-mono text-sm shadow-inner"
                            style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${fc.accent}30`, color: fc.accent }}>
                            {eq.formula}
                          </div>
                          <p className="text-[var(--text-secondary)] font-sans text-xs leading-relaxed">{eq.description}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 italic p-4 text-center font-sans">
                        No explicit mathematical formulation cataloged for this profile.
                      </div>
                    )}
                  </div>
                )}

                {/* ── TIMELINE ── */}
                {profileTab === 'timeline' && (
                  <div className="relative pl-6 space-y-4 text-xs font-mono"
                    style={{ borderLeft: `2px solid ${fc.accent}40` }}>
                    {selectedChemist.timeline?.map((t, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2"
                          style={{ background: fc.accent, borderColor: 'var(--bg-main)', boxShadow: `0 0 8px ${fc.accent}88` }} />
                        <div className="p-3.5 rounded-xl space-y-1 border"
                          style={{ background: 'var(--bg-inner)', borderColor: 'var(--border-subtle)' }}>
                          <span className="font-bold" style={{ color: fc.accent }}>{t.year}:</span>
                          <p className="text-[var(--text-secondary)] font-sans">{t.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── AWARDS & HONORS ── */}
                {profileTab === 'awards' && (
                  <div className="space-y-4 text-xs font-mono">
                    <div className="p-4 rounded-2xl space-y-2 border"
                      style={{ background: 'var(--bg-inner)', borderColor: 'rgba(245,158,11,0.3)' }}>
                      <div className="text-xs font-black text-amber-400 uppercase flex items-center gap-1.5">
                        <Award className="w-4 h-4" />Nobel Prize Citation &amp; Honors
                      </div>
                      <p className="text-[var(--text-primary)] font-sans leading-relaxed">{selectedChemist.nobel}</p>
                    </div>
                    <div className="p-4 rounded-2xl space-y-2 border"
                      style={{ background: 'var(--bg-inner)', borderColor: 'var(--border-subtle)' }}>
                      <div className="text-xs font-bold uppercase" style={{ color: fc.accent }}>
                        Medals &amp; Recognitions:
                      </div>
                      <ul className="list-disc pl-4 space-y-1 text-[var(--text-secondary)] font-sans">
                        {selectedChemist.awards?.map((a,i) => <li key={i}>{a}</li>)}
                      </ul>
                    </div>
                    <div className="p-4 rounded-2xl space-y-2 border"
                      style={{ background: 'var(--bg-inner)', borderColor: 'var(--border-subtle)' }}>
                      <div className="text-xs font-bold uppercase" style={{ color: fc.accent }}>
                        Landmark Publications:
                      </div>
                      <ul className="list-disc pl-4 space-y-1 text-[var(--text-secondary)] font-sans">
                        {selectedChemist.publications?.map((p,i) => <li key={i}><em>{p}</em></li>)}
                      </ul>
                    </div>
                    {selectedChemist.collaborators && (
                      <div className="p-4 rounded-2xl space-y-2 border"
                        style={{ background: 'var(--bg-inner)', borderColor: 'var(--border-subtle)' }}>
                        <div className="text-xs font-bold uppercase flex items-center gap-1.5" style={{ color: fc.accent }}>
                          <Users className="w-3.5 h-3.5" />Key Collaborators:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedChemist.collaborators.map((c,i) => (
                            <span key={i} className="px-2 py-1 rounded-lg text-[10px] font-bold font-mono"
                              style={{ background: fc.bg, color: fc.accent, border: `1px solid ${fc.border}` }}>
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── REFERENCES ── */}
                {profileTab === 'sources' && (
                  <div className="space-y-3 text-xs font-mono">
                    <div className="p-4 rounded-2xl space-y-2 border"
                      style={{ background: 'var(--bg-inner)', borderColor: `${fc.accent}30` }}>
                      <div className="text-xs font-black uppercase" style={{ color: fc.accent }}>
                        Authoritative References &amp; Sources:
                      </div>
                      <ul className="space-y-2 font-sans text-[var(--text-secondary)]">
                        {selectedChemist.references?.map((ref, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{ref}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Modal footer action bar ── */}
              <div className="px-6 py-4 border-t flex flex-wrap items-center justify-between gap-3 shrink-0"
                style={{ borderColor: 'var(--border-subtle)', background: 'rgba(0,0,0,0.2)' }}>
                <button
                  onClick={() => { window.dispatchEvent(new CustomEvent('chemspace-open-copilot')); }}
                  className="px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2"
                  style={{ background: `${fc.accent}20`, border: `1px solid ${fc.accent}40`, color: fc.accent }}
                  onMouseEnter={e => e.currentTarget.style.background = `${fc.accent}35`}
                  onMouseLeave={e => e.currentTarget.style.background = `${fc.accent}20`}>
                  <Bot className="w-4 h-4 animate-pulse" />
                  Ask ChemAI about {selectedChemist.name}
                </button>
                <button onClick={() => setSelectedChemist(null)}
                  className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold text-[var(--text-secondary)] transition">
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Inject keyframes for portrait loading spinner */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
