/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx ts-node src/json-crdt-patch/__demos__/PatchBuilder-konst.ts
 */

import {PatchBuilder, s} from '..';
import {LogicalClock} from '../clock';

const clock = new LogicalClock(123, 456);
const builder = new PatchBuilder(clock);

builder.json({
  bools: s.con([true, false]),
}),
  console.log(builder.patch + '');

// Patch 123.456!3
// ├─ "obj" 123.456
// ├─ "con" 123.457 { [true,false] }
// └─ "ins_obj" 123.458!1, obj = 123.456
//     └─ "bools": 123.457
