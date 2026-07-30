"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { replay, resolveObserverContext, stable } = require("../runtime/canonical-kernel.js");
const { runTick } = require("../runtime/constitutional-director.js");
const { createSession, submitSessionAction, exportSession, restoreSession } = require("../runtime/session-api.js");

const root = path.resolve(__dirname, "..");
const pack = JSON.parse(fs.readFileSync(path.join(root, "canon/reference-convergence/manifest.json"), "utf8"));
pack.observation_capabilities.push({ id: "reference-auditory", modalities: ["auditory"] });
pack.initial_objective.environment.signals["room-a-tone"] = { location: "room-a", modality: "auditory", content: "tone", fidelity: 1, source: "tone-source" };
pack.execution_rules.push({ id: "move-actor-a", intent: "move-actor-a", preconditions: [{ path: "actors.actor-a.position", equals: "room-a" }], success_effects: [{ type: "actors.positioned", domain: "actors", payload: { actor_id: "actor-a", position: "room-b" } }] });
const scenario = {
  id: "observer-authority-runtime",
  world: { id: pack.id, version: pack.version },
  actors: [{ id: "actor-a", position: "room-a" }, { id: "actor-b", position: "room-b" }],
  observers: [
    { id: "observer-a", goals: [], plans: [], actor_id: "actor-a", origin: "embodied", capabilities: ["visual"], access: ["local-a"] },
    { id: "observer-b", goals: [], plans: [], actor_id: "actor-b", origin: "embodied", capabilities: ["auditory"], access: ["local-b"] },
    { id: "observer-remote", goals: [], plans: [], origin: "remote", capabilities: ["visual"], access: ["remote"] },
    { id: "observer-none", goals: [], plans: [], origin: "unavailable" }
  ]
};
const sourceEvent = { id: "e1", session_id: "authority-runtime", sequence: 1, type: "environment.signal.initialized", version: "v1", at: 0, phase: "scheduled", priority: 0, domain: "environment", world: { id: pack.id, version: pack.version }, payload: {}, causal_parents: [] };
const created = createSession({ world_pack: pack, scenario, initial_history: [sourceEvent], seed_material: { scenario_seed: "authority-runtime" } });
assert.equal(created.ok, true);
let state = replay(created.session.history, created.session.world_pack).state;
assert.deepEqual(resolveObserverContext(state, "observer-a"), { status: "resolved", context: { observer: "observer-a", location: "room-a", capabilities: ["visual"], access: ["local-a"] } });
assert.equal(resolveObserverContext(state, "observer-remote").code, "remote_origin_unavailable");
assert.equal(resolveObserverContext(state, "observer-none").code, "observer_context_unavailable");
assert.equal(resolveObserverContext({ objective: { actors: {}, observers: { unbound: { id: "unbound", origin: "embodied", capabilities: [], access: [] } } } }, "unbound").code, "observer_binding_unavailable", "bindings are never inferred from IDs");
assert.equal(resolveObserverContext({ objective: { actors: {}, observers: { broken: { id: "broken", origin: "embodied", actor_id: "missing", capabilities: [], access: [] } } } }, "broken").code, "observer_origin_unavailable");

const visualSpoof = runTick({ history: created.session.history, pack: created.session.world_pack, tick: { id: "spoof-location", at: 1, observers: [{ id: "observer-a", goals: [], plans: [], perception: { request: { id: "see-fire", observer: "observer-a", projection_identity: created.session.projection.identity, modality: "visual", target: "fire-glow" }, context: { observer: "observer-a", location: "room-b", capabilities: ["auditory"], access: ["local-b"] } } }] } });
assert.equal(visualSpoof.perception_results[0].result.code, "target_out_of_range", "caller location claims cannot move perception origin");
const capabilitySpoof = runTick({ history: created.session.history, pack: created.session.world_pack, tick: { id: "spoof-capability", at: 1, observers: [{ id: "observer-a", goals: [], plans: [], perception: { request: { id: "hear-tone", observer: "observer-a", projection_identity: created.session.projection.identity, modality: "auditory", target: "room-a-tone" }, context: { observer: "observer-a", location: "room-a", capabilities: ["auditory"], access: ["local-b"] } } }] } });
assert.equal(capabilitySpoof.perception_results[0].result.code, "unsupported_modality", "caller capability claims cannot add perception capability");
assert.deepEqual(resolveObserverContext(state, "observer-a").context.access, ["local-a"], "caller access claims cannot change canonical access");
assert.equal(resolveObserverContext(state, "observer-b").context.location, "room-b", "observer identity selects its own canonical authority");

const moved = submitSessionAction({ session: created.session, actor: "observer-a", action: "move-actor-a" });
assert.equal(moved.ok, true);
state = replay(moved.session.history, moved.session.world_pack).state;
assert.equal(resolveObserverContext(state, "observer-a").context.location, "room-b", "movement updates the bound observer origin through actor state only");
const postMove = runTick({ history: moved.session.history, pack: moved.session.world_pack, tick: { id: "post-move", at: 2, observers: [{ id: "observer-a", goals: [], plans: [], perception: { request: { id: "see-fire-after-move", observer: "observer-a", projection_identity: moved.session.projection.identity, modality: "visual", target: "fire-glow" }, context: { observer: "observer-a", location: "room-a", capabilities: [], access: [] } } }] } });
assert.equal(postMove.perception_results[0].result.status, "observed", "legacy caller context cannot suppress canonical visual capability or moved origin");
const restored = restoreSession(exportSession(moved.session).envelope);
assert.equal(restored.ok, true);
const restoredState = replay(restored.session.history, restored.session.world_pack).state;
assert.deepEqual(resolveObserverContext(restoredState, "observer-a"), resolveObserverContext(state, "observer-a"), "export/restore preserves canonical observer authority");
assert.equal(stable(replay(moved.session.history, moved.session.world_pack).state), stable(state), "replay reconstructs identical actor and observer authority");
console.log("validated Director canonical observer authority and spoof resistance");
