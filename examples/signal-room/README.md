# The Signal Room

A five-minute neutral Custodian example. Two observers begin in a facility with
a locked connection, a held key, and a disabled light. The declared
`toggle-light` action first succeeds, emits an environmental effect and durable
evidence, and becomes part of canonical history. Repeating it is blocked by the
same objective precondition.

```sh
npm run conformance -- examples/signal-room --json
```

The example is declarative. It has no narration, LLM, or executable world-pack
logic. Use the [authoring tutorial](../../docs/guides/five-minute-world-pack.md)
to create an independent pack.
