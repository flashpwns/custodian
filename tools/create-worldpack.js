#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const target = process.argv[2];
if (!target || !/^[a-z0-9][a-z0-9-]*$/.test(path.basename(target))) {
  process.stderr.write("usage: create-custodian-worldpack <lowercase-kebab-name>\n");
  process.exitCode = 2;
} else {
  const destination = path.resolve(process.cwd(), target);
  const template = path.resolve(__dirname, "..", "templates", "world-pack-starter");
  if (fs.existsSync(destination)) {
    process.stderr.write(JSON.stringify({ ok: false, error: { code: "TARGET_EXISTS", details: { target: destination } } }) + "\n");
    process.exitCode = 1;
  } else {
    fs.cpSync(template, destination, { recursive: true, errorOnExist: true });
    for (const file of ["manifest.json", "scenario.json", "package.json", "README.md"]) {
      const location = path.join(destination, file);
      fs.writeFileSync(location, fs.readFileSync(location, "utf8").replaceAll("starter-world", path.basename(target)));
    }
    process.stdout.write(`Created ${path.basename(target)}.\n1. cd ${path.basename(target)}\n2. npm install\n3. npm run conformance\n4. edit manifest.json\n5. read README.md and Custodian's authoring guide\n`);
  }
}
