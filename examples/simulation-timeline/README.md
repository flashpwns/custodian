# Simulation timeline

This executable fixture demonstrates deterministic temporal simulation without
depending on a world-specific engine. A pressure drop is scheduled at time `0` and
resolves at time `10` while no observer is present. Two actions at time `5` compete
for the same valve command; their stable identifiers resolve the tie.

The reference executor advances to time `12`, resolves all due work, and retains a
causal history. The observation and narration entries are views over that history:
they do not mutate the objective projection.

| Artifact | Purpose |
| --- | --- |
| [`plan.json`](plan.json) | Timeline input, concurrent actions, and delayed consequence. |
| [`expected-outcome.json`](expected-outcome.json) | Replay-safe objective result and event order. |
| [`perspective-a.json`](perspective-a.json) | One permitted narrative view at time 12. |
| [`perspective-b.json`](perspective-b.json) | Another view over the same time and history. |
