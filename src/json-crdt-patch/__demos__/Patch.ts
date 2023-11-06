/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx ts-node src/json-crdt-patch/__demos__/Patch.ts
 */

import {InsStrOp, NewStrOp, Patch} from '..';
import {ts} from '../clock';

const patch = new Patch();

// Create a new "str" RGA-String with ID [123, 0].
patch.ops.push(new NewStrOp(ts(123, 0)));

// Insert "hello" with timespan that starts from [123, 1], into an
// RGA-String with ID [123, 0], at position [123, 0] (the beginning).
patch.ops.push(new InsStrOp(ts(123, 1), ts(123, 0), ts(123, 0), 'hello'));

console.log(patch.toString());
