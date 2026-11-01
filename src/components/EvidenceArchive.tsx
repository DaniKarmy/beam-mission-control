import React, { useState } from 'react';
import {
  EVIDENCE_ARCHIVE,
  EvidenceRecord,
  MissionReplayEvent,
  SCENARIO_CONFIG,
} from '../data/missionData';
import { EvidenceInspector } from './EvidenceInspector';
import { TooltipInfo } from './TooltipInfo';

interface EvidenceArchiveProps {
  activeEvent: MissionReplayEvent | null;
  highlightedEvidenceId: string | null;
  onSelectRecord: (id: string) => void;
}

export const EvidenceArchive: React.FC<EvidenceArchiveProps> = ({
  activeEvent,
  highlightedEvidenceId,
  onSelectRecord,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'CURRENT' | 'SUPERSEDED'>('ALL');
  const activeEvidenceId = activeEvent ? activeEvent.evidenceId : null;

  const filteredRecords: EvidenceRecord[] = EVIDENCE_ARCHIVE.filter((rec) => {
    if (filter === 'CURRENT') return rec.status === 'CURRENT';
    if (filter === 'SUPERSEDED') return rec.status === 'SUPERSEDED';
    return true;
  });

  return (
    <div className="flex flex-col gap-5">
      <section
        aria-label="Mission Evidence Archive"
        className="panel-surface border border-slate-800/80 rounded-xl p-5 flex flex-col gap-4"
      >
        {/* Header & Interactive Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/70">
          <div>
            <div className="text-xs font-mono text-cyan-300 uppercase">
              Frozen Contract {SCENARIO_CONFIG.contractId} · Scenario {SCENARIO_CONFIG.scenarioId}
            </div>
            <h1 className="text-xl font-display font-bold text-slate-100 mt-0.5">
              Mission <TooltipInfo term="Evidence" label="Evidence" /> Archive
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Declarative engineering records governing action admissibility. Evidence text is never treated as executable instructions.
            </p>
          </div>

          {/* Interactive Filter Segmented Control */}
          <div className="flex items-center gap-1 p-1 panel-sub border border-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                filter === 'ALL'
                  ? 'bg-slate-800 text-slate-100 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Records (7)
            </button>
            <button
              type="button"
              onClick={() => setFilter('CURRENT')}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                filter === 'CURRENT'
                  ? 'bg-cyan-950/70 text-cyan-200 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CURRENT (5)
            </button>
            <button
              type="button"
              onClick={() => setFilter('SUPERSEDED')}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                filter === 'SUPERSEDED'
                  ? 'bg-amber-950/70 text-amber-200 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SUPERSEDED (2)
            </button>
          </div>
        </div>

        {/* Evidence Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredRecords.map((record) => {
            const isCurrent = record.status === 'CURRENT';
            const isCitedByActiveEvent = activeEvidenceId === record.id;
            const isInspected = highlightedEvidenceId === record.id;

            return (
              <div
                key={record.id}
                onClick={() => onSelectRecord(record.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectRecord(record.id);
                  }
                }}
                className={`rounded-xl p-4 border transition-colors text-left flex flex-col justify-between gap-3 cursor-pointer ${
                  isCitedByActiveEvent || isInspected
                    ? 'bg-cyan-950/30 border-cyan-400'
                    : isCurrent
                    ? 'panel-sub border-slate-800/80 hover:border-slate-700'
                    : 'bg-[#070A12]/80 border-slate-800/50 opacity-80 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs font-mono">
                    <span
                      className={`text-base font-bold ${
                        isCurrent ? 'text-cyan-300' : 'text-slate-400 line-through'
                      }`}
                    >
                      {record.id}
                    </span>
                    <span
                      className={
                        isCurrent
                          ? 'text-cyan-300 font-semibold'
                          : 'text-amber-400 font-medium'
                      }
                    >
                      {record.status}
                    </span>
                  </div>

                  <div className="mt-1 text-xs font-mono text-slate-400">
                    Claim: <strong className="text-slate-200">{record.claim}</strong> ·{' '}
                    {record.subsystem}
                  </div>

                  <p className="mt-2.5 text-sm text-slate-200 leading-relaxed">
                    {record.text}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono">
                  {isCitedByActiveEvent ? (
                    <span className="text-cyan-300 font-semibold">
                      Cited by Event {activeEvent?.eventNumber}
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      {isCurrent ? 'Admissible CURRENT record' : 'Obsolete / Inadmissible'}
                    </span>
                  )}
                  <span className="text-slate-500">Declarative</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Integrated Evidence Inspector inside the EVIDENCE screen */}
      <EvidenceInspector selectedEvent={activeEvent} />
    </div>
  );
};
