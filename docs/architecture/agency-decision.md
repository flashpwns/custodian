# Agency and decision making

Agents keep goals, intentions, plans, and decision context in epistemic state. A
proposal is a request, not an outcome. The deterministic executor orders proposals
by simulation time, priority, and stable identifier; evaluates declarative
world-pack constraints; then returns a versioned success, failure, partial success,
blocked, or invalid execution result.

The kernel materializes the result and world-pack effect requests as canonical
events. Replay applies those events; the executor never applies them itself. A
failed or blocked proposal may still emit objective evidence, while its requested
material change remains absent. This preserves both agency and a world that can
refuse it.
