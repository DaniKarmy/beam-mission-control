import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import {
  INITIAL_PHYSICAL_STATE,
  REFERENCE_REPLAY_EVENTS,
  SCENARIO_CONFIG,
} from './data/missionData';
import {
  OrbitalTelemetryCard,
  OrbitalSceneStage,
} from './components/OrbitalTelemetryCard';
import { ProposalAndInterlock } from './components/ProposalAndInterlock';
import {
  CausalTimeline,
  MissionControlBottomStrip,
} from './components/CausalTimeline';
import { EvidenceArchive } from './components/EvidenceArchive';
import { LiveCalibrationView } from './components/LiveCalibrationView';
import { TooltipInfo } from './components/TooltipInfo';

export type AppView = 'MISSION_CONTROL' | 'REPLAY' | 'EVIDENCE' | 'LIVE_ATTEMPT';

const NAV_ITEMS: { id: AppView; label: string }[] = [
  { id: 'MISSION_CONTROL', label: 'Mission Control' },
  { id: 'REPLAY', label: 'Replay' },
  { id: 'EVIDENCE', label: 'Evidence' },
  { id: 'LIVE_ATTEMPT', label: 'Live Attempt' },
];

export default function App() {
  // Default to MISSION_CONTROL view
  const [activeView, setActiveView] = useState<AppView>('MISSION_CONTROL');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Sync fullscreen button state when entering/exiting fullscreen (including via Escape key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {
      // Silently ignore if Fullscreen API is unavailable or restricted
    }
  };

  // Default to Event 1 (index 0) so initial physical state (T0, 60Wh, 10.0°C, 6000mdps)
  // AND the first blocked SUN_POINT proposal (PRECONDITION_RATE) are immediately visible
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [highlightedEvidenceId, setHighlightedEvidenceId] = useState<string | null>(null);

  const activeEvent =
    selectedEventIndex !== null ? REFERENCE_REPLAY_EVENTS[selectedEventIndex] : null;

  const currentPhysicalState = activeEvent
    ? activeEvent.postState
    : INITIAL_PHYSICAL_STATE;

  const prePhysicalState = activeEvent
    ? activeEvent.preState
    : INITIAL_PHYSICAL_STATE;

  // Reset scroll position to top whenever switching application views
  const switchView = (view: AppView) => {
    setActiveView(view);
    setMobileMenuOpen(false);
    if (view === 'LIVE_ATTEMPT') {
      setIsPlaying(false);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  };

  // Auto-advance timer when PLAY is active
  useEffect(() => {
    if (!isPlaying) return;

    const timer = window.setInterval(() => {
      setSelectedEventIndex((prev) => {
        if (prev === null) return 0;
        if (prev < REFERENCE_REPLAY_EVENTS.length - 1) {
          return prev + 1;
        }
        setIsPlaying(false);
        return prev;
      });
    }, 1400);

    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const handleReset = () => {
    setIsPlaying(false);
    setSelectedEventIndex(0);
  };

  const handlePrevious = () => {
    setIsPlaying(false);
    setSelectedEventIndex((prev) => {
      if (prev === null) return null;
      if (prev === 0) return null;
      return prev - 1;
    });
  };

  const handleStep = () => {
    setIsPlaying(false);
    setSelectedEventIndex((prev) => {
      if (prev === null) return 0;
      if (prev < REFERENCE_REPLAY_EVENTS.length - 1) return prev + 1;
      return prev;
    });
  };

  const handleTogglePlay = () => {
    if (selectedEventIndex === REFERENCE_REPLAY_EVENTS.length - 1) {
      setSelectedEventIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const handleOpenEvidenceRecord = (evidenceId: string) => {
    setHighlightedEvidenceId(evidenceId);
    switchView('EVIDENCE');
  };

  return (
    <div className="min-h-screen w-full command-center-bg text-slate-100 flex flex-col overflow-x-hidden">
      {/* Compact Sticky Top Navigation Bar (Fits cleanly at 1200-1440px with zero clipping) */}
      <header className="sticky top-0 z-40 bg-[#050811]/95 backdrop-blur border-b border-slate-800/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4 lg:gap-8">
          {/* Zone 1: Brand Title (Single-line, never clips) */}
          <button
            type="button"
            onClick={() => switchView('MISSION_CONTROL')}
            className="text-left text-sm sm:text-base font-display font-bold tracking-wide text-slate-100 hover:text-cyan-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            BEAM MISSION CONTROL · Save the Satellite
          </button>

          {/* Zone 2: 4 Concise View Navigation Links */}
          <nav
            aria-label="Application Views"
            className="hidden md:flex items-center gap-5 lg:gap-7 text-xs sm:text-sm font-medium"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => switchView(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                    isActive
                      ? 'border-cyan-400 text-cyan-300 font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Full Screen Control + Mobile Hamburger */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleToggleFullscreen}
              aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
              className="px-3 py-1.5 text-xs font-mono font-medium text-slate-200 bg-[#080C16] border border-slate-700/80 rounded-lg hover:border-cyan-500/50 hover:text-cyan-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isFullscreen ? '⛶ EXIT FULL SCREEN' : '⛶ FULL SCREEN'}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg border border-slate-800 cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Responsive Mobile Drawer (< md) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-[#070B14] px-4 py-3 flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => switchView(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-cyan-950/60 text-cyan-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Sub-header Claim Boundary & Operational Provenance Ribbon */}
      <div className="border-b border-slate-800/60 bg-[#060913]/90">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[11px] font-mono">
          <div className="flex flex-wrap items-center gap-2 text-amber-300/95">
            <span>SYNTHETIC RESEARCH / ENGINEERING PROTOTYPE</span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span>NOT FLIGHT SOFTWARE</span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span>NO REAL SPACECRAFT CONTROL</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-slate-300">
            <span>SYNTHETIC</span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="text-cyan-300">C2 FROZEN</span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="text-cyan-300">
              <TooltipInfo term="Safety Interlock" label="SAFETY INTERLOCK ACTIVE" />
            </span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="text-amber-300">
              <TooltipInfo term="Provenance" label="PROVENANCE: UNVERIFIED" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Application View Container — Renders ONLY the Active View */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-3.5 flex flex-col justify-between">
        {activeView === 'MISSION_CONTROL' && (
          <div className="flex flex-col gap-3.5 h-full">
            {/* 3-Column Command Center Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
              {/* LEFT SIDE: SPACECRAFT TELEMETRY (3 cols) */}
              <div className="lg:col-span-3">
                <OrbitalTelemetryCard
                  state={currentPhysicalState}
                  preState={prePhysicalState}
                  activeEvent={activeEvent}
                />
              </div>

              {/* CENTER: VISUAL FOCAL POINT — LARGE ORBITAL SCENE (5 cols) */}
              <div className="lg:col-span-5">
                <OrbitalSceneStage
                  state={currentPhysicalState}
                  activeEvent={activeEvent}
                />
              </div>

              {/* RIGHT SIDE: VERTICAL DECISION CHAIN (4 cols) */}
              <div className="lg:col-span-4">
                <ProposalAndInterlock
                  event={activeEvent}
                  onInspectEvidence={handleOpenEvidenceRecord}
                />
              </div>
            </div>

            {/* BOTTOM: COMPACT MISSION STRIP & CONTROLS */}
            <MissionControlBottomStrip
              events={REFERENCE_REPLAY_EVENTS}
              selectedEventIndex={selectedEventIndex}
              isPlaying={isPlaying}
              onSelectEventIndex={(idx) => {
                setIsPlaying(false);
                setSelectedEventIndex(idx);
              }}
              onReset={handleReset}
              onPrevious={handlePrevious}
              onStep={handleStep}
              onTogglePlay={handleTogglePlay}
            />
          </div>
        )}

        {activeView === 'REPLAY' && (
          <CausalTimeline
            events={REFERENCE_REPLAY_EVENTS}
            selectedEventIndex={selectedEventIndex}
            isPlaying={isPlaying}
            onSelectEventIndex={(idx) => {
              setIsPlaying(false);
              setSelectedEventIndex(idx);
            }}
            onReset={handleReset}
            onPrevious={handlePrevious}
            onStep={handleStep}
            onTogglePlay={handleTogglePlay}
            onInspectEvidence={handleOpenEvidenceRecord}
          />
        )}

        {activeView === 'EVIDENCE' && (
          <EvidenceArchive
            activeEvent={activeEvent}
            highlightedEvidenceId={highlightedEvidenceId}
            onSelectRecord={(id) => setHighlightedEvidenceId(id)}
          />
        )}

        {activeView === 'LIVE_ATTEMPT' && (
          <LiveCalibrationView
            onReturnToMissionControl={() => switchView('MISSION_CONTROL')}
          />
        )}
      </main>

      {/* Quiet Compact Footer */}
      <footer className="border-t border-slate-800/60 bg-[#050811] px-4 sm:px-6 py-2.5">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
          <div>
            BEAM MISSION CONTROL · Scenario {SCENARIO_CONFIG.scenarioId} · Contract{' '}
            {SCENARIO_CONFIG.contractId}
          </div>
          <div>
            {activeView === 'LIVE_ATTEMPT'
              ? 'LIVE CALIBRATION EVIDENCE · NO ADMISSIBLE MODEL OUTPUT · PROVIDER/MODEL PROVENANCE UNVERIFIED'
              : 'LOCAL_REFERENCE · SCRIPTED DETERMINISTIC BASELINE · NOT A BEAM REASONING CLAIM'}
          </div>
        </div>
      </footer>
    </div>
  );
}
