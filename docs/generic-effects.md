# Generic canonical effects

`applySessionEffects({ session, request })` is Custodian's public, structured mutation API. It accepts `custodian-effect-request@v1` and returns `custodian-effect-result@v1` plus a new immutable session snapshot. It is deliberately not a natural-language or permission API: a world pack decides what is plausible and permitted; Custodian validates and records canonical state changes.

An effect request has a mandatory `request_id`, `actor_ref`, ordered `effects`, and optional `observer_ref`, `session_id`, `expected_revision`, and bounded provenance `metadata`. Effects have stable IDs. Available primitives are `RELOCATE_ACTOR`, `RELOCATE_OBJECT`, `SET_OBJECT_STATE`, `TRANSFER_ITEM`, `SET_RELATION`, `REMOVE_RELATION`, `COMMUNICATION_EVENT`, `TIME_BEAT`, and `APPEND_EVENT`.

World packs seed mutable entities and relations declaratively in
`initial_objective.environment.generic_effects` (`entities`, `relations`,
`events`, and `clock`). Entity references remain stable; moving or transferring
one changes its relations rather than cloning it.

```js
const outcome = applySessionEffects({ session, request: {
  version: "custodian-effect-request@v1", request_id: "turn-42", actor_ref: "operator",
  effects: [
    { id: "place", type: "RELOCATE_OBJECT", object_ref: "case", target_ref: "doorway", relation: "beside" },
    { id: "wait", type: "TIME_BEAT", ticks: 1, depends_on: ["place"] }
  ]
}});
```

Effects run sequentially against the current canonical state. `conditions` are data-only relation/state predicates and are revalidated before every step. A failed step is `FAILED`; dependents are `SKIPPED`; earlier successful steps remain `APPLIED`. Requests are structurally validated before any mutation, including unique IDs and an acyclic dependency graph.

Request IDs are idempotency keys persisted in canonical history. Repeating one, including after `exportSession`/`restoreSession`, returns the previous result with `duplicate: true` and creates no events or mutations. Event IDs derive only from session/request/effect identifiers, and replay rebuilds the same state.

The canonical result is for the world-pack integration boundary, not a player view. It does not grant knowledge or perception. Use `inspectSessionObserver` after application to derive the existing observer-safe view; messages likewise record delivery state but do not directly alter recipient knowledge. Legacy `submitSessionAction` remains supported and shares the same session history.
