"use strict";

const crypto = require("node:crypto");
const Ajv2020 = require("ajv/dist/2020");
const addFormats = require("ajv-formats");
const eventSchema = require("./contracts/canonical-event.schema.json");
const observationRequestSchema = require("./contracts/observation-request.schema.json");
const observerContextSchema = require("./contracts/observer-context.schema.json");
const observationResultSchema = require("./contracts/observation-result.schema.json");
const perceptionRecordSchema = require("./contracts/perception-record.schema.json");
const projectionSchema = require("../state/schemas/objective-projection.schema.json");
const worldPackSchema = require("./contracts/world-pack.schema.json");

const ORDERING_POLICY = "time-phase-priority-sequence-id@v1";
const phases = Object.freeze({ scheduled: 0, action: 1, consequence: 2, information: 3 });
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
ajv.addSchema(observationResultSchema);
const validateEvent = ajv.compile(eventSchema);
const validateObservationRequest = ajv.compile(observationRequestSchema);
const validateObserverContext = ajv.compile(observerContextSchema);
const validateObservationResult = ajv.compile(observationResultSchema);
const validatePerceptionRecord = ajv.compile(perceptionRecordSchema);
const validateProjection = ajv.compile(projectionSchema);
const validateWorldPack = ajv.compile(worldPackSchema);

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
function digest(value) { return crypto.createHash("sha256").update(stable(value)).digest("hex"); }
function compareEvents(a, b) { return a.at - b.at || phases[a.phase] - phases[b.phase] || a.priority - b.priority || a.sequence - b.sequence || a.id.localeCompare(b.id); }
function fail(code, detail) { const error = new Error(`${code}: ${detail}`); error.code = code; throw error; }
function valid(validator, value, code) { if (!validator(value)) fail(code, ajv.errorsText(validator.errors)); }

const reducerDefinitions = Object.freeze([
  { domain: "time", accepts: ["time."], reads: ["timeline"], writes: ["timeline"] },
  { domain: "agency", accepts: ["agency."], reads: ["actions"], writes: ["actions"] },
  { domain: "environment", accepts: ["environment."], reads: ["environment"], writes: ["environment"] },
  { domain: "resources", accepts: ["resources."], reads: ["resources"], writes: ["resources"] },
  { domain: "evidence", accepts: ["evidence."], reads: ["evidence"], writes: ["evidence"] },
  { domain: "communication", accepts: ["communication."], reads: ["messages"], writes: ["messages"] },
  { domain: "planning", accepts: ["planning."], reads: ["plans"], writes: ["plans"] },
  { domain: "memory", accepts: ["memory."], reads: ["memories"], writes: ["memories"] },
  { domain: "relationships", accepts: ["relationships."], reads: ["relationships"], writes: ["relationships"] },
  { domain: "epistemic", accepts: ["epistemic."], reads: ["beliefs", "knowledge"], writes: ["beliefs", "knowledge"] },
  { domain: "perception", accepts: ["perception."], reads: ["perceptions"], writes: ["perceptions"] }
]);

function initialState(pack) {
  valid(validateWorldPack, pack, "invalid_world_pack");
  const objective = structuredClone(pack.initial_objective);
  objective.observation_capabilities = structuredClone(pack.observation_capabilities ?? []);
  return { objective, local: { plans: {}, memories: {}, relationships: {}, beliefs: {}, knowledge: {}, perceptions: {} }, applied: [], simulation_time: 0 };
}
function apply(state, event) {
  const reducer = reducerDefinitions.find((item) => item.domain === event.domain);
  if (!reducer || !reducer.accepts.some((prefix) => event.type.startsWith(prefix))) fail("illegal_domain_ownership", event.type);
  const next = structuredClone(state);
  const p = event.payload;
  if (event.domain === "time") next.objective.timeline = { ...(next.objective.timeline ?? {}), ...p };
  if (event.domain === "agency") next.objective.actions = [...(next.objective.actions ?? []), { id: event.id, ...p }];
  if (event.domain === "environment") next.objective.environment = { ...(next.objective.environment ?? {}), ...p };
  if (event.domain === "resources") next.objective.resources = { ...(next.objective.resources ?? {}), ...p };
  if (event.domain === "evidence") next.objective.evidence = [...(next.objective.evidence ?? []), { id: event.id, ...p }];
  if (event.domain === "communication") next.objective.messages = [...(next.objective.messages ?? []), { id: event.id, ...p }];
  if (event.domain === "planning") next.local.plans[p.agent] = [...(next.local.plans[p.agent] ?? []), p];
  if (event.domain === "memory") next.local.memories[p.agent] = [...(next.local.memories[p.agent] ?? []), p];
  if (event.domain === "relationships") next.local.relationships[p.agent] = [...(next.local.relationships[p.agent] ?? []), p];
  if (event.domain === "epistemic") next.local[p.kind][p.agent] = [...(next.local[p.kind][p.agent] ?? []), p];
  if (event.domain === "perception") {
    valid(validatePerceptionRecord, p, "invalid_perception_record");
    if (p.result.status !== "observed") fail("invalid_perception_record", "only observed results may be committed");
    next.local.perceptions[p.observer] = [...(next.local.perceptions[p.observer] ?? []), { id: event.id, ...p }];
  }
  next.simulation_time = event.at; next.applied.push(event.id);
  return next;
}
function replay(events, pack, checkpoint) {
  const seen = new Set(); const byId = new Map();
  for (const event of events) { valid(validateEvent, event, "invalid_event_contract"); if (seen.has(event.id)) fail("duplicate_event", event.id); seen.add(event.id); byId.set(event.id, event); }
  const ordered = [...events].sort(compareEvents);
  for (const event of ordered) for (const parent of event.causal_parents) { const source = byId.get(parent); if (!source || compareEvents(source, event) >= 0) fail("invalid_causal_parent", `${event.id}:${parent}`); }
  let state = checkpoint ? structuredClone(checkpoint.state) : initialState(pack);
  for (const event of ordered) if (!state.applied.includes(event.id)) state = apply(state, event);
  const projection = objectiveProjection(state, ordered, pack);
  return { state, projection, ordered };
}
function objectiveProjection(state, events, pack) {
  const projectedThrough = events.length ? Math.max(...events.map((event) => event.sequence)) : 0;
  const base = { session_id: events[0]?.session_id ?? "reference", world: { id: pack.id, version: pack.version }, projection_schema: "objective-projection@v2", projected_through: projectedThrough, simulation_time: state.simulation_time, ordering_policy: ORDERING_POLICY, reducer_set: "canonical-reducers@v2", objective: state.objective };
  const projection = { ...base, identity: digest(base) };
  valid(validateProjection, projection, "invalid_objective_projection");
  return projection;
}
function rejectedObservation(request, code) {
  return {
    request_id: typeof request?.id === "string" ? request.id : "",
    observer: typeof request?.observer === "string" ? request.observer : "",
    projection_identity: typeof request?.projection_identity === "string" ? request.projection_identity : "",
    status: "rejected", code
  };
}
function evaluateObservation(projection, request, observerContext) {
  if (!validateProjection(projection)) return rejectedObservation(request, "invalid_objective_projection");
  if (!validateObservationRequest(request)) return rejectedObservation(request, "invalid_observation_request");
  if (!validateObserverContext(observerContext)) return rejectedObservation(request, "invalid_observer_context");
  if (request.projection_identity !== projection.identity) return rejectedObservation(request, "projection_mismatch");
  if (request.observer !== observerContext.observer) return rejectedObservation(request, "observer_mismatch");
  if (!projection.objective.environment?.locations?.[observerContext.location]) return rejectedObservation(request, "invalid_observer_location");
  if (!projection.objective.observation_capabilities?.some((capability) => capability.modalities.includes(request.modality))) return rejectedObservation(request, "unregistered_modality");
  if (!observerContext.capabilities.includes(request.modality)) return rejectedObservation(request, "unsupported_modality");
  const signal = projection.objective.environment?.signals?.[request.target];
  if (!signal) return rejectedObservation(request, "signal_unavailable");
  if (signal.modality !== request.modality) return rejectedObservation(request, "modality_mismatch");
  if (signal.location !== observerContext.location) return rejectedObservation(request, "target_out_of_range");
  const result = { request_id: request.id, observer: request.observer, projection_identity: projection.identity, status: "observed", modality: request.modality, target: request.target, content: signal.content, fidelity: signal.fidelity, source: signal.source };
  valid(validateObservationResult, result, "invalid_observation_result");
  return result;
}
function projectPerspective(projection, state, observer) {
  valid(validateProjection, projection, "invalid_objective_projection");
  const perceptions = (state.local.perceptions?.[observer] ?? [])
    .filter((record) => record.result.projection_identity === projection.identity)
    .map((record) => structuredClone(record));
  return { projection_identity: projection.identity, observer, perceptions };
}
module.exports = { ORDERING_POLICY, compareEvents, reducerDefinitions, stable, digest, replay, objectiveProjection, initialState, evaluateObservation, projectPerspective, fail };
