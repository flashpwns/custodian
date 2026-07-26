"use strict";

function replayEvidence(plan) {
  const entries = [...plan.entries].sort((left, right) => left.at - right.at || left.id.localeCompare(right.id));
  const reality = { ...plan.initial_reality };
  const evidence = new Map();
  const observers = {};
  const denied = [];
  const history = [];

  for (const entry of entries) {
    if (entry.at > plan.target_time) break;
    if (entry.operation.kind === "occur") {
      for (const change of entry.operation.changes ?? []) reality[change.fact_id] = change.value;
      for (const item of entry.operation.evidence ?? []) {
        if (evidence.has(item.id)) throw new Error(`duplicate evidence: ${item.id}`);
        evidence.set(item.id, { ...item, origin_event: entry.id, created_at: entry.at });
      }
    } else if (entry.operation.kind === "destroy") {
      const item = evidence.get(entry.operation.evidence_id);
      if (!item) throw new Error("destruction requires existing evidence");
      item.availability = "destroyed";
      item.destroyed_by = entry.id;
    } else if (entry.operation.kind === "access") {
      const item = evidence.get(entry.operation.evidence_id);
      if (!item || item.availability === "destroyed") {
        denied.push({ observer_id: entry.operation.observer_id, evidence_id: entry.operation.evidence_id, at: entry.at, reason: "unavailable" });
      } else {
        const observer = observers[entry.operation.observer_id] ??= { knowledge: [], beliefs: [] };
        const bounded = { completeness: item.completeness, fidelity: item.fidelity };
        if (item.provenance === "forged" || entry.operation.mode === "belief") {
          observer.beliefs.push({ evidence_id: item.id, claim: item.claims[0], basis: "evidence", bounds: bounded });
        } else {
          observer.knowledge.push({ evidence_id: item.id, claims: [...item.claims], bounds: bounded, channel: entry.operation.channel });
        }
      }
    } else {
      throw new Error(`unknown evidence operation: ${entry.operation.kind}`);
    }
    history.push({ id: entry.id, at: entry.at, operation: entry.operation });
  }

  return {
    simulation_time: plan.target_time,
    objective_reality: reality,
    evidence: [...evidence.values()].sort((left, right) => left.id.localeCompare(right.id)),
    observers,
    denied,
    history
  };
}

module.exports = { replayEvidence };
