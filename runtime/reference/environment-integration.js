"use strict";

const { replay: replayTimeline } = require("./timeline.js");
const { replayEnvironment } = require("./environment.js");
const { replayResources } = require("./resources.js");
const { replayRelationships } = require("./relationships.js");
const { replayCommunication } = require("./communication.js");
const { replayPlanning } = require("./planning.js");
const { replayAgency } = require("./agency.js");
const { replayEnvironmentalState } = require("./environment-model.js");
const { replayEvidence } = require("./evidence.js");
const { replayMemory } = require("./memory.js");

function replayEnvironmentIntegration(plan) {
  const timeline = replayTimeline(plan.timeline);
  const spatial = replayEnvironment(plan.spatial);
  const resources = replayResources(plan.resources);
  const relationships = replayRelationships(plan.relationships);
  const trust = relationships.relationships.find((item) => item.observer_id === "scout" && item.subject_id === "guide")?.trust ?? 0;
  const communicationPlan = structuredClone(plan.communication);
  communicationPlan.entries[0].trust.scout = trust;
  const communication = replayCommunication(communicationPlan);
  const warningDelivered = communication.beliefs.scout?.some((belief) => belief.claim === "room-b.hazardous=true");
  const agency = replayAgency(plan.agency);
  const repairCommitted = agency.history.some((item) => item.id === "proposal-repair-door" && item.status === "succeeded");
  const environmentPlan = structuredClone(plan.environment);
  environmentPlan.agents.scout.location = spatial.positions.scout;
  environmentPlan.resources = resources.quantities;
  environmentPlan.entries = environmentPlan.entries
    .filter((entry) => entry.kind !== "warning" || warningDelivered)
    .map((entry) => entry.kind === "repair" ? { ...entry, committed: repairCommitted } : entry.kind === "scheduled-topology" ? { ...entry, traversable: timeline.objective_reality[entry.time_fact] } : entry);
  const environment = replayEnvironmentalState(environmentPlan);
  const planningPlan = structuredClone(plan.planning);
  planningPlan.entries.find((entry) => entry.id === "avoid-hazard").fail = !warningDelivered;
  planningPlan.entries.find((entry) => entry.id === "repair-after-damage").fail = !environment.history.some((item) => item.id === "door-damaged" && item.status === "committed");
  const planning = replayPlanning(planningPlan);
  const evidencePlan = structuredClone(plan.evidence);
  evidencePlan.entries[0].operation.evidence[0].originates_from = environment.history.find((item) => item.id === "door-damaged").id;
  evidencePlan.entries[1].operation.evidence[0].originates_from = agency.history.find((item) => item.id === "proposal-seal-door").id;
  const evidence = replayEvidence(evidencePlan);
  const memory = replayMemory(plan.memory);

  return { timeline, spatial, resources, relationships, communication, agency, environment, planning, evidence, memory };
}

module.exports = { replayEnvironmentIntegration };
