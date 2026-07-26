# Contributing to Custodian

Custodian accepts kernel, documentation, and world-pack boundary contributions.
Read the [constitution](constitution/PRINCIPLES.md) first: objective state,
observer-local state, and narration remain separate.

## Development

```sh
npm ci
npm test
npm run validate
npm run replay
npm run conformance -- templates/world-pack-starter --json
```

Keep runtime changes narrowly owned, add contract fixtures for observable
behavior, and preserve deterministic replay. Do not add world-specific facts to
the kernel or executable pack code to the World-Pack API.

## Pull requests

Describe the constitutional boundary affected, validation performed, migration
impact, and any replay implications. Use the supplied template. Documentation
and external world packs are welcome; third-party packs remain independently
licensed and maintained.
