# Project Description

## BEAM MISSION CONTROL — Save the Satellite

BEAM MISSION CONTROL is a synthetic spacecraft-recovery demonstrator built around a simple question:

> How can an AI model contribute useful reasoning to a time-constrained recovery task without being trusted as the safety authority?

The prototype separates the system into two roles.

**The model-facing role** receives a synthetic spacecraft state, versioned mission evidence, and a small typed action set. It is expected to reason over the available evidence, distinguish current from superseded records, and propose a recovery action with an evidence citation.

**The deterministic control role** does not trust model prose. It validates the proposal schema, checks the cited evidence, evaluates action preconditions and predicted safety bounds, applies only permitted state transitions, and independently computes the mission outcome.

## Scenario

The demonstration uses one intentionally compact synthetic scenario: an eclipse-related power / thermal / attitude cascade.

The spacecraft begins with limited energy, a high attitude rate, payload and heater configuration constraints, and a deterministic illumination schedule. Recovery requires coordinated actions rather than one isolated command.

The scenario is an engineering demonstrator. Its numerical values are synthetic and illustrative; the project does not claim flight dynamics fidelity, hardware certification, or suitability for real spacecraft operations.

## Beam's intended role

Beam is not the simulator and not the Safety Interlock. Its role is to produce bounded action proposals from the mission context.

The logical task is designed to require the model to:

- read the current spacecraft state;
- reason over versioned records, including `CURRENT` and `SUPERSEDED` evidence;
- choose among typed recovery actions;
- cite the evidence record supporting the proposal;
- react to deterministic rejection feedback in a complete mission-loop extension;
- remain outside the authority that changes spacecraft state.

This is the project's central safety thesis: **AI reasoning can be useful without granting the AI direct control authority.**

## What the current public release demonstrates

The public reviewer interface demonstrates the full deterministic safety/replay path using a disclosed `LOCAL_REFERENCE` baseline. That baseline is intentionally labelled as scripted and is not represented as Beam output.

The release also exposes a separate live-calibration evidence view. The preserved real provider attempt made one HTTP send and returned HTTP 503. No admissible Beam output was captured, so this release does not claim a successful Beam-generated recovery action from that attempt.

This limitation is deliberate and visible. A failed live attempt is retained as evidence rather than rewritten as a successful inference.

## Why the evidence architecture matters

The project keeps separate questions separate:

1. **Was the local mission trace internally consistent?**
2. **Did the deterministic replay reproduce the recorded safety decisions and transitions?**
3. **Was a live provider interaction observed?**
4. **Can the exact provider/model origin be independently authenticated?**

A positive answer to one question does not automatically prove the others.

## Reviewer experience

The application is organized into four views:

- **Mission Control** — causal action/safety/state/oracle view;
- **Replay** — deterministic event-by-event reconstruction;
- **Evidence** — versioned mission evidence and technical provenance;
- **Live Attempt** — truthful live-attempt evidence and its epistemic limits.

The intended reviewer route is documented in [START-HERE.md](START-HERE.md).
