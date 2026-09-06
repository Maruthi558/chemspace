import React, { useState, useMemo } from 'react';
import { Clock, ChevronRight, Calendar, Filter, Star, Sparkles } from 'lucide-react';
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
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-cyan-400">
            <Clock className="w-5 h-5" />
            <h2 className="text-base font-black text-white font-mono">
              Historical Timeline of Scientific Chemistry
            </h2>
          </div>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
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
      <div className="relative pl-6 sm:pl-8 border-l-2 border-cyan-500/30 space-y-6">
        {filteredItems.map((item, idx) => {
          const fc = getFieldColor(item.scientist.field);

          return (
            <div key={idx} className="relative group">
              {/* Timeline Orb */}
              <div
                className="absolute -left-[31px] sm:-left-[39px] top-3 w-4 h-4 rounded-full border-2 border-black shadow-lg transition-transform group-hover:scale-125"
                style={{ background: fc.accent, boxShadow: `0 0 12px ${fc.accent}` }}
              />

              {/* Event Card */}
              <div
                onClick={() => onSelectScientist(item.scientist)}
                className="p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-200 flex items-start gap-4 border shadow-md hover:shadow-xl hover:-translate-x-1"
                style={{
                  background: 'rgba(10, 14, 22, 0.9)',
                  borderColor: 'rgba(255,255,255,0.08)'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = fc.accent + '70')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              >
                {/* Mini Scientist Portrait */}
                <div
                  className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border"
                  style={{ borderColor: `${fc.accent}50` }}
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
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black"
                      style={{ background: fc.bg, color: fc.accent, border: `1px solid ${fc.border}` }}
                    >
                      {item.yearStr}
                    </span>
                    <strong className="text-xs text-white font-mono">{item.scientist.name}</strong>
                    <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                      ({item.scientist.field})
                    </span>
                    {item.category && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">{item.event}</p>
                </div>

                {/* Inspect Arrow */}
                <div
                  className="flex items-center gap-1 text-[11px] font-mono font-bold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: fc.accent }}
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
