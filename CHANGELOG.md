# Changelog

All notable changes are documented here.

## 1.3.0 — Unreleased

- Add canonical actor and observer registries to the objective session state.
- Add explicit observer-to-actor bindings, actor-owned spatial positions, and
  canonical observer capability/access references.
- Add replayable `actors.*` and `observers.*` reducer domains and
  `canonical-session@v2` export metadata. Compatible earlier exports remain
  restorable without fabricated authority records.
- Document the actor/observer foundation. Director authority resolution and the
  public observer-view API are intentionally deferred.

## 1.1.0 — Unreleased

- Add additive declarative, profile-aware session startup. Startup is replayed
  through canonical `session.started` history and preserves player-local
  knowledge, permissions, and initial resource custody through export/restore.

## 1.0.0 — Unreleased

### Added

- Constitutional event kernel, deterministic replay, objective projections, and
  observer-local epistemic state.
- Decisions, proposals, deterministic action execution, canonical effects, and
  Constitutional Director tick orchestration.
- Public Session API, export/restoration, declarative World-Pack Adapter, and
  external conformance tooling.
- Public world-pack starter, local scaffold command, Signal Room learning
  example, authoring guides, automation, and contributor infrastructure.

### Security and compatibility

- Declarative packs only: no remote discovery, dynamic plugin execution, or
  arbitrary world-pack code.
- Explicit versioned contracts, canonical serialization, and replay-safe
  migration policy.
