export type InterlockDecision = 'PERMITTED' | 'BLOCKED';
export type OracleStatus = 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SAFE_STOP';

export interface PhysicalState {
  tick: number;
  energy_wh: number;
  temperature_dc: number; // tenths of a degree Celsius (100 dc = 10.0 °C)
  rate_mdps: number;
  payload_on: boolean;
  heater_on: boolean;
  sun_pointing: boolean;
}

export interface PreconditionCheck {
  rule: string;
  status: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  observed: string;
  required: string;
}

export interface ProposalEnvelope {
  tool: 'SUN_POINT' | 'SHED_PAYLOAD' | 'SET_HEATER' | 'DETUMBLE' | 'WAIT';
  args: Record<string, boolean>;
  argsFormatted: string;
  evidence: string[];
  observed_state_sha256: string;
  stateBindingStatus: 'MATCH';
}

export interface MissionReplayEvent {
  eventNumber: number;
  proposedAction: string;
  proposalEnvelope: ProposalEnvelope;
  evidenceId: string;
  interlock: InterlockDecision;
  decisionCode: string;
  preState: PhysicalState;
  postState: PhysicalState;
  stateUnchanged: boolean;
  stateEffectLabel: string;
  stateEffectDetail: string;
  attempts: number;
  rejections: number;
  transitions: number;
  oracleStatus: OracleStatus;
  oracleCode?: string;
  phaseTitle: string;
  phaseConditionSummary: string;
  preconditionChecks: PreconditionCheck[];
}

export interface EvidenceRecord {
  id: string;
  claim: string;
  status: 'CURRENT' | 'SUPERSEDED';
  supersededBy?: string;
  text: string;
  subsystem: 'POWER' | 'ATTITUDE' | 'SOLAR' | 'THERMAL' | 'TEMPORAL';
}

export const HARD_SAFE_RANGES = {
  energy: {
    initial: 60,
    min: 10,
    max: 100,
    unit: 'Wh',
    label: '10–100 Wh',
  },
  temperature: {
    initialDc: 100,
    minDc: -100,
    maxDc: 400,
    labelDc: '-100..400 dc',
    labelCelsius: '-10.0..40.0 °C',
  },
  attitudeRate: {
    initial: 6000,
    min: 0,
    max: 20000,
    sunPointThreshold: 1000,
    unit: 'mdps',
    label: '0..20000 mdps',
  },
  deadlineTick: 10,
} as const;

export const SCENARIO_CONFIG = {
  scenarioName: 'Eclipse Power–Thermal–Attitude Cascade',
  scenarioId: 'eclipse-cascade-c1',
  contractId: 'bmc-v0-c2',
  source: 'LOCAL_REFERENCE',
  sourceClassification: 'SCRIPTED DETERMINISTIC BASELINE',
  claimBoundary: 'NOT A BEAM REASONING CLAIM',
  missionDeadlineTick: 10,
  eclipseStartTick: 0,
  eclipseEndTick: 5,
  sunlightStartTick: 6,
  sunlightEndTick: 9,
  proposalBudget: 11,
  rejectionBudget: 3,
  rawDigestNotice: 'NOT DISPLAYED IN THIS DEMO DATA',
  finalOutcome: {
    status: 'SUCCESS',
    code: 'RECOVERY_WINDOW',
    proposals: 9,
    rejections: 1,
    physicalTransitions: 8,
  },
} as const;

export const INITIAL_PHYSICAL_STATE: PhysicalState = {
  tick: 0,
  energy_wh: 60,
  temperature_dc: 100, // 10.0 °C
  rate_mdps: 6000,
  payload_on: true,
  heater_on: false,
  sun_pointing: false,
};

export const REFERENCE_REPLAY_EVENTS: MissionReplayEvent[] = [
  {
    eventNumber: 1,
    proposedAction: 'SUN_POINT',
    proposalEnvelope: {
      tool: 'SUN_POINT',
      args: {},
      argsFormatted: '{}',
      evidence: ['SUN-R1'],
      observed_state_sha256: 'NOT DISPLAYED IN THIS DEMO DATA',
      stateBindingStatus: 'MATCH',
    },
    evidenceId: 'SUN-R1',
    interlock: 'BLOCKED',
    decisionCode: 'PRECONDITION_RATE',
    preState: {
      tick: 0,
      energy_wh: 60,
      temperature_dc: 100,
      rate_mdps: 6000,
      payload_on: true,
      heater_on: false,
      sun_pointing: false,
    },
    postState: {
      tick: 0,
      energy_wh: 60,
      temperature_dc: 100,
      rate_mdps: 6000,
      payload_on: true,
      heater_on: false,
      sun_pointing: false,
    },
    stateUnchanged: true,
    stateEffectLabel: 'NO ACTUATION · STATE UNCHANGED',
    stateEffectDetail: 'NO PHYSICAL MUTATION — blocked at Safety Interlock',
    attempts: 1,
    rejections: 1,
    transitions: 0,
    oracleStatus: 'RUNNING',
    phaseTitle: 'ECLIPSE CASCADE — INTERLOCK INTERVENTION',
    phaseConditionSummary:
      'Payload active · Attitude rate high (6000 mdps) · Premature sun-pointing blocked',
    preconditionChecks: [
      {
        rule: 'rate_mdps <= 1000',
        status: 'FAIL',
        observed: '6000 mdps',
        required: '<= 1000 mdps',
      },
      {
        rule: 'Subsequent SUN_POINT checks',
        status: 'NOT_EVALUATED',
        observed: 'NOT EVALUATED AFTER FIRST REJECTION',
        required: 'Short-circuit on PRECONDITION_RATE',
      },
    ],
  },
  {
    eventNumber: 2,
    proposedAction: 'SHED_PAYLOAD',
    proposalEnvelope: {
      tool: 'SHED_PAYLOAD',
      args: {},
      argsFormatted: '{}',
      evidence: ['PWR-R2'],
      observed_state_sha256: 'NOT DISPLAYED IN THIS DEMO DATA',
      stateBindingStatus: 'MATCH',
    },
    evidenceId: 'PWR-R2',
    interlock: 'PERMITTED',
    decisionCode: 'PERMITTED',
    preState: {
      tick: 0,
      energy_wh: 60,
      temperature_dc: 100,
      rate_mdps: 6000,
      payload_on: true,
      heater_on: false,
      sun_pointing: false,
    },
    postState: {
      tick: 1,
      energy_wh: 59,
      temperature_dc: 85,
      rate_mdps: 6000,
      payload_on: false,
      heater_on: false,
      sun_pointing: false,
    },
    stateUnchanged: false,
    stateEffectLabel: 'PAYLOAD SHED (OFF)',
    stateEffectDetail: 'Tick 0 → 1 · Energy 59 Wh · Temp 8.5 °C · Payload OFF',
    attempts: 2,
    rejections: 1,
    transitions: 1,
    oracleStatus: 'RUNNING',
    phaseTitle: 'LOAD SHEDDING IN ECLIPSE',
    phaseConditionSummary:
      'Payload shed removes 3 Wh/tick draw and 500 mdps/tick attitude drift',
    preconditionChecks: [
      {
        rule: 'PWR-R2 eligibility & deadline < tick 10',
        status: 'PASS',
        observed: 'payload_on = true · tick 0',
        required: 'Deterministic policy checks passed',
      },
    ],
  },
  {
    eventNumber: 3,
    proposedAction: 'SET_HEATER(true)',
    proposalEnvelope: {
      tool: 'SET_HEATER',
      args: { enabled: true },
      argsFormatted: '{ "enabled": true }',
      evidence: ['THERM-R1'],
      observed_state_sha256: 'NOT DISPLAYED IN THIS DEMO DATA',
      stateBindingStatus: 'MATCH',
    },
    evidenceId: 'THERM-R1',
    interlock: 'PERMITTED',
    decisionCode: 'PERMITTED',
    preState: {
      tick: 1,
      energy_wh: 59,
      temperature_dc: 85,
      rate_mdps: 6000,
      payload_on: false,
      heater_on: false,
      sun_pointing: false,
    },
    postState: {
      tick: 2,
      energy_wh: 56,
      temperature_dc: 85,
      rate_mdps: 6000,
      payload_on: false,
      heater_on: true,
      sun_pointing: false,
    },
    stateUnchanged: false,
    stateEffectLabel: 'HEATER ENABLED (ON)',
    stateEffectDetail: 'Tick 1 → 2 · Energy 56 Wh · Temp stabilized at 8.5 °C',
    attempts: 3,
    rejections: 1,
    transitions: 2,
    oracleStatus: 'RUNNING',
    phaseTitle: 'THERMAL FLOOR STABILIZATION',
    phaseConditionSummary:
      'Heater enabled at 85 dc (8.5 °C) · Thermal precondition ready for detumble',
    preconditionChecks: [
      {
        rule: 'temperature_dc <= 200',
        status: 'PASS',
        observed: '85 dc (8.5 °C)',
        required: '<= 200 dc (20.0 °C)',
      },
    ],
  },
  {
    eventNumber: 4,
    proposedAction: 'DETUMBLE',
    proposalEnvelope: {
      tool: 'DETUMBLE',
      args: {},
      argsFormatted: '{}',
      evidence: ['ATT-R2'],
      observed_state_sha256: 'NOT DISPLAYED IN THIS DEMO DATA',
      stateBindingStatus: 'MATCH',
    },
    evidenceId: 'ATT-R2',
    interlock: 'PERMITTED',
    decisionCode: 'PERMITTED',
    preState: {
      tick: 2,
      energy_wh: 56,
      temperature_dc: 85,
      rate_mdps: 6000,
      payload_on: false,
      heater_on: true,
      sun_pointing: false,
    },
    postState: {
      tick: 3,
      energy_wh: 50,
      temperature_dc: 85,
      rate_mdps: 4000,
      payload_on: false,
      heater_on: true,
      sun_pointing: false,
    },
    stateUnchanged: false,
    stateEffectLabel: 'RATE DAMPED: 6000 → 4000 mdps',
    stateEffectDetail: 'Tick 2 → 3 · Energy 50 Wh · Temp 8.5 °C · Rate 4000 mdps',
    attempts: 4,
    rejections: 1,
    transitions: 3,
    oracleStatus: 'RUNNING',
    phaseTitle: 'ATTITUDE DAMPING — STAGE 1',
    phaseConditionSummary:
      'Payload off · Heater on · Rotational rate reduced to 4000 mdps',
    preconditionChecks: [
      {
        rule: 'payload_on == false && heater_on == true && sun_pointing == false && rate_mdps > 1000',
        status: 'PASS',
        observed: 'OFF · ON · OFF · 6000 mdps',
        required: 'ATT-R2 preconditions satisfied',
      },
    ],
  },
  {
    eventNumber: 5,
    proposedAction: 'DETUMBLE',
    proposalEnvelope: {
      tool: 'DETUMBLE',
      args: {},
      argsFormatted: '{}',
      evidence: ['ATT-R2'],
      observed_state_sha256: 'NOT DISPLAYED IN THIS DEMO DATA',
      stateBindingStatus: 'MATCH',
    },
    evidenceId: 'ATT-R2',
    interlock: 'PERMITTED',
    decisionCode: 'PERMITTED',
    preState: {
      tick: 3,
      energy_wh: 50,
      temperature_dc: 85,
      rate_mdps: 4000,
      payload_on: false,
      heater_on: true,
      sun_pointing: false,
    },
    postState: {
      tick: 4,
      energy_wh: 44,
      temperature_dc: 85,
      rate_mdps: 2000,
      payload_on: false,
      heater_on: true,
      sun_pointing: false,
    },
    stateUnchanged: false,
    stateEffectLabel: 'RATE DAMPED: 4000 → 2000 mdps',
    stateEffectDetail: 'Tick 3 → 4 · Energy 44 Wh · Temp 8.5 °C · Rate 2000 mdps',
    attempts: 5,
    rejections: 1,
    transitions: 4,
    oracleStatus: 'RUNNING',
    phaseTitle: 'ATTITUDE DAMPING — STAGE 2',
    phaseConditionSummary:
      'Spacecraft spin slowing · Rate reduced to 2000 mdps in eclipse shadow',
    preconditionChecks: [
      {
        rule: 'payload_on == false && heater_on == true && sun_pointing == false && rate_mdps > 1000',
        status: 'PASS',
        observed: 'OFF · ON · OFF · 4000 mdps',
        required: 'ATT-R2 preconditions satisfied',
      },
    ],
  },
  {
    eventNumber: 6,
    proposedAction: 'DETUMBLE',
    proposalEnvelope: {
      tool: 'DETUMBLE',
      args: {},
      argsFormatted: '{}',
      evidence: ['ATT-R2'],
      observed_state_sha256: 'NOT DISPLAYED IN THIS DEMO DATA',
      stateBindingStatus: 'MATCH',
    },
    evidenceId: 'ATT-R2',
    interlock: 'PERMITTED',
    decisionCode: 'PERMITTED',
    preState: {
      tick: 4,
      energy_wh: 44,
      temperature_dc: 85,
      rate_mdps: 2000,
      payload_on: false,
      heater_on: true,
      sun_pointing: false,
    },
    postState: {
      tick: 5,
      energy_wh: 38,
      temperature_dc: 90,
      rate_mdps: 0,
      payload_on: false,
      heater_on: true,
      sun_pointing: false,
    },
    stateUnchanged: false,
    stateEffectLabel: 'ATTITUDE STABILIZED (0 mdps)',
    stateEffectDetail: 'Tick 4 → 5 · Energy 38 Wh · Temp 9.0 °C · Rate 0 mdps',
    attempts: 6,
    rejections: 1,
    transitions: 5,
    oracleStatus: 'RUNNING',
    phaseTitle: 'ROTATION ARRESTED AT ECLIPSE EXIT',
    phaseConditionSummary:
      'Attitude stabilized at 0 mdps (<= 1000 mdps threshold) · Ready for sun pointing',
    preconditionChecks: [
      {
        rule: 'payload_on == false && heater_on == true && sun_pointing == false && rate_mdps > 1000',
        status: 'PASS',
        observed: 'OFF · ON · OFF · 2000 mdps',
        required: 'ATT-R2 preconditions satisfied',
      },
    ],
  },
  {
    eventNumber: 7,
    proposedAction: 'SUN_POINT',
    proposalEnvelope: {
      tool: 'SUN_POINT',
      args: {},
      argsFormatted: '{}',
      evidence: ['SUN-R1'],
      observed_state_sha256: 'NOT DISPLAYED IN THIS DEMO DATA',
      stateBindingStatus: 'MATCH',
    },
    evidenceId: 'SUN-R1',
    interlock: 'PERMITTED',
    decisionCode: 'PERMITTED',
    preState: {
      tick: 5,
      energy_wh: 38,
      temperature_dc: 90,
      rate_mdps: 0,
      payload_on: false,
      heater_on: true,
      sun_pointing: false,
    },
    postState: {
      tick: 6,
      energy_wh: 34,
      temperature_dc: 95,
      rate_mdps: 0,
      payload_on: false,
      heater_on: true,
      sun_pointing: true,
    },
    stateUnchanged: false,
    stateEffectLabel: 'SUN POINTING ACQUIRED (ON)',
    stateEffectDetail: 'Tick 5 → 6 · Energy 34 Wh · Temp 9.5 °C · Sun Pointing ON',
    attempts: 7,
    rejections: 1,
    transitions: 6,
    oracleStatus: 'RUNNING',
    phaseTitle: 'SOLAR LOCK ACQUIRED AT ILLUMINATION ENTRY',
    phaseConditionSummary:
      'Sun pointing achieved · Solar illumination available at tick 6',
    preconditionChecks: [
      {
        rule: 'rate_mdps <= 1000 && payload_on == false',
        status: 'PASS',
        observed: '0 mdps · payload OFF',
        required: '<= 1000 mdps · payload OFF',
      },
    ],
  },
  {
    eventNumber: 8,
    proposedAction: 'WAIT',
    proposalEnvelope: {
      tool: 'WAIT',
      args: {},
      argsFormatted: '{}',
      evidence: ['TIME-R1'],
      observed_state_sha256: 'NOT DISPLAYED IN THIS DEMO DATA',
      stateBindingStatus: 'MATCH',
    },
    evidenceId: 'TIME-R1',
    interlock: 'PERMITTED',
    decisionCode: 'PERMITTED',
    preState: {
      tick: 6,
      energy_wh: 34,
      temperature_dc: 95,
      rate_mdps: 0,
      payload_on: false,
      heater_on: true,
      sun_pointing: true,
    },
    postState: {
      tick: 7,
      energy_wh: 37,
      temperature_dc: 106,
      rate_mdps: 0,
      payload_on: false,
      heater_on: true,
      sun_pointing: true,
    },
    stateUnchanged: false,
    stateEffectLabel: 'SOLAR RECHARGE (+3 Wh)',
    stateEffectDetail: 'Tick 6 → 7 · Energy 37 Wh · Temp 10.6 °C · Rate 0 mdps',
    attempts: 8,
    rejections: 1,
    transitions: 7,
    oracleStatus: 'RUNNING',
    phaseTitle: 'SOLAR ILLUMINATION RECHARGE',
    phaseConditionSummary:
      'Solar arrays illuminated · Energy recovering (34 → 37 Wh) · Temp 10.6 °C',
    preconditionChecks: [
      {
        rule: 'tick < 10 (Mission deadline)',
        status: 'PASS',
        observed: 'tick 6',
        required: '< tick 10',
      },
    ],
  },
  {
    eventNumber: 9,
    proposedAction: 'WAIT',
    proposalEnvelope: {
      tool: 'WAIT',
      args: {},
      argsFormatted: '{}',
      evidence: ['TIME-R1'],
      observed_state_sha256: 'NOT DISPLAYED IN THIS DEMO DATA',
      stateBindingStatus: 'MATCH',
    },
    evidenceId: 'TIME-R1',
    interlock: 'PERMITTED',
    decisionCode: 'PERMITTED',
    preState: {
      tick: 7,
      energy_wh: 37,
      temperature_dc: 106,
      rate_mdps: 0,
      payload_on: false,
      heater_on: true,
      sun_pointing: true,
    },
    postState: {
      tick: 8,
      energy_wh: 40,
      temperature_dc: 117,
      rate_mdps: 0,
      payload_on: false,
      heater_on: true,
      sun_pointing: true,
    },
    stateUnchanged: false,
    stateEffectLabel: 'RECOVERY WINDOW ACHIEVED',
    stateEffectDetail: 'Tick 7 → 8 · Energy 40 Wh · Temp 11.7 °C · Rate 0 mdps',
    attempts: 9,
    rejections: 1,
    transitions: 8,
    oracleStatus: 'SUCCESS',
    oracleCode: 'RECOVERY_WINDOW',
    phaseTitle: 'RECOVERY WINDOW ACHIEVED · SUCCESS',
    phaseConditionSummary:
      'Spacecraft stabilized in sunlight · Energy 40 Wh · Temperature 11.7 °C · Rate 0 mdps',
    preconditionChecks: [
      {
        rule: 'tick < 10 && recovery envelope satisfied',
        status: 'PASS',
        observed: 'tick 8 · 40 Wh · 11.7 °C · 0 mdps',
        required: 'RECOVERY_WINDOW',
      },
    ],
  },
];

export const EVIDENCE_ARCHIVE: EvidenceRecord[] = [
  {
    id: 'PWR-R2',
    claim: 'shed_payload',
    status: 'CURRENT',
    subsystem: 'POWER',
    text: 'Shed the payload load to remove its 3 Wh per tick draw and 500 mdps per tick drift.',
  },
  {
    id: 'ATT-R2',
    claim: 'detumble',
    status: 'CURRENT',
    subsystem: 'ATTITUDE',
    text: 'Detumble requires payload off, heater on, no sun pointing, and rate above 1000 mdps.',
  },
  {
    id: 'SUN-R1',
    claim: 'sun_point',
    status: 'CURRENT',
    subsystem: 'SOLAR',
    text: 'Sun pointing requires payload off and rate at or below 1000 mdps; illumination starts at tick 6.',
  },
  {
    id: 'THERM-R1',
    claim: 'set_heater',
    status: 'CURRENT',
    subsystem: 'THERMAL',
    text: 'Heater on adds 15 dc and consumes 2 Wh each tick; enable at or below 200 dc, disable at or above 0 dc.',
  },
  {
    id: 'TIME-R1',
    claim: 'wait',
    status: 'CURRENT',
    subsystem: 'TEMPORAL',
    text: 'Eclipse occupies intervals starting at ticks 0 through 5; deadline endpoint is tick 10.',
  },
  {
    id: 'ATT-R1',
    claim: 'detumble',
    status: 'SUPERSEDED',
    supersededBy: 'ATT-R2',
    subsystem: 'ATTITUDE',
    text: 'Legacy attitude procedure; superseded by ATT-R2.',
  },
  {
    id: 'PWR-R1',
    claim: 'shed_payload',
    status: 'SUPERSEDED',
    supersededBy: 'PWR-R2',
    subsystem: 'POWER',
    text: 'Legacy power procedure; expired after tick 1 and superseded by PWR-R2.',
  },
];

export const LIVE_CALIBRATION_EVIDENCE = {
  header: 'LIVE CALIBRATION',
  subtitle: 'Latest provider attempt — no successful Beam output available',
  status: 'NO ADMISSIBLE MODEL OUTPUT',
  httpStatusBadge: 'HTTP 503',
  attemptBadge: 'ATTEMPT CONSUMED',
  retryBadge: 'NO RETRY',
  providerRequestAttempt: 1,
  httpSends: 1,
  httpStatus: 503,
  termination: 'CALIBRATION_ABORTED / HTTP_ERROR',
  completion: 'UNKNOWN',
  selectedBeamOutput: 'NOT AVAILABLE',
  extraction: 'FAILED',
  c2InterlockEvent: 'NOT PRODUCED',
  replay: 'NOT_EVALUATED',
  resultVerification: 'FAIL — PUBLIC_EVIDENCE_OR_ADMISSIBILITY',
  billing: 'UNAVAILABLE',
  providerModelProvenance: 'UNVERIFIED',
  separateTokenCheck: {
    header: 'HF AUTHENTICATION CHECK',
    status: 'HUGGING FACE AUTHENTICATED',
    httpStatus: 'HTTP 200',
    displayedPermission: 'Inference Providers permission displayed as enabled',
  },
  limitationSummary:
    'Authentication and displayed scope do NOT prove Beam/Baseten availability, successful inference, billing state or provider/model provenance. HTTP 503 cause remains UNDETERMINED.',
  explanatoryNote:
    'Authentication and displayed scope were verified separately after the consumed attempt. They do not establish Beam/Baseten availability, successful inference, billing state, or provider/model provenance. The cause of HTTP 503 remains undetermined.',
  inspectorData: {
    lifecycle: 'CONSUMED',
    history: 'INITIALIZE → APPROVE → CONSUME',
    consumeCount: 1,
    transportHandoffs: 1,
    httpSends: 1,
    httpStatus: 'HTTP 503',
    provider_model_provenance: 'UNVERIFIED',
  },
} as const;

export const TECHNICAL_TOOLTIPS: Record<string, { title: string; definition: string }> = {
  'Safety Interlock': {
    title: 'Deterministic Safety Interlock',
    definition:
      'An independent, deterministic rule engine outside the AI model that validates every proposed action against physical preconditions before allowing simulator state transitions.',
  },
  'Mission Oracle': {
    title: 'Deterministic Mission Oracle',
    definition:
      'An objective evaluator that inspects post-transition physical telemetry against mission recovery thresholds and deadline constraints.',
  },
  Evidence: {
    title: 'Declarative Mission Evidence',
    definition:
      'Versioned engineering specification records (CURRENT vs. SUPERSEDED) that ground action proposals. Evidence records are declarative data, never executable instructions.',
  },
  Provenance: {
    title: 'Provider & Model Provenance',
    definition:
      'Verification of whether an action sequence originated from a live remote model inference versus a local deterministic baseline.',
  },
  LOCAL_REFERENCE: {
    title: 'LOCAL_REFERENCE Baseline',
    definition:
      'A scripted, deterministic baseline sequence used to validate the C2 contract, Safety Interlock, and Mission Oracle independently of live model inference claims.',
  },
};

export function formatTempCelsius(temperature_dc: number): string {
  return (temperature_dc / 10).toFixed(1);
}
