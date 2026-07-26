const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { replay } = require("../runtime/reference/timeline.js");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const plan = read("examples/simulation-timeline/plan.json");
const expected = read("examples/simulation-timeline/expected-outcome.json");
const perspectiveA = read("examples/simulation-timeline/perspective-a.json");
const perspectiveB = read("examples/simulation-timeline/perspective-b.json");

const firstReplay = replay(plan);
const secondReplay = replay(plan);
assert.deepEqual(firstReplay, secondReplay, "replay must produce identical outcomes");
assert.equal(firstReplay.simulation_time, expected.simulation_time);
assert.deepEqual(firstReplay.objective_reality, expected.objective_reality);
assert.deepEqual(firstReplay.history.map((event) => event.id), expected.history_ids);

const pressureDrop = firstReplay.history.find((event) => event.id === "scheduled-pressure-drop");
assert.equal(pressureDrop.at, 10, "delayed consequence must occur at its scheduled simulation time");
assert.equal(firstReplay.objective_reality["airlock.pressure"], "low");
assert.ok(
  firstReplay.history.filter((event) => event.at <= 10).every((event) => event.phase !== "observation"),
  "objective scheduled work may resolve with no observers present"
);

const alphaIndex = firstReplay.history.findIndex((event) => event.id === "action-alpha-open");
const bravoIndex = firstReplay.history.findIndex((event) => event.id === "action-bravo-close");
assert.ok(alphaIndex < bravoIndex, "same-time actions must use their stable IDs as deterministic tie-breakers");
assert.equal(firstReplay.objective_reality["valve.command"], "closed", "deterministic concurrent resolution must be replayable");

assert.equal(perspectiveA.simulation_time, firstReplay.simulation_time);
assert.equal(perspectiveB.simulation_time, firstReplay.simulation_time);
assert.notDeepEqual(perspectiveA.permitted_event_ids, perspectiveB.permitted_event_ids, "perspective changes reveal, not time");

const withoutNarration = structuredClone(plan);
withoutNarration.entries = withoutNarration.entries.filter((entry) => entry.phase !== "narration");
assert.deepEqual(
  replay(withoutNarration).objective_reality,
  firstReplay.objective_reality,
  "narration must not mutate objective reality"
);
const invalidNarration = structuredClone(plan);
invalidNarration.entries.find((entry) => entry.phase === "narration").operation.event_ids = ["invented-event"];
assert.throws(() => replay(invalidNarration), /narration cannot skip or invent causal history/);
const incompleteNarration = structuredClone(plan);
incompleteNarration.entries.find((entry) => entry.phase === "narration").operation.event_ids = ["scheduled-pressure-drop"];
assert.throws(() => replay(incompleteNarration), /narration cannot skip or invent causal history/);
assert.ok(
  pressureDrop.causal_parents.includes("system-schedule-pressure-drop"),
  "delayed consequence must retain its scheduling cause"
);

console.log("validated deterministic simulation timeline");
