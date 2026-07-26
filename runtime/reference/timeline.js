"use strict";

const phaseOrder = Object.freeze({ scheduled: 0, action: 1, consequence: 2, observation: 3, narration: 4 });

function compareEntries(left, right) {
  return left.at - right.at
    || phaseOrder[left.phase] - phaseOrder[right.phase]
    || left.priority - right.priority
    || left.id.localeCompare(right.id);
}

function replay(plan) {
  const queue = [...plan.entries];
  const facts = Object.fromEntries(Object.entries(plan.initial_reality));
  const history = [];
  const pending = new Map();

  while (queue.length > 0) {
    queue.sort(compareEntries);
    const entry = queue.shift();
    if (entry.at > plan.target_time) break;
    if (!Object.hasOwn(phaseOrder, entry.phase)) throw new Error(`unknown timeline phase: ${entry.phase}`);
    if (entry.operation.kind === "set") {
      facts[entry.operation.fact_id] = entry.operation.value;
    } else if (entry.operation.kind === "schedule") {
      const scheduled = entry.operation.scheduled;
      if (scheduled.due_at < entry.at) throw new Error("scheduled consequence cannot be due before it is scheduled");
      if (pending.has(scheduled.id)) throw new Error(`duplicate scheduled event: ${scheduled.id}`);
      pending.set(scheduled.id, {
        id: scheduled.id,
        due_at: scheduled.due_at,
        type: scheduled.type,
        payload: scheduled.payload,
        scheduled_by: entry.id,
        priority: scheduled.priority
      });
      queue.push({
        id: scheduled.id,
        at: scheduled.due_at,
        phase: "scheduled",
        priority: scheduled.priority,
        causal_parents: [entry.id],
        operation: scheduled.operation
      });
    } else if (entry.operation.kind === "observe") {
      if (!history.some((event) => event.id === entry.operation.source_event)) throw new Error("observation requires committed source history");
    } else if (entry.operation.kind === "narrate") {
      const narrated = new Set(entry.operation.event_ids);
      const historyById = new Map(history.map((event) => [event.id, event]));
      for (const sourceEvent of entry.operation.event_ids) {
        if (!historyById.has(sourceEvent)) throw new Error("narration cannot skip or invent causal history");
        const ancestors = [...historyById.get(sourceEvent).causal_parents];
        const visited = new Set();
        while (ancestors.length > 0) {
          const ancestor = ancestors.pop();
          if (visited.has(ancestor)) continue;
          visited.add(ancestor);
          if (!narrated.has(ancestor)) throw new Error("narration cannot skip or invent causal history");
          const parent = historyById.get(ancestor);
          if (!parent) throw new Error("narration cannot skip or invent causal history");
          ancestors.push(...parent.causal_parents);
        }
      }
    } else {
      throw new Error(`unknown operation: ${entry.operation.kind}`);
    }
    if (entry.phase === "scheduled") pending.delete(entry.id);
    history.push({
      id: entry.id,
      at: entry.at,
      phase: entry.phase,
      priority: entry.priority,
      causal_parents: entry.causal_parents ?? [],
      operation: entry.operation
    });
  }

  return {
    simulation_time: plan.target_time,
    objective_reality: facts,
    pending: [...pending.values()].sort((left, right) => left.id.localeCompare(right.id)),
    history
  };
}

module.exports = { compareEntries, replay };
