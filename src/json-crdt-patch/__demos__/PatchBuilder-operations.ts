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

// Create a "str" RGA-String.
const stringId = builder.str();

// Insert "bar" text into the string at the starting position.
builder.insStr(stringId, stringId, 'bar');

// Create an "obj" LWW-Object.
const objectId = builder.obj();

// Set "foo" property of the object to "bar".
builder.setKeys(objectId, [
  ['foo', stringId],
]);

// Set the document root LWW-Register value to the object.
builder.root(objectId);

console.log(builder.patch + '');
// Patch 123.456!7
// ├─ "str" 123.456
// ├─ "ins_str" 123.457!3, obj = 123.456 { 123.456 ← "bar" }
// ├─ "obj" 123.460
// ├─ "ins_obj" 123.461!1, obj = 123.460
// │   └─ "foo": 123.456
// └─ "ins_val" 123.462!1, obj = 0.0, val = 123.460
