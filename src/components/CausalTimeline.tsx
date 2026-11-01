import React from 'react';
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Ban,
  ArrowRight,
  FileText,
} from 'lucide-react';
import {
  INITIAL_PHYSICAL_STATE,
  MissionReplayEvent,
  SCENARIO_CONFIG,
  formatTempCelsius,
} from '../data/missionData';

interface TimelineControlProps {
  events: MissionReplayEvent[];
  selectedEventIndex: number | null; // null = T0, 0..8 = EV1..EV9
  isPlaying: boolean;
  onSelectEventIndex: (index: number | null) => void;
  onReset: () => void;
  onPrevious: () => void;
  onStep: () => void;
  onTogglePlay: () => void;
  onInspectEvidence?: (evidenceId: string) => void;
}

/**
 * Compact bottom strip for MISSION CONTROL view:
 * T0 EV1 EV2 EV3 EV4 EV5 EV6 EV7 EV8 EV9 + RESET / PREVIOUS / STEP / PLAY / PAUSE
 */
export const MissionControlBottomStrip: React.FC<TimelineControlProps> = ({
  events,
  selectedEventIndex,
  isPlaying,
  onSelectEventIndex,
  onReset,
  onPrevious,
  onStep,
  onTogglePlay,
}) => {
  return (
    <section
      aria-label="Mission Sequence Strip and Replay Controls"
      className="panel-surface border border-slate-800/80 rounded-xl px-4 py-3 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3"
    >
      {/* Left: Compact Event Nodes T0 .. EV9 */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
        <button
          type="button"
          onClick={() => onSelectEventIndex(null)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            selectedEventIndex === null
              ? 'bg-slate-800 border-cyan-400 text-slate-100'
              : 'bg-[#080C16] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          T0
        </button>

        {events.map((ev, idx) => {
          const isSelected = selectedEventIndex === idx;
          const isBlocked = ev.interlock === 'BLOCKED';
          const isFinalSuccess = ev.oracleStatus === 'SUCCESS';

          return (
            <button
              key={ev.eventNumber}
              type="button"
              onClick={() => onSelectEventIndex(idx)}
              title={`Event ${ev.eventNumber}: ${ev.proposedAction} (${ev.interlock})`}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                isSelected
                  ? isBlocked
                    ? 'bg-rose-950/75 border-rose-400 text-rose-100 shadow-sm'
                    : isFinalSuccess
                    ? 'bg-cyan-900/70 border-cyan-300 text-cyan-100 shadow-sm'
                    : 'bg-cyan-950/70 border-cyan-400 text-slate-100 shadow-sm'
                  : isBlocked
                  ? 'bg-rose-950/25 border-rose-800/60 text-rose-300 hover:border-rose-600'
                  : isFinalSuccess
                  ? 'bg-cyan-950/30 border-cyan-700/60 text-cyan-300 hover:border-cyan-500'
                  : 'bg-[#080C16] border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span>EV{ev.eventNumber}</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isBlocked
                    ? 'bg-rose-400'
                    : isFinalSuccess
                    ? 'bg-cyan-300'
                    : 'bg-cyan-400/80'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Right: Compact Replay Controls */}
      <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onReset}
            className="px-2.5 py-1.5 text-xs font-mono bg-[#080C16] hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-lg inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>RESET</span>
          </button>

          <button
            type="button"
            onClick={onPrevious}
            disabled={selectedEventIndex === null}
            className="px-2.5 py-1.5 text-xs font-mono bg-[#080C16] hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-200 border border-slate-700/80 rounded-lg inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>PREVIOUS</span>
          </button>

          <button
            type="button"
            onClick={onStep}
            disabled={selectedEventIndex === events.length - 1}
            className="px-2.5 py-1.5 text-xs font-mono bg-[#080C16] hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-200 border border-slate-700/80 rounded-lg inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>STEP</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={onTogglePlay}
            className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg border inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              isPlaying
                ? 'bg-amber-950/70 border-amber-500/70 text-amber-200'
                : 'bg-cyan-950/70 hover:bg-cyan-900/70 border-cyan-500/70 text-cyan-200'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>PLAY / PAUSE</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};

/**
 * Dedicated REPLAY Screen View:
 * Top: reference replay identity + controls.
 * Center: horizontal Event 1–9 timeline.
 * Bottom: ONE structured detail area for the selected event:
 * EVIDENCE -> MODEL PROPOSAL -> SAFETY INTERLOCK -> ACTION / NO ACTION -> PRE / POST STATE -> ORACLE
 */
export const CausalTimeline: React.FC<TimelineControlProps> = ({
  events,
  selectedEventIndex,
  isPlaying,
  onSelectEventIndex,
  onReset,
  onPrevious,
  onStep,
  onTogglePlay,
  onInspectEvidence,
}) => {
  const activeEvent = selectedEventIndex !== null ? events[selectedEventIndex] : null;
  const isBlocked = activeEvent?.interlock === 'BLOCKED';
  const pre = activeEvent ? activeEvent.preState : INITIAL_PHYSICAL_STATE;
  const post = activeEvent ? activeEvent.postState : INITIAL_PHYSICAL_STATE;

  return (
    <div className="flex flex-col gap-5">
      {/* Top: Reference Replay Identity + Controls */}
      <section className="panel-surface border border-slate-800/80 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-cyan-300">
            <span>LOCAL_REFERENCE</span>
            <span className="text-slate-600">·</span>
            <span>SCRIPTED DETERMINISTIC BASELINE</span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-300">NOT A BEAM REASONING CLAIM</span>
          </div>
          <h1 className="text-xl font-display font-bold text-slate-100 mt-1">
            Deterministic Causal Replay — {SCENARIO_CONFIG.scenarioName}
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Scenario ID: {SCENARIO_CONFIG.scenarioId} · Contract: {SCENARIO_CONFIG.contractId} ·
            Proposals: 9 / {SCENARIO_CONFIG.proposalBudget} · Rejections: 1 /{' '}
            {SCENARIO_CONFIG.rejectionBudget} · Physical Transitions: 8
          </p>
        </div>

        {/* Replay Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onReset}
            className="px-3 py-2 text-xs font-mono bg-[#080C16] hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>RESET</span>
          </button>

          <button
            type="button"
            onClick={onPrevious}
            disabled={selectedEventIndex === null}
            className="px-3 py-2 text-xs font-mono bg-[#080C16] hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-200 border border-slate-700 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>PREVIOUS</span>
          </button>

          <button
            type="button"
            onClick={onStep}
            disabled={selectedEventIndex === events.length - 1}
            className="px-3 py-2 text-xs font-mono bg-[#080C16] hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-200 border border-slate-700 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>STEP</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={onTogglePlay}
            className={`px-3.5 py-2 text-xs font-mono font-semibold rounded-lg border inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              isPlaying
                ? 'bg-amber-950/70 border-amber-500/70 text-amber-200'
                : 'bg-cyan-950/70 hover:bg-cyan-900/70 border-cyan-500/70 text-cyan-200'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>PLAY / PAUSE</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Center: Horizontal Event 1–9 Timeline */}
      <section className="panel-surface border border-slate-800/80 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <h2 className="text-sm font-semibold text-slate-200">
            Select Event to Inspect Full Causal Record
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Eclipse: Ticks 0–5 · Sunlight: Ticks 6–9 · Deadline: Tick 10
          </span>
        </div>

        <div className="mb-3 text-[11px] font-mono text-slate-400">
          EVENT = proposal/decision record · TICK = physical mission time · Rejected proposals do not advance mission time.
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {/* T0 Initial Baseline */}
          <button
            type="button"
            onClick={() => onSelectEventIndex(null)}
            className={`p-3 rounded-lg border text-left transition-colors flex flex-col justify-between cursor-pointer ${
              selectedEventIndex === null
                ? 'bg-slate-800/90 border-cyan-400 text-slate-100'
                : 'panel-sub border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-semibold">T0</span>
              <span>Tick 0</span>
            </div>
            <div className="my-1.5 text-xs font-mono font-semibold text-slate-200">
              INITIAL
            </div>
            <div className="text-[11px] font-mono text-amber-400">
              60Wh · 6000mdps
            </div>
          </button>

          {/* Events 1..9 */}
          {events.map((ev, idx) => {
            const isSelected = selectedEventIndex === idx;
            const evBlocked = ev.interlock === 'BLOCKED';
            const evSuccess = ev.oracleStatus === 'SUCCESS';

            return (
              <button
                key={ev.eventNumber}
                type="button"
                onClick={() => onSelectEventIndex(idx)}
                className={`p-3 rounded-lg border text-left transition-colors flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? evBlocked
                      ? 'bg-rose-950/60 border-rose-400 text-slate-100'
                      : 'bg-cyan-950/60 border-cyan-400 text-slate-100'
                    : evBlocked
                    ? 'bg-rose-950/20 border-rose-900/60 text-slate-300 hover:border-rose-700'
                    : 'panel-sub border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold">EV{ev.eventNumber}</span>
                  {evBlocked ? (
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  )}
                </div>

                <div className="mt-1 text-[11px] font-mono text-slate-300">
                  T{ev.preState.tick} → T{ev.postState.tick}
                </div>

                <div className="my-1 text-xs font-mono font-semibold text-slate-100 truncate">
                  {ev.proposedAction}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className={evBlocked ? 'text-rose-300' : 'text-cyan-300'}>
                    {evBlocked ? 'BLOCKED' : 'PERMITTED'}
                  </span>
                  <span className="text-slate-400">
                    {evSuccess ? 'SUCCESS' : ev.evidenceId}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected Event Single Structured Detail Area */}
      <section className="panel-surface border border-slate-800/80 rounded-xl p-5 flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/70">
          <div>
            <span className="text-xs font-mono text-cyan-300 uppercase">
              {activeEvent ? `Event ${activeEvent.eventNumber} Causal Inspection` : 'T0 Initial Baseline Inspection'}
            </span>
            <h2 className="text-lg font-display font-bold text-slate-100">
              {activeEvent
                ? `${activeEvent.proposedAction} — ${activeEvent.phaseTitle}`
                : 'Initial Eclipse Cascade State (Tick 0)'}
            </h2>
          </div>

          {activeEvent && (
            <div className="text-xs font-mono text-slate-400">
              Proposal Attempt {activeEvent.attempts} of {SCENARIO_CONFIG.proposalBudget} · Rejections:{' '}
              {activeEvent.rejections} of {SCENARIO_CONFIG.rejectionBudget}
            </div>
          )}
        </div>

        {/* 6-Stage Horizontal Causal Chain */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 items-stretch">
          {/* 1. EVIDENCE */}
          <div className="panel-sub border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold">1. EVIDENCE</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="mt-2 text-base font-mono font-bold text-cyan-300">
                {activeEvent ? activeEvent.evidenceId : 'ARCHIVE'}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Declarative CURRENT engineering specification
              </p>
            </div>
            {activeEvent && onInspectEvidence && (
              <button
                type="button"
                onClick={() => onInspectEvidence(activeEvent.evidenceId)}
                className="mt-3 px-2.5 py-1.5 text-xs font-mono bg-slate-900 hover:bg-slate-800 text-cyan-200 border border-slate-700 rounded inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <FileText className="w-3 h-3" />
                <span>Open in Evidence</span>
              </button>
            )}
          </div>

          {/* 2. MODEL PROPOSAL */}
          <div className="panel-sub border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold">2. MODEL PROPOSAL</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </div>
              {activeEvent ? (
                <div className="mt-2 space-y-1 text-xs font-mono">
                  <div>
                    <span className="text-slate-400">tool: </span>
                    <strong className="text-slate-100">{activeEvent.proposalEnvelope.tool}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">args: </span>
                    <code className="text-cyan-200">{activeEvent.proposalEnvelope.argsFormatted}</code>
                  </div>
                  <div>
                    <span className="text-slate-400">evidence: </span>
                    <code className="text-cyan-200">
                      {JSON.stringify(activeEvent.proposalEnvelope.evidence)}
                    </code>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-xs text-slate-400">No proposal at T0</div>
              )}
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/70 text-[11px] font-mono text-slate-400">
              STATE BINDING: <strong className="text-cyan-300">MATCH</strong>
            </div>
          </div>

          {/* 3. SAFETY INTERLOCK */}
          <div
            className={`rounded-xl p-3.5 border flex flex-col justify-between ${
              !activeEvent
                ? 'panel-sub border-slate-800'
                : isBlocked
                ? 'bg-rose-950/35 border-rose-500/70'
                : 'bg-cyan-950/30 border-cyan-500/60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold">3. SAFETY INTERLOCK</span>
                {activeEvent && isBlocked ? (
                  <Ban className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                )}
              </div>
              <div
                className={`mt-2 text-lg font-display font-bold ${
                  !activeEvent
                    ? 'text-slate-200'
                    : isBlocked
                    ? 'text-rose-400'
                    : 'text-cyan-300'
                }`}
              >
                {activeEvent ? activeEvent.interlock : 'ARMED'}
              </div>
              {activeEvent && (
                <div className="mt-1 text-xs font-mono text-slate-200">
                  Code: <strong>{activeEvent.decisionCode}</strong>
                </div>
              )}
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/70 text-[11px] text-slate-300">
              {isBlocked
                ? 'Model output cannot bypass this boundary.'
                : 'Deterministic policy checks passed.'}
            </div>
          </div>

          {/* 4. ACTION / NO ACTION */}
          <div
            className={`panel-sub rounded-xl p-3.5 border flex flex-col justify-between ${
              isBlocked ? 'border-rose-500/40' : 'border-slate-800/80'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold">4. ACTION / NO ACTION</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div
                className={`mt-2 text-sm font-mono font-bold ${
                  !activeEvent
                    ? 'text-slate-300'
                    : isBlocked
                    ? 'text-rose-300'
                    : 'text-cyan-300'
                }`}
              >
                {!activeEvent
                  ? 'NONE (T0)'
                  : isBlocked
                  ? 'NO ACTUATION'
                  : activeEvent.proposedAction}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {!activeEvent
                  ? 'Initial state before proposals'
                  : isBlocked
                  ? 'NO PHYSICAL MUTATION'
                  : 'Applied to deterministic simulator'}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/70 text-[11px] font-mono text-slate-400">
              Transitions: {activeEvent ? activeEvent.transitions : 0} / 8
            </div>
          </div>

          {/* 5. PRE / POST STATE */}
          <div className="panel-sub border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold">5. PRE / POST STATE</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="mt-2 space-y-1 text-xs font-mono">
                <div className="text-slate-300">
                  Tick: {pre.tick} →{' '}
                  <strong className={isBlocked ? 'text-rose-300' : 'text-cyan-300'}>
                    {isBlocked ? `${post.tick} (UNCHANGED)` : post.tick}
                  </strong>
                </div>
                <div className="text-slate-300">
                  Energy: {pre.energy_wh} → <strong>{post.energy_wh} Wh</strong>
                </div>
                <div className="text-slate-300">
                  Temp: {formatTempCelsius(pre.temperature_dc)} →{' '}
                  <strong>{formatTempCelsius(post.temperature_dc)} °C</strong>
                </div>
                <div className="text-slate-300">
                  Rate: {pre.rate_mdps} → <strong>{post.rate_mdps} mdps</strong>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/70 text-[11px] font-mono text-slate-400">
              Payload {post.payload_on ? 'ON' : 'OFF'} · Heater {post.heater_on ? 'ON' : 'OFF'} · Sun{' '}
              {post.sun_pointing ? 'ON' : 'OFF'}
            </div>
          </div>

          {/* 6. ORACLE */}
          <div
            className={`rounded-xl p-3.5 border flex flex-col justify-between ${
              activeEvent?.oracleStatus === 'SUCCESS'
                ? 'bg-cyan-950/35 border-cyan-400/70'
                : 'panel-sub border-slate-800/80'
            }`}
          >
            <div>
              <div className="text-xs font-semibold text-slate-400">6. ORACLE</div>
              <div className="mt-2 flex items-center gap-1.5">
                {activeEvent?.oracleStatus === 'SUCCESS' && (
                  <CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />
                )}
                <span
                  className={`text-base font-display font-bold ${
                    activeEvent?.oracleStatus === 'SUCCESS'
                      ? 'text-cyan-300'
                      : 'text-slate-100'
                  }`}
                >
                  {activeEvent ? activeEvent.oracleStatus : 'RUNNING'}
                </span>
              </div>
              {activeEvent?.oracleCode && (
                <div className="mt-1 text-xs font-mono text-cyan-200">
                  {activeEvent.oracleCode}
                </div>
              )}
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/70 text-[11px] text-slate-400">
              Verified deterministic reference replay — not Beam provenance.
            </div>
          </div>
        </div>

        {/* Proposal Envelope & Precondition Verification Details for Selected Event */}
        {activeEvent && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2 border-t border-slate-800/70">
            <div className="panel-sub border border-slate-800/70 rounded-lg p-3.5 text-xs font-mono space-y-1.5">
              <div className="text-slate-300 font-sans font-semibold">
                Proposal Envelope (Contract {SCENARIO_CONFIG.contractId})
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-400">tool:</span>
                <span className="text-slate-100">"{activeEvent.proposalEnvelope.tool}"</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-400">args:</span>
                <span className="text-cyan-300">{activeEvent.proposalEnvelope.argsFormatted}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-400">evidence:</span>
                <span className="text-cyan-300">
                  {JSON.stringify(activeEvent.proposalEnvelope.evidence)}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-400">observed_state_sha256:</span>
                <span className="text-slate-400">
                  {activeEvent.proposalEnvelope.observed_state_sha256}
                </span>
              </div>
            </div>

            <div className="panel-sub border border-slate-800/70 rounded-lg p-3.5 text-xs space-y-2">
              <div className="text-slate-300 font-semibold">
                Safety Interlock Evaluation Detail
              </div>
              {activeEvent.preconditionChecks.map((chk, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs py-1 border-b border-slate-800/60 last:border-none"
                >
                  <span className="text-slate-200">{chk.rule}</span>
                  <span
                    className={
                      chk.status === 'FAIL'
                        ? 'text-rose-300 font-semibold'
                        : chk.status === 'NOT_EVALUATED'
                        ? 'text-slate-400'
                        : 'text-cyan-300 font-semibold'
                    }
                  >
                    {chk.status === 'FAIL'
                      ? `FAIL — Observed: ${chk.observed}`
                      : chk.status === 'NOT_EVALUATED'
                      ? 'NOT EVALUATED AFTER FIRST REJECTION'
                      : `PASS (${chk.observed})`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
