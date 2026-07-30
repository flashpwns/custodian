# Public Observer-Safe View API

`inspectSessionObserver({ session, observer, request })` is the public read-only perception boundary for world packs, UI, and future AI adapters.

Requests follow `observer-inspection-request/v1`: `kind: "look"` or `kind: "inspect"` (which requires `target`), with optional `id`, `parameters`, and presentation-only `metadata`. LOOK returns the observer's current canonically resolved location plus opaque references for targets which the existing observation engine can presently evaluate. INSPECT accepts one of those references and returns only the observed modality, content, and fidelity.

Target references are deterministic hashes of the session identity, observer, current projection revision, and internal target. They never expose the raw target ID and are revalidated against the current canonical observer context. They cannot be reused across sessions or observers, or after a move changes the view. `target unavailable` intentionally collapses guessed, hidden, stale, nonexistent, and cross-context target failures. Context failures return the separate generic `observation unavailable` result.

The API is read-only: LOOK and INSPECT do not append history, alter knowledge, or affect replay. Export/restore returns the same view for equivalent canonical state. It composes with `getAvailableSessionActions` and `submitSessionAction`; consumers must not read `session.projection.objective` to construct a perception UI.

```
Canonical World
  ↓
Canonical Observer Authority
  ↓
resolveObserverContext → evaluateObservation
  ↓
inspectSessionObserver
  ↓
World Pack / UI / AI
```
