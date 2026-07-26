const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { stable, replay } = require("../runtime/canonical-kernel.js");
const { PHASE_ORDER, runTick } = require("../runtime/constitutional-director.js");

const root = path.resolve(__dirname, "..");
const pack = JSON.parse(fs.readFileSync(path.join(root, "canon/reference-convergence/manifest.json"), "utf8"));
const history = JSON.parse(fs.readFileSync(path.join(root, "examples/reference-simulation/events.json"), "utf8"));
const activeTick = { id: "tick-9", at: 9, observers: [
  { id: "agent-b", goals: [{ id: "b-fire", intent: "extinguish-fire", priority: 1 }], plans: [] },
  { id: "agent-a", goals: [{ id: "a-fire", intent: "extinguish-fire", priority: 0 }], plans: [] }
] };
const first = runTick({ history, pack, tick: activeTick });
const second = runTick({ history: [...history].reverse(), pack, tick: { ...activeTick, observers: [...activeTick.observers].reverse() } });
const checkpoint = replay(history.slice(0, 6), pack);
const fromCheckpoint = runTick({ history, pack, tick: activeTick });
const idle = runTick({ history, pack, tick: { id: "tick-idle", at: 9, observers: [{ id: "agent-a", goals: [], plans: [] }, { id: "agent-b", goals: [], plans: [] }] } });

assert.deepEqual(first.phase_order, PHASE_ORDER, "all constitutional phases are recorded in fixed order");
assert.deepEqual(first.observer_order, ["agent-a", "agent-b"], "observers are explicitly sorted");
assert.deepEqual(first.execution_results.map((result) => result.status), ["SUCCESS", "BLOCKED"], "conflicting actions resolve deterministically");
assert.equal(first.projection.objective.environment.hazards["fire-b"].active, false, "materialized effects advance reality only through replay");
assert.deepEqual(first.projection, second.projection, "observer and input insertion order cannot change tick output");
assert.equal(stable(first.events), stable(second.events), "tick event materialization is byte-stable");
assert.deepEqual(first.projection, fromCheckpoint.projection, "director continuation preserves replay equivalence");
assert.equal(checkpoint.projection.projected_through, 6, "checkpoint fixture remains a compatible replay boundary");
assert.equal(idle.complete, true, "idle tick completes without generated events");
assert.equal(idle.events.length, 0, "idle completion does not mutate history");
console.log("validated constitutional director scheduling, completion, and replay");
