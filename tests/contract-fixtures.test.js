const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const versionedType = /^[a-z][a-z0-9_.-]+@v[1-9][0-9]*$/;

const manifest = readJson("tests/fixtures/valid-session.json");
const events = readJson("examples/minimal-session/events.json");
const state = readJson("examples/minimal-session/state.json");

assert.ok(Array.isArray(events) && events.length > 0, "fixture must contain events");
assert.equal(state.projected_through, manifest.expected_projected_through);
assert.deepEqual(state.world, manifest.world, "state must retain the world pin");

for (const [index, event] of events.entries()) {
  assert.match(event.event_id, uuid, "event_id must be a UUID");
  assert.equal(event.sequence, index + 1, "events must be contiguous and ordered");
  assert.match(event.type, versionedType, "event type must be versioned");
  assert.deepEqual(event.world, manifest.world, "events must retain the world pin");
  assert.equal(typeof event.payload, "object", "event payload must be an object");
}

assert.equal(events.at(-1).sequence, state.projected_through, "state must project all fixture events");
const observation = events.find((event) => event.type === "observation.recorded@v1");
assert.ok(observation, "fixture must include an observation");
assert.deepEqual(
  state.observers["explorer-01"].perceptions.find((perception) => perception.id === observation.payload.fact_id),
  {
    id: observation.payload.fact_id,
    content: observation.payload.claim,
    path_id: "path-ambient-light-01"
  },
  "observation event must project to observer-local perception"
);

console.log(`validated ${manifest.name}`);
