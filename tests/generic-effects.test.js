const assert = require("node:assert/strict");
const api = require("../index.js");

const pack = {
  id: "generic-fixture", version: "1.0.0", kernel_compatibility: "canonical-kernel@v1", rules: [], observation_capabilities: [],
  initial_objective: { timeline: { pending: [] }, environment: { locations: { a: {}, b: {} }, generic_effects: { entities: { chair: { id: "chair", state: {} }, keys: { id: "keys", state: {} }, recorder: { id: "recorder", state: { recording: true } }, fixture: { id: "fixture", state: {} } }, relations: [{ subject_ref: "keys", relation: "carried_by", target_ref: "actor" }, { subject_ref: "recorder", relation: "carried_by", target_ref: "actor" }], events: [], clock: 0 } }, resources: {}, evidence: [], messages: [], actions: [] }
};
const scenario = { id: "generic", world: { id: pack.id, version: pack.version }, actors: [{ id: "actor", position: "a" }, { id: "recipient", position: "a" }], observers: [{ id: "observer", actor_id: "actor", origin: "embodied", capabilities: [], access: [], goals: [], plans: [] }] };
const created = api.createSession({ world_pack: pack, scenario, seed_material: { fixture: "generic" } });
assert.ok(created.ok);
assert.equal(typeof api.applySessionEffects, "function", "generic effects are available from the package root");
const request = { version: "custodian-effect-request@v1", request_id: "compound-1", actor_ref: "actor", effects: [
  { id: "move", type: "RELOCATE_ACTOR", actor_ref: "actor", target_ref: "b" },
  { id: "chair", type: "RELOCATE_OBJECT", object_ref: "chair", target_ref: "a", relation: "under" },
  { id: "stand", type: "SET_RELATION", subject_ref: "actor", relation: "supported_by", target_ref: "chair", depends_on: ["chair"] },
  { id: "drop", type: "TRANSFER_ITEM", item_ref: "keys", from: { relation: "carried_by", target_ref: "actor" }, to: { relation: "at", target_ref: "a" } },
  { id: "recorder", type: "SET_OBJECT_STATE", object_ref: "recorder", key: "recording", value: false },
  { id: "say", type: "COMMUNICATION_EVENT", sender_ref: "actor", recipients: ["recipient"], channel: "radio", content: { semantic_ref: "status" } },
  { id: "time", type: "TIME_BEAT", ticks: 3 },
  { id: "event", type: "APPEND_EVENT", event_type: "object.arranged", payload: { object: "chair" } }
] };
const applied = api.applySessionEffects({ session: created.session, request });
assert.ok(applied.ok);
assert.equal(applied.result.status, "APPLIED");
const generic = applied.session.projection.objective.environment.generic_effects;
assert.ok(generic.relations.some((x) => x.subject_ref === "chair" && x.relation === "under" && x.target_ref === "a"));
assert.ok(generic.relations.some((x) => x.subject_ref === "keys" && x.relation === "at" && x.target_ref === "a"));
assert.ok(!generic.relations.some((x) => x.subject_ref === "keys" && x.relation === "carried_by"));
assert.equal(generic.entities.recorder.state.recording, false);
assert.equal(generic.clock, 3);
assert.equal(applied.session.projection.objective.messages.length, 1);
assert.equal(applied.session.projection.objective.actors.actor.position, "b");
assert.equal(api.inspectSessionObserver({ session: applied.session, observer: "observer", request: { id: "look", kind: "look" } }).details.length, 0, "generic mutation does not grant knowledge");
const duplicate = api.applySessionEffects({ session: applied.session, request });
assert.ok(duplicate.ok && duplicate.result.duplicate);
assert.equal(duplicate.session.history.length, applied.session.history.length, "duplicate creates no history");
const restored = api.restoreSession(api.exportSession(applied.session).envelope);
assert.ok(restored.ok);
assert.deepEqual(restored.session.projection, applied.session.projection, "generic effects restore from canonical history");
assert.ok(api.applySessionEffects({ session: restored.session, request }).result.duplicate, "idempotence survives restore");
const partial = api.applySessionEffects({ session: created.session, request: { version: "custodian-effect-request@v1", request_id: "partial", actor_ref: "actor", effects: [
  { id: "first", type: "SET_OBJECT_STATE", object_ref: "chair", key: "moved", value: true },
  { id: "bad", type: "RELOCATE_OBJECT", object_ref: "chair", target_ref: "b", conditions: [{ kind: "state_equals", object_ref: "chair", key: "moved", value: false }] },
  { id: "later", type: "SET_OBJECT_STATE", object_ref: "chair", key: "later", value: true, depends_on: ["bad"] }
] } });
assert.deepEqual(partial.result.effect_results.map((x) => x.status), ["APPLIED", "FAILED", "SKIPPED"]);
const malformed = api.applySessionEffects({ session: created.session, request: { version: "custodian-effect-request@v1", request_id: "cycle", actor_ref: "actor", effects: [{ id: "a", type: "TIME_BEAT", ticks: 1, depends_on: ["b"] }, { id: "b", type: "TIME_BEAT", ticks: 1, depends_on: ["a"] }] } });
assert.equal(malformed.error.details.reason, "cyclic_dependency");
const stale = api.applySessionEffects({ session: applied.session, request: { version: "custodian-effect-request@v1", request_id: "stale", actor_ref: "actor", effects: [{ id: "teleport", type: "RELOCATE_OBJECT", object_ref: "chair", target_ref: "b", conditions: [{ kind: "relation_exists", subject_ref: "chair", relation: "at", target_ref: "a" }] }] } });
assert.equal(stale.result.effect_results[0].reason, "precondition_failed", "stale plans cannot overwrite current relations");
console.log("validated public generic effect application, ordering, replay, restore, and idempotence");
