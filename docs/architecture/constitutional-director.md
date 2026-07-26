# Constitutional Director and simulation ticks

**Normative.** The Constitutional Director owns simulation progression, not
interpretation. A tick has one fixed lifecycle:

```text
objective projection → perception → knowledge → belief → decision → proposal
→ execution → effects → replay → new projection
```

The Director records this phase order even where a phase has no declared work. It
sorts observers lexicographically by durable observer ID. Proposal ordering is the
existing time, priority, and ID policy; execution and effects retain the canonical
ordering supplied by their existing components. No platform iteration order,
thread scheduling, clock, I/O, model output, or mutable global participates.

The Director composes existing evaluators. It invokes the perception evaluator,
accepts only predeclared knowledge/belief event templates, invokes the decision
evaluator, commits resulting proposals, delegates action resolution, materializes
effects, and rebuilds with replay. It does not interpret signals, create
knowledge/beliefs/proposals/effects, apply effects, or mutate a projection.

An idle tick is complete only when no observer produces a proposal, no timeline
work remains, and no execution effects are pending. It returns completion without
adding events. Replaying the same history and tick input reconstructs the same
phase order, observer order, event bytes, projection identity, and local state.

Narration, dialogue, rendering, UI, CLI, LLM integration, and planning changes are
outside the Director.
