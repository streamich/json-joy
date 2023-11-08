/* tslint:disable no-console */
// Run: npx ts-node src/json-crdt/__bench__/util/concurrent-trace-patch-builder.ts

/**
 * This script reads a concurrent editing trace and produces a JSON CRDT Patch
 * trace, which represents the same concurrent editing trace.
 */

import * as path from 'path';
import * as fs from 'fs';
import * as zlib from 'zlib';
import {Model} from '../../model';
import type {ConcurrentTrace} from './types';
import {Patch} from '../../../json-crdt-patch';
import {encode as encodeVerbose} from '../../../json-crdt-patch/codec/verbose';
import {encode as encodeCompact} from '../../../json-crdt-patch/codec/compact';
import {CborEncoder} from '../../../json-pack/cbor/CborEncoder';

export const loadConcurrentTrace = (traceName: string): ConcurrentTrace => {
  const root = path.resolve(__dirname, '..', '..', '..', '..');
  const traceFile = path.resolve(root, 'node_modules', 'editing-traces', 'concurrent_traces', `${traceName}.json.gz`);
  const buf = fs.readFileSync(traceFile);
  const text = zlib.gunzipSync(buf).toString();
  const json = JSON.parse(text) as ConcurrentTrace;
  return json;
};

export const convertConcurrentTraceToPatches = (json: ConcurrentTrace): Patch[] => {
  const agent0 = Model.withLogicalClock(1000000);
  agent0.api.root('');
  const agents: Model[] = [agent0];
  const histories: Patch[][] = [[agent0.api.flush()], ...Array.from({length: json.numAgents - 1}, () => [])];
  const historyLenAtTxn: number[][] = [];
  const historyConsumed: number[][] = Array.from({length: json.numAgents}, () => []);
  for (let i = 1; i < json.numAgents; i++) {
    const fork = agents[0].fork(agents[0].clock.sid + i);
    agents.push(fork);
  }
  for (let i = 0; i < json.txns.length; i++) {
    const txn = json.txns[i];
    const agent = agents[txn.agent];
    const str = agent.api.str([]);
    for (const parent of txn.parents) {
      const parentTxn = json.txns[parent];
      if (parentTxn.agent === txn.agent) continue;
      const historyLength = historyLenAtTxn[parent][parentTxn.agent];
      const history = histories[parentTxn.agent];
      const historySlice = history.slice(historyConsumed[txn.agent][parentTxn.agent], historyLength);
      historyConsumed[txn.agent][parentTxn.agent] = historyLength;
      agent.applyBatch(historySlice);
      for (const slice of historySlice) histories[txn.agent].push(slice);
    }
    for (const patch of txn.patches) {
      const [pos, remove, insert] = patch;
      if (remove) str.del(pos, remove);
      if (insert) str.ins(pos, insert);
    }
    const agentPatch = agent.api.flush();
    histories[txn.agent].push(agentPatch);
    historyLenAtTxn.push(histories.map((h) => h.length));
  }
  if (agents[0].view() !== json.endContent) console.warn('Contents do not match!');
  if ((agents[0].view() as any).length !== json.endContent.length) throw new Error('Lengths do not match!');
  const patchExists = new Set<string>();
  const history = histories[0];
  const batch: Patch[] = [];
  for (const patch of history) {
    const id = patch.getId()!.sid + '_' + patch.getId()!.time;
    if (patchExists.has(id)) continue;
    patchExists.add(id);
    batch.push(patch);
  }
  const model = Model.withLogicalClock(1000000);
  model.applyBatch(batch);
  if (model.view() !== json.endContent) console.warn('Contents do not match!');
  if ((model.view() as any).length !== json.endContent.length) throw new Error('Lengths do not match!');
  return batch;
};

// const traceName = 'friendsforever';
// const json = loadConcurrentTrace(traceName);
// const batch = convertConcurrentTraceToPatches(json);

// const cborEncoder = new CborEncoder();

// const dataVerbose = batch.map(patch => encodeVerbose(patch));
// const dataCompact = batch.map(patch => encodeCompact(patch));
// const dataBinary = batch.map(patch => patch.toBinary());

// fs.writeFileSync(path.join(__dirname, `${traceName}.verbose.json`), JSON.stringify(dataVerbose));
// fs.writeFileSync(path.join(__dirname, `${traceName}.verbose.cbor`), cborEncoder.encode(dataVerbose));

// fs.writeFileSync(path.join(__dirname, `${traceName}.compact.json`), JSON.stringify(dataCompact));
// fs.writeFileSync(path.join(__dirname, `${traceName}.compact.cbor`), cborEncoder.encode(dataCompact));

// fs.writeFileSync(path.join(__dirname, `${traceName}.binary.bin`), cborEncoder.encode(dataBinary));

// fs.createReadStream(path.join(__dirname, `${traceName}.verbose.json`))
//   .pipe(zlib.createGzip({level: 9}))
//   .pipe(fs.createWriteStream(path.join(__dirname, `${traceName}.verbose.json.gz`)));

// fs.createReadStream(path.join(__dirname, `${traceName}.verbose.cbor`))
//   .pipe(zlib.createGzip({level: 9}))
//   .pipe(fs.createWriteStream(path.join(__dirname, `${traceName}.verbose.cbor.gz`)));

// fs.createReadStream(path.join(__dirname, `${traceName}.compact.json`))
//   .pipe(zlib.createGzip({level: 9}))
//   .pipe(fs.createWriteStream(path.join(__dirname, `${traceName}.compact.json.gz`)));

// fs.createReadStream(path.join(__dirname, `${traceName}.compact.cbor`))
//   .pipe(zlib.createGzip({level: 9}))
//   .pipe(fs.createWriteStream(path.join(__dirname, `${traceName}.compact.cbor.gz`)));

// fs.createReadStream(path.join(__dirname, `${traceName}.binary.bin`))
//   .pipe(zlib.createGzip({level: 9}))
//   .pipe(fs.createWriteStream(path.join(__dirname, `${traceName}.binary.bin.gz`)));
