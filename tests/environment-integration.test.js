const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { replayEnvironmentIntegration } = require("../runtime/reference/environment-integration.js");
const { replayEvidence } = require("../runtime/reference/evidence.js");

const plan = JSON.parse(fs.readFileSync(path.join(__dirname, "../examples/environment-integration/plan.json"), "utf8"));
const first = replayEnvironmentIntegration(plan);
const second = replayEnvironmentIntegration(plan);
const beforeObservation = replayEvidence({ ...plan.evidence, target_time: 4 });

assert.deepEqual(first, second, "integrated environment replay is deterministic");
assert.equal(first.spatial.positions.scout, "room-safe", "physical position constrains the agent's hazard exposure");
assert.equal(first.environment.agents.scout.health, 10, "communication changes planning without changing the hazard");
assert.equal(first.environment.hazards["electrified-water"].harm, 3, "warning never modifies objective hazard state");
assert.equal(first.environment.planning.scout.response, "avoid-room-b", "delivered communication informs environmental planning");
assert.equal(first.planning.steps.find((step) => step.id === "avoid-hazard").status, "completed", "planning records the warning-guided route choice");
assert.equal(first.planning.steps.find((step) => step.id === "repair-after-damage").status, "completed", "recorded environmental damage enables later repair planning");
assert.equal(first.agency.history.find((item) => item.id === "proposal-seal-door").status, "failed", "objective constraints reject environmental action proposals");
assert.equal(first.environment.affordances["door-b"].traverse, true, "only committed agency repair restores affordance");
assert.equal(first.environment.resources["maintenance-kit"].parts, 0, "repair uses the objective resource path");
assert.equal(first.environment.connections[0].traversable, false, "simulation time applies scheduled topology change");
assert.equal(beforeObservation.observers.scout, undefined, "environmental damage remains unknown before valid access");
assert.equal(first.evidence.history.find((item) => item.id === "observe-damage").at, 5, "evidence propagates through later observation");
assert.equal(first.evidence.observers.scout.knowledge.length, 2, "valid evidence access creates bounded knowledge");
assert.equal(first.memory.memories.length, 2, "environmental evidence forms replayable memories");
assert.equal(first.memory.memories.find((memory) => memory.id === "memory-seal-failure").formed_from, "failed-seal-trace", "failed environmental action remains evidenced and memorable");
assert.equal(first.relationships.objective_reality["door.traversable"], undefined, "relationships cannot modify physical state");
console.log("validated environment integration");
