"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { replay, stable } = require("../runtime/canonical-kernel.js");
const { createSession, exportSession, restoreSession } = require("../runtime/session-api.js");

const root = path.resolve(__dirname, "..");
const pack = JSON.parse(fs.readFileSync(path.join(root, "examples/signal-room/manifest.json"), "utf8"));
const scenario = {
  id: "actor-observer-foundation",
  world: { id: pack.id, version: pack.version },
  actors: [{ id: "actor-a", position: "location-a" }],
  observers: [
    { id: "observer-a", goals: [], plans: [], actor_id: "actor-a", origin: "embodied", capabilities: ["visual"], access: ["local"] },
    { id: "observer-b", goals: [], plans: [], origin: "unavailable" }
  ]
};
const created = createSession({ world_pack: pack, scenario, seed_material: { scenario_seed: "actor-observer" } });
assert.equal(created.ok, true);
assert.equal(created.session.session_format, "canonical-session@v2");
const authority = created.session.projection.objective;
assert.deepEqual(authority.actors["actor-a"], { id: "actor-a", position: "location-a" });
assert.deepEqual(authority.observers["observer-a"], { id: "observer-a", origin: "embodied", actor_id: "actor-a", capabilities: ["visual"], access: ["local"] });
assert.deepEqual(authority.observers["observer-b"], { id: "observer-b", origin: "unavailable", capabilities: [], access: [] });
assert.equal(authority.observers["observer-b"].actor_id, undefined, "observer bindings are explicit and never inferred");

const move = { id: "actor-a-positioned", session_id: created.session.id, sequence: 1, type: "actors.positioned", version: "v1", at: 1, phase: "consequence", priority: 0, domain: "actors", world: { id: pack.id, version: pack.version }, payload: { actor_id: "actor-a", position: "location-b" }, causal_parents: [] };
const replayed = replay([move], created.session.world_pack);
assert.equal(replayed.state.objective.actors["actor-a"].position, "location-b", "actor position has one canonical actor-owned source");
assert.equal(replayed.state.objective.environment.positions, undefined, "actor authority does not mirror positions into environment state");
assert.equal(stable(replay([move], created.session.world_pack).state), stable(replayed.state), "actor and observer state replay deterministically");

const initialized = replay([
  { id: "actor-b-initialized", session_id: "foundation", sequence: 1, type: "actors.initialized", version: "v1", at: 0, phase: "scheduled", priority: 0, domain: "actors", world: { id: pack.id, version: pack.version }, payload: { id: "actor-b", position: "location-c" }, causal_parents: [] },
  { id: "observer-c-initialized", session_id: "foundation", sequence: 2, type: "observers.initialized", version: "v1", at: 0, phase: "scheduled", priority: 0, domain: "observers", world: { id: pack.id, version: pack.version }, payload: { id: "observer-c", actor_id: "actor-b", origin: "embodied", capabilities: [], access: [] }, causal_parents: [] }
], pack);
assert.equal(initialized.state.objective.actors["actor-b"].position, "location-c");
assert.equal(initialized.state.objective.observers["observer-c"].actor_id, "actor-b", "canonical events reconstruct explicit bindings");

const exported = exportSession(created.session);
const restored = restoreSession(exported.envelope);
assert.equal(restored.ok, true);
assert.deepEqual(restored.session.projection.objective.actors, authority.actors);
assert.deepEqual(restored.session.projection.objective.observers, authority.observers);
const legacy = structuredClone(exported.envelope);
delete legacy.session.session_format;
assert.equal(restoreSession(legacy).ok, true, "older compatible exports restore without fabricating authority");
assert.equal(createSession({ world_pack: pack, scenario: { ...scenario, actors: [], observers: [{ id: "observer-a", goals: [], plans: [], actor_id: "missing", origin: "embodied" }] } }).error.code, "INVALID_SCENARIO");
console.log("validated canonical actor and observer state foundation");
