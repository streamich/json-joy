/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx ts-node src/json-crdt-patch/__demos__/PatchBuilder-operations.ts
 */

import {PatchBuilder} from '..';
import {LogicalClock} from '../clock';

const clock = new LogicalClock(123, 456);
const builder = new PatchBuilder(clock);

const strId = builder.str();
builder.insStr(strId, strId, 'Hello, world!');

builder.root(strId);

const patch = builder.flush();
console.log(patch.toString());
// Patch 123.456!15
// ├─ "str" 123.456
// ├─ "ins_str" 123.457!13, obj = 123.456 { 123.456 ← "Hello, world!" }
// └─ "ins_val" 123.470!1, obj = 0.0, val = 123.456
