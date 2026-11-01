# AI Assistance Disclosure

BEAM MISSION CONTROL was developed with AI-assisted workflows.

AI tools were used at different stages for activities such as:

- architecture exploration;
- implementation assistance;
- test and adversarial-review assistance;
- reviewer-UI generation/refinement;
- documentation drafting and consistency review.

OpenAI ChatGPT/Codex workflows and Google AI Studio were used during the broader development process. The human project owner retained the project decisions, approvals, release selection, and responsibility for what is publicly claimed.

## Development assistance is not runtime evidence

This disclosure is intentionally separate from evidence about Beam.

An AI tool helping write code, tests, UI, or documentation does **not** establish that Beam produced a particular mission action. Runtime/provider claims are limited to the evidence described in [EVIDENCE-AND-LIMITATIONS.md](EVIDENCE-AND-LIMITATIONS.md).

## Evidence discipline

The project follows these disclosure principles:

- a generated explanation is not treated as execution evidence;
- local replay is not treated as proof of external model origin;
- model/provider provenance is not upgraded from `UNVERIFIED` because a model name or request ID appears in data;
- failed attempts that affect interpretation are preserved rather than silently rewritten;
- the public `LOCAL_REFERENCE` trace is explicitly identified as scripted.
