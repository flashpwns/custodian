# State

State is a rebuildable projection of a session’s event stream. It exists to make
the present efficient to read; it is not a mutable substitute for history.

[`schemas/session-state.schema.json`](schemas/session-state.schema.json) defines a
portable baseline projection. It contains an `objective_reality` projection and
observer-local `epistemic_state`; these are intentionally separate. World-specific
state belongs beneath `world_state` and must be interpretable by the pinned world
pack. A projection records the event sequence through which it is valid so readers
can detect staleness.

Objective facts may be hidden from every observer. Perceptions are evidence,
knowledge is traceable receipt of information, and beliefs are fallible
interpretations. A renderer consumes a perspective-bounded revelation contract,
not the objective projection directly.

The timeline stores the current simulation time, the fixed resolution policy, and
pending scheduled consequences. Pending work is durable state: time advancement
resolves it whether or not observers are present. It must never be inferred only
when an observer asks for a scene.

## Projection rules

- Apply events in strictly increasing `sequence` order.
- Reject a projection that claims a sequence beyond the durable event stream.
- Make idempotency explicit: reapplying an already-applied event must not duplicate
  its effect.
- Store only recoverable derived data in checkpoints; preserve every required
  historical input in the event stream.
