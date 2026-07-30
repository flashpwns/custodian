"use strict";
const Ajv2020 = require("ajv/dist/2020");
const { replay, stable, digest } = require("./canonical-kernel.js");
const { runTick } = require("./constitutional-director.js");
const { adaptWorldPack, error } = require("./world-pack-adapter.js");
const scenarioSchema = require("./contracts/scenario.schema.json");
const creationSchema = require("./contracts/session-creation-request.schema.json");
const snapshotSchema = require("./contracts/session-snapshot.schema.json");
const advancementSchema = require("./contracts/session-advancement-request.schema.json");
const exportSchema = require("./contracts/session-export-envelope.schema.json");
const tickSchema = require("./contracts/simulation-tick.schema.json");
const startupSchema = require("./contracts/session-startup.schema.json");
const actionRequestSchema = require("./contracts/session-action-request.schema.json");
const ajv = new Ajv2020({ allErrors: true, strict: false });
for (const schema of [scenarioSchema, snapshotSchema, tickSchema, startupSchema, creationSchema, advancementSchema, exportSchema, actionRequestSchema]) ajv.addSchema(schema);
const validScenario = ajv.getSchema(scenarioSchema.$id), validCreation = ajv.getSchema(creationSchema.$id), validSnapshot = ajv.getSchema(snapshotSchema.$id), validAdvance = ajv.getSchema(advancementSchema.$id), validExport = ajv.getSchema(exportSchema.$id);
const validActionRequest = ajv.getSchema(actionRequestSchema.$id);
function merge(base, override) { const result = structuredClone(base); for (const [key, value] of Object.entries(override ?? {})) result[key] = value && typeof value === "object" && !Array.isArray(value) ? merge(result[key] ?? {}, value) : structuredClone(value); return result; }
function initializeAuthority(pack, scenario) {
  const next = structuredClone(pack);
  next.initial_objective.actors = structuredClone(next.initial_objective.actors ?? {});
  next.initial_objective.observers = structuredClone(next.initial_objective.observers ?? {});
  for (const actor of scenario.actors ?? []) next.initial_objective.actors[actor.id] = structuredClone({ id: actor.id, ...(actor.position === undefined ? {} : { position: actor.position }) });
  for (const observer of scenario.observers) {
    const authority = { id: observer.id, origin: observer.origin ?? (observer.actor_id ? "embodied" : "unavailable"), ...(observer.actor_id ? { actor_id: observer.actor_id } : {}), capabilities: structuredClone(observer.capabilities ?? []), access: structuredClone(observer.access ?? []) };
    if (authority.actor_id && !next.initial_objective.actors[authority.actor_id]) throw Object.assign(new Error("unknown_bound_actor"), { code: "unknown_bound_actor" });
    if (authority.origin === "embodied" && !authority.actor_id) throw Object.assign(new Error("invalid_observer_binding"), { code: "invalid_observer_binding" });
    next.initial_objective.observers[observer.id] = authority;
  }
  return next;
}
const SESSION_FORMAT = "canonical-session@v2";
function sessionId(pack, scenario, history, seed) { return `session-${digest({ version: "public-session@v1", session_format: SESSION_FORMAT, world: { id: pack.id, version: pack.version }, scenario, history, seed: seed ?? {} })}`; }
function makeSnapshot(pack, scenario, history, seed, complete = false) { const rebuilt = replay(history, pack); return { version: "public-session@v1", session_format: SESSION_FORMAT, id: sessionId(pack, scenario, history, seed), world: { id: pack.id, version: pack.version, kernel_compatibility: pack.kernel_compatibility }, world_pack: structuredClone(pack), scenario: structuredClone(scenario), history: structuredClone(history), observers: structuredClone(scenario.observers), projection: structuredClone(rebuilt.projection), complete, seed_material: structuredClone(seed ?? {}), startup: structuredClone(rebuilt.state.startup ?? {}) }; }
function startupEvent(pack, scenario, startup, seed) { const session = sessionId(pack, scenario, [], seed); return { id: `session-start-${digest({ world: { id: pack.id, version: pack.version }, scenario: scenario.id, startup, seed: seed ?? {} })}`, session_id: session, sequence: 1, type: "session.started", version: "v1", at: 0, phase: "scheduled", priority: 0, domain: "session", world: { id: pack.id, version: pack.version }, payload: structuredClone(startup), causal_parents: [] }; }
function createSession(request) {
  if (!validCreation(request)) return error("INVALID_SESSION", { contract: "session-creation-request" });
  if (!validScenario(request.scenario)) return error("INVALID_SCENARIO", { contract: "scenario" });
  const adapted = adaptWorldPack(request.world_pack); if (!adapted.ok) return adapted;
  if (request.scenario.world.id !== adapted.value.id || request.scenario.world.version !== adapted.value.version) return error("INVALID_SCENARIO", { reason: "world_mismatch" });
  let pack = structuredClone(adapted.value); pack.initial_objective = merge(pack.initial_objective, request.scenario.initial_objective_overrides);
  try { pack = initializeAuthority(pack, request.scenario); } catch (cause) { return error("INVALID_SCENARIO", { reason: cause.code ?? "invalid_observer_authority" }); }
  if (request.startup && !request.scenario.observers.some((observer) => observer.id === request.startup.player.observer_id)) return error("INVALID_SESSION", { reason: "unknown_player_observer" });
  try { const history = [...(request.startup ? [startupEvent(pack, request.scenario, request.startup, request.seed_material)] : []), ...(request.initial_history ?? []), ...(request.scenario.scheduled_events ?? [])]; const snapshot = makeSnapshot(pack, request.scenario, history, request.seed_material, false); return { ok: true, session: structuredClone(snapshot) }; } catch (cause) { return error("CORRUPTED_HISTORY", { code: cause.code ?? "replay_failed" }); }
}
function inspectSession(session) { if (!validSnapshot(session)) return error("INVALID_SESSION", { contract: "session-snapshot" }); return { ok: true, session: structuredClone(session) }; }
function advanceSession(request) {
  if (!validAdvance(request)) return error("INVALID_TICK_REQUEST", { contract: "session-advancement-request" });
  if (request.session.complete) return error("SESSION_COMPLETE", {});
  const checked = inspectSession(request.session); if (!checked.ok) return checked;
  const expected = sessionId(request.session.world_pack, request.session.scenario, request.session.history, request.session.seed_material);
  if (expected !== request.session.id) return error("INVALID_SESSION", { reason: "identity_mismatch" });
  try { const tick = runTick({ history: request.session.history, pack: request.session.world_pack, tick: request.tick, scheduled_events: request.scheduled_events ?? [] }); const snapshot = makeSnapshot(request.session.world_pack, request.session.scenario, [...request.session.history, ...tick.events], request.session.seed_material, tick.complete); return { ok: true, session: structuredClone(snapshot), tick_result: structuredClone(tick), events: structuredClone(tick.events), projection: structuredClone(snapshot.projection), complete: tick.complete, diagnostics: [] }; } catch (cause) { return error("INVALID_TICK_REQUEST", { code: cause.code ?? "director_failed" }); }
}
function getAvailableSessionActions({ session, actor }) {
  const checked = inspectSession(session); if (!checked.ok) return checked;
  if (!session.observers.some((observer) => observer.id === actor)) return error("INVALID_SESSION", { reason: "unknown_actor" });
  const permissions = (session.startup?.permissions ?? []).filter((entry) => entry.observer_id === actor).map((entry) => entry.permission);
  const declared = (session.world_pack.execution_rules ?? []).map((rule) => rule.intent);
  const profileControlled = Boolean(session.startup?.player?.observer_id);
  return { ok: true, actor, actions: [...new Set(declared.filter((intent) => !profileControlled || permissions.includes(intent)))].sort() };
}
function submitSessionAction(request) {
  if (!validActionRequest(request)) return error("INVALID_TICK_REQUEST", { contract: "session-action-request" });
  const actions = getAvailableSessionActions(request); if (!actions.ok) return actions;
  if (!actions.actions.includes(request.action)) return error("INVALID_TICK_REQUEST", { reason: "action_unavailable" });
  const at = (request.session.history.reduce((maximum, event) => Math.max(maximum, event.at), 0)) + 1;
  const tick = { id: `public-action-${digest({ session: request.session.id, actor: request.actor, action: request.action, target: request.target, parameters: request.parameters ?? {}, at })}`, at, observers: [{ id: request.actor, goals: [{ id: `public-goal-${digest({ actor: request.actor, action: request.action, target: request.target, parameters: request.parameters ?? {} })}`, intent: request.action, priority: 0 }], plans: [] }] };
  const advanced = advanceSession({ session: request.session, tick }); if (!advanced.ok) return advanced;
  const execution = advanced.tick_result.execution_results[0];
  return { ok: true, outcome: execution.status === "SUCCESS" ? "succeeded" : execution.status === "BLOCKED" ? "failed" : "rejected", action: request.action, actor: request.actor, reason: execution.reason, event_ids: advanced.events.map((event) => event.id), session: advanced.session };
}
function exportSession(session) { const checked = inspectSession(session); if (!checked.ok) return checked; return { ok: true, envelope: { version: "session-export@v1", session: structuredClone(session), cache: { projection_identity: session.projection.identity }, serialization: stable({ version: "session-export@v1", session, cache: { projection_identity: session.projection.identity } }) } }; }
function restoreSession(envelope) {
  if (!validExport(envelope)) return error("INVALID_SESSION", { contract: "session-export-envelope" });
  const adapted = adaptWorldPack(envelope.session.world_pack); if (!adapted.ok) return adapted;
  try { const snapshot = makeSnapshot(adapted.value, envelope.session.scenario, envelope.session.history, envelope.session.seed_material, envelope.session.complete); if (snapshot.projection.identity !== envelope.cache.projection_identity) return error("PROJECTION_IDENTITY_MISMATCH", { expected: envelope.cache.projection_identity, actual: snapshot.projection.identity }); return { ok: true, session: structuredClone(snapshot) }; } catch (cause) { return error("CORRUPTED_HISTORY", { code: cause.code ?? "replay_failed" }); }
}
module.exports = { createSession, advanceSession, inspectSession, exportSession, restoreSession, getAvailableSessionActions, submitSessionAction };
