# Perceptual acquisition and perspective projection

**Normative.** Milestone 11 adds observer-local acquisition without changing the
objective kernel. The constitutional order is:

```text
objective reality → physical signal → perception → knowledge → belief → planning → narration
```

Perception never creates reality and never directly creates knowledge. An
observation evaluator consumes only a pinned objective projection, an observation
request, and explicit observer context. It is pure: it reads no clock, random
source, filesystem, network, process state, or mutable global state, and it
cannot insert events or mutate either input.

## Ownership and lifecycle

`perception` is a canonical reducer domain. Its only durable write is
`state.local.perceptions[observer_id]`. A successful evaluator result becomes
durable only when an authorized `perception.observation.recorded` event is
committed through the normal lifecycle. Rejected observations are deterministic
results, not events and not knowledge.

The evaluator currently recognizes declarative physical signals supplied by a
world pack. A signal must exist in the pinned objective projection, match the
request modality, and be at the observer's explicit objective location. The
observer must declare the requested capability. These are intentionally narrow
reference rules, not a sensory renderer or a scene system.

## Perspective projection

`projectPerspective(projection, state, observer)` is a read-only structured
query. It returns only that observer's perception records pinned to the supplied
objective projection identity. It does not render prose, choose disclosure,
compose a scene, infer attention, or expose the complete objective projection.

The objective projection still excludes perception, knowledge, belief, memory,
relationships, plans, and narration. Consequently observer-local acquisition
cannot alter its identity or its replay outcome.

## Replay

Observation records carry the identity of the exact objective projection they
were evaluated against. Replay reconstructs the same local records from the same
committed stream, while rebuilds from checkpoints retain the normal canonical
ordering guarantees. A perspective query cannot attach a record to a later or
earlier projection identity.

World packs may declare supported observation capabilities, but they may not
evaluate observations by mutating projections or create knowledge automatically.
Future milestones may add perception modalities and observer context fields only
through versioned contracts and the canonical event lifecycle.
