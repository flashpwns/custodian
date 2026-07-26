# Evidence propagation

This fixture models an unobserved reactor trip that creates durable sensor output
and an environmental trace. Later observers learn only by accessing evidence; no
direct perception occurs.

The sensor output is destroyed after one reading, so a later access is denied. A
damaged maintenance record yields a bounded, partial knowledge claim. A forged
artifact produces an incorrect belief about an objectively unchanged airlock.

| Artifact | Purpose |
| --- | --- |
| [`plan.json`](plan.json) | Objective events, evidence lifecycle, and access channels. |
| [`expected-outcome.json`](expected-outcome.json) | Replay-safe result summary. |
