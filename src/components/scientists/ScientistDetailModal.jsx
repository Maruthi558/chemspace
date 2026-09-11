import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Atom,
  Clock,
  FileText,
  Bookmark,
  Users,
  X,
  FlaskConical,
  Zap,
  CheckCircle2,
  Bot,
  GraduationCap,
  Building2,
  Globe,
  ExternalLink,
  Eye,
  Cpu,
  ArrowRight,
  Info
} from 'lucide-react';
import ScientistPortrait, { getFieldColor } from './ScientistPortrait';
import ScientificStorytelling from './ScientificStorytelling';
import ThreeMoleculeViewer from '../ThreeMoleculeViewer';
import Molecule2DViewer from '../RDKit/Molecule2DViewer';
import { parseSmilesTo2D } from '../../services/chemicalGraph';
import { MOLECULES } from '../../data/moleculeData';
import { FAMOUS_CHEMISTS } from '../../data/chemistsData';

export default function ScientistDetailModal({
  scientist,
  onClose,
  onSelectScientist
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('story');
  const [portraitMode, setPortraitMode] = useState('real'); // 'real' | 'animated'

  const fc = getFieldColor(scientist.field);

  // Lock body scroll while modal is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Compute 2D and 3D molecule models
  const molecule2D = useMemo(() => {
    if (!scientist?.molecule?.smiles) return null;
    return parseSmilesTo2D(scientist.molecule.smiles);
  }, [scientist]);

  const molecule3D = useMemo(() => {
    if (!scientist?.molecule) return null;
    const existing = MOLECULES.find(
      m => m.id === scientist.id || m.formula === scientist.molecule.formula
    );
    if (existing) return existing;

    if (molecule2D?.atoms?.length > 0) {
      return {
        id: scientist.id,
        name: scientist.molecule.name,
        formula: scientist.molecule.formula,
        atoms: molecule2D.atoms.map((a, i) => ({
          id: a.id,
          element: a.element || 'C',
          x: Number(((a.x - 350) / 45).toFixed(3)),
          y: Number((-(a.y - 250) / 45).toFixed(3)),
          z: Number((i % 2 === 0 ? 0.3 : -0.3).toFixed(3))
        })),
        bonds: molecule2D.bonds
      };
    }
    return MOLECULES[0];
  }, [scientist, molecule2D]);

  const tabs = [
    { id: 'story', label: 'Scientific Contributions', icon: BookOpen },
    { id: 'discoveries', label: 'Discoveries & Experiments', icon: FlaskConical },
    { id: 'visual', label: 'Interactive Simulation', icon: Zap },
    { id: 'molecule', label: 'Signature Molecule', icon: Atom },
    { id: 'equations', label: 'Formulations & Models', icon: FileText },
    { id: 'timeline', label: 'Life Timeline', icon: Clock },
    { id: 'lineage', label: 'Academic Lineage', icon: Users },
    { id: 'awards', label: 'Honors & Citations', icon: Award }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto select-none"
      style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(20px)' }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative max-w-5xl w-full rounded-[32px] overflow-hidden shadow-2xl flex flex-col my-auto border"
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border-medium)',
          maxHeight: '94vh'
        }}
      >
        {/* ─── HERO HEADER ──────────────────────────────────────────────── */}
        <div className="relative shrink-0 h-64 sm:h-72 w-full overflow-hidden">
          <ScientistPortrait
            scientist={scientist}
            className="absolute inset-0 w-full h-full"
            size="modal"
            mode={portraitMode}
            showBadge={false}
          />

          {/* Top Chromatic Accent Strip */}
          <div
            className="absolute top-0 inset-x-0 h-1 z-20 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.25) 60%, transparent 100%)'
            }}
          />

          {/* Dark gradient fade over portrait for text contrast */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to top, rgba(9,13,20,1) 0%, rgba(9,13,20,0.7) 45%, rgba(9,13,20,0.15) 100%)'
            }}
          />

          {/* Header Action Bar (Close & Mode Switch) */}
          <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPortraitMode(portraitMode === 'real' ? 'animated' : 'real')}
              className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              title="Toggle between Historical Photo and AI Hologram"
            >
              {portraitMode === 'real' ? <Cpu className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
              <span>{portraitMode === 'real' ? 'View AI Hologram' : 'View Archival Photo'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nobel Laurel Badge */}
          {scientist.isNobelLaureate && (
            <div
              className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold shadow-lg"
              style={{
                background: 'rgba(0,0,0,0.75)',
                border: '1px solid rgba(245,158,11,0.45)',
                color: '#f59e0b',
                backdropFilter: 'blur(8px)'
              }}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Nobel Laureate</span>
            </div>
          )}

          {/* Title & Metadata Overlay */}
          <div className="absolute bottom-4 inset-x-6 z-20 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--bg-inner)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                >
                  {scientist.field}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {scientist.era}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-md">
                {scientist.fullName || scientist.name}
              </h2>
              <div className="text-xs text-slate-300 font-mono mt-1 flex flex-wrap items-center gap-2">
                <span>{scientist.years}</span>
                <span className="text-slate-500">•</span>
                <span>{scientist.nationality}</span>
                {scientist.birthPlace && (
                  <>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 truncate max-w-xs">{scientist.birthPlace}</span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Metrics Chips */}
            <div className="flex items-center gap-2 shrink-0">
              <div
                className="text-center px-3 py-1.5 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)]"
              >
                <div className="text-lg font-mono font-black text-[var(--text-primary)]">
                  {scientist.discoveries?.length || 0}
                </div>
                <div className="text-[9px] text-[var(--text-muted)] uppercase font-mono font-bold">Discoveries</div>
              </div>
              <div className="text-center px-3 py-1.5 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
                <div className="text-lg font-mono font-black text-[var(--text-primary)]">
                  {scientist.equations?.length || 0}
                </div>
                <div className="text-[9px] text-[var(--text-muted)] uppercase font-mono font-bold">Equations</div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── BIOGRAPHY EXCERPT & INSTITUTIONS ─────────────────────────── */}
        <div className="px-6 py-3 border-b border-[var(--border-subtle)] shrink-0 bg-[var(--bg-inner)] flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-secondary)] font-sans">
            <span className="text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-1">
              <Building2 className="w-3 h-3 text-[var(--text-muted)]" /> Institutions:
            </span>
            {scientist.institutions?.map((inst, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
              >
                {inst}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent('chemspace-open-copilot', {
                  detail: { initialQuery: `Explain the scientific contributions of ${scientist.name}` }
                })
              );
            }}
            className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition flex items-center gap-1.5 text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]"
          >
            <Bot className="w-3 h-3 text-emerald-400" />
            <span>Consult ChemAI</span>
          </button>
        </div>

        {/* ─── TAB NAVIGATION BAR ───────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 px-6 py-2 border-b border-[var(--border-subtle)] overflow-x-auto custom-scrollbar shrink-0 bg-[var(--bg-inner)]">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                activeTab === id
                  ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-sm font-black'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* ─── TAB CONTENT (SCROLLABLE) ─────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
          {/* TAB 1: SCIENTIFIC CONTRIBUTIONS (STORY) */}
          {activeTab === 'story' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] space-y-2">
                <h3 className="text-xs font-mono font-bold uppercase text-[var(--text-primary)] flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[var(--text-muted)]" /> Executive Summary &amp; Historical Impact
                </h3>
                <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                  {scientist.biography}
                </p>
              </div>

              {scientist.story && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'who', label: '1. Who They Were' },
                    { key: 'problem', label: '2. The Fundamental Scientific Problem' },
                    { key: 'discovery', label: '3. What Did They Discover?' },
                    { key: 'how', label: '4. How Did They Discover It?' },
                    { key: 'why', label: '5. Why Was It Important?' },
                    { key: 'scienceChanged', label: '6. How Did It Change Science?' },
                    { key: 'modernUse', label: '7. Modern Scientific Technologies Still Using This', span: true }
                  ].map(({ key, label, span }) => (
                    <div
                      key={key}
                      className={`p-4 rounded-2xl space-y-1.5 border border-[var(--border-subtle)] bg-[var(--bg-inner)] shadow-sm ${span ? 'md:col-span-2' : ''}`}
                    >
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider block text-[var(--text-muted)]">
                        {label}
                      </span>
                      <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                        {scientist.story[key]}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DISCOVERIES & EXPERIMENTS */}
          {activeTab === 'discoveries' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {scientist.discoveries?.map((disc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-inner)] space-y-2 shadow-sm hover:border-[var(--border-strong)] transition"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                      >
                        {disc.type}
                      </span>
                      <strong className="text-sm font-mono text-[var(--text-primary)]">{disc.title}</strong>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                      {disc.description}
                    </p>
                  </div>
                ))}
              </div>

              {scientist.techniques && scientist.techniques.length > 0 && (
                <div className="p-4 rounded-2xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] space-y-3">
                  <h4 className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase">
                    Pioneered Laboratory &amp; Experimental Techniques:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {scientist.techniques.map((tech, i) => (
                      <div key={i} className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
                        <div className="text-xs font-mono font-bold text-[var(--text-primary)]">{tech.name}</div>
                        <p className="text-[11px] text-[var(--text-secondary)] font-sans leading-relaxed">{tech.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: VISUAL SIMULATION */}
          {activeTab === 'visual' && (
            <div className="space-y-4">
              <ScientificStorytelling scientist={scientist} />
            </div>
          )}

          {/* TAB 4: SIGNATURE MOLECULE & REACTIONS */}
          {activeTab === 'molecule' && (
            <div className="space-y-6">
              {scientist.molecule && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold block">
                        Signature Chemical Entity:
                      </span>
                      <h3 className="text-base font-mono font-black text-[var(--text-primary)]">
                        {scientist.molecule.name} ({scientist.molecule.formula})
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
                        {scientist.molecule.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate('/chemdraw');
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] transition flex items-center gap-1.5 shadow-sm"
                        title="Edit in ChemDraw CAD Studio"
                      >
                        <FlaskConical className="w-3.5 h-3.5" />
                        <span>ChemDraw CAD</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate('/quantum-library');
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] border border-[var(--btn-secondary-border)] transition flex items-center gap-1.5"
                        title="Compute Orbitals in Quantum Lab"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Quantum Lab</span>
                      </button>
                    </div>
                  </div>

                  {/* 2D and 3D Viewers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-[290px] rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-inner)] flex flex-col">
                      <div className="px-3 py-2 border-b border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-muted)] flex justify-between">
                        <span>2D Graph Topology</span>
                        <span className="text-[var(--text-primary)] font-bold">{scientist.molecule.formula}</span>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        {molecule2D && (
                          <Molecule2DViewer
                            atoms={molecule2D.atoms}
                            bonds={molecule2D.bonds}
                            smiles={scientist.molecule.smiles}
                            formula={scientist.molecule.formula}
                          />
                        )}
                      </div>
                    </div>

                    <div className="h-[290px] rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-inner)] flex flex-col">
                      <div className="px-3 py-2 border-b border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-muted)] flex justify-between">
                        <span>3D WebGL Ball-and-Stick Conformer</span>
                        <span className="text-emerald-400 font-bold">Interactive Orbit Controls</span>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        {molecule3D && (
                          <ThreeMoleculeViewer molecule={molecule3D} styleMode="ball-stick" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {scientist.reactions && scientist.reactions.length > 0 && (
                <div className="p-4 rounded-2xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] space-y-3">
                  <h4 className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase">
                    Signature Chemical Reaction Scheme:
                  </h4>
                  {scientist.reactions.map((rxn, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[var(--text-primary)]">{rxn.name}</span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[var(--bg-inner)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                          {rxn.type}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[var(--bg-inner)] font-mono text-xs text-[var(--text-primary)] text-center border border-[var(--border-subtle)] overflow-x-auto">
                        {rxn.scheme}
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] font-sans">{rxn.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: EQUATIONS & FORMULATIONS */}
          {activeTab === 'equations' && (
            <div className="space-y-4">
              {scientist.equations?.length > 0 ? (
                scientist.equations.map((eq, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-inner)] space-y-3 shadow-sm"
                  >
                    <div className="text-xs font-mono font-bold text-[var(--text-primary)]">
                      {eq.name}
                    </div>
                    <div
                      className="p-4 rounded-xl text-center font-mono font-bold text-sm sm:text-base shadow-inner overflow-x-auto"
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {eq.formula}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                      {eq.description}
                    </p>

                    {eq.variables && eq.variables.length > 0 && (
                      <div className="pt-3 border-t border-[var(--border-subtle)] space-y-1">
                        <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold block">
                          Variable Legend:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {eq.variables.map((v, i) => (
                            <div key={i} className="text-xs font-mono text-[var(--text-secondary)] flex items-center gap-2">
                              <code className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-primary)] font-bold border border-[var(--border-subtle)]">
                                {v.symbol}
                              </code>
                              <span className="text-[11px] text-[var(--text-muted)] font-sans">{v.meaning}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-[var(--text-muted)] italic font-mono">
                  No explicit mathematical equation cataloged for this profile.
                </div>
              )}
            </div>
          )}

          {/* TAB 6: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="relative pl-6 space-y-4" style={{ borderLeft: '2px solid var(--border-medium)' }}>
              {scientist.timeline?.map((t, idx) => (
                <div key={idx} className="relative group">
                  <div
                    className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-black shadow"
                    style={{ background: 'var(--text-primary)' }}
                  />
                  <div className="p-3.5 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] space-y-1 hover:border-[var(--border-strong)] transition">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                        {t.year}
                      </span>
                      {t.category && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                          {t.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] font-sans">{t.event}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 7: ACADEMIC LINEAGE */}
          {activeTab === 'lineage' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mentors */}
                <div className="p-4 rounded-2xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] space-y-2">
                  <div className="text-xs font-mono font-bold text-[var(--text-primary)] flex items-center gap-1.5 uppercase">
                    <GraduationCap className="w-4 h-4 text-[var(--text-muted)]" /> Academic Mentors &amp; Advisors:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {scientist.mentors?.map((m, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-xl text-xs font-mono bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Students */}
                <div className="p-4 rounded-2xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] space-y-2">
                  <div className="text-xs font-mono font-bold text-[var(--text-primary)] flex items-center gap-1.5 uppercase">
                    <Users className="w-4 h-4 text-[var(--text-muted)]" /> Notable Students &amp; Protégés:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {scientist.students?.map((s, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-xl text-xs font-mono bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Collaborators */}
              {scientist.collaborators && scientist.collaborators.length > 0 && (
                <div className="p-4 rounded-2xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] space-y-2">
                  <div className="text-xs font-mono font-bold text-[var(--text-primary)] flex items-center gap-1.5 uppercase">
                    <Users className="w-4 h-4 text-[var(--text-muted)]" /> Key Scientific Collaborators:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {scientist.collaborators.map((c, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-xl text-xs font-mono bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: HONORS, AWARDS & PUBLICATIONS */}
          {activeTab === 'awards' && (
            <div className="space-y-4">
              {/* Nobel Section */}
              <div className="p-4 rounded-2xl bg-[var(--bg-inner)] border border-amber-500/30 space-y-1.5">
                <div className="text-xs font-mono font-black text-amber-400 uppercase flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" /> Nobel Prize Citation &amp; Highest Recognition:
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">{scientist.nobel}</p>
              </div>

              {/* Awards List */}
              <div className="p-4 rounded-2xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] space-y-2">
                <div className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase">
                  Major Medals &amp; Honors:
                </div>
                <ul className="list-disc pl-5 space-y-1 text-xs text-[var(--text-secondary)] font-sans">
                  {scientist.awards?.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>

              {/* Landmark Publications */}
              <div className="p-4 rounded-2xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] space-y-2">
                <div className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase">
                  Landmark Scientific Publications:
                </div>
                <ul className="list-disc pl-5 space-y-1 text-xs text-[var(--text-secondary)] font-sans">
                  {scientist.publications?.map((p, i) => (
                    <li key={i}>
                      <em>{p}</em>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Historical Facts & Anecdotes */}
              {scientist.facts && scientist.facts.length > 0 && (
                <div className="p-4 rounded-2xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] space-y-2">
                  <div className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase">
                    Curious Historical Facts &amp; Anecdotes:
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-[var(--text-secondary)] font-sans">
                    {scientist.facts.map((fact, i) => (
                      <li key={i}>{fact}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sources */}
              {scientist.references && scientist.references.length > 0 && (
                <div className="p-4 rounded-2xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] space-y-1.5">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase font-bold block">
                    Verified Archival References:
                  </span>
                  <div className="space-y-1">
                    {scientist.references.map((r, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] font-mono">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── MODAL FOOTER ─────────────────────────────────────────────── */}
        <div className="px-6 py-3 border-t border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-inner)] shrink-0">
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            ChemSpace Scientific Museum Archive • Profile ID: {scientist.id}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-mono font-bold bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] border border-[var(--border-subtle)] transition"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
