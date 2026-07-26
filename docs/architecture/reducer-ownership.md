# Reducer ownership

**Normative.** Reducers consume canonical events in canonical order. Their
declared domains are `time`, `agency`, `environment`, `resources`, `evidence`,
`communication`, `planning`, `memory`, `relationships`, `epistemic`, and
`perception`.

| Domain | Owns | Cannot directly write |
| --- | --- | --- |
| Time | scheduling and timeline metadata | physical or local state |
| Agency | proposal and execution records | environment or resources |
| Environment | topology, hazards, damage, affordances | plans, beliefs, memory, trust |
| Resources | custody, quantities, allocation and reservation effects | intent or objective access outcomes |
| Evidence | durable evidence | knowledge beyond a later valid path |
| Communication | objective message/delivery records | truth, memory, trust, or relationships |
| Planning | agent-local plans and commitments | physical effects |
| Memory | agent-local recollection | committed history |
| Relationships | agent-local social evaluation | objective history |
| Epistemic | knowledge and beliefs | objective state |
| Perception | observer-local acquired observations | objective state or knowledge |

The observation evaluator is read-only: it consumes a pinned objective projection,
an observation request, and explicit observer context. A separate committed
perception event may store its successful result only in
`state.local.perceptions[observer_id]`.
