const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { createSession, advanceSession, exportSession, restoreSession } = require("custodian");

const root = path.resolve(__dirname, "..");
function run(args, cwd = root) { return spawnSync(process.execPath, args, { cwd, encoding: "utf8" }); }
function packAt(relative) { return JSON.parse(fs.readFileSync(path.join(root, relative, "manifest.json"), "utf8")); }
function scenarioAt(relative) { return JSON.parse(fs.readFileSync(path.join(root, relative, "scenario.json"), "utf8")); }
function conforms(relative) {
  const result = run(["runtime/conformance-command.js", relative, "--json"]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).ok, true);
}

conforms("templates/world-pack-starter");
conforms("examples/signal-room");

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "custodian-world-pack-"));
const scaffolded = path.join(temporary, "my-world");
try {
  const scaffold = run(["tools/create-worldpack.js", scaffolded]);
  assert.equal(scaffold.status, 0, scaffold.stderr);
  assert.match(scaffold.stdout, /npm run conformance/);
  const conformance = run(["runtime/conformance-command.js", scaffolded, "--json"]);
  assert.equal(conformance.status, 0, conformance.stderr);
  assert.equal(JSON.parse(conformance.stdout).pack.id, "my-world");
  assert.equal(run(["tools/create-worldpack.js", scaffolded]).status, 1, "scaffold refuses overwrite");
} finally { fs.rmSync(temporary, { recursive: true, force: true }); }

const artifactDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "custodian-package-"));
try {
  const packed = spawnSync("npm", ["pack", "--json", "--pack-destination", artifactDirectory], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, npm_config_cache: path.join(artifactDirectory, "cache") }
  });
  assert.equal(packed.status, 0, packed.stderr);
  const archive = path.join(artifactDirectory, JSON.parse(packed.stdout)[0].filename);
  const unpacked = path.join(artifactDirectory, "unpacked");
  fs.mkdirSync(unpacked);
  assert.equal(spawnSync("tar", ["-xzf", archive, "-C", unpacked], { encoding: "utf8" }).status, 0);
  fs.mkdirSync(path.join(unpacked, "package", "node_modules"));
  const packagedRoot = path.join(unpacked, "package");
  for (const dependency of ["ajv", "ajv-formats"]) fs.symlinkSync(path.join(root, "node_modules", dependency), path.join(packagedRoot, "node_modules", dependency), "dir");
  assert.ok(fs.existsSync(path.join(packagedRoot, "templates", "world-pack-starter", "manifest.json")));
  const app = path.join(artifactDirectory, "consumer");
  fs.mkdirSync(path.join(app, "node_modules"), { recursive: true });
  fs.symlinkSync(packagedRoot, path.join(app, "node_modules", "custodian"), "dir");
  const consumer = spawnSync(process.execPath, ["-e", "const api=require('custodian'); if(typeof api.createSession!=='function'||typeof api.inspectSessionObserver!=='function') process.exit(3); const p={id:'packed-view',version:'1',kernel_compatibility:'canonical-kernel@v1',initial_objective:{timeline:{pending:[]},environment:{locations:{a:{}},signals:{s:{location:'a',modality:'visual',content:'x',fidelity:1,source:'e'}}},resources:{},evidence:[],messages:[],actions:[]},observation_capabilities:[{id:'visual',modalities:['visual']}],rules:[]}; const s={id:'s',world:{id:'packed-view',version:'1'},actors:[{id:'actor',position:'a'}],observers:[{id:'observer',goals:[],plans:[],actor_id:'actor',origin:'embodied',capabilities:['visual'],access:[]}]}; const made=api.createSession({world_pack:p,scenario:s}); const view=api.inspectSessionObserver({session:made.session,observer:'observer',request:{kind:'look'}}); const detail=api.inspectSessionObserver({session:made.session,observer:'observer',request:{kind:'inspect',target:view.targets[0]?.ref}}); if(!made.ok||view.outcome!=='succeeded'||detail.outcome!=='succeeded') process.exit(6); try { require('custodian/runtime/canonical-kernel.js'); process.exit(4); } catch (error) { if (error.code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED') process.exit(5); }"], { cwd: app, encoding: "utf8" });
  assert.equal(consumer.status, 0, consumer.stderr);
} finally { fs.rmSync(artifactDirectory, { recursive: true, force: true }); }

const world_pack = packAt("examples/signal-room");
const scenario = scenarioAt("examples/signal-room");
const created = createSession({ world_pack, scenario });
assert.equal(created.ok, true);
const advanced = advanceSession({ session: created.session, tick: { id: "readme-tick", at: 1, observers: scenario.observers } });
assert.equal(advanced.ok, true);
const restored = restoreSession(exportSession(advanced.session).envelope);
assert.equal(restored.ok, true, "public API README flow restores");

for (const relative of [
  "README.md", "CONTRIBUTING.md", "SECURITY.md", "SUPPORT.md", "WORLD_PACKS.md",
  "docs/guides/five-minute-world-pack.md", "docs/guides/world-pack-authoring.md",
  "docs/releases/v1.0.0.md", "docs/releases/release-checklist.md", ".github/workflows/validate.yml"
]) assert.ok(fs.existsSync(path.join(root, relative)), `${relative} exists`);
assert.match(fs.readFileSync(path.join(root, "CHANGELOG.md"), "utf8"), /1\.0\.0/);
assert.equal(JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version, "1.6.0");
const packageMetadata = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
for (const published of ["templates", "tools", "LICENSE", "CHANGELOG.md", "CONTRIBUTING.md"]) assert.ok(packageMetadata.files.includes(published), `${published} is packaged`);
console.log("validated public launch assets, starter scaffold, examples, and documented public API flow");
