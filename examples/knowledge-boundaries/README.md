# Knowledge boundaries

This fixture is a deliberately small simulation, not a world-pack assertion. It
demonstrates the constitutional kernel with a service door and a hidden generator
failure.

- The generator failure is objective at simulation time `10`, even though neither
  observer gains knowledge of it.
- Observer A sees a green indicator and believes the door is unlocked.
- Observer B hears a latch and believes the same door is locked.
- A later authenticated status message gives only Observer A knowledge that the
  door is unlocked.
- The two revelations differ by perspective but both are pinned to projection 7;
  neither contains the objective state itself.

| Artifact | Purpose |
| --- | --- |
| [`events.json`](events.json) | Causal, simulation-time event stream. |
| [`state.json`](state.json) | Objective and observer-local projections. |
| [`revelation-a.json`](revelation-a.json) | What Observer A may be told. |
| [`revelation-b.json`](revelation-b.json) | What Observer B may be told. |
