# Runtime

The runtime is the world-agnostic execution layer. It accepts intent, loads a
pinned session context, asks an adjudicator for an outcome, commits events, and
requests a projection. It does not own UI copy, model credentials, database
details, or canon facts.

## Constitutional kernel

The runtime maintains one objective projection and one epistemic projection per
observer. Objective changes happen at simulation time and may be entirely unseen.
Observers receive perceptions and knowledge only through recorded information
paths. Beliefs are observer-local interpretations of that evidence. A perspective
selects what a narrative may reveal; it does not select or modify what is true.

This is a concrete simulation rule, not a storytelling preference: an unseen
structural failure can change the objective projection now and be discovered later
through its simulated consequences.

## Deterministic timeline

The timeline advances to an explicit simulation time. Before the runtime accepts a
new action or renders a perspective at that time, it resolves all scheduled work
that is due. Entries share a total order: `simulation_time`, then phase
(`scheduled`, `action`, `consequence`, `observation`, `narration`), then priority,
then stable identifier. Concurrent actions are not made simultaneous by accident;
their deterministic order is part of the simulation record.

Observation records a path from an existing event. Narration cites committed event
identifiers. Neither is allowed to create an objective change. See the executable
[`reference timeline`](reference/timeline.js) and the
[`simulation timeline example`](../examples/simulation-timeline/README.md).

## Evidence propagation

Evidence is objective state, not a narrator's retrospective explanation. The
runtime records its objective origin, form, completeness, fidelity, availability,
and any destruction event. An information path declares whether an observer read
an evidence object or directly perceived an event; evidence-derived knowledge is
limited to the claims retained by that object. A forgery can influence belief but
never changes the underlying objective fact.

## Contract surface

- [`contracts/event-envelope.schema.json`](contracts/event-envelope.schema.json)
  defines the immutable record written to an event stream.
- [`contracts/intent-envelope.schema.json`](contracts/intent-envelope.schema.json)
  defines a request offered to an adjudicator.
- [`contracts/information-path.schema.json`](contracts/information-path.schema.json)
  defines the provenance required before knowledge can enter an observer view.
- [`contracts/narrative-revelation.schema.json`](contracts/narrative-revelation.schema.json)
  defines a perspective-bounded rendering input.
- [`contracts/scheduled-event.schema.json`](contracts/scheduled-event.schema.json)
  defines a durable, causally-owned delayed consequence.
- [`contracts/action-envelope.schema.json`](contracts/action-envelope.schema.json)
  defines an action's deterministic timeline position.
- [`contracts/evidence.schema.json`](contracts/evidence.schema.json) defines a
  durable recording, artifact, trace, sensor output, or record.

An implementation can add typed domain events, but each must fit inside the event
envelope and have an explicit owner and compatibility policy.

## Minimal runtime interface

```text
adjudicate(intent, session_context) -> accepted events | rejection
append(session_id, expected_sequence, events) -> committed events
project(previous_state, committed_events) -> next_state
render(next_state, committed_events, world_pack) -> response
```

`expected_sequence` provides optimistic concurrency: a stale writer must retry
against the latest stream rather than overwrite another outcome.
