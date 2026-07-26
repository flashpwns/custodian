# Starter World Pack

This is a minimal declarative Custodian world pack. `manifest.json` owns pack
identity, objective initial state, observation capabilities, and deterministic
execution rules. `scenario.json` declares compatible observers.

After Custodian v1.0.0 is published, run `npm install` and then `npm run
conformance`. Before publication, run conformance from a Custodian checkout as
documented in the tutorial. Replace `starter-world` and the package name before
publishing. Keep the manifest declarative: Custodian does not execute
pack-authored JavaScript.
