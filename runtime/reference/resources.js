"use strict";

function replayResources(plan) {
  const quantities = structuredClone(plan.quantities);
  const objects = structuredClone(plan.objects);
  const reservations = {};
  const allocations = {};
  const history = [];

  for (const entry of [...plan.entries].sort((a, b) => a.at - b.at || a.id.localeCompare(b.id))) {
    let status = "failed";

    if (entry.kind === "reserve") {
      const reserved = Object.values(reservations)
        .filter((record) => record.resource === entry.resource && record.source === entry.source)
        .reduce((total, record) => total + record.quantity, 0);
      const available = quantities[entry.source]?.[entry.resource] ?? 0;

      if (reserved + entry.quantity <= available) {
        reservations[entry.id] = { ...entry };
        status = "reserved";
      }
    } else if (entry.kind === "allocate") {
      const allocated = Object.values(allocations)
        .filter((record) => record.resource === entry.resource && record.source === entry.source)
        .reduce((total, record) => total + record.quantity, 0);
      const available = quantities[entry.source]?.[entry.resource] ?? 0;

      if (allocated + entry.quantity <= available) {
        allocations[entry.id] = { ...entry };
        status = "allocated";
      }
    } else if (entry.kind === "release-reservation") {
      if (reservations[entry.reservation]) {
        delete reservations[entry.reservation];
        status = "released";
      }
    } else if (entry.kind === "transfer") {
      const sourceQuantity = quantities[entry.source]?.[entry.resource] ?? 0;
      const destinationQuantity = quantities[entry.destination]?.[entry.resource] ?? 0;
      const destinationCapacity = plan.capacity[entry.destination]?.[entry.resource] ?? Infinity;

      if (sourceQuantity >= entry.quantity && destinationQuantity + entry.quantity <= destinationCapacity) {
        quantities[entry.source][entry.resource] -= entry.quantity;
        quantities[entry.destination] ??= {};
        quantities[entry.destination][entry.resource] = destinationQuantity + entry.quantity;
        status = "committed";
      }
    } else if (entry.kind === "object-transfer") {
      const object = objects[entry.object];
      const count = Object.values(objects).filter((candidate) => candidate.container === entry.destination).length;
      const limit = plan.object_capacity[entry.destination] ?? 0;

      if (object && object.container === entry.source && count < limit) {
        object.container = entry.destination;
        object.custodian = entry.custodian;
        status = "committed";
      }
    }

    history.push({ id: entry.id, status, at: entry.at });
  }

  return { quantities, objects, reservations, allocations, history };
}

module.exports = { replayResources };
