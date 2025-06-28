/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/getting-started.ts
 */

import {Model, type n} from '..';
import {vec} from '../../json-crdt-patch';

// Create a new JSON CRDT document, 1234 is the session ID.
const model = Model.withLogicalClock(1234) as any as Model<
  n.obj<{
    counter: n.val<n.con<number>>;
    text: n.str;
  }>
>;

console.log(model.view());
console.log(model + '');

model.api.set({
  counter: 0,
  text: 'Hello',
});

console.log(model.view());
console.log(model + '');

// model.proxy.toApi().set({
//   counter: 25,
// });
model.api.obj([]).set({
  counter: 25,
});

// model.proxy.text.toApi().ins(5, ' world!');
model.api.str(['text']).ins(5, ' world!');

console.log(model.view());
console.log(model + '');

const blob = model.toBinary();
console.log(blob);
// Uint8Array(52) [
//   1,   0,   0,   0,  38, 129,  18, 130, 167,  99,
// 111, 117, 110, 116, 101, 114,  24, 212,  25, 164,
// 116, 101, 120, 116, 129,  16, 162,  31, 165,  72,
// 101, 108, 108, 111,  22, 167,  32, 119, 111, 114,
// 108, 100,  33,   1,   0,   0,   4, 210,   0,   0,
//   0,  19
// ]

const fork = Model.fromBinary(blob);
console.log(fork + '');
// Model
// ├─ RootNode 0.0
// │  └─ ObjNode 1234.1
// │     ├─ "counter"
// │     │   └─ ConNode 1234.11 { 25 }
// │     └─ "text"
// │         └─ StrNode 1234.3 { "Hello world!" }
// │            └─ StrChunk 1234.13!7 len:12 { " world!" }
// │               ← StrChunk 1234.4!5 len:5 { "Hello" }
// │
// └─ VectorClock 1234.20

const patch = model.api.flush();
console.log(patch + '');
// Patch 1234.1!19
// ├─ "new_obj" 1234.1
// ├─ "new_con" 1234.2 { 0 }
// ├─ "new_str" 1234.3
// ├─ "ins_str" 1234.4!5, obj = 1234.3 { 1234.3 ← "Hello" }
// ├─ "ins_obj" 1234.9!1, obj = 1234.1
// │   ├─ "counter": 1234.2
// │   └─ "text": 1234.3
// ├─ "ins_val" 1234.10!1, obj = 0.0, val = 1234.1
// ├─ "new_con" 1234.11 { 25 }
// ├─ "ins_obj" 1234.12!1, obj = 1234.1
// │   └─ "counter": 1234.11
// └─ "ins_str" 1234.13!7, obj = 1234.3 { 1234.8 ← " world!" }

const patchBlob = patch.toBinary();
console.log(patchBlob);
// Uint8Array(64) [
//   210,   9,   1, 247,   9,   2,   0,   0,   4, 172, 131,
//   131,  72, 101, 108, 108, 111,  74, 129, 120,   7,  99,
//   111, 117, 110, 116, 101, 114, 130, 100, 116, 101, 120,
//   116, 131,   9,   0,   0, 129,   0,  24,  25,  42, 129,
//   120,   7,  99, 111, 117, 110, 116, 101, 114, 139, 236,
//   131, 136,  32, 119, 111, 114, 108, 100,  33
// ]
