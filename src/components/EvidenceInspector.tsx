import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileCode2 } from 'lucide-react';
import {
  EVIDENCE_ARCHIVE,
  INITIAL_PHYSICAL_STATE,
  LIVE_CALIBRATION_EVIDENCE,
  MissionReplayEvent,
  SCENARIO_CONFIG,
  formatTempCelsius,
} from '../data/missionData';

interface EvidenceInspectorProps {
  selectedEvent: MissionReplayEvent | null;
}

export const EvidenceInspector: React.FC<EvidenceInspectorProps> = ({
  selectedEvent,
}) => {
  const [expanded, setExpanded] = useState(true);

  const currentEvidenceIds = EVIDENCE_ARCHIVE.filter((r) => r.status === 'CURRENT').map(
    (r) => r.id
  );
  const supersededEvidenceIds = EVIDENCE_ARCHIVE.filter((r) => r.status === 'SUPERSEDED').map(
    (r) => r.id
  );

  const pre = selectedEvent ? selectedEvent.preState : INITIAL_PHYSICAL_STATE;
  const post = selectedEvent ? selectedEvent.postState : INITIAL_PHYSICAL_STATE;

  return (
    <section
      aria-label="Evidence Inspector and Technical Provenance"
      className="panel-surface border border-slate-800/80 rounded-xl overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full px-5 py-4 hover:bg-slate-900/50 flex items-center justify-between gap-4 text-left transition-colors cursor-pointer"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <FileCode2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <span className="text-sm font-semibold text-slate-100">
              Evidence Inspector &amp; Technical Provenance
            </span>
            <span className="text-slate-600 mx-2">·</span>
            <span className="text-xs font-mono text-slate-400">
              scenario = {SCENARIO_CONFIG.scenarioId} · contract = {SCENARIO_CONFIG.contractId} ·
              source = {SCENARIO_CONFIG.source}
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-300 shrink-0">
          <span>{expanded ? 'Collapse' : 'Expand'}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="p-5 border-t border-slate-800/70 space-y-4 text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Column 1: Provenance & Contract Metadata */}
            <div className="panel-sub border border-slate-800/70 rounded-lg p-4 space-y-2 font-mono">
              <div className="text-slate-300 font-sans font-semibold pb-1.5 border-b border-slate-800/70">
                Reference Provenance Ledger
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-400">scenario ID:</span>
                <span className="text-slate-100 font-semibold">{SCENARIO_CONFIG.scenarioId}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-400">contract ID:</span>
                <span className="text-slate-100 font-semibold">{SCENARIO_CONFIG.contractId}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-400">source:</span>
                <span className="text-amber-300 font-semibold">{SCENARIO_CONFIG.source}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-400">CURRENT IDs:</span>
                <span className="text-cyan-300">{currentEvidenceIds.join(', ')}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-400">SUPERSEDED IDs:</span>
                <span className="text-slate-400">{supersededEvidenceIds.join(', ')}</span>
              </div>
              <div className="flex justify-between gap-2 pt-1 border-t border-slate-800/60">
                <span className="text-slate-400">observed_state_sha256:</span>
                <span className="text-slate-400">{SCENARIO_CONFIG.rawDigestNotice}</span>
              </div>
            </div>

            {/* Column 2: Active Replay Event Inspection */}
            <div className="panel-sub border border-slate-800/70 rounded-lg p-4 space-y-2 font-mono">
              <div className="text-slate-300 font-sans font-semibold pb-1.5 border-b border-slate-800/70">
                Selected Event Envelope &amp; Interlock
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-400">event index:</span>
                <span className="text-slate-100 font-semibold">
                  {selectedEvent
                    ? `Event ${selectedEvent.eventNumber} (idx ${selectedEvent.eventNumber - 1})`
                    : 'T0 Baseline'}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-400">tool:</span>
                <span className="text-slate-100 font-semibold">
                  {selectedEvent ? selectedEvent.proposalEnvelope.tool : '—'}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-400">args:</span>
                <span className="text-cyan-300">
                  {selectedEvent ? selectedEvent.proposalEnvelope.argsFormatted : '—'}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-400">evidence:</span>
                <span className="text-cyan-300">
                  {selectedEvent ? JSON.stringify(selectedEvent.proposalEnvelope.evidence) : '—'}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-400">interlock / code:</span>
                <span
                  className={
                    selectedEvent?.interlock === 'BLOCKED'
                      ? 'text-rose-400 font-bold'
                      : 'text-cyan-300 font-semibold'
                  }
                >
                  {selectedEvent
                    ? `${selectedEvent.interlock} (${selectedEvent.decisionCode})`
                    : 'ARMED'}
                </span>
              </div>
            </div>

            {/* Column 3: Pre/Post Physical State & Calibration Summary */}
            <div className="panel-sub border border-slate-800/70 rounded-lg p-4 space-y-2 font-mono">
              <div className="text-slate-300 font-sans font-semibold pb-1.5 border-b border-slate-800/70">
                State Transition &amp; Provider Provenance
              </div>
              <div className="text-slate-300 leading-relaxed">
                <span className="text-slate-400">pre_state: </span>
                {`t=${pre.tick}, ${pre.energy_wh}Wh, ${pre.temperature_dc}dc (${formatTempCelsius(
                  pre.temperature_dc
                )}°C), ${pre.rate_mdps}mdps, payload=${pre.payload_on}, heater=${
                  pre.heater_on
                }, sun=${pre.sun_pointing}`}
              </div>
              <div className="text-cyan-200 leading-relaxed pt-1 border-t border-slate-800/60">
                <span className="text-slate-400">post_state: </span>
                {selectedEvent?.stateUnchanged
                  ? 'NO PHYSICAL MUTATION (UNCHANGED)'
                  : `t=${post.tick}, ${post.energy_wh}Wh, ${
                      post.temperature_dc
                    }dc (${formatTempCelsius(post.temperature_dc)}°C), ${
                      post.rate_mdps
                    }mdps, payload=${post.payload_on}, heater=${post.heater_on}, sun=${
                      post.sun_pointing
                    }`}
              </div>
              <div className="flex justify-between gap-2 pt-1 border-t border-slate-800/60">
                <span className="text-slate-400">provider_model_provenance:</span>
                <span className="text-slate-300 font-semibold">
                  NOT APPLICABLE — LOCAL_REFERENCE
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
