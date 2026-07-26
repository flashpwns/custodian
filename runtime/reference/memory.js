"use strict";
function replayMemory(plan) {
  const reality = { ...plan.objective_reality }; const memories = new Map(); const history = []; const proposals = [];
  for (const entry of [...plan.entries].sort((a,b) => a.at-b.at || a.id.localeCompare(b.id))) {
    if (entry.kind === "form") { const old=memories.get(entry.memory_id); memories.set(entry.memory_id, { id: entry.memory_id, agent_id: entry.agent_id, content: entry.content, formed_from: entry.source, formed_at: old?.formed_at ?? entry.at, confidence: Math.min(1, Number(((old?.confidence ?? 0)+entry.gain).toFixed(6))), availability: "active", associations: entry.associations ?? [] }); }
    else if (entry.kind === "decay") { memories.get(entry.memory_id).availability="forgotten"; }
    else if (entry.kind === "retrieve") { const memory=memories.get(entry.memory_id); history.push({ id: entry.id, kind: "retrieval", memory_id: memory.id, at: entry.at, availability: memory.availability }); }
    else if (entry.kind === "propose") { proposals.push({ id: entry.id, influenced_by: entry.memory_id, action: entry.action }); }
    history.push({ id: entry.id, kind: entry.kind, at: entry.at });
  }
  return { objective_reality: reality, memories: [...memories.values()], proposals, history };
}
module.exports = { replayMemory };
