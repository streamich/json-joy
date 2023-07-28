/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx ts-node src/json-crdt-patch/__demos__/PatchBuilder-json.ts
 */

import {PatchBuilder, Patch} from '..';
import {LogicalClock} from '../clock';

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

// Patch 123.456!15
// ├─ "obj" 123.456
// ├─ "str" 123.457
// ├─ "ins_str" 123.458!3, obj = 123.457 { 123.457 ← "bar" }
// ├─ "con" 123.461 { 123 }
// ├─ "arr" 123.462
// ├─ "con" 123.463 { true }
// ├─ "val" 123.464 { 123.463 }
// ├─ "con" 123.465 { false }
// ├─ "val" 123.466 { 123.465 }
// ├─ "ins_arr" 123.467!2, obj = 123.462 { 123.462 ← 123.464, 123.466 }
// ├─ "ins_obj" 123.469!1, obj = 123.456
// │   ├─ "foo": 123.457
// │   ├─ "baz": 123.461
// │   └─ "bools": 123.462
// └─ "ins_val" 123.470!1, obj = 0.0, val = 123.456

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
// Patch 123.456!8
// ├─ "obj" 123.456
// ├─ "str" 123.457
// ├─ "ins_str" 123.458!3, obj = 123.457 { 123.457 ← "bar" }
// ├─ "con" 123.461 { 123 }
// ├─ "ins_obj" 123.462!1, obj = 123.456
// │   ├─ "foo": 123.457
// │   └─ "baz": 123.461
// └─ "ins_val" 123.463!1, obj = 0.0, val = 123.456
