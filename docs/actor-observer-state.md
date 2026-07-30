# Canonical Actor and Observer State

Custodian's canonical objective state may contain `actors` and `observers` registries. An actor is a world participant and, when spatial, owns its authoritative `position`. An observer is a perception-authority identity. The two are distinct.

An embodied observer declares an explicit `actor_id` binding. Its eventual spatial observation origin derives from that actor record; Custodian never infers a binding from matching identifiers. A nonspatial observer can use `remote` or `unavailable` origin without an actor binding.

Observer records may declare capability and access references. The Director uses
those canonical values for its internal observation path; a public
observer-view API remains intentionally deferred.

New exports include `session_format: "canonical-session@v2"`. Older compatible exports without that field restore normally, with no fabricated actor or observer authority.

## Runtime observer context

The Director now resolves its internal observation context through
`resolveObserverContext(state, observerId)`. For an embodied observer it reads
the explicit actor binding and that actor's canonical position. Capabilities and
access are copied from the canonical observer record. `remote` is legal but has
no spatial evaluator semantics yet, and `unavailable` remains a legal explicit
no-context state.

Tick-level `observer.perception.context` remains accepted for parse
compatibility only. Its location, capabilities, and access are ignored: runtime
callers cannot move an observer's perception origin or grant extra perception
authority. Canonical actor movement automatically changes the derived embodied
observer origin. The resolver is deterministic across replay and export/restore.

The public observer-safe LOOK/INSPECT API is intentionally deferred to Part 3.
