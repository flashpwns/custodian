#!/usr/bin/env node
"use strict";
const fs = require("node:fs"); const path = require("node:path"); const api = require("../index.js");
const target = process.argv[2]; const json = process.argv.includes("--json");
if (!target) { process.stderr.write("usage: npm run conformance -- <pack-path> [--json]\n"); process.exitCode = 2; } else {
  try { const manifest = JSON.parse(fs.readFileSync(path.join(target, "manifest.json"), "utf8")); const scenarioPath = path.join(target, "scenario.json"); const scenario = fs.existsSync(scenarioPath) ? JSON.parse(fs.readFileSync(scenarioPath, "utf8")) : null; const ticks = scenario ? [{ id: `conformance-${scenario.id}`, at: 1, observers: scenario.observers.map((observer, index) => ({ ...observer, goals: index === 0 ? [{ id: "toggle", intent: "toggle-light", priority: 0 }] : [] })) }] : []; const report = api.validateWorldPackConformance({ world_pack: manifest, scenarios: scenario ? [{ scenario, ticks }] : [] }); process.stdout.write(`${json ? report.serialization : JSON.stringify(report, null, 2)}\n`); process.exitCode = report.ok ? 0 : 1; } catch (cause) { process.stderr.write(`${JSON.stringify({ ok: false, error: { code: "INVALID_WORLD_PACK", details: { code: cause.code ?? "read_failed" } } })}\n`); process.exitCode = 1; }
}
