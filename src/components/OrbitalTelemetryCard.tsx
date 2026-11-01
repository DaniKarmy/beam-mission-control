import React, { useEffect, useState } from 'react';
import {
  HARD_SAFE_RANGES,
  MissionReplayEvent,
  PhysicalState,
  SCENARIO_CONFIG,
  formatTempCelsius,
} from '../data/missionData';

interface OrbitalTelemetryProps {
  state: PhysicalState;
  preState: PhysicalState;
  activeEvent: MissionReplayEvent | null;
}

export function useAnimatedNumber(target: number, durationMs = 260): number {
  const [current, setCurrent] = useState(target);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const initial = current;
    const delta = target - initial;

    if (delta === 0) return;

    let rafId: number;
    const step = (timestamp: number) => {
      if (startTimestamp === null) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(initial + delta * eased);
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setCurrent(target);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, durationMs]);

  return current;
}

/**
 * Left Column of Mission Control: Compact Spacecraft Telemetry Instruments
 */
export const OrbitalTelemetryCard: React.FC<OrbitalTelemetryProps> = ({
  state,
  preState,
  activeEvent,
}) => {
  const animatedEnergy = useAnimatedNumber(state.energy_wh);
  const animatedTempDc = useAnimatedNumber(state.temperature_dc);
  const animatedRate = useAnimatedNumber(state.rate_mdps);

  const isEclipse = state.tick <= SCENARIO_CONFIG.eclipseEndTick;
  const aboveSunPointRate = state.rate_mdps > HARD_SAFE_RANGES.attitudeRate.sunPointThreshold;
  const energyDelta = activeEvent ? state.energy_wh - preState.energy_wh : 0;
  const tempDeltaDc = activeEvent ? state.temperature_dc - preState.temperature_dc : 0;
  const rateDelta = activeEvent ? state.rate_mdps - preState.rate_mdps : 0;

  // Normalize temperature_dc (-100..400) to 0..1
  const tempNormalized = Math.min(
    Math.max(
      (state.temperature_dc - HARD_SAFE_RANGES.temperature.minDc) /
        (HARD_SAFE_RANGES.temperature.maxDc - HARD_SAFE_RANGES.temperature.minDc),
      0
    ),
    1
  );

  // Normalize energy (10..100 Wh)
  const energyNormalized = Math.min(
    Math.max(state.energy_wh / HARD_SAFE_RANGES.energy.max, 0),
    1
  );

  // Normalize rate (0..20000 mdps, with 6000 mdps initial visible scale)
  const rateNormalized = Math.min(
    Math.max(state.rate_mdps / HARD_SAFE_RANGES.attitudeRate.max, 0.02),
    1
  );

  return (
    <aside
      aria-label="Spacecraft Telemetry"
      className="panel-surface border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between gap-3 h-full"
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 tracking-tight">
            Spacecraft Telemetry
          </h2>
          <p className="text-xs text-slate-400">
            Physical bus instruments
          </p>
        </div>
        <span
          className={`text-xs font-mono font-medium ${
            isEclipse ? 'text-amber-400' : 'text-cyan-300'
          }`}
        >
          {isEclipse ? 'Eclipse (T0–T5)' : 'Sunlight (T6–T9)'}
        </span>
      </div>

      {/* 4 Primary Gauges */}
      <div className="flex flex-col gap-2.5">
        {/* ENERGY */}
        <div className="panel-sub rounded-lg p-3 border border-slate-800/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Energy</span>
            <span className="font-mono text-slate-400 text-[11px]">
              Safe: {HARD_SAFE_RANGES.energy.label}
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-semibold text-slate-100 tabular-nums">
                {Math.round(animatedEnergy)}
              </span>
              <span className="text-xs font-mono text-slate-400">Wh</span>
            </div>
            {energyDelta !== 0 && (
              <span
                className={`text-xs font-mono ${
                  energyDelta > 0 ? 'text-cyan-300' : 'text-amber-400'
                }`}
              >
                {energyDelta > 0 ? `+${energyDelta}` : energyDelta} Wh
              </span>
            )}
          </div>
          <div className="mt-2 w-full bg-slate-900/90 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-transform duration-200 origin-left"
              style={{ transform: `scaleX(${energyNormalized})` }}
            />
          </div>
        </div>

        {/* TEMPERATURE */}
        <div className="panel-sub rounded-lg p-3 border border-slate-800/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Temperature</span>
            <span className="font-mono text-slate-400 text-[11px]">
              Safe: {HARD_SAFE_RANGES.temperature.labelCelsius}
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-semibold text-slate-100 tabular-nums">
                {(animatedTempDc / 10).toFixed(1)}
              </span>
              <span className="text-xs font-mono text-slate-400">
                °C ({Math.round(animatedTempDc)} dc)
              </span>
            </div>
            {tempDeltaDc !== 0 && (
              <span
                className={`text-xs font-mono ${
                  tempDeltaDc > 0 ? 'text-cyan-300' : 'text-amber-400'
                }`}
              >
                {tempDeltaDc > 0
                  ? `+${formatTempCelsius(tempDeltaDc)}`
                  : formatTempCelsius(tempDeltaDc)}{' '}
                °C
              </span>
            )}
          </div>
          <div className="mt-2 w-full bg-slate-900/90 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-transform duration-200 origin-left"
              style={{ transform: `scaleX(${tempNormalized})` }}
            />
          </div>
        </div>

        {/* ATTITUDE RATE */}
        <div
          className={`panel-sub rounded-lg p-3 border transition-colors ${
            aboveSunPointRate ? 'border-amber-500/40' : 'border-slate-800/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Attitude Rate</span>
            <span className="font-mono text-slate-400 text-[11px]">
              Safe: {HARD_SAFE_RANGES.attitudeRate.label}
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-2xl font-mono font-semibold tabular-nums ${
                  aboveSunPointRate ? 'text-amber-400' : 'text-cyan-300'
                }`}
              >
                {Math.round(animatedRate)}
              </span>
              <span className="text-xs font-mono text-slate-400">mdps</span>
            </div>
            {rateDelta !== 0 && (
              <span
                className={`text-xs font-mono ${
                  rateDelta < 0 ? 'text-cyan-300' : 'text-amber-400'
                }`}
              >
                {rateDelta > 0 ? `+${rateDelta}` : rateDelta} mdps
              </span>
            )}
          </div>
          <div className="mt-2 w-full bg-slate-900/90 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-transform duration-200 origin-left ${
                aboveSunPointRate ? 'bg-amber-400' : 'bg-cyan-400'
              }`}
              style={{ transform: `scaleX(${rateNormalized})` }}
            />
          </div>
          <div className="mt-1 text-[11px] text-slate-400 flex justify-between">
            <span>SUN_POINT eligibility: &le; 1000 mdps</span>
            <span className={aboveSunPointRate ? 'text-amber-400 font-mono' : 'text-cyan-300 font-mono'}>
              {aboveSunPointRate ? '> 1000' : 'ELIGIBLE'}
            </span>
          </div>
        </div>

        {/* MISSION TICK */}
        <div className="panel-sub rounded-lg p-3 border border-slate-800/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Mission Tick</span>
            <span className="font-mono text-slate-400 text-[11px]">
              Deadline: Tick {SCENARIO_CONFIG.missionDeadlineTick}
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-semibold text-slate-100 tabular-nums">
                {state.tick}
              </span>
              <span className="text-xs font-mono text-slate-400">
                / {SCENARIO_CONFIG.missionDeadlineTick}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              {isEclipse ? 'Shadow transit' : 'Solar window'}
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-900/90 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-transform duration-200 origin-left"
              style={{
                transform: `scaleX(${Math.min(
                  Math.max(state.tick / SCENARIO_CONFIG.missionDeadlineTick, 0.04),
                  1
                )})`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 3 Compact Subsystem States */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/60">
        <div className="panel-sub rounded-lg p-2.5 border border-slate-800/60 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">Payload</span>
          <span
            className={`mt-1 text-xs font-mono font-semibold ${
              state.payload_on ? 'text-amber-400' : 'text-cyan-300'
            }`}
          >
            {state.payload_on ? 'ON' : 'OFF'}
          </span>
        </div>

        <div className="panel-sub rounded-lg p-2.5 border border-slate-800/60 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">Heater</span>
          <span
            className={`mt-1 text-xs font-mono font-semibold ${
              state.heater_on ? 'text-cyan-300' : 'text-slate-400'
            }`}
          >
            {state.heater_on ? 'ON' : 'OFF'}
          </span>
        </div>

        <div className="panel-sub rounded-lg p-2.5 border border-slate-800/60 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">Sun Pointing</span>
          <span
            className={`mt-1 text-xs font-mono font-semibold ${
              state.sun_pointing ? 'text-cyan-300' : 'text-slate-400'
            }`}
          >
            {state.sun_pointing ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>
    </aside>
  );
};

/**
 * Center Visual Focal Point of Mission Control: Large Orbital Scene
 */
export const OrbitalSceneStage: React.FC<{
  state: PhysicalState;
  activeEvent: MissionReplayEvent | null;
}> = ({ state, activeEvent }) => {
  const isEclipse = state.tick <= SCENARIO_CONFIG.eclipseEndTick;
  const isBlocked = activeEvent?.interlock === 'BLOCKED';
  const isSuccess = activeEvent?.oracleStatus === 'SUCCESS';

  // Compute orbital coordinates along a quadratic Bezier curve from (70, 290) through (380, 70) to (690, 290)
  // Ticks 0..10 map to t = tick / 10
  const getPointOnOrbit = (tick: number) => {
    const t = Math.min(Math.max(tick / 10, 0), 1);
    const p0 = { x: 68, y: 278 };
    const p1 = { x: 380, y: 68 };
    const p2 = { x: 692, y: 278 };
    const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
    const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
    return { x, y };
  };

  const satPos = getPointOnOrbit(state.tick);
  // Boundary between eclipse (tick 5) and sunlight (tick 6) is around t = 0.55
  const eclipseBoundaryPos = getPointOnOrbit(5.5);

  const rotationAngle = state.sun_pointing
    ? -12
    : state.rate_mdps === 6000
    ? 38
    : state.rate_mdps === 4000
    ? 24
    : state.rate_mdps === 2000
    ? 11
    : 0;

  return (
    <section
      aria-label="Orbital Visualization Stage"
      className="panel-surface border border-slate-800/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between h-full relative overflow-hidden"
    >
      {/* Top Narrative Banner inside Stage */}
      <div className="flex flex-wrap items-start justify-between gap-3 z-10">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold tracking-wide uppercase ${
                isSuccess
                  ? 'text-cyan-300'
                  : isBlocked
                  ? 'text-rose-400'
                  : isEclipse
                  ? 'text-amber-400'
                  : 'text-cyan-300'
              }`}
            >
              {activeEvent
                ? activeEvent.phaseTitle
                : 'ECLIPSE CASCADE — INITIAL ANOMALY STATE'}
            </span>
          </div>
          <p className="text-sm text-slate-300 mt-0.5">
            {activeEvent
              ? activeEvent.phaseConditionSummary
              : 'Payload active (3 Wh/tick draw) · Attitude rate high (6000 mdps) · Energy declining · No sun pointing'}
          </p>
        </div>

        <div className="text-right font-mono text-xs shrink-0">
          <div className="text-slate-400">
            Scenario: <span className="text-slate-200">{SCENARIO_CONFIG.scenarioId}</span>
          </div>
          <div className="text-slate-400">
            Tick <strong className="text-slate-100">{state.tick}</strong> of{' '}
            {SCENARIO_CONFIG.missionDeadlineTick}
          </div>
        </div>
      </div>

      {/* Central Curved Earth Limb & Orbital Trajectory SVG */}
      <div className="my-auto py-1 flex items-center justify-center">
        <svg
          viewBox="0 0 760 365"
          className="w-full max-h-[340px] select-none"
          role="img"
          aria-label="Spacecraft orbital trajectory across Earth eclipse shadow ticks 0 to 5 and solar illumination ticks 6 to 9"
        >
          <defs>
            {/* Earth Atmospheric Glow Gradient */}
            <radialGradient id="earthAtmoGlow" cx="50%" cy="100%" r="75%" fx="50%" fy="100%">
              <stop offset="0%" stopColor="#083344" stopOpacity="0.55" />
              <stop offset="55%" stopColor="#0F172A" stopOpacity="0.35" />
              <stop offset="82%" stopColor="#38BDF8" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#050811" stopOpacity="0" />
            </radialGradient>

            {/* Earth Body Gradient */}
            <linearGradient id="earthBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#040B16" />
              <stop offset="65%" stopColor="#081426" />
              <stop offset="100%" stopColor="#0C223B" />
            </linearGradient>

            {/* Sunlight Corridor Glow */}
            <linearGradient id="sunlightZoneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.02" />
              <stop offset="45%" stopColor="#06B6D4" stopOpacity="0.11" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.14" />
            </linearGradient>

            {/* Eclipse Shadow Gradient */}
            <linearGradient id="eclipseZoneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#020617" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {/* Subtle coordinate reference rings */}
          <circle
            cx="380"
            cy="580"
            r="465"
            fill="none"
            stroke="rgba(51, 65, 85, 0.25)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          <circle
            cx="380"
            cy="580"
            r="395"
            fill="none"
            stroke="rgba(51, 65, 85, 0.2)"
            strokeWidth="1"
          />

          {/* Eclipse vs Sunlight Background Regions */}
          <path
            d="M 20 35 L 408 35 L 385 335 L 20 335 Z"
            fill="url(#eclipseZoneGrad)"
          />
          <path
            d="M 408 35 L 740 35 L 740 335 L 385 335 Z"
            fill="url(#sunlightZoneGrad)"
          />

          {/* Terminator Line (Eclipse Exit at Tick 6) */}
          <line
            x1={eclipseBoundaryPos.x}
            y1="35"
            x2={eclipseBoundaryPos.x - 16}
            y2="288"
            stroke="rgba(34, 211, 238, 0.35)"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <g transform={`translate(${eclipseBoundaryPos.x - 16}, 304)`}>
            <rect
              x="-88"
              y="-11"
              width="176"
              height="16"
              rx="3"
              fill="rgba(5, 11, 22, 0.85)"
              stroke="rgba(34, 211, 238, 0.3)"
              strokeWidth="1"
            />
            <text
              x="0"
              y="0"
              textAnchor="middle"
              className="fill-cyan-300/90 text-[9.5px] font-mono"
            >
              ILLUMINATION ENTRY (TICK 6)
            </text>
          </g>

          {/* Zone Labels */}
          <text x="36" y="54" className="fill-amber-400/90 text-[11px] font-mono font-medium">
            ECLIPSE SHADOW ZONE (TICKS 0–5)
          </text>
          <text
            x="724"
            y="54"
            textAnchor="end"
            className="fill-cyan-300/90 text-[11px] font-mono font-medium"
          >
            SOLAR ILLUMINATION ZONE (TICKS 6–9)
          </text>

          {/* Solar Rays on Right Side */}
          <g stroke="rgba(251, 191, 36, 0.22)" strokeWidth="1">
            <line x1="755" y1="88" x2="670" y2="108" />
            <line x1="755" y1="128" x2="655" y2="148" />
            <line x1="755" y1="168" x2="670" y2="188" />
          </g>

          {/* Curved Earth Atmosphere Halo */}
          <ellipse cx="380" cy="560" rx="460" ry="270" fill="url(#earthAtmoGlow)" />

          {/* Curved Earth Limb */}
          <ellipse
            cx="380"
            cy="575"
            rx="430"
            ry="255"
            fill="url(#earthBodyGrad)"
            stroke="rgba(56, 189, 248, 0.45)"
            strokeWidth="1.5"
          />

          {/* Full Orbital Trajectory Curve */}
          <path
            d="M 68 278 Q 380 68 692 278"
            fill="none"
            stroke="rgba(148, 163, 184, 0.35)"
            strokeWidth="2"
            strokeDasharray="5 5"
          />

          {/* Tick Nodes 0..10 along Orbital Arc */}
          {Array.from({ length: 11 }).map((_, tickIdx) => {
            const pt = getPointOnOrbit(tickIdx);
            const isCurrentTick = state.tick === tickIdx;
            const isPastTick = state.tick > tickIdx;
            const isDeadline = tickIdx === 10;

            return (
              <g key={tickIdx} transform={`translate(${pt.x}, ${pt.y})`}>
                <circle
                  r={isCurrentTick ? 7 : isDeadline ? 5 : 4}
                  fill={
                    isCurrentTick
                      ? '#22D3EE'
                      : isPastTick
                      ? '#0891B2'
                      : isDeadline
                      ? '#881337'
                      : '#0F172A'
                  }
                  stroke={
                    isCurrentTick
                      ? '#E0F2FE'
                      : isDeadline
                      ? '#F43F5E'
                      : isPastTick
                      ? '#22D3EE'
                      : '#475569'
                  }
                  strokeWidth={isCurrentTick ? '2' : '1.5'}
                />
                <text
                  x="0"
                  y="20"
                  textAnchor="middle"
                  className={`text-[10px] font-mono ${
                    isCurrentTick
                      ? 'fill-cyan-200 font-bold'
                      : isDeadline
                      ? 'fill-rose-400 font-semibold'
                      : 'fill-slate-400'
                  }`}
                >
                  {isDeadline ? 'T10 END' : `T${tickIdx}`}
                </text>
              </g>
            );
          })}

          {/* Dynamic Spacecraft Schematic at Current Position */}
          <g
            transform={`translate(${satPos.x}, ${satPos.y - 36})`}
            className="transition-all duration-300"
          >
            {/* Tether line down to current orbital tick node */}
            <line
              x1="0"
              y1="16"
              x2="0"
              y2="36"
              stroke={isBlocked ? '#F43F5E' : '#22D3EE'}
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />

            {/* Outer Attitude / Spin Ring */}
            <circle
              cx="0"
              cy="0"
              r="24"
              fill="rgba(5, 8, 17, 0.85)"
              stroke={
                isBlocked
                  ? '#F43F5E'
                  : state.rate_mdps > 1000
                  ? '#F59E0B'
                  : '#22D3EE'
              }
              strokeWidth="1.5"
            />

            {/* Spin Arc Indicator when rate > 0 */}
            {state.rate_mdps > 0 && (
              <path
                d="M -18 -10 A 20 20 0 0 1 18 -10"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="1.5"
              />
            )}

            {/* Rotating Spacecraft Bus & Solar Wings */}
            <g transform={`rotate(${rotationAngle})`}>
              {/* Left Solar Wing */}
              <rect
                x="-21"
                y="-3.5"
                width="13"
                height="7"
                rx="1"
                fill={state.sun_pointing ? '#06B6D4' : '#1E293B'}
                stroke={state.sun_pointing ? '#A5F3FC' : '#64748B'}
                strokeWidth="1"
              />
              {/* Right Solar Wing */}
              <rect
                x="8"
                y="-3.5"
                width="13"
                height="7"
                rx="1"
                fill={state.sun_pointing ? '#06B6D4' : '#1E293B'}
                stroke={state.sun_pointing ? '#A5F3FC' : '#64748B'}
                strokeWidth="1"
              />
              {/* Central Spacecraft Bus */}
              <rect
                x="-7"
                y="-7"
                width="14"
                height="14"
                rx="2"
                fill="#0F172A"
                stroke="#E2E8F0"
                strokeWidth="1.2"
              />
              {/* Internal Heater / Payload Indicator */}
              {state.heater_on ? (
                <circle cx="0" cy="0" r="3" fill="#38BDF8" />
              ) : state.payload_on ? (
                <circle cx="0" cy="0" r="3" fill="#F59E0B" />
              ) : null}
            </g>

            {/* Floating Callout Pill Next to Satellite */}
            <g transform="translate(0, -34)">
              <rect
                x="-68"
                y="-12"
                width="136"
                height="20"
                rx="4"
                fill="rgba(8, 13, 24, 0.92)"
                stroke={
                  isBlocked
                    ? 'rgba(244, 63, 94, 0.7)'
                    : isSuccess
                    ? 'rgba(34, 211, 238, 0.8)'
                    : 'rgba(71, 85, 105, 0.7)'
                }
                strokeWidth="1"
              />
              <text
                x="0"
                y="1"
                textAnchor="middle"
                className={`text-[10px] font-mono font-semibold ${
                  isBlocked
                    ? 'fill-rose-300'
                    : isSuccess
                    ? 'fill-cyan-300'
                    : 'fill-slate-200'
                }`}
              >
                {isBlocked
                  ? 'BLOCKED · NO MUTATION'
                  : isSuccess
                  ? 'RECOVERY ACHIEVED'
                  : `${state.energy_wh}Wh · ${state.rate_mdps}mdps`}
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* Bottom Condition Summary Bar inside Orbital Stage */}
      <div className="pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-3 text-slate-300">
          <span>
            Payload:{' '}
            <strong className={state.payload_on ? 'text-amber-400' : 'text-cyan-300'}>
              {state.payload_on ? 'Active (3 Wh/tick)' : 'Shed (OFF)'}
            </strong>
          </span>
          <span className="text-slate-600">·</span>
          <span>
            Heater:{' '}
            <strong className={state.heater_on ? 'text-cyan-300' : 'text-slate-400'}>
              {state.heater_on ? 'Enabled' : 'OFF'}
            </strong>
          </span>
          <span className="text-slate-600">·</span>
          <span>
            Sun Lock:{' '}
            <strong className={state.sun_pointing ? 'text-cyan-300' : 'text-slate-400'}>
              {state.sun_pointing ? 'Acquired' : 'OFF'}
            </strong>
          </span>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          LOCAL_REFERENCE · SCRIPTED DETERMINISTIC BASELINE · NOT A BEAM REASONING CLAIM
        </div>
      </div>
    </section>
  );
};
