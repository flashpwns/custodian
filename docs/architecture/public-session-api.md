# Public Session API and World-Pack Runtime Adapter

**Normative.** External consumers use the Public Session API, not reducers,
replay internals, or the Constitutional Director directly:

```text
world pack → adapter → session creation → tick request → Director
→ canonical replay → public result → export / restore
```

`createSession`, `advanceSession`, `inspectSession`, `exportSession`, and
`restoreSession` return defensive copies and structured `{ ok, ... }` results.
Expected failures expose only stable error codes and structured details. The API
has no wall clock, random source, filesystem discovery, network loading, dynamic
code execution, narration, or mutable handles.

## Declarative startup profiles

`createSession` optionally accepts a setting-neutral `startup` object. It is
additive: callers without it retain the v1 creation behavior. A startup object
names a profile, selects an existing scenario observer as the player, and may
declare that observer's local knowledge references, interface permissions, and
initial resource custody. It cannot alter pack facts, reducers, scenario
authority, or hidden objective state.

```js
const session = createSession({
  world_pack, scenario, seed_material: { seed: "example" },
  startup: {
    profile: { id: "field-operator" },
    player: { observer_id: "operator-a", role: "operator" },
    knowledge: [{ observer_id: "operator-a", kind: "instruction", reference: "briefing" }],
    permissions: [{ observer_id: "operator-a", permission: "observe" }],
    resources: [{ id: "survey-kit", custodian: "operator-a", quantity: 1 }]
  }
});
```

Creation validates the pack and scenario, validates startup, establishes the
seed, replays the scenario objective state, then commits `session.started` as
canonical history. Replay reconstructs the player-local startup data; export
and restore therefore retain it. A permission authorizes an attempted public
action or access surface only—it never guarantees success or changes physics.

Session identity is `public-session@v1` plus a canonical digest of the adapted
pack identity/content, scenario, canonical history, and explicit seed material.
It is independent of input insertion order and process state. The history is
authoritative; objective projection and local state are rebuilt by replay.

The World-Pack Runtime Adapter validates declarative compatibility and normalizes
a defensive pack copy, including declared observation/execution capabilities. It
does not apply effects, commit events, create epistemic state, or execute pack
code. Scenario overrides are applied only to the adapter-owned initialization copy.

Exports use `session-export@v1` and include history, declarative pack, scenario,
seed material, and an optional projection identity cache. Restore validates the
envelope and pack, replays history, verifies cache identity, and rejects corrupted
or incompatible input deterministically. Knowledge and belief templates remain
predeclared work; this public layer does not define acquisition or revision policy.

The package root is the public import boundary. See
[external world-pack conformance](world-pack-conformance.md) for the published
surface, compatibility validation, and external-pack workflow.
