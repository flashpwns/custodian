# Evidence and information propagation

Evidence is a durable objective object created by an event. It is not an
observer's memory and not an authorial explanation. Custodian uses five concrete
forms: recordings, artifacts, environmental traces, sensor outputs, and durable
records.

## Evidence lifecycle

1. An objective event creates or changes an evidence object.
2. The object remains available across simulation time unless an objective event
   damages or destroys it.
3. An observer accesses it through a named channel such as a recording reader,
   physical inspection, sensor console, or archive.
4. The runtime records an information path and derives only the claims that remain
   in the evidence, with its completeness and fidelity bounds.

Destroyed evidence remains in the event history as destroyed; it is not silently
removed. Later access records a denied attempt and cannot create new knowledge.

## Fidelity, completeness, and forgery

Completeness bounds how much of a subject the object contains. Fidelity bounds how
accurately retained material represents its origin. Both bounds travel with every
evidence-derived knowledge record. A forged object has an objective provenance of
`forged`; it may yield a belief about its claim, but cannot establish that claim as
objective reality or knowledge of the underlying fact.
