# Documentation

This directory explains how Custodian fits together and how to extend it without
weakening persistence or continuity.

- [`architecture/overview.md`](architecture/overview.md) defines components,
  ownership, and the session lifecycle.
- [`architecture/simulation-time.md`](architecture/simulation-time.md) defines
  deterministic progression, scheduling, concurrency, and replay.
- [`architecture/evidence-propagation.md`](architecture/evidence-propagation.md)
  defines durable evidence and bounded indirect observation.
- [`guides/contributing.md`](guides/contributing.md) explains how to propose a
  runtime change, world pack, contract, or fixture.

Documentation is normative only when it explicitly says **Normative**. JSON Schema
files and the constitution are normative by default; explanatory prose is not.
