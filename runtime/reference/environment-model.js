"use strict";

function replayEnvironmentalState(plan) {
  const conditions = structuredClone(plan.conditions);
  const hazards = structuredClone(plan.hazards);
  const agents = structuredClone(plan.agents);
  const affordances = structuredClone(plan.affordances);
  const connections = structuredClone(plan.connections);
  const resources = structuredClone(plan.resources ?? {});
  const planning = structuredClone(plan.planning ?? {});
  const history = [];

  for (const entry of [...plan.entries].sort((a, b) => a.at - b.at || a.id.localeCompare(b.id))) {
    let status = "ignored";

    if (entry.kind === "condition") {
      conditions[entry.location] ??= {};
      conditions[entry.location][entry.condition] = entry.intensity;
      status = "resolved";
    } else if (entry.kind === "propagate") {
      const available = conditions[entry.from]?.[entry.condition] ?? 0;
      if (available >= entry.amount) {
        conditions[entry.from][entry.condition] -= entry.amount;
        conditions[entry.to] ??= {};
        conditions[entry.to][entry.condition] = (conditions[entry.to][entry.condition] ?? 0) + entry.amount;
        status = "resolved";
      }
    } else if (entry.kind === "decay") {
      const current = conditions[entry.location]?.[entry.condition] ?? 0;
      conditions[entry.location] ??= {};
      conditions[entry.location][entry.condition] = Math.max(0, current - entry.amount);
      status = "resolved";
    } else if (entry.kind === "scheduled-topology") {
      const connection = connections.find((candidate) => candidate.id === entry.connection);
      if (connection) {
        connection.traversable = entry.traversable;
        status = "resolved";
      }
    } else if (entry.kind === "exposure") {
      const hazard = hazards[entry.hazard];
      const agent = agents[entry.agent];
      const intensity = hazard ? conditions[hazard.location]?.[hazard.condition] ?? 0 : 0;
      if (hazard && agent?.location === hazard.location && intensity >= hazard.threshold) {
        const protection = entry.protection ?? 0;
        const harm = hazard.harm * entry.duration * (1 - protection);
        agent.health -= harm;
        status = "harmed";
      }
    } else if (entry.kind === "warning") {
      planning[entry.agent] = { hazard: entry.hazard, response: entry.response, source: entry.id };
      status = "recorded";
    } else if (entry.kind === "damage") {
      if (entry.committed && affordances[entry.target]) {
        affordances[entry.target][entry.affordance] = false;
        status = "committed";
      }
    } else if (entry.kind === "repair") {
      const material = entry.material;
      const source = entry.material_source;
      const hasMaterial = !material || (resources[source]?.[material] ?? 0) >= entry.material_quantity;
      if (entry.committed && affordances[entry.target] && hasMaterial) {
        if (material) resources[source][material] -= entry.material_quantity;
        affordances[entry.target][entry.affordance] = true;
        status = "committed";
      }
    }

    history.push({ id: entry.id, at: entry.at, status });
  }

  return { conditions, hazards, agents, affordances, connections, resources, planning, history };
}

module.exports = { replayEnvironmentalState };
