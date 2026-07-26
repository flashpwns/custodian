# State

State is a rebuildable projection of a session’s event stream. It exists to make
the present efficient to read; it is not a mutable substitute for history.

[`schemas/session-state.schema.json`](schemas/session-state.schema.json) defines a
portable baseline projection. World-specific state belongs beneath `world_state`
and must be interpretable by the pinned world pack. A projection records the event
sequence through which it is valid so readers can detect staleness.

## Projection rules

- Apply events in strictly increasing `sequence` order.
- Reject a projection that claims a sequence beyond the durable event stream.
- Make idempotency explicit: reapplying an already-applied event must not duplicate
  its effect.
- Store only recoverable derived data in checkpoints; preserve every required
  historical input in the event stream.
