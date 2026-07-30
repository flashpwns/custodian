"use strict";

const Ajv2020 = require("ajv/dist/2020");
const tickSchema = require("./contracts/simulation-tick.schema.json");
const { replay, resolveObserverContext, evaluateObservation, evaluateDecision } = require("./canonical-kernel.js");
const { resolveActions, materializeExecutionEvents } = require("./action-executor.js");

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validateTick = ajv.compile(tickSchema);
const PHASE_ORDER = Object.freeze(["objective_projection", "perception", "knowledge", "belief", "decision", "proposal", "execution", "effects", "replay", "projection"]);
function fail(code, detail) { const error = new Error(`${code}: ${detail}`); error.code = code; throw error; }
function nextSequence(events) { return events.reduce((max, event) => Math.max(max, event.sequence), 0) + 1; }
function canonicalTemplate(template, tick, sequence, pack, defaults = {}) {
  return { id: template.id ?? `director-${tick.id}-${sequence}`, session_id: template.session_id ?? "director-session", sequence, type: template.type, version: "v1", at: tick.at, phase: template.phase ?? "information", priority: template.priority ?? 0, domain: template.domain, world: { id: pack.id, version: pack.version }, payload: structuredClone(template.payload), causal_parents: structuredClone(template.causal_parents ?? []), ...defaults };
}
function runTick({ history = [], pack, tick, scheduled_events = [] }) {
  if (!validateTick(tick)) fail("invalid_simulation_tick", ajv.errorsText(validateTick.errors));
  const observers = [...tick.observers].sort((a, b) => a.id.localeCompare(b.id));
  let allEvents = [...history]; let state = replay(allEvents, pack).state; let projection = replay(allEvents, pack).projection;
  const emitted = [];
  const append = (events) => { if (!events.length) return; allEvents = [...allEvents, ...events]; emitted.push(...events); const rebuilt = replay(allEvents, pack); state = rebuilt.state; projection = rebuilt.projection; };
  append([...scheduled_events].sort((a, b) => a.id.localeCompare(b.id)));
  const perceptionEvents = [];
  const perceptionResults = [];
  for (const observer of observers) if (observer.perception) {
    // Legacy caller context remains parse-compatible, but is deliberately ignored.
    // Canonical actor/observer state is the only authority for perception context.
    const resolved = resolveObserverContext(state, observer.id);
    const result = resolved.status === "resolved"
      ? evaluateObservation(projection, observer.perception.request, resolved.context)
      : { request_id: observer.perception.request?.id ?? "", observer: observer.id, projection_identity: projection.identity, status: "rejected", code: "observer_context_unavailable" };
    perceptionResults.push({ observer: observer.id, result: structuredClone(result) });
    if (result.status === "observed") perceptionEvents.push(canonicalTemplate({ type: "perception.observation.recorded", domain: "perception", payload: { observer: observer.id, result, causal_source: result.source }, causal_parents: [result.source] }, tick, nextSequence([...allEvents, ...perceptionEvents]), pack));
  }
  append(perceptionEvents);
  const knowledgeEvents = observers.flatMap((observer) => (observer.knowledge_events ?? []).map((event) => canonicalTemplate(event, tick, 0, pack))).sort((a, b) => a.id.localeCompare(b.id));
  knowledgeEvents.forEach((event, index) => { event.sequence = nextSequence([...allEvents, ...knowledgeEvents.slice(0, index)]); }); append(knowledgeEvents);
  const beliefEvents = observers.flatMap((observer) => (observer.belief_events ?? []).map((event) => canonicalTemplate(event, tick, 0, pack))).sort((a, b) => a.id.localeCompare(b.id));
  beliefEvents.forEach((event, index) => { event.sequence = nextSequence([...allEvents, ...beliefEvents.slice(0, index)]); }); append(beliefEvents);
  const decisions = observers.map((observer) => ({ observer, result: evaluateDecision(projection, { observer: observer.id, projection_identity: projection.identity, goals: observer.goals, plans: observer.plans }, { perceptions: state.local.perceptions[observer.id], knowledge: state.local.knowledge[observer.id], beliefs: state.local.beliefs[observer.id] }) }));
  const proposalEvents = [];
  for (const proposal of decisions.flatMap(({ result }) => result.proposals).sort((a, b) => a.at - b.at || a.priority - b.priority || a.id.localeCompare(b.id))) proposalEvents.push(canonicalTemplate({ id: `director-${tick.id}-proposal-${proposal.id}`, type: "agency.action.proposed", phase: "action", domain: "agency", priority: proposal.priority, payload: proposal }, tick, nextSequence([...allEvents, ...proposalEvents]), pack));
  append(proposalEvents);
  const results = resolveActions(projection, proposalEvents.map((event) => event.payload), pack);
  const executionEvents = []; let sequence = nextSequence(allEvents);
  results.forEach((result, index) => { const events = materializeExecutionEvents(result, proposalEvents[index], sequence); sequence += events.length; executionEvents.push(...events); });
  append(executionEvents);
  const pending = projection.objective.timeline?.pending?.length ?? 0;
  return { tick_id: tick.id, phase_order: PHASE_ORDER, observer_order: observers.map((observer) => observer.id), perception_results: perceptionResults, decisions: decisions.map(({ observer, result }) => ({ observer: observer.id, result })), execution_results: results, events: emitted, state, projection, complete: proposalEvents.length === 0 && pending === 0 && executionEvents.length === 0 };
}
module.exports = { PHASE_ORDER, runTick };
