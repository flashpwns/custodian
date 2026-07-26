# Canon

A world pack supplies the setting-specific knowledge used by Custodian. It is a
versioned collection of claims, constraints, entities, places, and narrative
guidance; it is not a database of player-session truth.

Every claim should be classified as one of:

- **sourced** — directly supported by an identified primary or permitted source;
- **inferred** — a constrained deduction from sourced material;
- **interpretive** — a deliberate creative choice used to make the simulation run.

Claims also carry a confidence level and a provenance reference. Do not store
unlicensed source text or imagery when a citation and summary will do.

## Authority is not character knowledge

Canon authority governs how the runtime adjudicates objective reality. It does not
grant any observer access to a canon fact. Every claim uses the authority contract
in [`authority.schema.json`](authority.schema.json): `primary` claims constrain the
pack directly, `derived` claims record a reasoned interpretation, and
`interpretive` claims make an explicit simulation choice. Confidence expresses the
maintainer's support for a claim, not an observer's belief.

The first reference pack is [`kane-pixels-backrooms/`](kane-pixels-backrooms/README.md).
