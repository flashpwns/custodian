# Minimal session

This example shows a session pinned to the Kane Pixels Backrooms reference pack.
It begins with creation, records an observation, and projects a present-state fact.
The observation is marked as observed by an actor, not as an omniscient statement
about the world.

| Artifact | Purpose |
| --- | --- |
| [`events.json`](events.json) | Ordered event records using the runtime envelope. |
| [`state.json`](state.json) | Projection valid through event sequence 2. |

The UUID values are fixed to make fixture comparisons and replay demonstrations
stable. The sample is illustrative and contains no source-derived scene detail.
