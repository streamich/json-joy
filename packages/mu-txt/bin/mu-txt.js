#!/usr/bin/env node
'use strict';

const {spawn} = require('node:child_process');
const path = require('node:path');

const electron = require('electron');
const main = path.resolve(__dirname, '..', 'out-electron', 'main.js');

const child = spawn(electron, [main, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env,
  windowsHide: false,
});

child.on('close', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code == null ? 0 : code);
  }
});
