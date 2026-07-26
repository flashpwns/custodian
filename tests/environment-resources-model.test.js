const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { replayResources } = require("../runtime/reference/resources.js");

const plan = JSON.parse(fs.readFileSync(path.join(__dirname, "../examples/environment-resources/plan.json"), "utf8"));
const first = replayResources(plan);
const second = replayResources(plan);

assert.deepEqual(first, second, "resource replay is deterministic");
assert.equal(first.quantities.store.fuel + first.quantities["agent-a"].fuel, 10, "transfers conserve quantity");
assert.equal(first.quantities.store.fuel, 6, "reservation does not consume or allocate fuel");
assert.equal(first.history.find((entry) => entry.id === "reserve-fuel").status, "failed", "conflicting reservation is deterministically rejected");
assert.equal(first.allocations["allocate-fuel"].quantity, 6, "allocation remains distinct from custody and consumption");
assert.equal(first.history.find((entry) => entry.id === "fuel-failed").status, "failed", "failed transfer preserves source and destination quantities");
assert.equal(first.objects.key.owner, "agent-b", "ownership differs from custody");
assert.equal(first.objects.key.custodian, "agent-a", "committed transfer changes custody");
assert.equal(first.objects.key.container, "agent-a", "inventory is objective containment");
console.log("validated environment resource model");
