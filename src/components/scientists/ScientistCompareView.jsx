import React, { useState } from 'react';
import { GitCompare, Award, Atom, FlaskConical, BookOpen, Layers, ArrowRight } from 'lucide-react';
import { FAMOUS_CHEMISTS } from '../../data/chemistsData';
import ScientistPortrait, { getFieldColor } from './ScientistPortrait';

export default function ScientistCompareView({ onSelectScientist }) {
  const [idA, setIdA] = useState('mendeleev');
  const [idB, setIdB] = useState('pauling');

  const chemistA = FAMOUS_CHEMISTS.find(s => s.id === idA) || FAMOUS_CHEMISTS[0];
  const chemistB = FAMOUS_CHEMISTS.find(s => s.id === idB) || FAMOUS_CHEMISTS[1];

  const fcA = getFieldColor(chemistA.field);
  const fcB = getFieldColor(chemistB.field);

  return (
    <div className="space-y-6 select-none">
      <div className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-2 shadow-sm">
        <div className="flex items-center gap-2 text-[var(--text-primary)]">
          <GitCompare className="w-5 h-5 text-[var(--text-muted)]" />
          <h2 className="text-base font-black text-[var(--text-primary)] font-mono">
            Side-by-Side Pioneer Comparative Matrix
          </h2>
        </div>
        <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
          Compare scientific paradigms, major discoveries, mathematical models, signature chemical compounds, and historical impact between any two scientists.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            scientist: chemistA,
            selectedId: idA,
            setId: setIdA,
            fc: fcA,
            label: 'Scientist A'
          },
          {
            scientist: chemistB,
            selectedId: idB,
            setId: setIdB,
            fc: fcB,
            label: 'Scientist B'
          }
        ].map(({ scientist, selectedId, setId, fc, label }) => (
          <div
            key={label}
            className="glass-panel rounded-3xl overflow-hidden border space-y-4 shadow-sm flex flex-col justify-between"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)' }}
          >
            {/* Header Hero Portrait */}
            <div className="relative h-52 w-full">
              <ScientistPortrait
                scientist={scientist}
                className="w-full h-full"
                size="compare"
              />
              <div
                className="absolute top-0 inset-x-0 h-0.5 pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
              />
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                <div>
                  <h3 className="text-lg font-black text-white leading-tight drop-shadow-md">
                    {scientist.name}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-300 mt-0.5">
                    {scientist.years} • {scientist.nationality}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectScientist(scientist)}
                  className="px-3 py-1 rounded-xl text-[10px] font-mono font-bold transition flex items-center gap-1 shadow-sm bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)]"
                >
                  <span>Dossier</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Selector Dropdown */}
            <div className="px-5">
              <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] block mb-1">
                Choose {label}:
              </span>
              <select
                value={selectedId}
                onChange={e => setId(e.target.value)}
                className="input-control w-full py-2.5 px-3 rounded-2xl text-xs font-mono font-bold"
              >
                {FAMOUS_CHEMISTS.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.field})
                  </option>
                ))}
              </select>
            </div>

            {/* Structured Comparative Data */}
            <div className="px-5 pb-5 space-y-3.5 flex-1">
              {/* Field & Era */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-muted)]">
                  Discipline &amp; Historical Era:
                </span>
                <div className="text-xs font-mono text-[var(--text-primary)] font-bold">{scientist.field}</div>
                <div className="text-[11px] font-sans text-[var(--text-secondary)]">{scientist.era}</div>
              </div>

              {/* Major Discoveries */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase flex items-center gap-1 text-[var(--text-muted)]">
                  <FlaskConical className="w-3 h-3 text-[var(--text-muted)]" /> Breakthrough Discoveries:
                </span>
                <ul className="space-y-1.5">
                  {scientist.discoveries?.slice(0, 3).map((d, i) => (
                    <li key={i} className="text-xs font-sans text-[var(--text-secondary)]">
                      <strong className="text-[var(--text-primary)] font-mono">{d.title}:</strong> {d.description}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mathematical Equation / Model */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-muted)]">
                  Key Mathematical Formulation:
                </span>
                <div className="text-xs font-bold text-[var(--text-primary)] font-mono">
                  {scientist.equations?.[0]?.name || 'N/A'}
                </div>
                <div
                  className="p-2.5 rounded-xl font-mono text-xs font-bold text-center overflow-x-auto shadow-inner"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                >
                  {scientist.equations?.[0]?.formula || 'No formula recorded'}
                </div>
              </div>

              {/* Signature Molecule */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase flex items-center gap-1 text-[var(--text-muted)]">
                  <Atom className="w-3 h-3 text-[var(--text-muted)]" /> Signature Chemical Entity:
                </span>
                <div className="text-xs font-mono font-bold text-[var(--text-primary)]">
                  {scientist.molecule?.name} ({scientist.molecule?.formula})
                </div>
                <div className="text-[11px] font-sans text-[var(--text-secondary)]">
                  {scientist.molecule?.description}
                </div>
              </div>

              {/* Nobel & Honors */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-amber-500 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" /> Honors &amp; Awards:
                </span>
                <p className="text-xs font-sans text-[var(--text-secondary)]">
                  {scientist.nobel}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
