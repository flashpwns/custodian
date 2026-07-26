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

## Contract surface

- [`contracts/event-envelope.schema.json`](contracts/event-envelope.schema.json)
  defines the immutable record written to an event stream.
- [`contracts/intent-envelope.schema.json`](contracts/intent-envelope.schema.json)
  defines a request offered to an adjudicator.
- [`contracts/information-path.schema.json`](contracts/information-path.schema.json)
  defines the provenance required before knowledge can enter an observer view.
- [`contracts/narrative-revelation.schema.json`](contracts/narrative-revelation.schema.json)
  defines a perspective-bounded rendering input.

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
