"use strict";

function replayAgency(plan) {
  const reality = { ...plan.initial_reality };
  const agents = {};
  const history = [];
  const proposals = [];
  for (const entry of [...plan.entries].sort((a, b) => a.at - b.at || a.priority - b.priority || a.id.localeCompare(b.id))) {
    if (entry.kind === "goal") {
      const agent = agents[entry.agent_id] ??= { goals: [], intentions: [], plans: [] };
      agent.goals.push({ id: entry.goal_id, statement: entry.statement });
      agent.intentions.push({ goal_id: entry.goal_id, intent: entry.intent });
      agent.plans.push({ id: entry.plan_id, status: "active" });
      history.push({ id: entry.id, kind: "goal", at: entry.at });
      continue;
    }
    proposals.push(entry.id);
    const result = { id: entry.id, kind: "execution", at: entry.at, status: "failed", reason: "constraint" };
    const agent = agents[entry.agent_id];
    const planState = agent.plans.find((item) => item.id === entry.plan_id);
    if (entry.interrupt) {
      result.status = "interrupted"; result.reason = entry.interrupt; planState.status = "interrupted";
    } else if (reality[entry.requires.fact_id] !== entry.requires.value) {
      result.status = "failed"; result.reason = "objective_constraint"; planState.status = "failed";
    } else {
      reality[entry.effect.fact_id] = entry.effect.value;
      result.status = "succeeded"; result.committed_event = `committed-${entry.id}`; planState.status = "completed";
    }
    history.push(result);
  }
  return { objective_reality: reality, agents, proposals, history };
}

module.exports = { replayAgency };
