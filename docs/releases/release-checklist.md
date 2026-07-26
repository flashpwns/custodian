# Release checklist

## Before merging the release PR

- [ ] `npm test`, `npm run validate`, `npm run demo`, and `npm run replay` pass.
- [ ] Signal Room example and official starter pass conformance unchanged.
- [ ] Scaffold output passes conformance unchanged.
- [ ] `npm pack --dry-run --json` contains runtime, schemas, templates, tools,
  README, and LICENSE.
- [ ] Documentation examples use package-root public APIs only.
- [ ] Changelog and v1.0.0 notes agree with `package.json`.
- [ ] Worktree is clean and the branch contains current main.

## After merge: release from main only

```sh
git switch main
git pull --ff-only origin main
npm ci
npm test && npm run validate && npm run replay
git status --short
git tag -a v1.0.0 -m "Custodian v1.0.0"
git push origin v1.0.0
gh release create v1.0.0 --title "Custodian v1.0.0" --notes-file docs/releases/v1.0.0.md
```

Verify the release URL and tag visibility. npm publication is intentionally not
part of this procedure.
