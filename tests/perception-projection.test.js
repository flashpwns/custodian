const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { replay, stable, reducerDefinitions, evaluateObservation, projectPerspective } = require("../runtime/canonical-kernel.js");

const root = path.resolve(__dirname, "..");
const pack = JSON.parse(fs.readFileSync(path.join(root, "canon/reference-convergence/manifest.json"), "utf8"));
const events = JSON.parse(fs.readFileSync(path.join(root, "examples/reference-simulation/events.json"), "utf8"));
const base = replay(events, pack);
const request = { id: "observe-fire-glow", observer: "agent-a", projection_identity: base.projection.identity, modality: "visual", target: "fire-glow" };
const observerContext = { observer: "agent-a", location: "room-b", capabilities: ["visual"] };
const evaluatorInputs = stable({ projection: base.projection, request, observerContext });
const result = evaluateObservation(base.projection, request, observerContext);
const perceptionEvent = {
  id: "e12", session_id: "reference-session", sequence: 12, type: "perception.observation.recorded", version: "v1", at: 10,
  phase: "information", priority: 0, domain: "perception", world: { id: pack.id, version: pack.version },
  payload: { observer: "agent-a", result, causal_source: "e1" }, causal_parents: ["e1"]
};
const integrated = replay([...events, perceptionEvent], pack);
const reordered = replay([perceptionEvent, ...[...events].reverse()], pack);
const checkpoint = replay(events.slice(0, 6), pack);
const fromCheckpoint = replay([...events, perceptionEvent], pack, { state: checkpoint.state });

assert.deepEqual(result, {
  request_id: "observe-fire-glow", observer: "agent-a", projection_identity: base.projection.identity, status: "observed",
  modality: "visual", target: "fire-glow", content: "fire glow", fidelity: 0.8, source: "e1"
});
assert.equal(stable({ projection: base.projection, request, observerContext }), evaluatorInputs, "observation evaluation is input-pure");
assert.equal(integrated.state.local.perceptions["agent-a"].length, 1);
assert.equal(integrated.state.local.knowledge["agent-a"], undefined, "perception does not directly create knowledge");
assert.equal(integrated.state.local.perceptions["agent-b"], undefined, "observer-local state does not leak");
assert.equal(JSON.stringify(integrated.projection).includes("perceptions"), false, "objective projection excludes perceptions");
assert.equal(integrated.projection.projection_schema, "objective-projection@v2");
assert.equal(integrated.projection.reducer_set, "canonical-reducers@v2");
assert.deepEqual(integrated.projection, reordered.projection, "perceptions cannot change the objective projection");
assert.equal(stable(integrated.state.local.perceptions), stable(reordered.state.local.perceptions), "perception replay is insertion-order independent");
assert.deepEqual(integrated.projection, fromCheckpoint.projection, "checkpoint replay preserves the objective projection");
assert.equal(stable(integrated.state.local.perceptions), stable(fromCheckpoint.state.local.perceptions), "checkpoint replay preserves local perceptions");
assert.deepEqual(projectPerspective(integrated.projection, integrated.state, "agent-a"), {
  projection_identity: integrated.projection.identity, observer: "agent-a", perceptions: []
}, "a perspective projection is pinned and does not mix records from an earlier objective projection");
assert.equal(projectPerspective(base.projection, integrated.state, "agent-a").perceptions.length, 1, "a record remains available only through its pinned objective snapshot");
assert.equal(evaluateObservation(base.projection, { ...request, projection_identity: "wrong" }, observerContext).code, "projection_mismatch");
assert.equal(evaluateObservation(base.projection, request, { ...observerContext, location: "room-a" }).code, "target_out_of_range");
assert.equal(evaluateObservation(base.projection, request, { ...observerContext, capabilities: [] }).code, "unsupported_modality");
assert.equal(evaluateObservation(base.projection, { ...request, modality: "auditory" }, { ...observerContext, capabilities: ["auditory"] }).code, "unregistered_modality");
assert.equal(evaluateObservation({}, request, observerContext).code, "invalid_objective_projection", "invalid input has a deterministic rejection");
assert.equal(evaluateObservation(base.projection, {}, observerContext).code, "invalid_observation_request", "malformed requests cannot create side effects");
assert.deepEqual(reducerDefinitions.find((reducer) => reducer.domain === "perception").writes, ["perceptions"]);
assert.throws(() => replay([...events, { ...perceptionEvent, id: "bad-perception", payload: { ...perceptionEvent.payload, result: { ...result, status: "rejected" } } }], pack), /invalid_perception_record/);
assert.throws(() => replay([...events, { ...perceptionEvent, id: "bad-parent", causal_parents: ["missing"] }], pack), /invalid_causal_parent/);
console.log("validated deterministic observer-local perception and perspective projection");
