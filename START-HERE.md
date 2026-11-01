# START HERE — Reviewer Quick Route

If you are reviewing **BEAM MISSION CONTROL — Save the Satellite**, start with the running app. This public repository is self-contained for the reviewer path below.

## Open the app

### Recommended: Hugging Face Space

Open the **App** tab. No command line or local installation is required.

Then follow this route:

**Mission Control → Replay → Evidence → Live Attempt**

### Local Windows fallback

If you downloaded or cloned the repository on Windows, keep `START-BEAM-MISSION-CONTROL.cmd` in the same folder as `package.json` and double-click it.

On the first run, the launcher installs the locked npm dependencies with `npm ci`, so startup can take longer. The repo already contains the narrow npm install-script approval needed by the pinned `esbuild@0.28.2` build dependency; no manual `npm approve-scripts` step should be required. Later launches are faster while `node_modules` remains present. The launcher prefers `http://127.0.0.1:4173`. If that port is already in use, Vite automatically chooses the next available local port and opens the correct URL in the browser.

Windows may show an unsigned-script security warning because this convenience launcher is not code-signed. If you obtained the file from this repository, choose **Run** to continue. Keep the command window open while using the local app.

## What to inspect in about 60 seconds

### 1. Mission Control

Start with the first event. Watch the three layers together:

- spacecraft state;
- typed action proposal plus evidence citation;
- deterministic Safety Interlock decision.

The first proposal is intentionally rejected. A rejected proposal does **not** mutate the physical spacecraft state.

### 2. Replay

Open **Replay** and step through the disclosed deterministic baseline.

The important distinction is:

- an **event** records a proposal/decision;
- a **physical tick** advances only after an accepted physical action.

The `LOCAL_REFERENCE` replay reaches `SUCCESS / RECOVERY_WINDOW`. It is a scripted baseline for validating the architecture and reviewer experience — **not a Beam reasoning claim**.

### 3. Evidence

Open **Evidence**.

Inspect how `CURRENT` and `SUPERSEDED` records are distinguished, then follow an event citation into the archive. Evidence is treated as data to validate; archive text does not directly authorize a state change.

### 4. Live Attempt

Open **Live Attempt** last.

This view is intentionally separate from the successful local reference replay. It preserves the public facts from the real provider attempt represented in this release:

- one application HTTP send;
- HTTP 503;
- no admissible model output;
- no calibration event produced;
- replay not evaluated;
- provider/model provenance `UNVERIFIED`.

## Core idea

```text
model proposes
      ↓
untrusted typed proposal
      ↓
evidence + schema validation
      ↓
deterministic Safety Interlock
      ↓
permitted state transition only
      ↓
deterministic Mission Oracle
      ↓
inspectable evidence + replay
```

The model can propose. It does not receive direct authority to mutate simulator state.

## More detail

- [README.md](README.md) — project overview and local setup
- [PROJECT-DESCRIPTION.md](PROJECT-DESCRIPTION.md) — competition-facing description
- [ARCHITECTURE-AND-SAFETY.md](ARCHITECTURE-AND-SAFETY.md) — public architecture and trust boundaries
- [EVIDENCE-AND-LIMITATIONS.md](EVIDENCE-AND-LIMITATIONS.md) — exact evidence/claim boundaries
- [AI-ASSISTANCE-DISCLOSURE.md](AI-ASSISTANCE-DISCLOSURE.md) — development-assistance disclosure
- [THIRD-PARTY-NOTICE.md](THIRD-PARTY-NOTICE.md) — third-party dependency notices
