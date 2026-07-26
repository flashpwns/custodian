# Migrations and compatibility

Public event, projection, world-pack, and session contracts are versioned.
Compatibility is explicit: a runtime either accepts a declared version, applies a
registered deterministic migration, or rejects it with a stable diagnostic.

Each migration records source version, target version, applicability, deterministic
transform, and pre/post validation. Snapshots are invalidated rather than silently
reinterpreted when their schema, reducer set, ordering policy, or world pack is
incompatible. The reference migration registry is intentionally small; it records
the v9-to-v10 session projection addition of an empty objective environment.
