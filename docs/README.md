# Documentation

This directory explains how the Custodian Constitutional Kernel, World Pack API,
and Reference World Packs fit together without weakening persistence or continuity.

- [`architecture/overview.md`](architecture/overview.md) defines components,
  ownership, and the session lifecycle.
- [`architecture/simulation-time.md`](architecture/simulation-time.md) defines
  deterministic progression, scheduling, concurrency, and replay.
- [`architecture/evidence-propagation.md`](architecture/evidence-propagation.md)
  defines durable evidence and bounded indirect observation.
- [`architecture/agency-decision.md`](architecture/agency-decision.md) defines
  proposal-based agency and deterministic execution.
- [`architecture/memory-learning.md`](architecture/memory-learning.md) defines
  durable internal memory, retrieval, forgetting, and learning.
- [`architecture/relationships-social.md`](architecture/relationships-social.md)
  defines trust, testimony, and emergent reputation.
- [`architecture/communication-deception.md`](architecture/communication-deception.md)
  defines deterministic, perspective-bounded messaging.
- [`architecture/planning-commitments.md`](architecture/planning-commitments.md)
  defines contingent planning and commitments.
- [`architecture/environment-physical-constraints.md`](architecture/environment-physical-constraints.md)
  defines objective space, resources, hazards, material effects, and their
  constitutional boundaries.
- [`architecture/kernel-convergence.md`](architecture/kernel-convergence.md),
  [`architecture/reducer-ownership.md`](architecture/reducer-ownership.md), and
  [`architecture/migrations-compatibility.md`](architecture/migrations-compatibility.md)
  define the canonical kernel lifecycle, purity, projection, and compatibility.
- [`architecture/world-pack-boundary.md`](architecture/world-pack-boundary.md)
  defines the World Pack API boundary between constitutional mechanics and world
  content.
- [`architecture/perception-projection.md`](architecture/perception-projection.md)
  defines projection-pinned observer-local perceptual acquisition.
- [`guides/contributing.md`](guides/contributing.md) explains how to propose a
  runtime change, world pack, contract, or fixture.

Documentation is normative only when it explicitly says **Normative**. JSON Schema
files and the constitution are normative by default; explanatory prose is not.
