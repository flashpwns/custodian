# Custodian

Custodian is a reusable framework for persistent, canon-aware narrative simulations.
It separates the rules that make a simulation durable—events, state, continuity,
and adjudication—from the setting-specific material that gives a world its voice.

Custodian is organized as a **Constitutional Kernel**, a versioned **World Pack
API**, and independently versioned **Reference World Packs**. The first reference
world pack is **Kane Pixels Backrooms**: a constrained, archival simulation of an
anomalous space, its exploration, and the records created around it. It is a
reference implementation of Custodian, not a replacement for the source material.

> **Status:** constitutional reference architecture. The repository provides
> deterministic reference executors and fixtures for knowledge, time, evidence,
> agency, memory, social state, communication, planning, objective physical
> environments, and observer-local perception; it is not a production deployment
> engine.

## Why Custodian

Persistent roleplay usually fails at the seams: a compelling turn contradicts an
earlier fact, a model invents authority it does not have, or a saved session cannot
be replayed. Custodian treats those seams as first-class design constraints.

- **Persistent:** append-only events make sessions replayable and auditable.
- **Deterministic where it matters:** state is a derived projection, not a second
  source of truth.
- **Canon-aware:** world facts carry provenance and confidence instead of being
  flattened into prompt text.
- **Perspective-bounded:** objective reality, observation, knowledge, belief, and
  narrative revelation remain distinct.
- **Portable:** a world pack can change without changing core runtime contracts.
- **Human-governed:** unresolved canon and safety-sensitive outcomes remain
  explicit decisions.

## Repository map

| Path | Responsibility |
| --- | --- |
| [`constitution/`](constitution/README.md) | Non-negotiable engineering and narrative principles. |
| [`runtime/`](runtime/README.md) | Constitutional Kernel execution contracts and event protocol. |
| [`state/`](state/README.md) | Durable session projection model and JSON schemas. |
| [`canon/`](canon/README.md) | World Pack API content and reference world packs. |
| [`examples/`](examples/README.md) | Small, inspectable examples of valid Custodian artifacts. |
| [`tests/`](tests/README.md) | Contract fixtures and the validation strategy. |
| [`docs/`](docs/README.md) | Architecture, authoring, and operational documentation. |

## Architecture identity

```text
Custodian
└── Constitutional Kernel
    ├── Public Session API
    ├── World Pack API
    └── Reference World Packs
        └── Kane Pixels Backrooms (first reference pack)
```

## Core model

```text
player intent → adjudication → event log → state projection → narrative response
                         ↑                         ↓
                    world pack ───────────── continuity checks
```

The event log is authoritative. A runtime evaluates an intent against the current
projection and the selected world pack, records one or more events, rebuilds the
projection, then produces a response grounded in that result.

## Quick orientation

1. Read the [constitution](constitution/PRINCIPLES.md) for the rules every runtime
   and world pack must honor.
2. Read the [architecture overview](docs/architecture/overview.md) for boundaries
   and the session lifecycle.
3. Inspect the [minimal session example](examples/minimal-session/README.md).
4. Use [`runtime/contracts/event-envelope.schema.json`](runtime/contracts/event-envelope.schema.json)
   and [`state/schemas/session-state.schema.json`](state/schemas/session-state.schema.json)
   as the initial integration contracts.
5. Author a new setting as a world pack; do not fork the runtime to encode setting
   facts.

## Reference kernel

Custodian now includes a deterministic reference kernel and a deliberately small
generic world pack. Run `npm test` for all validation, `npm run validate` for
canonical contract/projection checks, and `npm run demo` for a structured two-room
simulation and replay comparison. Perception is a structured, projection-pinned
observer-local acquisition boundary; attention, scene projection, disclosure
policy, narration, and LLM rendering are intentionally not implemented yet.

External software should use the Public Session API for deterministic creation,
advancement, inspection, export, and restoration. It validates declarative world
packs and returns defensive snapshots; reducers and the Director remain internal.

## Scope and non-goals

Custodian specifies the durable boundary between an engine and a world pack. It
does not mandate a model provider, user interface, database, prompt format, or
content-rating policy. Those choices belong to adapters and deployments.

The Kane Pixels Backrooms pack is a fan-made interpretive implementation. Names,
characters, and source material remain the property of their respective owners.
See its [world-pack policy](canon/kane-pixels-backrooms/README.md) before adding
source-derived material.

## Contributing

Changes should preserve the boundaries described in this repository. In particular,
new behavior belongs in `runtime/`; setting facts belong in `canon/`; durable data
contracts belong in `state/`; and every contract change needs a fixture in `tests/`.
See [documentation guidance](docs/guides/contributing.md).

## License

No license has been selected yet. Until one is added, do not assume permission to
reuse, redistribute, or deploy this repository beyond applicable default copyright
law.
