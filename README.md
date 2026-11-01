---
title: BEAM MISSION CONTROL — Save the Satellite
emoji: 🛰️
colorFrom: blue
colorTo: indigo
sdk: static
app_build_command: npm run build
app_file: dist/index.html
pinned: false
fullWidth: true
header: mini
short_description: Satellite mission control with deterministic safety checks.
---

# BEAM MISSION CONTROL — Save the Satellite

**Build with Beam 2026 — public reviewer release**

BEAM MISSION CONTROL is a research/engineering prototype for a synthetic spacecraft recovery scenario. The model-facing layer proposes actions; deterministic systems outside the model decide whether those actions are admissible, apply allowed state transitions, compute the mission outcome, and preserve an inspectable evidence trail.

> **Evidence boundary:** the deterministic `LOCAL_REFERENCE` mission replay shown in the app is a scripted baseline used to validate the safety architecture. It is **not** presented as Beam reasoning. Live-attempt evidence and its limitations are documented separately below.

## Judge quick start

If you are viewing this repository as a Hugging Face Space, open the **App** tab. No local setup is required. Static Spaces support a React/Vite build step, and this repository is configured to build `dist/index.html` automatically.

For a 30–60 second guided route, see **[START-HERE.md](START-HERE.md)**.

Recommended path through the app:

**Mission Control → Replay → Evidence → Live Attempt**

## What Beam is asked to do

The project is designed around a narrow, auditable role for Beam:

1. receive a synthetic spacecraft state;
2. inspect versioned mission evidence, including `CURRENT` and `SUPERSEDED` records;
3. select a typed recovery action and cite its supporting evidence;
4. return a proposal, not direct control authority;
5. allow a deterministic Safety Interlock to accept or reject the proposal;
6. allow a deterministic simulator and Mission Oracle to compute the resulting state and outcome.

The model is therefore inside the reasoning loop but **outside the authority boundary**.

## What the four views show

- **Mission Control** — spacecraft telemetry, action proposal, evidence citation, Safety Interlock decision, state effect, and Mission Oracle status.
- **Replay** — the deterministic `LOCAL_REFERENCE` event sequence and the distinction between proposal/event numbers and physical mission ticks.
- **Evidence** — the mission evidence archive, including current versus superseded engineering records and the evidence attached to each proposal.
- **Live Attempt** — public evidence from the separately executed live calibration attempt preserved for this release. It ended with HTTP 503 and produced no admissible model output.

## Architecture in one line

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

See **[ARCHITECTURE-AND-SAFETY.md](ARCHITECTURE-AND-SAFETY.md)** for the public architecture summary.

## Evidence and claim boundaries

The repository intentionally separates three different claims:

- **local deterministic replay** — demonstrable and inspectable in the UI;
- **live interaction evidence** — represented only by the separately captured live-attempt facts shown in the Live Attempt view;
- **provider/model provenance** — not independently authenticated by this release and therefore not claimed as verified.

The public **Live Attempt** view records the real provider attempt preserved for this release: one application HTTP send, HTTP 503, no admissible model output, no calibration event, replay not evaluated, and provider/model provenance `UNVERIFIED`. These facts are intentionally separated from the successful `LOCAL_REFERENCE` replay.

See **[EVIDENCE-AND-LIMITATIONS.md](EVIDENCE-AND-LIMITATIONS.md)**.

## Run locally — easiest Windows path

Prerequisite: Node.js compatible with Vite 8 (`^20.19.0` or `>=22.12.0`).

Double-click:

```text
START-BEAM-MISSION-CONTROL.cmd
```

The launcher:

- checks that Node.js and npm are available;
- installs the locked dependencies with `npm ci` on the first run;
- starts the local Vite server, preferring `127.0.0.1:4173`; if that port is busy, Vite selects the next available local port;
- opens the actual local app URL in the default browser.

The first local launch can take longer while npm installs the locked dependencies. The repository explicitly allows only the pinned `esbuild@0.28.2` install script required by the locked toolchain; it does not enable arbitrary dependency scripts. Because the convenience `.cmd` is not code-signed, Windows may display an `Unknown Publisher` warning after download; reviewers should run it only when obtained from this repository.

Close the server window or press `Ctrl+C` to stop it.

macOS/Linux users can run:

```bash
./START-BEAM-MISSION-CONTROL.sh
```

## Manual local run

```bash
npm ci
npm run lint
npm run build
npm run dev
```

The development script normally uses port `3000` and may select another port if it is occupied.

## Repository map

```text
README.md                         ← public project entry point / Hugging Face Space config
START-HERE.md                     ← 30–60 second reviewer route
PROJECT-DESCRIPTION.md            ← competition-facing project description
ARCHITECTURE-AND-SAFETY.md        ← public architecture and trust boundaries
EVIDENCE-AND-LIMITATIONS.md       ← exact claim/evidence boundary
AI-ASSISTANCE-DISCLOSURE.md       ← development-assistance disclosure
THIRD-PARTY-NOTICE.md             ← dependency/license notices
RELEASE-MANIFEST.sha256           ← hashes for the public release files
START-BEAM-MISSION-CONTROL.cmd     ← one-click Windows launcher
START-BEAM-MISSION-CONTROL.sh      ← macOS/Linux launcher
src/                              ← reviewer UI source
package.json / package-lock.json  ← dependency definition and lock
```

## Static release characteristics

This public reviewer application contains:

- no API key or secret;
- no runtime Beam/Gemini/provider call;
- no backend server;
- no user account or upload flow;
- no real spacecraft control;
- no claim of flight software, certification, or spacecraft-physics fidelity.

All mission values in the reviewer interface are synthetic engineering-demonstrator values.

## Development assistance

This project was developed with AI-assisted engineering, coding, review, and documentation workflows. The development-assistance disclosure is separate from evidence of Beam runtime behavior. See **[AI-ASSISTANCE-DISCLOSURE.md](AI-ASSISTANCE-DISCLOSURE.md)**.

## Third-party software

Runtime and build dependencies remain under their respective upstream licenses. See **[THIRD-PARTY-NOTICE.md](THIRD-PARTY-NOTICE.md)** and `package-lock.json` for the locked dependency graph.
