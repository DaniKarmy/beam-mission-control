import React, { useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';
import { LIVE_CALIBRATION_EVIDENCE } from '../data/missionData';
import { TooltipInfo } from './TooltipInfo';

interface LiveCalibrationViewProps {
  onReturnToMissionControl: () => void;
}

export const LiveCalibrationView: React.FC<LiveCalibrationViewProps> = ({
  onReturnToMissionControl,
}) => {
  const data = LIVE_CALIBRATION_EVIDENCE;
  const [lifecycleExpanded, setLifecycleExpanded] = useState(true);
  const [authExpanded, setAuthExpanded] = useState(true);

  return (
    <div className="flex flex-col gap-5">
      {/* Concise First-Level Status Card */}
      <section
        aria-label="Live Calibration Summary"
        className="panel-surface border border-slate-800/80 rounded-xl p-6 flex flex-col gap-5"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/70">
          <div className="flex items-start gap-3.5">
            <AlertTriangle className="w-7 h-7 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-amber-400">
                {data.header}
              </div>
              <h1 className="text-2xl font-display font-bold text-slate-100 mt-0.5">
                {data.status}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {data.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onReturnToMissionControl}
            className="px-3.5 py-2 text-xs font-mono bg-[#080C16] hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start lg:self-center"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>Return to Mission Control</span>
          </button>
        </div>

        {/* First-Level Concise Status Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="panel-sub border border-amber-500/40 rounded-xl p-4">
            <div className="text-xs text-slate-400">Transport Status</div>
            <div className="mt-1 text-2xl font-mono font-bold text-amber-400">
              {data.httpStatusBadge}
            </div>
            <div className="mt-1 text-xs font-mono text-slate-400">
              {data.termination}
            </div>
          </div>

          <div className="panel-sub border border-slate-800/80 rounded-xl p-4">
            <div className="text-xs text-slate-400">Attempt Lifecycle</div>
            <div className="mt-1 text-xl font-mono font-bold text-slate-100">
              {data.attemptBadge}
            </div>
            <div className="mt-1 text-xs font-mono text-slate-400">
              {data.inspectorData.history}
            </div>
          </div>

          <div className="panel-sub border border-slate-800/80 rounded-xl p-4">
            <div className="text-xs text-slate-400">Retry Policy</div>
            <div className="mt-1 text-xl font-mono font-bold text-slate-100">
              {data.retryBadge}
            </div>
            <div className="mt-1 text-xs font-mono text-slate-400">
              CONSUME = {data.inspectorData.consumeCount} · HTTP sends = {data.httpSends}
            </div>
          </div>

          <div className="panel-sub border border-amber-500/40 rounded-xl p-4">
            <div className="text-xs text-slate-400">
              <TooltipInfo term="Provenance" label="Provider / Model Provenance" />
            </div>
            <div className="mt-1 text-xl font-mono font-bold text-amber-300">
              {data.providerModelProvenance}
            </div>
            <div className="mt-1 text-xs font-mono text-rose-300">
              {data.resultVerification}
            </div>
          </div>
        </div>
      </section>

      {/* Expandable Panel 1: Attempt Lifecycle & Extraction Details */}
      <section className="panel-surface border border-slate-800/80 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setLifecycleExpanded((prev) => !prev)}
          className="w-full px-5 py-4 hover:bg-slate-900/40 flex items-center justify-between gap-4 text-left transition-colors cursor-pointer"
          aria-expanded={lifecycleExpanded}
        >
          <div>
            <div className="text-sm font-semibold text-slate-100">
              Attempt Lifecycle &amp; Pipeline Telemetry
            </div>
            <div className="text-xs font-mono text-slate-400 mt-0.5">
              INITIALIZE → APPROVE → CONSUME · Completion = UNKNOWN · Extraction = FAILED · Replay = NOT_EVALUATED
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-300 shrink-0">
            <span>{lifecycleExpanded ? 'Collapse' : 'Expand'}</span>
            {lifecycleExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {lifecycleExpanded && (
          <div className="p-5 border-t border-slate-800/70 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
            <div className="panel-sub border border-slate-800/70 rounded-lg p-3.5">
              <div className="text-slate-400">Lifecycle</div>
              <div className="mt-1 text-sm font-semibold text-slate-100">
                {data.inspectorData.history}
              </div>
            </div>

            <div className="panel-sub border border-slate-800/70 rounded-lg p-3.5">
              <div className="text-slate-400">CONSUME / HTTP Sends</div>
              <div className="mt-1 text-sm font-semibold text-slate-100">
                CONSUME = {data.inspectorData.consumeCount} · HTTP sends = {data.httpSends}
              </div>
            </div>

            <div className="panel-sub border border-slate-800/70 rounded-lg p-3.5">
              <div className="text-slate-400">Completion</div>
              <div className="mt-1 text-sm font-semibold text-slate-200">
                {data.completion}
              </div>
            </div>

            <div className="panel-sub border border-slate-800/70 rounded-lg p-3.5">
              <div className="text-slate-400">Extraction</div>
              <div className="mt-1 text-sm font-semibold text-rose-300">
                {data.extraction}
              </div>
            </div>

            <div className="panel-sub border border-slate-800/70 rounded-lg p-3.5">
              <div className="text-slate-400">Selected Beam output</div>
              <div className="mt-1 text-sm font-semibold text-rose-300">
                {data.selectedBeamOutput}
              </div>
            </div>

            <div className="panel-sub border border-slate-800/70 rounded-lg p-3.5">
              <div className="text-slate-400">C2 / Interlock event</div>
              <div className="mt-1 text-sm font-semibold text-slate-300">
                {data.c2InterlockEvent}
              </div>
            </div>

            <div className="panel-sub border border-slate-800/70 rounded-lg p-3.5">
              <div className="text-slate-400">Replay</div>
              <div className="mt-1 text-sm font-semibold text-slate-300">
                {data.replay}
              </div>
            </div>

            <div className="panel-sub border border-slate-800/70 rounded-lg p-3.5">
              <div className="text-slate-400">Billing &amp; Provenance</div>
              <div className="mt-1 text-sm font-semibold text-amber-300">
                Billing: {data.billing} · {data.providerModelProvenance}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Expandable Panel 2: Separate Authentication Evidence & Limitation Boundary */}
      <section className="panel-surface border border-slate-800/80 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setAuthExpanded((prev) => !prev)}
          className="w-full px-5 py-4 hover:bg-slate-900/40 flex items-center justify-between gap-4 text-left transition-colors cursor-pointer"
          aria-expanded={authExpanded}
        >
          <div>
            <div className="text-sm font-semibold text-slate-100">
              Separate Authentication Evidence &amp; Epistemic Limitation
            </div>
            <div className="text-xs font-mono text-slate-400 mt-0.5">
              {data.separateTokenCheck.header} · {data.separateTokenCheck.httpStatus}
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-300 shrink-0">
            <span>{authExpanded ? 'Collapse' : 'Expand'}</span>
            {authExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {authExpanded && (
          <div className="p-5 border-t border-slate-800/70 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <div className="lg:col-span-5 panel-sub border border-slate-800/70 rounded-lg p-4 space-y-2.5 text-xs font-mono">
              <div className="flex items-center gap-2 text-cyan-300 font-sans font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{data.separateTokenCheck.header}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Status:</span>
                <strong className="text-cyan-300">{data.separateTokenCheck.status}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">HTTP Status:</span>
                <strong className="text-cyan-300">{data.separateTokenCheck.httpStatus}</strong>
              </div>
              <div className="flex justify-between py-1.5 gap-2">
                <span className="text-slate-400">Scope check:</span>
                <strong className="text-cyan-300 text-right">
                  {data.separateTokenCheck.displayedPermission}
                </strong>
              </div>
            </div>

            <div className="lg:col-span-7 panel-sub border border-amber-500/40 rounded-lg p-4 flex flex-col justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Attribution Limitation Boundary</span>
              </div>

              <p className="text-sm text-slate-100 leading-relaxed">
                {data.limitationSummary}
              </p>

              <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800/60">
                “{data.explanatoryNote}”
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
