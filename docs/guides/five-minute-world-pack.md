# Five-minute world-pack tutorial

This guide uses only Custodian's public commands and package-root API.

## 1. Create a pack

From a Custodian checkout:

```sh
npm run create-worldpack -- my-world
cd my-world
```

The starter contains `manifest.json` and `scenario.json`. Both are ordinary,
valid JSON; no generated identity material or executable rule module is hidden
inside the scaffold. Until the prepared v1.0.0 package is published, validate a
new pack from a Custodian checkout with `npm run conformance -- my-world --json`.
After publication, run `npm install` inside the pack and `npm run conformance`.

## 2. Set identity and compatibility

In `manifest.json`, set a lowercase kebab-case `id`, increment `version` when
your declarative content changes, and retain:

```json
"kernel_compatibility": "canonical-kernel@v1"
```

The manifest owns initial objective state, not agent-local knowledge or belief.

## 3. Declare the world

`initial_objective` declares locations, topology, conditions, resources, and
empty objective collections. `observation_capabilities` declares available
modalities. `execution_rules` declare an intent, objective preconditions, and
typed effects. Effects are requests; only canonical replay applies them.

## 4. Add a scenario

`scenario.json` names the matching world id/version and declares observer IDs,
goals, and plans. Scenario observers are not proof of knowledge, possession, or
successful action.

## 5. Validate it

```sh
npm run conformance
```

Expected failures are structured codes. `INCOMPATIBLE_KERNEL_VERSION` means the
manifest is not compatible; `INVALID_WORLD_PACK` points to a malformed manifest;
`INVALID_SCENARIO` means the scenario does not match the pack contract.

## 6. Create and advance a session

Create `run.js` beside the pack:

```js
const { createSession, advanceSession, exportSession, restoreSession } = require("custodian");
const pack = require("./manifest.json");
const scenario = require("./scenario.json");
const created = createSession({ world_pack: pack, scenario });
const advanced = advanceSession({ session: created.session, tick: { id: "tick-1", at: 1, observers: scenario.observers } });
const exported = exportSession(advanced.session);
const restored = restoreSession(exported.envelope);
console.log(JSON.stringify({ ok: restored.ok, projection: restored.session?.projection.identity }));
```

Run `node run.js`. A real pack can supply goals in a tick, but neither a goal nor
a plan changes reality until the existing proposal, execution, effect, and replay
pipeline records committed events.

Next, read the [full authoring guide](world-pack-authoring.md) and inspect
[`examples/signal-room`](../../examples/signal-room).
