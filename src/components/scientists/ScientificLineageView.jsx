import React from 'react';
import {
  Users,
  GitBranch,
  Award,
  ArrowRight,
  GraduationCap,
  Layers
} from 'lucide-react';
import { FAMOUS_CHEMISTS } from '../../data/chemistsData';
import ScientistPortrait, { getFieldColor } from './ScientistPortrait';

export default function ScientificLineageView({ onSelectScientist }) {
  // Key generational lineage lineages:
  const lineages = [
    {
      title: 'The British Electrochemistry & Atomic Lineage',
      description: 'The direct succession of master-student relationships that revolutionized electrochemistry, subatomic particles, and nuclear physics.',
      nodes: ['faraday', 'thomson', 'rutherford', 'bohr']
    },
    {
      title: 'The Foundations of Modern Chemical Bonding & Quantum Chemistry',
      description: 'How classical valence models evolved into quantum mechanical wave equations and electron orbital hybridization.',
      nodes: ['lewis', 'schrodinger', 'pauling', 'kohn', 'pople']
    },
    {
      title: 'The Biomolecular Architecture & Genomic Revolution',
      description: 'From crystallographic structure determinations to directed evolution and CRISPR programmable genome editing.',
      nodes: ['hodgkin', 'franklin', 'karplus', 'doudna', 'arnold', 'bertozzi']
    },
    {
      title: 'Chemical Stoichiometry, Periodicity & Kinetics',
      description: 'Establishing conservation of mass, the periodic law of elements, and chemical reaction rate dynamics.',
      nodes: ['lavoisier', 'dalton', 'avogadro', 'mendeleev', 'arrhenius', 'vanthoff', 'haber']
    }
  ];

  return (
    <div className="space-y-8 select-none">
      <div className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-2 shadow-sm">
        <div className="flex items-center gap-2 text-[var(--text-primary)]">
          <GitBranch className="w-5 h-5 text-[var(--text-muted)]" />
          <h2 className="text-base font-black text-[var(--text-primary)] font-mono">
            Scientific Lineage &amp; Generational Transmission of Knowledge
          </h2>
        </div>
        <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
          Trace how chemical theories and breakthrough experimental methods passed from mentors to students and collaborators across centuries. Click any scientist to inspect their complete dossier.
        </p>
      </div>

      <div className="space-y-6">
        {lineages.map((tree, tIdx) => (
          <div
            key={tIdx}
            className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-4 shadow-sm"
          >
            <div>
              <h3 className="text-sm font-black text-[var(--text-primary)] font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {tree.title}
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] font-sans mt-0.5">
                {tree.description}
              </p>
            </div>

            {/* Horizontal Lineage Nodes River */}
            <div className="flex items-center gap-3 overflow-x-auto pb-3 custom-scrollbar">
              {tree.nodes.map((sciId, idx) => {
                const scientist = FAMOUS_CHEMISTS.find(s => s.id === sciId);
                if (!scientist) return null;
                const fc = getFieldColor(scientist.field);
                const isLast = idx === tree.nodes.length - 1;

                return (
                  <React.Fragment key={scientist.id}>
                    <div
                      onClick={() => onSelectScientist(scientist)}
                      className="group cursor-pointer rounded-2xl p-3 border transition-all duration-200 shrink-0 w-52 flex flex-col justify-between hover:-translate-y-1 shadow-sm hover:shadow-md"
                      style={{
                        background: 'var(--bg-inner)',
                        borderColor: 'var(--border-subtle)'
                      }}
                    >
                      <div className="relative h-28 rounded-xl overflow-hidden mb-2 border border-white/10">
                        <ScientistPortrait
                          scientist={scientist}
                          className="w-full h-full"
                          size="card"
                          showBadge={false}
                        />
                        {scientist.isNobelLaureate && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-md bg-black/70 border border-amber-400/50 flex items-center justify-center backdrop-blur-md">
                            <Award className="w-3 h-3 text-amber-400 fill-current" />
                          </div>
                        )}
                        <div
                          className="absolute bottom-1.5 left-1.5 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/80 text-white"
                        >
                          {scientist.years}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-[var(--text-primary)] group-hover:text-emerald-400 transition truncate">
                          {scientist.name}
                        </h4>
                        <span
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded inline-block truncate max-w-full bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                        >
                          {scientist.field}
                        </span>
                        <p className="text-[10px] text-[var(--text-muted)] line-clamp-2 font-sans pt-1">
                          {scientist.discoveries?.[0]?.title || scientist.summary}
                        </p>
                      </div>

                      <div
                        className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono font-bold text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors"
                      >
                        <span>Inspect Profile</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {!isLast && (
                      <div className="flex flex-col items-center justify-center shrink-0 px-1 text-slate-500">
                        <div className="text-[9px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1">
                          Influenced
                        </div>
                        <ArrowRight className="w-5 h-5 text-[var(--text-muted)]" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
