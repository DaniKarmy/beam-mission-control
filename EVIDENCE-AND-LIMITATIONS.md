# Evidence & Limitations

This document defines what the public release supports — and what it deliberately does not claim.

## Claim matrix

| Surface | What is shown | Supported claim | Claim not made |
|---|---|---|---|
| Mission Control | `LOCAL_REFERENCE` proposal → interlock → state → oracle chain | The static UI represents the disclosed deterministic baseline and its causal chain | That Beam generated the baseline |
| Replay | Event-by-event deterministic reference sequence | The reference sequence is inspectable as a deterministic baseline | Provider/model provenance |
| Evidence | Current/superseded records and event citations | The UI demonstrates evidence-aware action gating in the reference data | That an external provider authenticated those records |
| Live Attempt | One preserved provider attempt ending HTTP 503 | One application HTTP send was attempted and the captured public result was HTTP 503 with no admissible output | Successful Beam inference, Beam-generated recovery, or authenticated provider/model origin |
| Separate HF authentication check | Hugging Face authentication succeeded separately after the consumed attempt | A separate authentication check returned a successful Hugging Face authentication result | Beam/Baseten availability, inference success, billing state, or Beam provenance |

## LOCAL_REFERENCE

`LOCAL_REFERENCE` is a scripted deterministic baseline used to exercise the architecture and reviewer experience.

It is intentionally labelled throughout the UI as:

```text
LOCAL_REFERENCE · SCRIPTED DETERMINISTIC BASELINE · NOT A BEAM REASONING CLAIM
```

Its terminal state in the reference replay is `SUCCESS / RECOVERY_WINDOW`. That success belongs to the synthetic baseline trace only.

## Preserved live attempt

The Live Attempt view exposes the public facts retained for the latest provider attempt represented in this release:

- application HTTP attempts: `1`;
- HTTP sends: `1`;
- HTTP status: `503`;
- lifecycle: `CONSUMED`;
- termination: `CALIBRATION_ABORTED / HTTP_ERROR`;
- completion: `UNKNOWN`;
- selected Beam output: `NOT AVAILABLE`;
- extraction: `FAILED`;
- C2/interlock calibration event: `NOT PRODUCED`;
- replay: `NOT_EVALUATED`;
- billing: `UNAVAILABLE`;
- provider/model provenance: `UNVERIFIED`.

The HTTP 503 result does not establish the provider-internal cause or whether model inference began.

## Why authentication is shown separately

A separate Hugging Face authentication check succeeded after the consumed attempt, and the relevant Inference Providers permission was displayed as enabled.

Those observations narrow what can responsibly be said about the failed request, but they are not proof that Beam/Baseten executed the inference. The UI therefore keeps authentication evidence and model/provider provenance as separate concepts.

## Important limitations

### No flight-software claim

The scenario is synthetic. The project does not claim spacecraft-physics fidelity, certification, real-time flight guarantees, or operational readiness.

### No live inference in the public frontend

The static reviewer application performs no runtime Beam/provider call. It displays prepared synthetic reference data and sanitized live-attempt evidence.

### No independent provider/model authentication

Provider/model provenance is explicitly `UNVERIFIED` in the live-attempt evidence. A model label, HTTP connection, local hash, or successful replay is not treated as independent proof of origin.

### No hidden successful trace

There is no successful Beam output hidden behind the HTTP 503. The public release does not replace the failed live attempt with the scripted reference sequence.

### Build and hosting are separate from mission evidence

A successful GitHub/Hugging Face build proves that the reviewer application can be built and served. It does not prove a successful Beam inference or a spacecraft-recovery result.
