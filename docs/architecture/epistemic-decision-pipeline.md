# Epistemic processing and constitutional decision pipeline

**Normative.** Milestone 12 makes the transition from observer-local perception
to knowledge, belief, decision, and action proposal explicit:

```text
objective reality → physical signals → perception → knowledge → belief → planning → decision → action proposal → committed event
```

Knowledge is an immutable observer-local historical record. A committed
`epistemic.knowledge.acquired` event must name its observer, proposition, basis,
and provenance source; the source must already exist and be a causal parent.
Supported bases are perception, trusted communication, validated evidence, and an
objective record. A later correction adds knowledge; it never rewrites prior
acquisition.

Beliefs are append-only observer-local interpretations. A belief may be false.
`epistemic.belief.revised` names the earlier belief it supersedes, preserving both
records and their provenance. Neither knowledge nor belief is included in the
canonical objective projection.

`evaluateDecision()` is pure and projection-pinned. It reads one objective
projection, explicit goals and plans, and one observer's supplied perceptions,
knowledge, and beliefs. It sorts goals by durable priority then ID and returns a
structured proposal or deterministic rejection. It has no clock, random source,
I/O, mutation, narration, or event insertion. A proposal becomes durable only as
a committed `agency.action.proposed` event; it is not an objective material effect.

The evaluator does not resolve truth. It can therefore act on an observer's
incorrect belief without modifying objective reality. Agency execution remains the
only path from a proposal to an objective outcome.

No session-state migration is required for this reference implementation: the new
records live in replay-derived local state. Existing projection caches remain
compatible with `objective-projection@v2`; a durable session format that stores
these records must add an explicit versioned migration.
