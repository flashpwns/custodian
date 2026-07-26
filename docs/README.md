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
- [`architecture/epistemic-decision-pipeline.md`](architecture/epistemic-decision-pipeline.md)
  defines provenance-bounded knowledge, belief revision, and pure action proposals.
- [`architecture/action-execution.md`](architecture/action-execution.md) defines
  deterministic world-pack execution and canonical effect materialization.
- [`architecture/constitutional-director.md`](architecture/constitutional-director.md)
  defines deterministic tick scheduling and simulation completion.
- [`architecture/public-session-api.md`](architecture/public-session-api.md)
  defines the stable external session and persistence boundary.
- [`architecture/world-pack-conformance.md`](architecture/world-pack-conformance.md)
  defines external declarative-pack validation, the supported package surface,
  and the deliberately narrow local conformance command.
- [`architecture/release-compatibility.md`](architecture/release-compatibility.md)
  defines compatibility dimensions, migration/deprecation policy, security
  boundary, and release-candidate checks.
- [`guides/contributing.md`](guides/contributing.md) explains how to propose a
  runtime change, world pack, contract, or fixture.
- [`guides/five-minute-world-pack.md`](guides/five-minute-world-pack.md) creates
  and validates a first declarative pack using only public APIs.
- [`guides/world-pack-authoring.md`](guides/world-pack-authoring.md) defines
  manifest, scenario, capability, effect, compatibility, and security ownership.
- [`community.md`](community.md) records the pending Discussions categories and
  recommended repository topics without claiming those GitHub settings exist.
- [`releases/release-checklist.md`](releases/release-checklist.md) and
  [`releases/v1.0.0.md`](releases/v1.0.0.md) define prepared release procedure
  and notes.

Documentation is normative only when it explicitly says **Normative**. JSON Schema
files and the constitution are normative by default; explanatory prose is not.
