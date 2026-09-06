import React, { useState } from 'react';
import { GitCompare, Award, Atom, Sparkles, BookOpen, Layers, ArrowRight } from 'lucide-react';
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
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-2">
        <div className="flex items-center gap-2 text-cyan-400">
          <GitCompare className="w-5 h-5" />
          <h2 className="text-base font-black text-white font-mono">
            Side-by-Side Pioneer Comparative Matrix
          </h2>
        </div>
        <p className="text-xs text-slate-300 font-sans leading-relaxed">
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
            className="glass-panel rounded-3xl overflow-hidden border space-y-4 shadow-2xl flex flex-col justify-between"
            style={{ borderColor: `${fc.accent}40`, background: 'rgba(10, 14, 22, 0.95)' }}
          >
            {/* Header Hero Portrait */}
            <div className="relative h-52 w-full">
              <ScientistPortrait
                scientist={scientist}
                className="w-full h-full"
                size="compare"
              />
              <div
                className="absolute top-0 inset-x-0 h-1"
                style={{ background: `linear-gradient(90deg, transparent, ${fc.accent}, transparent)` }}
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
                  className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition flex items-center gap-1 shadow"
                  style={{ background: fc.accent, color: '#03050a' }}
                >
                  <span>Dossier</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Selector Dropdown */}
            <div className="px-5">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">
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
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase" style={{ color: fc.accent }}>
                  Discipline &amp; Historical Era:
                </span>
                <div className="text-xs font-mono text-white font-bold">{scientist.field}</div>
                <div className="text-[11px] font-sans text-slate-400">{scientist.era}</div>
              </div>

              {/* Major Discoveries */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase flex items-center gap-1" style={{ color: fc.accent }}>
                  <Sparkles className="w-3 h-3" /> Breakthrough Discoveries:
                </span>
                <ul className="space-y-1.5">
                  {scientist.discoveries?.slice(0, 3).map((d, i) => (
                    <li key={i} className="text-xs font-sans text-slate-300">
                      <strong className="text-white font-mono">{d.title}:</strong> {d.description}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mathematical Equation / Model */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase" style={{ color: fc.accent }}>
                  Key Mathematical Formulation:
                </span>
                <div className="text-xs font-bold text-white font-mono">
                  {scientist.equations?.[0]?.name || 'N/A'}
                </div>
                <div
                  className="p-2.5 rounded-xl font-mono text-xs font-bold text-center overflow-x-auto shadow-inner"
                  style={{ background: 'rgba(0,0,0,0.6)', color: fc.accent, border: `1px solid ${fc.accent}30` }}
                >
                  {scientist.equations?.[0]?.formula || 'No formula recorded'}
                </div>
              </div>

              {/* Signature Molecule */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase flex items-center gap-1" style={{ color: fc.accent }}>
                  <Atom className="w-3 h-3" /> Signature Chemical Entity:
                </span>
                <div className="text-xs font-mono font-bold text-white">
                  {scientist.molecule?.name} ({scientist.molecule?.formula})
                </div>
                <div className="text-[11px] font-sans text-slate-400">
                  {scientist.molecule?.description}
                </div>
              </div>

              {/* Nobel & Honors */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-amber-400 flex items-center gap-1">
                  <Award className="w-3 h-3" /> Honors &amp; Awards:
                </span>
                <p className="text-xs font-sans text-slate-300">
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
