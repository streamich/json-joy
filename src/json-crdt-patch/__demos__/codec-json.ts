/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx ts-node src/json-crdt-patch/__demos__/codec-json.ts
 */

import {PatchBuilder} from '..';
import {encode} from '../codec/verbose';
import {LogicalClock} from '../clock';

const clock = new LogicalClock(123, 456);
const builder = new PatchBuilder(clock);

builder.json('hello');
const pojo = encode(builder.patch);

console.log(JSON.stringify(pojo, null, 2));
// {
//   "id": [123, 456],
//   "ops": [
//     { "op": "str" },
//     { "op": "ins_str", "obj": [123, 456],
//     "after": [123, 456], "value": "hello" }
//   ]
// }
