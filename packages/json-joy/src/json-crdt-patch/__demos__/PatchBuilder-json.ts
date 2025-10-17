/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *    npx nodemon -q -x ts-node src/json-crdt-patch/__demos__/PatchBuilder-json.ts
 */

import {PatchBuilder, Patch, schema} from '..';
import {LogicalClock} from '../clock';

console.clear();

const clock = new LogicalClock(123, 456);
const builder = new PatchBuilder(clock);

const json = {
  foo: 'bar',
  baz: 123,
  bools: [true, false],
  tuple: schema.vec(schema.con(123), schema.con(true)),
};

builder.root(builder.json(json));

const patch = builder.flush();
console.log(patch.toString());

// Patch 123.456!21
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
// ├─ new_vec 123.471
// ├─ new_con 123.472 { 123 }
// ├─ new_con 123.473 { true }
// ├─ ins_vec 123.474!1, obj = 123.471
// │  ├─ 0: 123.472
// │  └─ 1: 123.473
// ├─ ins_obj 123.475!1, obj = 123.456
// │  ├─ "foo": 123.457
// │  ├─ "baz": 123.461
// │  ├─ "bools": 123.462
// │  └─ "tuple": 123.471
// └─ ins_val 123.476!1, obj = 0.0, val = 123.456

const buf = patch.toBinary();
console.log(buf);

// Uint8Array(95) [
//   123, 200,   3, 247,  18,  16,  32,  99, 73,   7,  73,   7,
//    98,  97, 114,   0,  24, 123,  48,   8,  0, 245,  72,  79,
//     7,  80,   7,   8,   0, 244,  72,  82,  7,  83,   7, 114,
//    78,   7,  78,   7,  79,   7,  82,   7, 24,   0,  24, 123,
//     0, 245,  90,  87,   7,   0,  88,   7,  1,  89,   7,  84,
//    72,   7,  99, 102, 111, 111,  73,   7, 99,  98,  97, 122,
//    77,   7, 101,  98, 111, 111, 108, 115, 78,   7, 101, 116,
//   117, 112, 108, 101,  87,   7,  72, 128,  0,  72,   7
// ]

const patch2 = Patch.fromBinary(buf);
console.log(patch2.toString());

// Patch 123.456!21
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
// ├─ new_vec 123.471
// ├─ new_con 123.472 { 123 }
// ├─ new_con 123.473 { true }
// ├─ ins_vec 123.474!1, obj = 123.471
// │  ├─ 0: 123.472
// │  └─ 1: 123.473
// ├─ ins_obj 123.475!1, obj = 123.456
// │  ├─ "foo": 123.457
// │  ├─ "baz": 123.461
// │  ├─ "bools": 123.462
// │  └─ "tuple": 123.471
// └─ ins_val 123.476!1, obj = 0.0, val = 123.456
