const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { replayEvidence } = require("../runtime/reference/evidence.js");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const plan = read("examples/evidence-propagation/plan.json");
const expected = read("examples/evidence-propagation/expected-outcome.json");

const firstReplay = replayEvidence(plan);
const secondReplay = replayEvidence(plan);
assert.deepEqual(firstReplay, secondReplay, "deterministic replay must preserve every evidence chain");
assert.equal(firstReplay.simulation_time, expected.simulation_time);
assert.deepEqual(firstReplay.objective_reality, expected.objective_reality);
assert.deepEqual(firstReplay.history.map((event) => event.id), expected.history_ids);

const evidenceById = new Map(firstReplay.evidence.map((item) => [item.id, item]));
const sensorLog = evidenceById.get("sensor-log-1");
assert.equal(sensorLog.origin_event, "reactor-trip", "objective events may create evidence with no observers present");
assert.equal(sensorLog.created_at, 0);
assert.ok(!firstReplay.history.some((event) => event.at === 0 && event.operation.kind === "access"));

for (const observer of Object.values(firstReplay.observers)) {
  for (const knowledge of observer.knowledge) {
    assert.ok(evidenceById.has(knowledge.evidence_id), "knowledge must be acquired through a durable evidence object");
    assert.ok(knowledge.channel, "evidence knowledge must name an information channel");
  }
}

const heatTrace = evidenceById.get("heat-trace-1");
assert.equal(heatTrace.availability, "available", "evidence survives simulation time unless objectively destroyed");
assert.equal(heatTrace.created_at, 0);
assert.equal(sensorLog.availability, "destroyed", "destruction is objective evidence state");
assert.ok(firstReplay.denied.some((attempt) => attempt.evidence_id === "sensor-log-1" && attempt.at === 8), "destroyed evidence prevents future propagation");
assert.equal(firstReplay.observers["late-analyst"], undefined, "a denied evidence read cannot create knowledge");

const partialKnowledge = firstReplay.observers.inspector.knowledge[0];
assert.deepEqual(partialKnowledge.claims, ["airlock.seal-wear"], "incomplete evidence exposes only retained claims");
assert.deepEqual(partialKnowledge.bounds, { completeness: 0.4, fidelity: 0.6 }, "knowledge retains evidence bounds");

const forgedBelief = firstReplay.observers.courier.beliefs[0];
assert.equal(forgedBelief.claim, "airlock.sealed=false");
assert.equal(firstReplay.objective_reality["airlock.sealed"], true, "forged evidence changes belief, never objective reality");

for (const item of firstReplay.evidence) {
  assert.ok(firstReplay.history.some((event) => event.id === item.origin_event), "every evidence object must retain an objective origin event");
}

console.log("validated evidence propagation model");
