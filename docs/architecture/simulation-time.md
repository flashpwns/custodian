# Simulation time and causality

Custodian simulation time is a monotonic integer measured in session milliseconds.
It is not wall-clock persistence time and it is not a property of the current
viewer. The runtime advances it deliberately to a requested target; all due work is
resolved from the event stream before the resulting state is observed or narrated.

## Resolution order

At one simulation time, entries sort by this durable key:

```text
(simulation_time, phase, priority, stable_id)
```

`phase` uses this fixed order: scheduled, action, consequence, observation,
narration. Lower numeric priority wins; the stable ID breaks any remaining tie.
This makes concurrency visible, testable, and replay-safe rather than dependent on
thread scheduling or request arrival.

## Delayed consequences

A scheduling event creates a durable pending record with an identifier, due time,
payload, and causal parent. On or after its due time, the runtime emits the
consequence event and records the schedule as its causal parent. No observer is
required for this transition. If an observer arrives later, their perception points
to the already-committed consequence.

## Causal history and narration

Every objective outcome has a chain of causal parents terminating at a root event.
A narration may reference this chain only after it is committed. It cannot add an
objective event, change time, or hide an event from the projection; perspective
controls disclosure, not history.
