/* tslint:disable no-console */
// npx ts-node src/json-crdt/__bench__/util/concurrent-trace-patch-builder.ts

/**
 * This script reads a concurrent editing trace and produces a JSON CRDT Patch
 * trace, which represents the same concurrent editing trace.
 */

import * as path from 'path';
import * as fs from 'fs';
import * as zlib from 'zlib';
import {Model} from '../../model';
import type {ConcurrentTrace} from './types';

const root = path.resolve(__dirname, '..', '..', '..', '..');
const traceName = 'friendsforever';
const traceFile = path.resolve(root, 'node_modules', 'editing-traces', 'concurrent_traces', `${traceName}.json.gz`);

const buf = fs.readFileSync(traceFile);
const text = zlib.gunzipSync(buf).toString();
const json = JSON.parse(text) as ConcurrentTrace;

const agent0 = Model.withLogicalClock(1000000);
agent0.api.root('');

const agents: Model[] = [agent0];

for (const txn of json.txns) {
  console.log(txn);
}

