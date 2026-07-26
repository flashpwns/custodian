# External world-pack conformance

**Normative.** A world pack is external declarative data consumed through the
published Custodian package surface. It is never a reducer extension, a plugin,
or executable code. The supported framework flow is:

```text
external declarative pack
  → conformance validation
  → World-Pack Runtime Adapter
  → Public Session API
  → Constitutional Director
  → canonical replay
  → public result / export / restore
```

`validateWorldPackConformance({ world_pack, scenarios })` is the public
conformance operation. It returns a stable, structured report with the pack
identity, declared contract versions, accepted capabilities, scenario results,
checks, and structured errors. It validates the manifest, identity, kernel
compatibility, capabilities, deterministic canonicalization, session creation,
advancement, export, restoration, and post-restore continuation. A report's
`serialization` field is its canonical byte-stable JSON representation.

## Local command

Use the narrow developer command only for local declarative content:

```sh
npm run conformance -- path/to/pack --json
```

A pack directory must provide `manifest.json` and may provide `scenario.json`.
The command reads only those explicit files, never discovers packs, installs
dependencies, accesses a network, writes the pack, or evaluates JavaScript.
It exits `0` for conformant content, `1` for a validation or input failure, and
`2` when the pack path is omitted. `--json` writes canonical report bytes;
without it the same report is formatted for humans.

## Supported package imports

The package root is the only supported runtime import. Its declared API is
listed in [`public-api.json`](../../public-api.json): session creation,
advancement, inspection, export, restoration, world-pack adaptation,
conformance validation, public errors, and stable serialization. Deep imports
are intentionally unsupported by the package export map. Reducers, the
Director, replay mutation helpers, fixtures, and hashing internals are private.

## Reference external pack

[`external-fixtures/signal-room`](../../external-fixtures/signal-room) is a
neutral external-consumer fixture, not a built-in setting. It declares two
rooms, a locked connection, a key, a controllable light, two observers, and a
small deterministic effect rule. The test suite consumes it only through the
public package root and verifies create, advance, export, restore, and
continuation equivalence.

## Security boundary

Custodian trusts a loaded pack only as data that may be rejected by validation.
Pack-authored executable code is not supported. The public runtime accepts
already-loaded values and has no filesystem authority. The conformance command
has the deliberately narrow authority to read the caller-supplied local
directory's JSON files; it grants no authority to the pack itself. All effects
remain requests that become canonical events only through the kernel lifecycle.
Replay remains the sole authority that applies history.
