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
const ajv = new Ajv2020({ allErrors: true, strict: false });
for (const schema of [scenarioSchema, snapshotSchema, tickSchema, creationSchema, advancementSchema, exportSchema]) ajv.addSchema(schema);
const validScenario = ajv.getSchema(scenarioSchema.$id), validCreation = ajv.getSchema(creationSchema.$id), validSnapshot = ajv.getSchema(snapshotSchema.$id), validAdvance = ajv.getSchema(advancementSchema.$id), validExport = ajv.getSchema(exportSchema.$id);
function merge(base, override) { const result = structuredClone(base); for (const [key, value] of Object.entries(override ?? {})) result[key] = value && typeof value === "object" && !Array.isArray(value) ? merge(result[key] ?? {}, value) : structuredClone(value); return result; }
function sessionId(pack, scenario, history, seed) { return `session-${digest({ version: "public-session@v1", world: { id: pack.id, version: pack.version }, scenario, history, seed: seed ?? {} })}`; }
function makeSnapshot(pack, scenario, history, seed, complete = false) { const rebuilt = replay(history, pack); return { version: "public-session@v1", id: sessionId(pack, scenario, history, seed), world: { id: pack.id, version: pack.version, kernel_compatibility: pack.kernel_compatibility }, world_pack: structuredClone(pack), scenario: structuredClone(scenario), history: structuredClone(history), observers: structuredClone(scenario.observers), projection: structuredClone(rebuilt.projection), complete, seed_material: structuredClone(seed ?? {}) }; }
function createSession(request) {
  if (!validCreation(request)) return error("INVALID_SESSION", { contract: "session-creation-request" });
  if (!validScenario(request.scenario)) return error("INVALID_SCENARIO", { contract: "scenario" });
  const adapted = adaptWorldPack(request.world_pack); if (!adapted.ok) return adapted;
  if (request.scenario.world.id !== adapted.value.id || request.scenario.world.version !== adapted.value.version) return error("INVALID_SCENARIO", { reason: "world_mismatch" });
  const pack = structuredClone(adapted.value); pack.initial_objective = merge(pack.initial_objective, request.scenario.initial_objective_overrides);
  try { const history = [...(request.initial_history ?? []), ...(request.scenario.scheduled_events ?? [])]; const snapshot = makeSnapshot(pack, request.scenario, history, request.seed_material, false); return { ok: true, session: structuredClone(snapshot) }; } catch (cause) { return error("CORRUPTED_HISTORY", { code: cause.code ?? "replay_failed" }); }
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
function exportSession(session) { const checked = inspectSession(session); if (!checked.ok) return checked; return { ok: true, envelope: { version: "session-export@v1", session: structuredClone(session), cache: { projection_identity: session.projection.identity }, serialization: stable({ version: "session-export@v1", session, cache: { projection_identity: session.projection.identity } }) } }; }
function restoreSession(envelope) {
  if (!validExport(envelope)) return error("INVALID_SESSION", { contract: "session-export-envelope" });
  const adapted = adaptWorldPack(envelope.session.world_pack); if (!adapted.ok) return adapted;
  try { const snapshot = makeSnapshot(adapted.value, envelope.session.scenario, envelope.session.history, envelope.session.seed_material, envelope.session.complete); if (snapshot.projection.identity !== envelope.cache.projection_identity) return error("PROJECTION_IDENTITY_MISMATCH", { expected: envelope.cache.projection_identity, actual: snapshot.projection.identity }); return { ok: true, session: structuredClone(snapshot) }; } catch (cause) { return error("CORRUPTED_HISTORY", { code: cause.code ?? "replay_failed" }); }
}
module.exports = { createSession, advanceSession, inspectSession, exportSession, restoreSession };
