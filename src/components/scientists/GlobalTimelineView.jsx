import React, { useState, useMemo } from 'react';
import { Clock, ChevronRight, Calendar, Filter } from 'lucide-react';
import { FAMOUS_CHEMISTS, SCIENTIST_ERAS } from '../../data/chemistsData';
import ScientistPortrait, { getFieldColor } from './ScientistPortrait';

export default function GlobalTimelineView({ onSelectScientist }) {
  const [selectedEra, setSelectedEra] = useState('All Eras');

  const timelineItems = useMemo(() => {
    const items = [];
    FAMOUS_CHEMISTS.forEach(s => {
      (s.timeline || []).forEach(t => {
        const match = t.year.match(/\d{4}/);
        const y = match ? parseInt(match[0], 10) : 1900;
        items.push({
          year: y,
          yearStr: t.year,
          event: t.event,
          category: t.category || 'Discovery',
          scientist: s
        });
      });
    });

    return items.sort((a, b) => a.year - b.year);
  }, []);

  const filteredItems = useMemo(() => {
    if (selectedEra === 'All Eras') return timelineItems;
    return timelineItems.filter(item => item.scientist.era === selectedEra);
  }, [timelineItems, selectedEra]);

  return (
    <div className="space-y-6 select-none">
      {/* Header & Era Filter */}
      <div className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[var(--text-primary)]">
            <Clock className="w-5 h-5 text-[var(--text-muted)]" />
            <h2 className="text-base font-black text-[var(--text-primary)] font-mono">
              Historical Timeline of Scientific Chemistry
            </h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
            Chronological milestones spanning atomic theory, wave mechanics, total synthesis, and modern gene editing.
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={selectedEra}
            onChange={e => setSelectedEra(e.target.value)}
            className="input-control w-full sm:w-auto py-2 px-3 rounded-2xl text-xs font-mono font-bold"
          >
            {SCIENTIST_ERAS.map(era => (
              <option key={era} value={era}>
                {era}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chronology River */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-[var(--border-medium)] space-y-6">
        {filteredItems.map((item, idx) => {
          const fc = getFieldColor(item.scientist.field);

          return (
            <div key={idx} className="relative group">
              {/* Timeline Orb */}
              <div
                className="absolute -left-[31px] sm:-left-[39px] top-3 w-4 h-4 rounded-full border-2 border-black shadow-sm transition-transform group-hover:scale-125"
                style={{ background: 'var(--text-primary)' }}
              />

              {/* Event Card */}
              <div
                onClick={() => onSelectScientist(item.scientist)}
                className="p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-200 flex items-start gap-4 border shadow-sm hover:shadow-md hover:-translate-x-1"
                style={{
                  background: 'var(--bg-inner)',
                  borderColor: 'var(--border-subtle)'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
              >
                {/* Mini Scientist Portrait */}
                <div
                  className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[var(--border-subtle)]"
                >
                  <ScientistPortrait
                    scientist={item.scientist}
                    className="w-full h-full"
                    size="mini"
                    showBadge={false}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)]"
                    >
                      {item.yearStr}
                    </span>
                    <strong className="text-xs text-[var(--text-primary)] font-mono">{item.scientist.name}</strong>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono hidden sm:inline">
                      ({item.scientist.field})
                    </span>
                    {item.category && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">{item.event}</p>
                </div>

                {/* Inspect Arrow */}
                <div
                  className="flex items-center gap-1 text-[11px] font-mono font-bold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-primary)]"
                >
                  <span className="hidden sm:inline">View Dossier</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
