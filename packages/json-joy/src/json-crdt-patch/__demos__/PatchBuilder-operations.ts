/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx ts-node src/json-crdt-patch/__demos__/PatchBuilder-operations.ts
 */

import {PatchBuilder} from '..';
import {LogicalClock} from '../clock';
import * as verbose from '../codec/verbose';
import * as compact from '../codec/compact';
import * as binary from '../codec/binary';
import * as cbor from '@jsonjoy.com/json-pack/lib/cbor/shared';

const clock = new LogicalClock(123, 456);
const builder = new PatchBuilder(clock);

// Create a "str" RGA-String.
const stringId = builder.str();

// Insert "bar" text into the string at the starting position.
builder.insStr(stringId, stringId, 'bar');

// Create an "obj" LWW-Object.
const objectId = builder.obj();

// Set "foo" property of the object to "bar".
builder.insObj(objectId, [['foo', stringId]]);

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

console.log(JSON.stringify(verbose.encode(builder.patch), null, 2));
console.log('Size:', JSON.stringify(verbose.encode(builder.patch)).length);

console.log(JSON.stringify(compact.encode(builder.patch), null, 2));
console.log('Size:', JSON.stringify(compact.encode(builder.patch)).length);
console.log('Size:', cbor.encode(compact.encode(builder.patch)).length);

console.log(binary.encode(builder.patch));
console.log(Buffer.from(binary.encode(builder.patch)));
console.log('Size:', binary.encode(builder.patch).length);
