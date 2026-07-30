# Canonical Actor and Observer State

Custodian's canonical objective state may contain `actors` and `observers` registries. An actor is a world participant and, when spatial, owns its authoritative `position`. An observer is a perception-authority identity. The two are distinct.

An embodied observer declares an explicit `actor_id` binding. Its eventual spatial observation origin derives from that actor record; Custodian never infers a binding from matching identifiers. A nonspatial observer can use `remote` or `unavailable` origin without an actor binding.

Observer records may declare capability and access references. This foundation stores those values canonically, but does not yet migrate Director perception authority or expose a public observer-view API. Those changes are intentionally deferred to Canonical Observer Authority Part 2.

New exports include `session_format: "canonical-session@v2"`. Older compatible exports without that field restore normally, with no fabricated actor or observer authority.
