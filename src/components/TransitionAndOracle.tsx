import React from 'react';
import { ArrowRight, CheckCircle2, Ban } from 'lucide-react';
import {
  MissionReplayEvent,
  OracleStatus,
  PhysicalState,
  SCENARIO_CONFIG,
  formatTempCelsius,
} from '../data/missionData';
import { TooltipInfo } from './TooltipInfo';

interface TransitionAndOracleProps {
  event: MissionReplayEvent | null;
  currentState: PhysicalState;
}

const ALL_ORACLE_STATUSES: OracleStatus[] = ['RUNNING', 'SUCCESS', 'FAILED', 'SAFE_STOP'];

export const TransitionAndOracle: React.FC<TransitionAndOracleProps> = ({
  event,
  currentState,
}) => {
  const pre = event ? event.preState : currentState;
  const post = event ? event.postState : currentState;
  const isBlocked = event?.interlock === 'BLOCKED';
  const activeOracleStatus: OracleStatus = event ? event.oracleStatus : 'RUNNING';
  const isFinalSuccess = event?.eventNumber === 9 && event.oracleStatus === 'SUCCESS';

  return (
    <section
      aria-label="State Transition and Mission Oracle"
      className="bg-[#0B101B] border border-slate-800 rounded p-5 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
            D. State Transition &amp; <TooltipInfo term="Mission Oracle" label="Mission Oracle" />
          </div>
          <h2 className="text-base font-display font-semibold text-slate-100 tracking-wide">
            Deterministic Simulator &amp; Oracle Evaluation
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Physical Transitions:</span>
          <strong className="text-slate-100">
            {event ? event.transitions : 0} / {SCENARIO_CONFIG.finalOutcome.physicalTransitions}
          </strong>
        </div>
      </div>

      {/* PRE-STATE -> ACTION -> POST-STATE */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-3 items-stretch">
        {/* PRE-STATE */}
        <div className="lg:col-span-4 bg-[#070B12] border border-slate-800 rounded p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-800/80">
            <span>PRE-STATE</span>
            <span className="text-slate-300">tick {pre.tick}</span>
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-y-1.5 gap-x-3 text-xs font-mono">
            <div className="text-slate-400">
              Energy: <strong className="text-slate-200">{pre.energy_wh} Wh</strong>
            </div>
            <div className="text-slate-400">
              Temp: <strong className="text-slate-200">{formatTempCelsius(pre.temperature_dc)} °C</strong>
            </div>
            <div className="text-slate-400">
              Rate: <strong className="text-slate-200">{pre.rate_mdps} mdps</strong>
            </div>
            <div className="text-slate-400">
              Payload: <strong className="text-slate-200">{pre.payload_on ? 'ON' : 'OFF'}</strong>
            </div>
            <div className="text-slate-400">
              Heater: <strong className="text-slate-200">{pre.heater_on ? 'ON' : 'OFF'}</strong>
            </div>
            <div className="text-slate-400">
              Sun Point: <strong className="text-slate-200">{pre.sun_pointing ? 'ON' : 'OFF'}</strong>
            </div>
          </div>
        </div>

        {/* ACTION */}
        <div className="lg:col-span-3 bg-[#070B12] border border-slate-800 rounded p-3.5 flex flex-col items-center justify-center text-center">
          <div className="text-[11px] font-mono uppercase text-slate-400">
            SIMULATOR ACTUATION
          </div>
          {event ? (
            isBlocked ? (
              <div className="my-2 flex flex-col items-center gap-1">
                <div className="inline-flex items-center gap-1.5 text-sm font-mono font-bold text-rose-400">
                  <Ban className="w-4 h-4" />
                  <span>{event.proposedAction} — BLOCKED</span>
                </div>
                <span className="text-xs font-mono text-rose-300">
                  {event.decisionCode} · NO ACTUATION
                </span>
              </div>
            ) : (
              <div className="my-2 flex flex-col items-center gap-1">
                <div className="inline-flex items-center gap-1.5 text-sm font-mono font-bold text-cyan-300">
                  <span>{event.proposedAction}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono text-slate-300">
                  Evidence: {event.evidenceId} · PERMITTED
                </span>
              </div>
            )
          ) : (
            <div className="my-2 text-xs font-mono text-slate-400">
              T=0 Initial State (No action applied)
            </div>
          )}
        </div>

        {/* POST-STATE */}
        <div
          className={`lg:col-span-4 rounded p-3.5 flex flex-col justify-between border ${
            isBlocked
              ? 'bg-rose-950/15 border-rose-500/40'
              : 'bg-[#070B12] border-cyan-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-800/80">
            <span className="text-slate-300">POST-STATE</span>
            {isBlocked ? (
              <span className="text-rose-300 font-semibold">PHYSICAL STATE: UNCHANGED</span>
            ) : (
              <span className="text-cyan-300 font-semibold">tick {post.tick}</span>
            )}
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-y-1.5 gap-x-3 text-xs font-mono">
            <div className="text-slate-400">
              Energy:{' '}
              <strong className={post.energy_wh !== pre.energy_wh ? 'text-cyan-300' : 'text-slate-200'}>
                {post.energy_wh} Wh
              </strong>
            </div>
            <div className="text-slate-400">
              Temp:{' '}
              <strong
                className={
                  post.temperature_dc !== pre.temperature_dc ? 'text-cyan-300' : 'text-slate-200'
                }
              >
                {formatTempCelsius(post.temperature_dc)} °C
              </strong>
            </div>
            <div className="text-slate-400">
              Rate:{' '}
              <strong className={post.rate_mdps !== pre.rate_mdps ? 'text-cyan-300' : 'text-slate-200'}>
                {post.rate_mdps} mdps
              </strong>
            </div>
            <div className="text-slate-400">
              Payload:{' '}
              <strong className={post.payload_on !== pre.payload_on ? 'text-cyan-300' : 'text-slate-200'}>
                {post.payload_on ? 'ON' : 'OFF'}
              </strong>
            </div>
            <div className="text-slate-400">
              Heater:{' '}
              <strong className={post.heater_on !== pre.heater_on ? 'text-cyan-300' : 'text-slate-200'}>
                {post.heater_on ? 'ON' : 'OFF'}
              </strong>
            </div>
            <div className="text-slate-400">
              Sun Point:{' '}
              <strong
                className={post.sun_pointing !== pre.sun_pointing ? 'text-cyan-300' : 'text-slate-200'}
              >
                {post.sun_pointing ? 'ON' : 'OFF'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Oracle Status Bar */}
      <div className="bg-[#070B12] border border-slate-800 rounded p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="text-xs font-mono uppercase text-slate-400">
            Mission Oracle Evaluation State
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {event
              ? event.phaseConditionSummary
              : 'Initial eclipse entry cascade: payload drawing 3 Wh/tick and inducing 500 mdps/tick drift while spacecraft tumbles at 6000 mdps.'}
          </p>
        </div>

        {/* 4 Oracle States Display */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {ALL_ORACLE_STATUSES.map((status) => {
            const isActive = activeOracleStatus === status;
            return (
              <div
                key={status}
                className={`px-3 py-1.5 rounded border text-xs font-mono tracking-wider transition-colors ${
                  isActive
                    ? status === 'SUCCESS'
                      ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 font-bold'
                      : 'bg-slate-800 border-cyan-400/70 text-slate-100 font-semibold'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-500'
                }`}
              >
                {isActive ? `● ${status}` : status}
              </div>
            );
          })}
        </div>
      </div>

      {/* Prominent Final Event Recovery Verified Callout (especially highlighted on Event 9, or summarized cleanly) */}
      {isFinalSuccess ? (
        <div className="bg-cyan-950/30 border border-cyan-500/60 rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-7 h-7 text-cyan-300 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-cyan-300">
                RECOVERY VERIFIED
              </div>
              <div className="text-xl font-display font-bold text-slate-100 tracking-wide">
                SUCCESS / RECOVERY_WINDOW
              </div>
              <div className="text-xs font-mono text-amber-300 mt-1">
                Verified deterministic reference replay — not Beam provenance.
              </div>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-200 space-y-1 md:text-right border-t md:border-t-0 pt-2 md:pt-0 border-cyan-800/50">
            <div>
              Summary: <strong>9 proposals</strong> · <strong>1 rejection</strong> ·{' '}
              <strong>8 physical transitions</strong>
            </div>
            <div className="text-slate-400">
              LOCAL_REFERENCE · SCRIPTED DETERMINISTIC BASELINE · NOT A BEAM REASONING CLAIM
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#080D16] border border-slate-800/90 rounded px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="text-slate-300">
            Reference Sequence Outcome:{' '}
            <strong className="text-cyan-300">SUCCESS / RECOVERY_WINDOW</strong> (at Event 9, Tick 8)
            <span className="text-slate-500 mx-2">·</span>
            <span>9 proposals · 1 rejection · 8 physical transitions</span>
          </div>
          <div className="text-amber-300/90">
            Verified deterministic reference replay — not Beam provenance.
          </div>
        </div>
      )}
    </section>
  );
};
