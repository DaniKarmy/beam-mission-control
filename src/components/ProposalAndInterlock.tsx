import React from 'react';
import {
  ArrowDown,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Ban,
  FileText,
} from 'lucide-react';
import { MissionReplayEvent, SCENARIO_CONFIG } from '../data/missionData';
import { TooltipInfo } from './TooltipInfo';

interface DecisionChainProps {
  event: MissionReplayEvent | null;
  onInspectEvidence?: (evidenceId: string) => void;
}

export const ProposalAndInterlock: React.FC<DecisionChainProps> = ({
  event,
  onInspectEvidence,
}) => {
  const isBlocked = event?.interlock === 'BLOCKED';
  const isFinalSuccess = event?.oracleStatus === 'SUCCESS';

  return (
    <aside
      aria-label="Operational Decision Chain"
      className="panel-surface border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between gap-2 h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 tracking-tight">
            Operational Decision Chain
          </h2>
          <p className="text-xs text-slate-400">
            {event ? `Event ${event.eventNumber} of 9` : 'T0 Initial Baseline'}
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Proposals: {event ? event.attempts : 0}/{SCENARIO_CONFIG.proposalBudget}
        </span>
      </div>

      {/* Stage 1: MODEL PROPOSAL */}
      <div className="panel-sub rounded-lg p-3 border border-slate-800/70">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-slate-300">
            1. Model Proposal
          </span>
          <span className="text-amber-400/90 font-mono text-[10px]">
            UNTRUSTED UNTIL VALIDATED
          </span>
        </div>

        {event ? (
          <div className="mt-1.5 space-y-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-lg font-mono font-bold text-slate-100">
                {event.proposedAction}
              </span>
              <span className="text-xs font-mono text-slate-300">
                args: <code className="text-cyan-200">{event.proposalEnvelope.argsFormatted}</code>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-xs">
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-slate-400">Evidence:</span>
                {onInspectEvidence ? (
                  <button
                    type="button"
                    onClick={() => onInspectEvidence(event.evidenceId)}
                    className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200 underline decoration-dotted cursor-pointer"
                  >
                    <FileText className="w-3 h-3" />
                    <span>{JSON.stringify(event.proposalEnvelope.evidence)}</span>
                  </button>
                ) : (
                  <span className="text-cyan-300">
                    {JSON.stringify(event.proposalEnvelope.evidence)}
                  </span>
                )}
              </div>

              <div className="font-mono text-[11px]">
                <span className="text-slate-400">STATE BINDING: </span>
                <strong className="text-cyan-300">
                  {event.proposalEnvelope.stateBindingStatus}
                </strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-2 text-xs text-slate-400">
            Initial eclipse entry state (Tick 0). Step to Event 1 to inspect the first recovery proposal.
          </div>
        )}
      </div>

      {/* Arrow Down */}
      <div className="flex justify-center -my-1" aria-hidden="true">
        <ArrowDown className="w-4 h-4 text-slate-500" />
      </div>

      {/* Stage 2: SAFETY INTERLOCK (Visually Dominates the Chain) */}
      <div
        className={`rounded-xl p-3.5 border transition-colors ${
          !event
            ? 'panel-sub border-slate-700'
            : isBlocked
            ? 'bg-rose-950/35 border-rose-500/80 shadow-[0_0_25px_-8px_rgba(244,63,94,0.45)]'
            : 'bg-cyan-950/30 border-cyan-500/70 shadow-[0_0_25px_-8px_rgba(6,182,212,0.35)]'
        }`}
      >
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold uppercase tracking-wider text-slate-200">
            2. <TooltipInfo term="Safety Interlock" label="Safety Interlock" />
          </span>
          <span className="font-mono text-[10px] text-slate-300">
            INDEPENDENT AUTHORITY
          </span>
        </div>

        {event ? (
          <div className="mt-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                {isBlocked ? (
                  <ShieldAlert className="w-7 h-7 text-rose-400 shrink-0" />
                ) : (
                  <ShieldCheck className="w-7 h-7 text-cyan-300 shrink-0" />
                )}
                <div>
                  <div
                    className={`text-2xl font-display font-bold tracking-wider leading-none ${
                      isBlocked ? 'text-rose-400' : 'text-cyan-300'
                    }`}
                  >
                    {event.interlock}
                  </div>
                  {isBlocked && (
                    <div className="text-xs font-mono font-semibold text-rose-200 mt-1">
                      {event.decisionCode}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right text-[11px] font-mono text-slate-300">
                <div>Rejections</div>
                <div className="font-semibold">
                  {event.rejections} / {SCENARIO_CONFIG.rejectionBudget}
                </div>
              </div>
            </div>

            {/* First failing precondition or policy pass detail */}
            <div className="mt-2.5 pt-2 border-t border-slate-800/70 space-y-1 text-xs">
              {event.preconditionChecks.map((chk, i) => (
                <div key={i} className="flex flex-col gap-0.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-300">{chk.rule}</span>
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
                        ? `Observed: ${chk.observed}`
                        : chk.status === 'NOT_EVALUATED'
                        ? 'NOT EVALUATED AFTER FIRST REJECTION'
                        : 'PASS'}
                    </span>
                  </div>
                </div>
              ))}
              <div className="text-[11px] text-slate-300 pt-0.5">
                {isBlocked
                  ? 'Model output cannot bypass this boundary.'
                  : 'Deterministic policy checks passed.'}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-2 text-xs text-slate-300">
            Armed outside the AI model. Model output cannot bypass this boundary.
          </div>
        )}
      </div>

      {/* Arrow Down */}
      <div className="flex justify-center -my-1" aria-hidden="true">
        <ArrowDown
          className={`w-4 h-4 ${isBlocked ? 'text-rose-400' : 'text-slate-500'}`}
        />
      </div>

      {/* Stage 3: STATE EFFECT */}
      <div
        className={`panel-sub rounded-lg p-3 border ${
          isBlocked ? 'border-rose-500/40' : 'border-slate-800/70'
        }`}
      >
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-slate-300">
            3. State Effect
          </span>
          <span className="font-mono text-[10px]">
            Transitions: {event ? event.transitions : 0}/8
          </span>
        </div>

        {event ? (
          isBlocked ? (
            <div className="mt-1.5">
              <div className="flex items-center gap-1.5 text-sm font-mono font-bold text-rose-300">
                <Ban className="w-4 h-4 text-rose-400 shrink-0" />
                <span>NO ACTUATION · STATE UNCHANGED</span>
              </div>
              <div className="text-xs font-mono text-slate-400 mt-0.5">
                NO PHYSICAL MUTATION (Tick 0 remains at 60 Wh · 6000 mdps)
              </div>
            </div>
          ) : (
            <div className="mt-1.5">
              <div className="text-sm font-mono font-semibold text-cyan-300">
                {event.stateEffectLabel}
              </div>
              <div className="text-xs font-mono text-slate-300 mt-0.5">
                {event.stateEffectDetail}
              </div>
            </div>
          )
        ) : (
          <div className="mt-1.5 text-xs font-mono text-slate-400">
            T0 Baseline: 60 Wh · 10.0 °C · 6000 mdps
          </div>
        )}
      </div>

      {/* Arrow Down */}
      <div className="flex justify-center -my-1" aria-hidden="true">
        <ArrowDown className="w-4 h-4 text-slate-500" />
      </div>

      {/* Stage 4: MISSION ORACLE */}
      <div
        className={`rounded-lg p-3 border ${
          isFinalSuccess
            ? 'bg-cyan-950/35 border-cyan-400/70'
            : 'panel-sub border-slate-800/70'
        }`}
      >
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-slate-300">
            4. <TooltipInfo term="Mission Oracle" label="Mission Oracle" />
          </span>
          <span className="font-mono text-[10px]">
            Deadline: Tick {SCENARIO_CONFIG.missionDeadlineTick}
          </span>
        </div>

        {isFinalSuccess ? (
          <div className="mt-1.5 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-cyan-300 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-display font-bold text-cyan-300 tracking-wide">
                RECOVERY WINDOW ACHIEVED · SUCCESS
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                Verified deterministic reference replay — not Beam provenance.
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-base font-display font-bold text-slate-100 tracking-wide">
              {event ? event.oracleStatus : 'RUNNING'}
            </span>
            <span className="text-xs text-slate-400">
              Evaluating recovery envelope
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
