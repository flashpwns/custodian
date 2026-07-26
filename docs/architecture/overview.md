# Custodian architecture

Custodian has four intentionally narrow layers. A conforming implementation may
combine processes or storage technologies, but it must preserve these ownership
boundaries.

| Layer | Owns | Must not own |
| --- | --- | --- |
| Runtime | intent adjudication, event emission, replay orchestration | setting facts or mutable session truth |
| State | event projections, checkpoints, migration records | narrative generation or source interpretation |
| Canon | world facts, provenance, constraints, uncertainty | player-specific state or engine control flow |
| Adapter | UI, model/provider calls, storage transport | silent changes to contracts or canon |

## Session lifecycle

1. An adapter submits an `intent` with a session identifier and actor.
2. The runtime loads the latest compatible state projection and the pinned world
   pack version.
3. The adjudicator evaluates preconditions, canon constraints, and declared random
   inputs. It either rejects the intent with a reason or emits domain events.
4. Events are appended atomically in stream order.
5. The projector derives objective reality, then derives only the observer views
   justified by recorded information paths.
6. The response layer renders a declared perspective. It may be generative, but it
   cannot rewrite events or state, and it cannot reveal unavailable objective facts.

If rendering fails after an event is committed, a retry renders the same committed
outcome. If event persistence fails, no narrative outcome may be presented as
committed.

## Authority and versioning

Each session pins a `world_id` and `world_version`. Event payloads use a versioned
`type`; projections use a versioned schema. A migration is an explicit, testable
transformation, never a best-effort reinterpretation during load.

The event stream is the authoritative historical record. Checkpoints and state
projections are disposable caches that can be rebuilt from it. A runtime must
preserve unknown event types during export even if it cannot interpret them.

## Determinism boundary

Model output is not a source of simulation truth. Any generated text is a
perspective-bounded view of committed events and the current projection. Randomness
that changes state must be recorded as an event input or outcome, including its
algorithm/version where replay depends on it. An objective fact may exist without
an observer, but an observer's knowledge requires a recorded information path.

## Failure modes

- **Invalid input:** reject before emission; return a structured diagnostic.
- **Canon ambiguity:** emit no asserted fact; request an operator decision or mark
  the response as an in-world hypothesis.
- **Projection failure:** retain the event stream, mark the projection stale, and
  rebuild from a known checkpoint.
- **World-pack incompatibility:** block the session until an explicit migration or
  compatibility adapter is selected.
