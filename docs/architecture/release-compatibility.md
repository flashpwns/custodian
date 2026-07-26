# Compatibility, migration, and release policy

**Normative.** Custodian prepares `1.0.0` on its release branch. It is not a
published package and not a `v1.0.0` tag until that branch is merged, main is
revalidated, and the post-merge release procedure is completed.

Compatibility has independent dimensions:

| Dimension | Current identifier | Owner |
| --- | --- | --- |
| Package/public API | `custodian-public-api@v1` | package root |
| Kernel | `canonical-kernel@v1` | Constitutional Kernel |
| World-pack manifest | `world-pack/v1` | World-Pack Adapter |
| Scenario | `scenario/v1` | Public Session API |
| Canonical events | versioned event contract | canonical replay |
| Session export | `session-export@v1` | Public Session API |
| Identity derivation | `public-session@v1` | Public Session API |

Patch releases may correct implementation defects without changing a declared
contract. Additive, backward-readable changes may be minor releases only when
the relevant contract explicitly permits them. Removed fields, changed semantic
meaning, changed identity derivation, changed event ordering, or a changed
canonical serialization promise require an incompatible contract boundary and a
major package release when published.

Old contracts are never silently reinterpreted. A supported migration is a
named, deterministic, versioned transformation with validation before and after
conversion. Canonical histories are not rewritten to resemble a new schema:
unsupported histories fail deterministically. Projection caches are
non-authoritative and must be rebuilt and identity-checked. A world-pack identity
changes whenever identity-bearing declarative content changes.

Public durable outputs promise canonical byte stability only for world-pack
canonical representation, session identity inputs, canonical history, session
export envelopes, structured public errors, and conformance reports. Incidental
debug objects make no byte-stability promise.

Before publication, run `npm test`, `npm run validate`, `npm run demo`,
`npm run replay`, `npm run conformance -- external-fixtures/signal-room --json`,
and `npm pack --dry-run --json`. Publication, registry access, and tagging remain
outside this milestone.
