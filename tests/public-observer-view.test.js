"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { stable } = require("../runtime/canonical-kernel.js");
const { createSession, submitSessionAction, exportSession, restoreSession, inspectSessionObserver } = require("../index.js");

const root = path.resolve(__dirname, "..");
const pack = JSON.parse(fs.readFileSync(path.join(root, "canon/reference-convergence/manifest.json"), "utf8"));
pack.initial_objective.environment.signals["local-a"] = { location: "room-a", modality: "visual", content: "local indicator", fidelity: 1, source: "source-a" };
pack.initial_objective.environment.signals["private-b"] = { location: "room-b", modality: "visual", content: "private indicator", fidelity: 1, source: "source-b" };
pack.execution_rules.push({ id: "move-a-to-b", intent: "move-a-to-b", preconditions: [{ path: "actors.actor-a.position", equals: "room-a" }], success_effects: [{ type: "actors.positioned", domain: "actors", payload: { actor_id: "actor-a", position: "room-b" } }] });
const scenario = {
  id: "public-observer-view",
  world: { id: pack.id, version: pack.version },
  actors: [{ id: "actor-a", position: "room-a" }, { id: "actor-b", position: "room-b" }],
  observers: [
    { id: "observer-a", goals: [], plans: [], actor_id: "actor-a", origin: "embodied", capabilities: ["visual"], access: ["a"] },
    { id: "observer-b", goals: [], plans: [], actor_id: "actor-b", origin: "embodied", capabilities: ["visual"], access: ["b"] },
    { id: "observer-none", goals: [], plans: [], origin: "unavailable" }
  ]
};
const created = createSession({ world_pack: pack, scenario, seed_material: { scenario_seed: "public-view" } });
assert.equal(created.ok, true);
const beforeHistory = stable(created.session.history);
const first = inspectSessionObserver({ session: created.session, observer: "observer-a", request: { id: "look-a", kind: "look", metadata: { location: "room-b", capabilities: ["auditory"] } } });
const second = inspectSessionObserver({ session: created.session, observer: "observer-a", request: { id: "look-a", kind: "look" } });
assert.deepEqual(first, second, "same read-only request is deterministic and caller context fields have no authority");
assert.equal(first.outcome, "succeeded");
assert.equal(first.view.location, "room-a");
assert.equal(first.targets.length, 1);
assert.equal("target" in first.targets[0], false, "public targets do not reveal objective identifiers");
assert.equal(JSON.stringify(first).includes("private-b"), false, "LOOK hides out-of-context targets");
assert.equal(JSON.stringify(first).includes("room-b"), false, "LOOK hides unknown locations");
assert.equal(JSON.stringify(first).includes("objective"), false, "LOOK has no raw objective projection");
assert.equal(stable(created.session.history), beforeHistory, "LOOK is read-only");
const refA = first.targets[0].ref;
const inspected = inspectSessionObserver({ session: created.session, observer: "observer-a", request: { id: "inspect-a", kind: "inspect", target: refA } });
assert.deepEqual(inspected.details, [{ kind: "signal", modality: "visual", content: "local indicator", fidelity: 1 }]);
for (const target of ["local-a", "hidden:target", "observer-target-not-real", inspectSessionObserver({ session: created.session, observer: "observer-b", request: { kind: "look" } }).targets[0].ref]) {
  const rejected = inspectSessionObserver({ session: created.session, observer: "observer-a", request: { kind: "inspect", target } });
  assert.equal(rejected.public_reason, "target unavailable", "guessed, hidden, nonexistent, and cross-observer targets share a safe failure");
}
assert.equal(inspectSessionObserver({ session: created.session, observer: "observer-b", request: { kind: "inspect", target: refA } }).public_reason, "target unavailable", "observer-scoped refs cannot cross observers");
assert.equal(inspectSessionObserver({ session: created.session, observer: "observer-none", request: { kind: "look" } }).public_reason, "observation unavailable");
assert.equal(inspectSessionObserver({ session: created.session, observer: "missing", request: { kind: "look" } }).public_reason, "observation unavailable");
assert.equal(inspectSessionObserver({ session: created.session, observer: "observer-a", request: { kind: "invalid" } }).public_reason, "observation unavailable");

const other = createSession({ world_pack: pack, scenario, seed_material: { scenario_seed: "other-view" } });
assert.equal(inspectSessionObserver({ session: other.session, observer: "observer-a", request: { kind: "inspect", target: refA } }).public_reason, "target unavailable", "target refs cannot cross sessions");
const moved = submitSessionAction({ session: created.session, actor: "observer-a", action: "move-a-to-b" });
assert.equal(moved.ok, true);
assert.equal(inspectSessionObserver({ session: moved.session, observer: "observer-a", request: { kind: "inspect", target: refA } }).public_reason, "target unavailable", "stale refs are revalidated after movement");
const afterMove = inspectSessionObserver({ session: moved.session, observer: "observer-a", request: { id: "look-b", kind: "look" } });
assert.equal(afterMove.view.location, "room-b", "view follows canonical actor movement");
assert.equal(afterMove.targets.length, 2, "the moved observer receives only room-b's currently observable targets");
const restored = restoreSession(exportSession(moved.session).envelope);
assert.equal(restored.ok, true);
assert.deepEqual(inspectSessionObserver({ session: restored.session, observer: "observer-a", request: { id: "look-b", kind: "look" } }), afterMove, "restore preserves the read-only observer-safe view");
assert.equal(stable(moved.session.history), stable(restored.session.history), "public observations add no replay history");
console.log("certified public observer-safe LOOK/INSPECT, target isolation, and leakage privacy");
