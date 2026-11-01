# BEAM MISSION CONTROL — Save the Satellite

**Build with Beam 2026 — public reviewer release**

BEAM MISSION CONTROL is a research/engineering prototype for a synthetic spacecraft recovery scenario. It explores a simple safety question:

> How can an AI model contribute useful reasoning without receiving direct authority to change system state?

The model-facing layer proposes typed recovery actions and cites supporting evidence. Deterministic systems outside the model validate those proposals, enforce safety constraints, apply only permitted state transitions, compute the mission outcome, and preserve an inspectable evidence trail.

## Live app

**Hugging Face Space:**  
https://huggingface.co/spaces/SolisTechLabs/beam-mission-control

Recommended reviewer route:

**Mission Control → Replay → Evidence → Live Attempt**

For a guided 30–60 second walkthrough, see [START-HERE.md](START-HERE.md).

## Core architecture

```text
model proposal (untrusted)
  → typed/schema validation
  → evidence validation
  → deterministic Safety Interlock
  → deterministic simulator transition
  → deterministic Mission Oracle
  → event/evidence record
  → replay / reviewer UI
```

The model is therefore inside the reasoning loop but **outside the authority boundary**.

## What Beam is asked to do

The project is designed around a narrow, auditable role for Beam:

1. receive a synthetic spacecraft state;
2. inspect versioned mission evidence, including `CURRENT` and `SUPERSEDED` records;
3. select a typed recovery action and cite its supporting evidence;
4. return a proposal, not direct control authority;
5. allow a deterministic Safety Interlock to accept or reject the proposal;
6. allow a deterministic simulator and Mission Oracle to compute the resulting state and outcome.

## What the app shows

- **Mission Control** — spacecraft telemetry, action proposal, evidence citation, Safety Interlock decision, state effect, and Mission Oracle status.
- **Replay** — the deterministic `LOCAL_REFERENCE` event sequence.
- **Evidence** — versioned mission records and the evidence attached to each proposal.
- **Live Attempt** — preserved public evidence from the separately executed live provider attempt.

## Evidence boundary

The deterministic `LOCAL_REFERENCE` replay is a scripted baseline used to validate the safety architecture and reviewer experience. It is **not presented as Beam reasoning**.

The preserved live attempt made one application HTTP send and returned **HTTP 503**. No admissible model output was captured, no calibration event was produced, replay was not evaluated, and provider/model provenance remains `UNVERIFIED`.

The project intentionally keeps these claims separate rather than presenting the deterministic reference trace as a successful Beam inference.

See [EVIDENCE-AND-LIMITATIONS.md](EVIDENCE-AND-LIMITATIONS.md) for the exact claim/evidence boundary.

## Run locally

### Windows

Prerequisite: Node.js compatible with Vite 8 (`^20.19.0` or `>=22.12.0`).

Double-click:

```text
START-BEAM-MISSION-CONTROL.cmd
```

The launcher installs the locked dependencies on first run, starts the local Vite server, and opens the app in the default browser.

### macOS / Linux

```bash
./START-BEAM-MISSION-CONTROL.sh
```

### Manual

```bash
npm ci
npm run lint
npm run build
npm run dev
```

## Repository map

- [START-HERE.md](START-HERE.md) — 30–60 second reviewer route
- [PROJECT-DESCRIPTION.md](PROJECT-DESCRIPTION.md) — project and competition description
- [ARCHITECTURE-AND-SAFETY.md](ARCHITECTURE-AND-SAFETY.md) — architecture and trust boundaries
- [EVIDENCE-AND-LIMITATIONS.md](EVIDENCE-AND-LIMITATIONS.md) — exact evidence and claim boundaries
- [AI-ASSISTANCE-DISCLOSURE.md](AI-ASSISTANCE-DISCLOSURE.md) — development-assistance disclosure
- [THIRD-PARTY-NOTICE.md](THIRD-PARTY-NOTICE.md) — dependency and license notices
- `src/` — reviewer UI source
- `package.json` / `package-lock.json` — dependency definition and lock

## Scope and limitations

This public reviewer application contains:

- no API key or secret;
- no runtime Beam/Gemini/provider call;
- no backend server;
- no user account or upload flow;
- no real spacecraft control;
- no claim of flight software, certification, or spacecraft-physics fidelity.

All mission values in the reviewer interface are synthetic engineering-demonstrator values.

## Development assistance

This project was developed with AI-assisted engineering, coding, review, and documentation workflows. See [AI-ASSISTANCE-DISCLOSURE.md](AI-ASSISTANCE-DISCLOSURE.md).

## Third-party software

Runtime and build dependencies remain under their respective upstream licenses. See [THIRD-PARTY-NOTICE.md](THIRD-PARTY-NOTICE.md) and `package-lock.json`.
