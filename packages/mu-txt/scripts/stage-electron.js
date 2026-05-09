#!/usr/bin/env node
'use strict';

// Build a self-contained staging directory that Electron Forge can package.
//
// Forge's dep walker (flora-colossus) doesn't compose with yarn workspaces:
// it walks transitive `workspace:*` deps and dies. We side-step this by
// assembling an isolated copy that looks like a vanilla npm project to Forge
// — only `electron` in the dep tree, with the already-bundled renderer
// (`dist/`) and main process (`out-electron/`) dropped in as data.

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const repoRoot = path.resolve(root, '..', '..');
const stage = path.join(root, 'out-stage');

const die = (msg) => {
  process.stderr.write(`stage-electron: ${msg}\n`);
  process.exit(1);
};

const must = (relPath) => {
  const abs = path.join(root, relPath);
  if (!fs.existsSync(abs)) die(`missing ${relPath} — run \`yarn electron:build\` first`);
  return abs;
};

const distDir = must('dist');
const mainDir = must('out-electron');
const binDir = must('bin');
const iconsDir = must('public/icons');
const forgeConfig = must('forge.config.ts');

const electronCandidates = [
  path.join(root, 'node_modules', 'electron'),
  path.join(repoRoot, 'node_modules', 'electron'),
];
const electronModule = electronCandidates.find((p) => fs.existsSync(p));
if (!electronModule) die('cannot find electron in node_modules — run `yarn install`');

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const electronVersion = pkg.devDependencies?.electron ?? pkg.dependencies?.electron;
if (!electronVersion) die('cannot resolve electron version from package.json');

fs.rmSync(stage, {recursive: true, force: true});
fs.mkdirSync(stage, {recursive: true});

// Forge sees only `electron` as a dep — flora-colossus has nothing to choke on.
// Pull every @electron-forge/* version from the source package so the staged
// devDependencies satisfy Forge's project-resolver (which walks up looking
// for `@electron-forge/cli`).
const forgeDeps = Object.fromEntries(
  Object.entries(pkg.devDependencies ?? {}).filter(([name]) => name.startsWith('@electron-forge/')),
);

const stagePkg = {
  name: pkg.name,
  productName: 'mu-txt',
  version: pkg.version,
  description: pkg.description,
  author: pkg.author,
  license: pkg.license,
  homepage: pkg.homepage,
  repository: pkg.repository,
  main: 'out-electron/main.js',
  bin: pkg.bin,
  dependencies: {electron: electronVersion},
  devDependencies: {
    ...forgeDeps,
    electron: electronVersion,
  },
};
fs.writeFileSync(path.join(stage, 'package.json'), JSON.stringify(stagePkg, null, 2) + '\n');

const copy = (src, dest) => fs.cpSync(src, dest, {recursive: true, dereference: true});

copy(distDir, path.join(stage, 'dist'));
copy(mainDir, path.join(stage, 'out-electron'));
copy(binDir, path.join(stage, 'bin'));
copy(iconsDir, path.join(stage, 'public', 'icons'));

fs.copyFileSync(forgeConfig, path.join(stage, 'forge.config.ts'));

// Forge loads .ts configs via cosmiconfig + ts-node; a minimal tsconfig keeps
// the loader happy without inheriting the strict renderer config.
fs.writeFileSync(
  path.join(stage, 'tsconfig.json'),
  JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2022',
        module: 'commonjs',
        moduleResolution: 'node',
        esModuleInterop: true,
        skipLibCheck: true,
        strict: false,
        types: ['node'],
      },
    },
    null,
    2,
  ) + '\n',
);

// Surface every dependency Forge needs from the repo's existing node_modules
// trees. We symlink each entry one-by-one so the stage looks like a flat npm
// install, which is what flora-colossus expects.
const stageNm = path.join(stage, 'node_modules');
fs.mkdirSync(stageNm);
fs.symlinkSync(electronModule, path.join(stageNm, 'electron'), 'dir');

const linkAllExceptElectron = (sourceNm) => {
  if (!fs.existsSync(sourceNm)) return;
  for (const entry of fs.readdirSync(sourceNm)) {
    if (entry === 'electron') continue;
    const linkPath = path.join(stageNm, entry);
    if (fs.existsSync(linkPath)) continue;
    fs.symlinkSync(path.join(sourceNm, entry), linkPath, 'dir');
  }
};

linkAllExceptElectron(path.join(root, 'node_modules'));
linkAllExceptElectron(path.join(repoRoot, 'node_modules'));

process.stdout.write(`stage-electron: staged → ${path.relative(process.cwd(), stage)}\n`);
