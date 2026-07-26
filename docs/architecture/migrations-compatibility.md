# Migrations and compatibility

Public event, projection, world-pack, and session contracts are versioned.
Compatibility is explicit: a runtime either accepts a declared version, applies a
registered deterministic migration, or rejects it with a stable diagnostic.

Each migration records source version, target version, applicability, deterministic
transform, and pre/post validation. Snapshots are invalidated rather than silently
reinterpreted when their schema, reducer set, ordering policy, or world pack is
incompatible. The reference migration registry is intentionally small; it records
the v9-to-v10 session projection addition of an empty objective environment.

Milestone 11 introduces `objective-projection@v2` and
`canonical-reducers@v2`. Objective projections are disposable replay caches, so
v1 projections are deliberately invalidated instead of migrated: v2 adds
world-pack-declared observation capabilities and a perception-aware reducer-set
identity. The historical v1 schema remains available for validation; rebuilding
the compatible event stream produces the v2 projection.
