Verify code quality and correctness:

```bash
yarn lint
yarn format
yarn typecheck
yarn test
yarn typedoc
```

Prepare for release:

```bash
yarn clean
yarn build
```

Update version in root `package.json`:

```bash
npm version --no-git-tag-version <major|minor|patch|pre*|{version}>
```

Synchronize versions across all packages:

```bash
./scripts/sync-versions.ts
```

Perform a dry run:

```bash
yarn workspaces foreach -A --no-private npm publish --dry-run
```

Publish to NPM:

```bash
yarn workspaces foreach -A --no-private npm publish
```
