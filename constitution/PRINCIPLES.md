# Custodian Constitution

**Normative.** The key words **MUST**, **MUST NOT**, **SHOULD**, and **MAY** are
interpreted as described in RFC 2119.

## 1. Preserve objective reality through events

Durable changes to objective reality **MUST** be represented as ordered events. An
objective projection **MUST NOT** become the only record of how a fact came to be.
Event deletion or mutation requires an explicit, auditable redaction policy.

Objective reality is what exists in the simulation whether or not any observer
perceives it. It includes hidden conditions, causal consequences, and the
simulation time at which they obtain. It is the sole authority for physical and
world-state resolution; it is not automatically narrative-visible.

## 2. Separate mechanism from world

Runtime logic **MUST NOT** depend on a named world, character, place, or canon
claim. World packs **MUST NOT** alter the meaning of core event envelopes. A
world-specific rule is data or a world-pack extension, not a hidden runtime branch.

## 3. Make uncertainty legible

The system **MUST** distinguish observed facts, sourced claims, inferences, and
fictional connective material. A response **MUST NOT** present unresolved canon as
verified fact. Confidence and provenance belong with canon assertions.

**Mystery is an emergent property of incomplete information, not withheld
information.** The runtime **MUST** simulate relevant objective facts before their
effects are observed. It **MUST NOT** invent a previously-unsimulated hidden fact
only when a reveal would make a scene more dramatic.

## 4. Keep epistemic layers distinct

Custodian recognizes five non-interchangeable layers:

1. **Objective reality** — a world fact or consequence represented in the
   objective projection.
2. **Perception** — an observer's bounded sensory or instrument reading of an
   event; it may be incomplete, noisy, or misleading.
3. **Knowledge** — a proposition acquired through a recorded, valid information
   path and retained by a named observer.
4. **Belief** — an observer's defeasible interpretation of a proposition. Beliefs
   may conflict with objective reality and with one another.
5. **Narrative revelation** — material a renderer is permitted to present for a
   declared perspective. It is a view, never an authority over reality.

A perception **MUST NOT** be promoted to knowledge without a valid information
path. A belief **MUST NOT** be promoted to objective reality merely because it is
widely held. A narrative renderer **MUST NOT** disclose objective facts outside its
declared perspective except through explicitly authorized out-of-world interfaces.

## 5. Make causality, time, and propagation explicit

Every event that changes objective reality **MUST** carry simulation time and an
identifiable causal origin when it is not a session root. Every knowledge record
**MUST** reference an information path whose source event predates its delivery and
whose recipient matches the knower. Information propagation is a simulation event,
not an assumed side effect of truth.

Changing the active perspective **MUST NOT** rewrite objective reality, event
history, another observer's knowledge, or another observer's beliefs. It changes
only the permitted narrative revelation.

## 6. Advance reality independently of observation

**Reality advances independently of observation. Observation discovers events. It
does not create them.** The runtime **MUST** advance objective reality through due
scheduled consequences whenever simulation time advances, whether or not any
observer is present, active, or rendered.

An event with a delayed consequence **MUST** record the schedule, due simulation
time, and causal parent before its consequence is resolved. A consequence **MUST
NOT** be skipped because no perspective observes it, and it **MUST NOT** be created
only because a later observer asks about it.

Events at the same simulation time **MUST** resolve using a documented total order.
The order **MUST** be derived from durable event fields, not process timing, model
output, database return order, or client arrival order. Replay of the same event
stream and pinned runtime/world versions **MUST** produce the same objective
projection and causal history.

Narration and observation events **MUST NOT** mutate objective reality. A narrated
outcome **MUST** be traceable to committed causal history; a renderer **MUST NOT**
invent an objective consequence or omit a committed causal event to make a scene
more convenient.

## 7. Keep generated prose subordinate to state

Generated narrative **MUST NOT** silently create, alter, or erase durable facts.
Only committed events can do so. Rendering **SHOULD** cite the relevant state and
canon context internally so it remains constrained by the simulation outcome.

## 8. Preserve evidence and bound its propagation

**Evidence is objective reality made durable.** A recording, artifact,
environmental trace, sensor output, or durable record is an objective entity with
an origin, creation time, availability, and fidelity. Evidence **MUST** persist
independently of observers unless an objective event destroys or alters it.

An observer may directly perceive reality or indirectly perceive evidence through
a named information channel. Indirect knowledge **MUST** name the evidence object
and remain bounded by its recorded completeness, fidelity, and availability. A
missing, damaged, partial, or destroyed record **MUST NOT** support knowledge beyond
what it objectively retains.

Forged evidence is itself an objective fact, but its claim **MUST NOT** modify the
objective fact it purports to describe. It may support an attributed, incorrect
belief. Evidence access, destruction, and propagation **MUST** be part of the
replayable causal history.

## 9. Favor replay over convenience

Equivalent inputs, pinned dependencies, and declared random outcomes **SHOULD**
produce equivalent event streams. Nondeterministic dependencies **MUST** be
identified at the adapter boundary and recorded whenever they affect state.

## 10. Keep agency separate from outcome

**Agency proposes actions. The simulation determines outcomes.** Agents, goals,
intentions, plans, and decision context are epistemic state. They **MUST NOT**
change objective reality merely by being formed, selected, or narrated.

An action proposal **MUST** be evaluated against committed objective state and
produce a durable execution result: succeeded, failed, delayed, or interrupted.
Only a successful, committed execution event may change objective reality. Failure
and interruption are valid replayable outcomes and plans remain historically
visible after either result.

## 11. Version public contracts

Public schemas, event types, and world packs **MUST** carry versions. Breaking
changes **MUST** provide migration or an intentional incompatibility boundary.
Silent reinterpretation of saved sessions is prohibited.

## 12. Preserve memory without confusing it with truth

**Memory is an agent's persistent internal representation of prior experience.**
Memory, recollection, confidence, decay, and learned associations are agent-local
epistemic state, not objective reality. Direct observation and evidence may form
memory according to recorded experience, but incomplete or damaged sources **MUST**
bound the resulting memory.

Memory retrieval **MUST** be a durable event. Remembering is not truth, and an
incorrect recollection may influence an agent's proposal without changing objective
history. Forgetting and decay **MUST NOT** erase formation history: a replay can
recover that a memory existed and how it changed.

## 13. Protect players and source material

Deployments **MUST** have an explicit policy for sensitive content, privacy, and
operator intervention. World packs **MUST NOT** redistribute source material
without permission. Attribution, transformation, and original additions must be
clear enough for maintainers to review.

## 14. Test observable promises

Every externally observable contract change **MUST** have a fixture or automated
test. Tests should prefer behavior at boundaries—input, event, projection, and
replay—over incidental implementation structure.
