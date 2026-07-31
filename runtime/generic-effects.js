"use strict";

const crypto = require("node:crypto");
function stable(value) { if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`; if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`; return JSON.stringify(value); }
function digest(value) { return crypto.createHash("sha256").update(stable(value)).digest("hex"); }

const PRIMARY_RELATIONS = new Set(["at", "inside", "on", "under", "held_by", "carried_by", "contained_by"]);
function effectStore(state) { return state.objective.environment?.generic_effects ?? { entities: {}, relations: [], events: [], clock: 0 }; }
function entityExists(state, ref) { return Boolean(state.objective.actors?.[ref] || effectStore(state).entities?.[ref] || state.objective.resources?.[ref]); }
function relations(state) { return effectStore(state).relations ?? []; }
function sameRelation(a, b) { return a.subject_ref === b.subject_ref && a.relation === b.relation && a.target_ref === b.target_ref; }
function hasRelation(state, relation) { return relations(state).some((entry) => sameRelation(entry, relation)); }
function stateOf(state, ref) { return effectStore(state).entities?.[ref]?.state ?? {}; }
function conditionMet(state, condition) {
  if (condition.kind === "relation_exists") return hasRelation(state, condition);
  if (condition.kind === "relation_absent") return !hasRelation(state, condition);
  if (condition.kind === "state_equals") return stateOf(state, condition.object_ref)[condition.key] === condition.value;
  if (condition.kind === "state_absent") return !(condition.key in stateOf(state, condition.object_ref));
  return false;
}
function validateEffect(state, effect) {
  const ref = effect.object_ref ?? effect.item_ref ?? effect.subject_ref ?? effect.actor_ref ?? effect.sender_ref;
  const target = effect.target_ref ?? effect.to?.target_ref;
  if (["RELOCATE_ACTOR", "RELOCATE_OBJECT", "SET_OBJECT_STATE", "TRANSFER_ITEM", "SET_RELATION", "REMOVE_RELATION"].includes(effect.type) && (!ref || !entityExists(state, ref))) return "target_missing";
  if (target && !entityExists(state, target) && !state.objective.environment?.locations?.[target]) return "target_missing";
  if (effect.type === "RELOCATE_ACTOR" && !state.objective.actors?.[effect.actor_ref]) return "target_missing";
  if (effect.type === "COMMUNICATION_EVENT" && (!entityExists(state, effect.sender_ref) || !(effect.channel || effect.recipients?.length))) return "invalid_effect";
  if (effect.type === "TIME_BEAT" && !Number.isInteger(effect.ticks)) return "invalid_effect";
  if (effect.type === "APPEND_EVENT" && !effect.event_type) return "invalid_effect";
  if (effect.type === "TRANSFER_ITEM" && (!effect.item_ref || !effect.to || (!entityExists(state, effect.to.target_ref) && !state.objective.environment?.locations?.[effect.to.target_ref]))) return "invalid_effect";
  if (effect.type === "SET_RELATION" || effect.type === "REMOVE_RELATION") if (!effect.subject_ref || !effect.target_ref || !effect.relation) return "invalid_effect";
  return null;
}
function mutationsFor(state, effect) {
  const primary = (subject_ref, relation, target_ref) => ({ remove_subject_primary: subject_ref, remove_relations: ["at", "inside", "on", "under", "held_by", "carried_by", "contained_by"], add: { subject_ref, relation, target_ref } });
  switch (effect.type) {
    case "RELOCATE_ACTOR": return { ...primary(effect.actor_ref, effect.relation ?? "at", effect.target_ref), actor_position: { actor_ref: effect.actor_ref, position: effect.target_ref } };
    case "RELOCATE_OBJECT": return primary(effect.object_ref, effect.relation ?? "at", effect.target_ref);
    case "SET_OBJECT_STATE": return { set_state: { object_ref: effect.object_ref, key: effect.key, value: structuredClone(effect.value) } };
    case "TRANSFER_ITEM": return { remove: effect.from ? { subject_ref: effect.item_ref, relation: effect.from.relation, target_ref: effect.from.target_ref } : null, ...primary(effect.item_ref, effect.to.relation, effect.to.target_ref) };
    case "SET_RELATION": return PRIMARY_RELATIONS.has(effect.relation) ? { remove_subject_primary: effect.subject_ref, remove_relations: [...PRIMARY_RELATIONS], add: { subject_ref: effect.subject_ref, relation: effect.relation, target_ref: effect.target_ref } } : { add: { subject_ref: effect.subject_ref, relation: effect.relation, target_ref: effect.target_ref } };
    case "REMOVE_RELATION": return { remove: { subject_ref: effect.subject_ref, relation: effect.relation, target_ref: effect.target_ref } };
    case "COMMUNICATION_EVENT": return { communication: { sender_ref: effect.sender_ref, recipients: structuredClone(effect.recipients ?? []), channel: effect.channel ?? null, content: structuredClone(effect.content ?? {}), delivery_state: effect.delivery_state ?? "pending" } };
    case "TIME_BEAT": return { time: { ticks: effect.ticks } };
    case "APPEND_EVENT": return { appended_event: { type: effect.event_type, payload: structuredClone(effect.payload ?? {}) } };
    default: return null;
  }
}
function applyMutation(state, mutation, eventId) {
  const next = structuredClone(state); const env = next.objective.environment ?? (next.objective.environment = {});
  const store = env.generic_effects ?? (env.generic_effects = { entities: {}, relations: [], events: [], clock: 0 });
  store.entities ??= {}; store.relations ??= []; store.events ??= []; store.clock ??= 0;
  const remove = (relation) => { if (!relation) return; store.relations = store.relations.filter((entry) => !sameRelation(entry, relation)); };
  if (mutation.remove) remove(mutation.remove);
  if (mutation.remove_subject_primary) store.relations = store.relations.filter((entry) => entry.subject_ref !== mutation.remove_subject_primary || !mutation.remove_relations.includes(entry.relation));
  if (mutation.add && !store.relations.some((entry) => sameRelation(entry, mutation.add))) store.relations.push(structuredClone(mutation.add));
  if (mutation.set_state) { const { object_ref, key, value } = mutation.set_state; store.entities[object_ref] = { ...(store.entities[object_ref] ?? { id: object_ref }), state: { ...(store.entities[object_ref]?.state ?? {}), [key]: value } }; }
  if (mutation.actor_position) next.objective.actors[mutation.actor_position.actor_ref].position = mutation.actor_position.position;
  if (mutation.communication) next.objective.messages = [...(next.objective.messages ?? []), { id: `communication-${eventId}`, ...mutation.communication }];
  if (mutation.time) { store.clock += mutation.time.ticks; next.objective.timeline = { ...(next.objective.timeline ?? {}), generic_effect_clock: store.clock }; }
  if (mutation.appended_event) store.events.push({ id: `event-${eventId}`, ...mutation.appended_event });
  return next;
}
function requestResultFromHistory(history, requestId) {
  const events = history.filter((event) => event.type === "environment.generic-effect.resolved" && event.payload?.request_id === requestId).sort((a, b) => a.sequence - b.sequence);
  if (!events.length) return null;
  const effect_results = events.map((event) => structuredClone(event.payload.effect_result));
  const first = events[0].payload, last = events.at(-1).payload;
  return { version: "custodian-effect-result@v1", request_id: requestId, status: last.request_status, duplicate: true, effect_results, canonical_event_refs: events.map((event) => event.id), state_revision_before: first.state_revision_before, state_revision_after: last.state_revision_after, time_before: first.time_before, time_after: last.time_after, applied_effects: effect_results.filter((x) => x.status === "APPLIED").map((x) => x.effect_id), failed_effects: effect_results.filter((x) => x.status === "FAILED").map((x) => x.effect_id), skipped_effects: effect_results.filter((x) => x.status === "SKIPPED").map((x) => x.effect_id) };
}
function revision(history) { return digest(history.map((event) => event.id)); }
module.exports = { PRIMARY_RELATIONS, effectStore, entityExists, conditionMet, validateEffect, mutationsFor, applyMutation, requestResultFromHistory, revision };
