"use strict";

const Ajv2020 = require("ajv/dist/2020");
const actionProposalSchema = require("./contracts/action-proposal.schema.json");
const executionResultSchema = require("./contracts/action-execution-result.schema.json");
const effectRequestSchema = require("./contracts/effect-request.schema.json");
const worldPackSchema = require("./contracts/world-pack.schema.json");
const projectionSchema = require("../state/schemas/objective-projection.schema.json");
const canonicalEventSchema = require("./contracts/canonical-event.schema.json");

const ajv = new Ajv2020({ allErrors: true, strict: false });
ajv.addSchema(effectRequestSchema);
const validateProposal = ajv.compile(actionProposalSchema);
const validateResult = ajv.compile(executionResultSchema);
const validatePack = ajv.compile(worldPackSchema);
const validateProjection = ajv.compile(projectionSchema);
const validateEvent = ajv.compile(canonicalEventSchema);
function reject(proposal, reason) { return { proposal_id: proposal?.id ?? "", status: "INVALID", reason, causal_parents: proposal?.id ? [proposal.id] : ["invalid-proposal"], generated_effects: [] }; }
function atPath(object, path) { return path.split(".").reduce((value, key) => value?.[key], object); }
function ruleMatches(rule, projection) { return (rule.preconditions ?? []).every((condition) => atPath(projection.objective, condition.path) === condition.equals); }
function resolveAction(projection, proposal, pack, claimed = new Set()) {
  if (!validateProjection(projection)) return reject(proposal, "invalid_objective_projection");
  if (!validateProposal(proposal)) return reject(proposal, "invalid_action_proposal");
  if (!validatePack(pack)) return reject(proposal, "invalid_world_pack");
  const rule = [...(pack.execution_rules ?? [])].filter((entry) => entry.intent === proposal.intent).sort((a, b) => a.id.localeCompare(b.id))[0];
  if (!rule) return { proposal_id: proposal.id, status: "INVALID", reason: "unsupported_intent", causal_parents: [proposal.id], generated_effects: [] };
  if (rule.exclusive && claimed.has(rule.exclusive)) return { proposal_id: proposal.id, status: "BLOCKED", reason: `conflict:${rule.exclusive}`, rule_id: rule.id, causal_parents: [proposal.id], generated_effects: [] };
  if (!ruleMatches(rule, projection)) return { proposal_id: proposal.id, status: rule.failure?.status ?? "BLOCKED", reason: rule.failure?.reason ?? "precondition_failed", rule_id: rule.id, causal_parents: [proposal.id], generated_effects: structuredClone(rule.failure?.effects ?? []) };
  if (rule.exclusive) claimed.add(rule.exclusive);
  return { proposal_id: proposal.id, status: "SUCCESS", reason: "resolved", rule_id: rule.id, causal_parents: [proposal.id], generated_effects: structuredClone(rule.success_effects ?? []) };
}
function resolveActions(projection, proposals, pack) {
  const claimed = new Set();
  return [...proposals].sort((a, b) => a.at - b.at || a.priority - b.priority || a.id.localeCompare(b.id)).map((proposal) => {
    const result = resolveAction(projection, proposal, pack, claimed);
    if (!validateResult(result)) throw new Error(`invalid_execution_result: ${ajv.errorsText(validateResult.errors)}`);
    return result;
  });
}
function materializeExecutionEvents(result, proposalEvent, firstSequence) {
  if (!validateResult(result)) throw new Error(`invalid_execution_result: ${ajv.errorsText(validateResult.errors)}`);
  if (!validateEvent(proposalEvent)) throw new Error(`invalid_proposal_event: ${ajv.errorsText(validateEvent.errors)}`);
  const resultId = `execution-${proposalEvent.id}`;
  const base = { session_id: proposalEvent.session_id, at: proposalEvent.at, world: proposalEvent.world, version: "v1" };
  const events = [{ id: resultId, ...base, sequence: firstSequence, type: "agency.execution.resolved", phase: "consequence", priority: proposalEvent.priority, domain: "agency", payload: result, causal_parents: [proposalEvent.id] }];
  result.generated_effects.forEach((effect, index) => events.push({ id: `${resultId}-effect-${index + 1}`, ...base, sequence: firstSequence + index + 1, type: effect.type, phase: effect.phase ?? "consequence", priority: effect.priority ?? proposalEvent.priority, domain: effect.domain, payload: structuredClone(effect.payload), causal_parents: [resultId] }));
  for (const event of events) if (!validateEvent(event)) throw new Error(`invalid_materialized_event: ${ajv.errorsText(validateEvent.errors)}`);
  return events;
}
module.exports = { resolveAction, resolveActions, materializeExecutionEvents };
