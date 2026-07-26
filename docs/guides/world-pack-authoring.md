# World-pack authoring guide

## Ownership

Custodian owns canonical ordering, event commitment, replay, projections,
session lifecycle, and constitutional information boundaries. A pack owns its
identity, declarative initial objective state, observation capabilities,
execution declarations, scenarios, and world vocabulary. The adapter validates
and normalizes a defensive copy; it does not create knowledge, execute code, or
apply effects.

## Required manifest fields

`id`, `version`, `kernel_compatibility`, `initial_objective`, and `rules` are
required by `world-pack/v1`. The id is lowercase kebab case. Set
`kernel_compatibility` to `canonical-kernel@v1` for this release. Pack identity
is derived from canonical declarative content, so identity-bearing changes must
also change the pack version.

`initial_objective` is authoritative starting world state. Locations, topology,
objects/resources, conditions, hazards, evidence, messages, and actions belong
there when the current contracts support them. Agent-local perception, knowledge,
belief, memory, trust, private plans, interpretation, and narration do not.

## Capabilities and effects

`observation_capabilities` declare known modalities. They do not grant an agent
knowledge or bypass perception constraints. `execution_rules` declare an `intent`,
optional exclusive key, objective preconditions, and typed effect requests. A
precondition fails deterministically when objective state differs. Effects are
validated requests converted to canonical events; a pack never mutates the
projection itself.

## Scenarios

A `scenario/v1` declares a scenario id, matching world id/version, observers,
and optional initial objective overrides or scheduled canonical events. Observers
may carry goals and plans, but those are local planning inputs rather than future
objective facts. Completion remains a Director result.

## History, compatibility, and publication

Canonical history is authoritative and must never be rewritten just to fit a
newer schema. Session exports may cache projections only as identity-checked,
non-authoritative values. Contract migrations are explicit and deterministic;
unsupported combinations fail with structured errors. Test each released pack
against its declared Custodian compatibility and include its own license,
maintenance status, and content warnings.

## Test and publish safely

Run `custodian-conformance . --json`, preserve a minimal scenario, and verify
create/advance/export/restore continuation before publishing. Do not execute
pack-authored modules, use ambient filesystem/network state in rules, embed
private Custodian imports, or claim that a pack is endorsed by Custodian.

See [World-Pack Conformance](../architecture/world-pack-conformance.md) for the
complete public boundary and [Compatibility](../architecture/release-compatibility.md)
for version policy.
