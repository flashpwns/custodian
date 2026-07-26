const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { replayEnvironmentalState } = require("../runtime/reference/environment-model.js");

const plan = JSON.parse(fs.readFileSync(path.join(__dirname, "../examples/environment-model/plan.json"), "utf8"));
const first = replayEnvironmentalState(plan);
const second = replayEnvironmentalState(plan);
const damagedPlan = { ...plan, entries: plan.entries.filter((entry) => entry.at <= 4) };
const damaged = replayEnvironmentalState(damagedPlan);

assert.deepEqual(first, second, "environmental replay is deterministic");
assert.equal(first.conditions["room-b"].water, 1, "condition changes without any observation entry");
assert.equal(first.agents["unaware-explorer"].health, 7, "hazard affects an unaware agent through objective exposure");
assert.deepEqual(first.planning["unaware-explorer"].response, "avoid-room-b", "warning changes planning state");
assert.equal(first.hazards["electrified-water"].harm, 3, "warning does not change the objective hazard");
assert.equal(damaged.affordances["door-b"].traverse, false, "committed damage removes a physical affordance");
assert.equal(first.affordances["door-b"].traverse, true, "committed repair restores a damaged affordance");
assert.equal(first.resources["maintenance-kit"].parts, 0, "committed repair consumes its material path");
assert.equal(first.connections[0].traversable, false, "scheduled topology change resolves at simulation time");
assert.equal(first.conditions["room-c"].water, 0.75, "propagation and decay are objective environmental effects");
console.log("validated environment model");
