const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Ajv2020 = require("ajv/dist/2020");
const addFormats = require("ajv-formats");

const root = path.resolve(__dirname, "..");

function jsonFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return jsonFiles(target);
    return entry.name.endsWith(".json") ? [target] : [];
  });
}

const artifacts = ["runtime/contracts", "state/schemas", "examples", "tests/fixtures"]
  .flatMap((directory) => jsonFiles(path.join(root, directory)));

for (const file of artifacts) {
  assert.doesNotThrow(() => JSON.parse(fs.readFileSync(file, "utf8")), `invalid JSON: ${path.relative(root, file)}`);
}

const contracts = jsonFiles(path.join(root, "runtime/contracts"));
const contractAjv = new Ajv2020({ allErrors: true, strict: false });
addFormats(contractAjv);
const contractSchemas = [];
for (const file of contracts) {
  const schema = JSON.parse(fs.readFileSync(file, "utf8"));
  assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema", `${path.basename(file)} must declare Draft 2020-12`);
  assert.match(schema.$id, /^https:\/\/custodian\.dev\/schemas\/runtime\/.+\/v[1-9][0-9]*$/, `${path.basename(file)} must have a versioned runtime id`);
  assert.equal(schema.type, "object", `${path.basename(file)} must define an object contract`);
  contractSchemas.push(schema);
}
for (const schema of contractSchemas) contractAjv.addSchema(schema);
for (const schema of contractSchemas) assert.ok(contractAjv.getSchema(schema.$id), `${schema.$id} must compile`);

const sessionSchema = JSON.parse(fs.readFileSync(path.join(root, "state/schemas/session-state.schema.json"), "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateSession = ajv.compile(sessionSchema);
assert.equal(sessionSchema.$schema, "https://json-schema.org/draft/2020-12/schema");
assert.equal(sessionSchema.properties.schema_version.const, "10.0.0");
assert.ok(sessionSchema.required.includes("environment"));

for (const relative of ["examples/minimal-session/state.json", "examples/knowledge-boundaries/state.json"]) {
  const state = JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
  assert.equal(state.schema_version, "10.0.0", `${relative} must be migrated to v10`);
  assert.deepEqual(Object.keys(state.environment).sort(), ["conditions", "damage", "hazards", "topology_history"]);
  assert.ok(validateSession(state), `${relative} must validate against session-state: ${ajv.errorsText(validateSession.errors)}`);
}

console.log(`validated ${artifacts.length} JSON artifacts and ${contracts.length} runtime contracts`);
