/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx ts-node src/json-crdt-patch/__demos__/codec-binary.ts
 */

import {PatchBuilder} from '..';
import {encode} from '../codec/binary';
import {LogicalClock} from '../clock';

const clock = new LogicalClock(123, 456);
const builder = new PatchBuilder(clock);

builder.json('hello');
const encoded = encode(builder.patch);

console.log(encoded);
// Uint8Array(16) [
//   123,   1, 200,   3, 246,   4,
//   172,   1,   0,   1,   0, 104,
//   101, 108, 108, 111
// ]
