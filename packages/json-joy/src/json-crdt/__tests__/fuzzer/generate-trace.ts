/* tslint:disable no-console */
// Run: npx ts-node src/json-crdt/__tests__/fuzzer/generate-trace.ts

import type {Patch} from '../../../json-crdt-patch';
import {Model} from '../../model';
import {JsonCrdtFuzzer} from './JsonCrdtFuzzer';
import {CborEncoder} from '@jsonjoy.com/json-pack/lib/cbor/CborEncoder';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import * as fs from 'fs';

const sessionNum = 100;
const fuzzer = new JsonCrdtFuzzer({
  // concurrentPeers: [20, 100],
  // startingValue: new Uint8Array([1, 2, 3]),
  collectPatches: true,
});
fuzzer.setupModel();

for (let ses = 0; ses < sessionNum; ses++) {
  fuzzer.executeConcurrentSession();
}

const patches: Patch[] = [];
const dupes: Set<string> = new Set();
for (const patch of fuzzer.patches) {
  const key = `${patch.getId()?.sid}_${patch.getId()?.time}`;
  if (dupes.has(key)) continue;
  dupes.add(key);
  patches.push(patch);
}

const model = Model.create();
model.applyBatch(patches);
const cborEncoder = new CborEncoder(new Writer());
fs.writeFileSync(__dirname + '/trace.cbor', cborEncoder.encode(patches.map((p) => p.toBinary())));

// console.log(Buffer.from(jsonEncoder.encode(encoded)).toString());
console.log(model.view());
console.log(fuzzer.model.view());
// console.log(model + '');
