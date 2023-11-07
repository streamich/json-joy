/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *    npx nodemon -q -x ts-node src/json-crdt-patch/__demos__/PatchBuilder-json.ts
 */

import {PatchBuilder, Patch} from '..';
import {LogicalClock} from '../clock';

console.clear();

const clock = new LogicalClock(123, 456);
const builder = new PatchBuilder(clock);

const json = {
  foo: 'bar',
  baz: 123,
  bools: [true, false],
};

builder.root(builder.json(json));

const patch = builder.flush();
console.log(patch.toString());

// Patch 123.456!17
// ├─ new_obj 123.456
// ├─ new_str 123.457
// ├─ ins_str 123.458!3, obj = 123.457 { 123.457 ← "bar" }
// ├─ new_con 123.461 { 123 }
// ├─ new_arr 123.462
// ├─ new_val 123.463
// ├─ new_con 123.464 { true }
// ├─ ins_val 123.465!1, obj = 123.463, val = 123.464
// ├─ new_val 123.466
// ├─ new_con 123.467 { false }
// ├─ ins_val 123.468!1, obj = 123.466, val = 123.467
// ├─ ins_arr 123.469!2, obj = 123.462 { 123.462 ← 123.463, 123.466 }
// ├─ ins_obj 123.471!1, obj = 123.456
// │   ├─ "foo": 123.457
// │   ├─ "baz": 123.461
// │   └─ "bools": 123.462
// └─ ins_val 123.472!1, obj = 0.0, val = 123.456

const buf = patch.toBinary();
console.log(buf);
// Uint8Array(38) [
//   123,  1, 200,   3, 246, 2,  4, 108,  1,  1,
//     1,  1,  98,  97, 114, 0, 24, 123, 74,  1,
//     0, 99, 102, 111, 111, 1,  1,  99, 98, 97,
//   122,  1,   5,   9,   0, 0,  1,   0
// ]

const patch2 = Patch.fromBinary(buf);
console.log(patch2.toString());
// Patch 123.456!17
// ├─ new_obj 123.456
// ├─ new_str 123.457
// ├─ ins_str 123.458!3, obj = 123.457 { 123.457 ← "bar" }
// ├─ new_con 123.461 { 123 }
// ├─ new_arr 123.462
// ├─ new_val 123.463
// ├─ new_con 123.464 { true }
// ├─ ins_val 123.465!1, obj = 123.463, val = 123.464
// ├─ new_val 123.466
// ├─ new_con 123.467 { false }
// ├─ ins_val 123.468!1, obj = 123.466, val = 123.467
// ├─ ins_arr 123.469!2, obj = 123.462 { 123.462 ← 123.463, 123.466 }
// ├─ ins_obj 123.471!1, obj = 123.456
// │   ├─ "foo": 123.457
// │   ├─ "baz": 123.461
// │   └─ "bools": 123.462
// └─ ins_val 123.472!1, obj = 0.0, val = 123.456
