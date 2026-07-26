const assert = require("node:assert/strict");
const { migrate } = require("../state/migrations.js");
const v9 = { schema_version: "9.0.0", session_id: "migrate", world: { id: "reference", version: "1.0.0" } };
const migrated = migrate(v9, "10.0.0");
assert.equal(migrated.schema_version, "10.0.0");
assert.deepEqual(migrated.environment, { conditions: {}, hazards: {}, damage: [], topology_history: [] });
assert.deepEqual(migrate(v9, "10.0.0"), migrated, "migration is deterministic");
assert.throws(() => migrate(v9, "11.0.0"), /unsupported_migration/);
console.log("validated explicit projection migration registry");
