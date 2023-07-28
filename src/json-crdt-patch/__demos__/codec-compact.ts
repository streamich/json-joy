/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx ts-node src/json-crdt-patch/__demos__/codec-compact.ts
 */

import {PatchBuilder} from '..';
import {encode} from '../codec/compact';
import {LogicalClock} from '../clock';

const clock = new LogicalClock(123, 456);
const builder = new PatchBuilder(clock);

builder.json('hello');
const pojo = encode(builder.patch);

console.log(JSON.stringify(pojo, null, 2));
// [
//   [
//     [123, 456]
//   ],
//   [4],
//   [12, -1, -1, "hello"],
// ]
