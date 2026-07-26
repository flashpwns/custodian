# Contributing to Custodian

Start by deciding which boundary your change belongs to.

| Change | Home | Required evidence |
| --- | --- | --- |
| New engine capability | `runtime/` | contract update and replay fixture |
| New durable field or migration | `state/` | schema update and before/after fixture |
| Setting fact or interpretation | `canon/<world>/` | provenance and confidence |
| Usage walkthrough | `examples/` | runnable or inspectable artifact |
| Rule that applies everywhere | `constitution/` | rationale and compatibility note |

## Contract changes

Prefer additive changes. A breaking contract change needs: a new version, a
migration story, a fixture demonstrating the new behavior, and a compatibility
note. Do not use an ambiguous field name to avoid versioning.

## Canon changes

Canon entries must distinguish sourced facts, deductions, and original connective
material. Do not encode a disputed interpretation as an unquestioned truth. The
world-pack maintainer decides how source attribution is recorded, subject to the
constitution.

## Pull request checklist

- Keep runtime mechanics independent of a specific setting.
- Keep derived state rebuildable from events.
- Add or update a fixture for any observable contract change.
- Explain compatibility and migration impact.
- Avoid copying source text or media that the project cannot redistribute.
