# Custodian Constitution

**Normative.** The key words **MUST**, **MUST NOT**, **SHOULD**, and **MAY** are
interpreted as described in RFC 2119.

## 1. Preserve truth through events

Durable simulation changes **MUST** be represented as ordered events. A state
projection **MUST NOT** become the only record of how a fact came to be. Event
deletion or mutation requires an explicit, auditable redaction policy.

## 2. Separate mechanism from world

Runtime logic **MUST NOT** depend on a named world, character, place, or canon
claim. World packs **MUST NOT** alter the meaning of core event envelopes. A
world-specific rule is data or a world-pack extension, not a hidden runtime branch.

## 3. Make uncertainty legible

The system **MUST** distinguish observed facts, sourced claims, inferences, and
fictional connective material. A response **MUST NOT** present unresolved canon as
verified fact. Confidence and provenance belong with canon assertions.

## 4. Keep generated prose subordinate to state

Generated narrative **MUST NOT** silently create, alter, or erase durable facts.
Only committed events can do so. Rendering **SHOULD** cite the relevant state and
canon context internally so it remains constrained by the simulation outcome.

## 5. Favor replay over convenience

Equivalent inputs, pinned dependencies, and declared random outcomes **SHOULD**
produce equivalent event streams. Nondeterministic dependencies **MUST** be
identified at the adapter boundary and recorded whenever they affect state.

## 6. Version public contracts

Public schemas, event types, and world packs **MUST** carry versions. Breaking
changes **MUST** provide migration or an intentional incompatibility boundary.
Silent reinterpretation of saved sessions is prohibited.

## 7. Protect players and source material

Deployments **MUST** have an explicit policy for sensitive content, privacy, and
operator intervention. World packs **MUST NOT** redistribute source material
without permission. Attribution, transformation, and original additions must be
clear enough for maintainers to review.

## 8. Test observable promises

Every externally observable contract change **MUST** have a fixture or automated
test. Tests should prefer behavior at boundaries—input, event, projection, and
replay—over incidental implementation structure.
