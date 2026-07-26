# Tests and fixtures

Custodian begins with contract fixtures because the runtime is intentionally not
coupled to a language implementation yet. When an executable engine is introduced,
it must validate these fixtures and add replay tests before expanding behavior.

## Required checks

1. Every schema file is valid JSON Schema Draft 2020-12 JSON.
2. Every event fixture validates against the event envelope.
3. Every projected state validates against the session-state schema.
4. Replaying the event fixture reproduces the corresponding state fixture.
5. Invalid fixtures are rejected with a stable diagnostic category.

Run `npm test` to execute the dependency-free bootstrap check. It verifies valid
JSON, envelope essentials, ordered events, world pinning, and the example’s derived
perception. The constitutional fixture additionally proves that hidden objective
changes persist, beliefs can conflict, knowledge requires a valid path, and a
perspective changes revelation rather than reality. A production runtime should
replace the narrow structural assertions with a full Draft 2020-12 validator while
keeping the same fixture contract.

The simulation-time fixture executes the reference timeline twice and verifies
identical replay, scheduled consequences without observers, stable concurrent
ordering, unchanged time across perspectives, and narration's causal-history
boundary.
