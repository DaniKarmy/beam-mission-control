# Architecture & Safety

## Design objective

The architecture is designed to prevent a model proposal from becoming a state mutation merely because the model produced it.

The model is a reasoning component. It is not the safety authority.

## Public pipeline

```text
Synthetic mission state + versioned evidence + typed actions
                         ↓
                  model proposal
                  (untrusted input)
                         ↓
                strict typed parsing
                         ↓
                 evidence validation
                         ↓
            deterministic Safety Interlock
                ↙                    ↘
            REJECT                    PERMIT
     no physical mutation               ↓
                                deterministic simulator
                                        ↓
                               deterministic Mission Oracle
                                        ↓
                               event / evidence record
                                        ↓
                                  replay / reviewer UI
```

## Trust boundaries

### Model output is untrusted

The system does not treat natural-language confidence, rationale, or self-declared permission as authority. The meaningful output boundary is a typed proposal.

### Evidence is data, not instruction

Mission records can be `CURRENT` or `SUPERSEDED`. A citation must point to the correct supporting record. Evidence content is displayed and validated as declarative engineering data; it is never executed as an instruction stream.

### Safety Interlock is deterministic

The Safety Interlock evaluates the current state, proposal structure, evidence status, action preconditions, and predicted safety bounds. A rejected action produces no prohibited physical state mutation.

### Simulator does not accept unchecked authority

State transitions are deterministic and occur only after the permission boundary. The public architecture is intentionally narrower than a real spacecraft control stack.

### Mission Oracle is independent of model claims

The mission outcome is computed from state/history predicates. The model cannot declare the mission successful by writing `SUCCESS` in prose.

### Replay and provider provenance are different claims

A trace may replay consistently without proving which external model produced an earlier response. The UI therefore does not use replay consistency as proof of Beam/provider origin.

## Typed action surface

The synthetic demonstrator uses a small allowlisted action vocabulary:

- `SHED_PAYLOAD`
- `SET_HEATER`
- `DETUMBLE`
- `SUN_POINT`
- `WAIT`
- `SAFE_STOP`

The UI shows the evidence citation and deterministic decision attached to each reference event.

## Fail-closed behavior

The design treats malformed, stale, unsupported, unsafe, or insufficiently evidenced proposals as controlled rejection conditions. Rejection preserves the physical state for that proposal event.

`SAFE_STOP` is a legitimate software outcome. It is not represented as proof that a real spacecraft has been stabilized.

## Static public application boundary

This repository contains the reviewer-facing static React/Vite application only.

The public UI has:

- no API key or credential;
- no runtime provider call;
- no backend server;
- no arbitrary network/tool execution path;
- no real telemetry or spacecraft control.

The Live Attempt screen displays sanitized public evidence that was produced outside the static application.

## Scope disclaimer

This is a synthetic research/engineering prototype, not flight software, a certified digital twin, or an operational spacecraft controller. The scenario parameters are illustrative and are not a claim of real spacecraft physics or flight-grade safety thresholds.
