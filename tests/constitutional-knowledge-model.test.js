const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const events = read("examples/knowledge-boundaries/events.json");
const state = read("examples/knowledge-boundaries/state.json");
const revealA = read("examples/knowledge-boundaries/revelation-a.json");
const revealB = read("examples/knowledge-boundaries/revelation-b.json");
const eventById = new Map(events.map((event) => [event.event_id, event]));
const pathById = new Map(state.information_paths.map((informationPath) => [informationPath.id, informationPath]));

for (const [index, event] of events.entries()) {
  assert.equal(event.sequence, index + 1, "event stream must be contiguous");
  assert.equal(typeof event.simulation_time, "number", "events must carry simulation time");
  if (event.sequence > 1) assert.ok(event.causation_id, "non-root events must declare a causal origin");
}

const hiddenFailure = state.objective_reality.facts.find((fact) => fact.id === "generator-7.capacitor_failed");
assert.deepEqual(hiddenFailure.value, true, "an unseen event must alter objective reality");
assert.equal(hiddenFailure.source_event, "10000000-0000-4000-8000-000000000002");
assert.ok(
  Object.values(state.observers).every((observer) => observer.knowledge.every((knowledge) => !knowledge.proposition.includes("generator-7"))),
  "an unseen objective change must not enter observer knowledge"
);

const beliefA = state.observers["observer-a"].beliefs.find((belief) => belief.proposition === "service-door.locked");
const beliefB = state.observers["observer-b"].beliefs.find((belief) => belief.proposition === "service-door.locked");
assert.notEqual(beliefA.value, beliefB.value, "observers may hold conflicting beliefs about one objective fact");

for (const [observerId, observer] of Object.entries(state.observers)) {
  for (const knowledge of observer.knowledge) {
    const informationPath = pathById.get(knowledge.path_id);
    assert.ok(informationPath, "knowledge must name an information path");
    assert.equal(informationPath.recipient_id, observerId, "knowledge path must be addressed to its observer");
    const source = eventById.get(informationPath.source_event);
    const delivery = eventById.get(informationPath.delivery_event);
    assert.ok(source && delivery, "knowledge path endpoints must be committed events");
    assert.ok(source.simulation_time <= informationPath.delivered_at, "information cannot arrive before its source");
  }
}

assert.ok(hiddenFailure.valid_from < state.simulation_time, "hidden information was simulated before the present");
assert.ok(eventById.has(hiddenFailure.source_event), "hidden information has a durable source event, not retroactive narration");

for (const revelation of [revealA, revealB]) {
  assert.equal(revelation.projected_through, state.projected_through, "perspectives share one objective projection");
  assert.ok(!Object.hasOwn(revelation, "objective_reality"), "revelations must not carry objective reality");
  const observer = state.observers[revelation.perspective.observer_id];
  for (const knowledgeId of revelation.permitted.knowledge_ids) {
    assert.ok(observer.knowledge.some((knowledge) => knowledge.id === knowledgeId), "revelation may expose only its observer knowledge");
  }
}
assert.notDeepEqual(revealA.permitted, revealB.permitted, "perspective changes the reveal without rewriting reality");

console.log("validated constitutional knowledge boundaries");
