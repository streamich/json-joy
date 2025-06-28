/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/docs-bin.ts
 */

import {Model} from '..';

console.clear();

const model = Model.withLogicalClock(1234); // 1234 is session ID

model.api.set({
  blob: new Uint8Array([1, 2, 3, 14, 15, 16, 17]),
});

console.log(model.view());
// {
//   blob: Uint8Array(7) [
//      1,  2,  3, 14,
//     15, 16, 17
//   ]
// }

console.log(model.root + '');
// root 0.0
// └─ obj 1234.1
//    └─ "blob"
//        └─ bin 1234.2  { 01 02 03 0e 0f 10 11 }
//           └─ BinChunk 1234.3!7 len:7 { 01 02 03 0e 0f 10 11 }

// Retrieve node at path ['blob'] as "bin" type.
const blob = model.api.bin(['blob']);
console.log(blob + '');
// BinApi
// └─ bin 1234.2  { 01 02 03 0e 0f 10 11 }
//    └─ BinChunk 1234.3!7 len:7 { 01 02 03 0e 0f 10 11 }

blob.ins(3, new Uint8Array([4, 5]));
console.log(blob + '');
// BinApi
// └─ bin 1234.2  { 01 02 03 04 05 0e 0f 10 11 }
//    └─ BinChunk 1234.12!2 len:9 { 04 05 }
//       ← BinChunk 1234.3!3 len:3 { 01 02 03 }
//       → BinChunk 1234.6!4 len:4 { 0e 0f 10 11 }

blob.del(2, 1);
console.log(blob + '');
// BinApi
// └─ bin 1234.2  { 01 02 04 05 0e 0f 10 11 }
//    └─ BinChunk 1234.12!2 len:8 { 04 05 }
//       ← BinChunk 1234.3!2 len:2 { 01 02 }
//         → BinChunk 1234.5!1 len:0 [1]
//       → BinChunk 1234.6!4 len:4 { 0e 0f 10 11 }

console.log(model.view());
// {
//   blob: Uint8Array(8) [
//      1,  2,  4,  5,
//     14, 15, 16, 17
//   ]
// }
