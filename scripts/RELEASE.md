## Quick Release Guide

Simply run the `quick-release.sh` script with an optional version bump type or
specific version:

```bash
# Use default (minor) version bump
./scripts/quick-release.sh

# Specify version bump type
./scripts/quick-release.sh patch
./scripts/quick-release.sh major
./scripts/quick-release.sh 1.2.3
```

It will test test and build the packages and publish them to NPM, then create
a git commit and tag for the new version.


## Manual Release Steps

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

Login with NPM:

```bash
yarn npm login
```

Publish to NPM:

```bash
yarn workspaces foreach -A --no-private npm publish
```

Create a Git tag and push to remote:

```bash
git add .
git commit -m "chore: release v$(node -p "require('./package.json').version")"
git tag v$(node -p "require('./package.json').version")
git push origin --tags
```
