/* tslint:disable no-console */
// npx ts-node src/json-crdt/__bench__/bench.codecs.sizes.ts

import {payloads} from '../../__bench__/payloads';
import {type StructuralEditors, structuralEditors} from './util/structural-editors';

console.clear();

const editorNames: StructuralEditors[] = [
  'jsonJoy',
  'jsonJoyServerClock',
  'jsonJoyCompact',
  'jsonJoyCompactServerClock',
  'jsonJoyVerbose',
  'jsonJoyVerboseServerClock',
  'jsonJoyIndexed',
  'jsonJoyIndexedServerClock',
  'jsonJoySidecar',
  'jsonJoySidecarServerClock',
  'yjs',
  'yrs',
  'automerge',
  'nativeJs',
];

for (const payload of payloads) {
  console.log('='.repeat(80));
  const title = typeof payload.name === 'function' ? payload.name(payload.data) : payload.name;
  console.log(`Payload: ${title}`);
  console.log('='.repeat(80));
  for (const name of editorNames) {
    const editor = structuralEditors[name];
    const instance = editor.factory();
    instance.setRoot(payload.data);
    const blob = instance.toBlob();
    const size = new Intl.NumberFormat().format(blob.length);
    console.log(`${editor.name} -> ${size} bytes`);
  }
  console.log('\n');
}
