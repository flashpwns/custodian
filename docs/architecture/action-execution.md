# Constitutional action execution and effect resolution

**Normative.** The completed execution path is:

```text
committed action proposal → validation → world-pack rule resolution → execution result
  → canonical execution/effect events → replay → updated objective reality
```

The Constitutional Kernel owns proposal and world-pack contract validation,
deterministic proposal ordering, result/event materialization, commitment, and
replay. The World Pack API declares physical preconditions, exclusive conflict
keys, outcome reasons, and effect requests. Neither party applies an effect
directly.

`resolveAction()` and `resolveActions()` are pure. They consume a pinned objective
projection, action proposal, and compatible world pack; they read no clocks,
randomness, I/O, or mutable globals. Conflicting proposals are ordered by durable
time, priority, and ID. The executor returns `SUCCESS`, `FAILURE`,
`PARTIAL_SUCCESS`, `BLOCKED`, or `INVALID`, plus a deterministic reason, causal
proposal parent, and zero or more effect requests.

`materializeExecutionEvents()` is also pure. It converts a validated result into
normal canonical `agency.execution.resolved` and effect events with explicit
sequences and causal parents. Replay, not the executor, applies environment,
resource, evidence, communication, or agency effects. This means a failed action
can create evidence while leaving the requested material state unchanged.

World packs cannot mutate projections, local observer state, or replay state. They
may only declare deterministic constraints and effect requests through the World
Pack API. Narration, rendering, dialogue, and LLMs remain outside this lifecycle.
