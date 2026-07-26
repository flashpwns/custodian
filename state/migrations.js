"use strict";
const migrations = [{ from: "9.0.0", to: "10.0.0", apply: (state) => ({ ...state, schema_version: "10.0.0", environment: state.environment ?? { conditions: {}, hazards: {}, damage: [], topology_history: [] } }) }];
function migrate(state, target) { let next = structuredClone(state); while (next.schema_version !== target) { const step = migrations.find((item) => item.from === next.schema_version); if (!step) throw new Error(`unsupported_migration: ${next.schema_version}->${target}`); next = step.apply(next); } return next; }
module.exports = { migrations, migrate };
