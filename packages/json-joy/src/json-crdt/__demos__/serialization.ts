/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/serialization.ts
 */

import {Model} from '..';
import {s} from '../../json-crdt-patch';
import {formatWithOptions} from 'util';

console.clear();

const schema = s.obj({
  id: s.con('xyz'),
  text: s.str('hello'),
  temperature: s.con(36.6),
});

const model = Model.create(void 0, 1234).setSchema(schema);

console.log(model + '');
// model
// ├─ root 0.0
// │  └─ obj 1234.1
// │     ├─ "id"
// │     │   └─ con 1234.2 { "xyz" }
// │     ├─ "text"
// │     │   └─ str 1234.3 { "hello" }
// │     │      └─ StrChunk 1234.4!5 len:5 { "hello" }
// │     └─ "temperature"
// │         └─ con 1234.9 { 36.6 }
// │
// ├─ index (4 nodes)
// │  ├─ obj 1234.1
// │  ├─ con 1234.2
// │  ├─ str 1234.3
// │  └─ con 1234.9
// │
// ├─ view
// │  └─ {
// │       "id": "xyz",
// │       "text": "hello",
// │       "temperature": 36.6
// │     }
// │
// └─ clock 1234.12

console.log(model.root + '');
// root 0.0
// └─ obj 1234.1
//    ├─ "id"
//    │   └─ con 1234.2 { "xyz" }
//    ├─ "text"
//    │   └─ str 1234.3 { "hello" }
//    │      └─ StrChunk 1234.4!5 len:5 { "hello" }
//    └─ "temperature"
//        └─ con 1234.9 { 36.6 }

const encoded = model.toBinary();
console.log(encoded);
// Uint8Array(57) [
//   0,   0,   0,  49,  26,  67,  98, 105, 100,  25,   0,
//  99, 120, 121, 122, 100, 116, 101, 120, 116,  24, 129,
//  23, 101, 104, 101, 108, 108, 111, 120,  11, 116, 101,
// 109, 112, 101, 114,  97, 116, 117, 114, 101,  18,   0,
// 251,  64,  66,  76, 204, 204, 204, 204, 205,   1, 210,
//   9,  11
// ]

const decoded = Model.fromBinary(encoded);
console.log(decoded.root + '');
// root 0.0
// └─ obj 1234.1
//    ├─ "id"
//    │   └─ con 1234.2 { "xyz" }
//    ├─ "text"
//    │   └─ str 1234.3 { "hello" }
//    │      └─ StrChunk 1234.4!5 len:5 { "hello" }
//    └─ "temperature"
//        └─ con 1234.9 { 36.6 }

import {Encoder as VerboseEncoder} from '../codec/structural/verbose/Encoder';
import {Decoder as VerboseDecoder} from '../codec/structural/verbose/Decoder';
const verboseEncoder = new VerboseEncoder();
const verboseDecoder = new VerboseDecoder();
const verboseEncoded = verboseEncoder.encode(model);
console.log(formatWithOptions({depth: 30}, verboseEncoded));
// {
//   time: [ [ 1234, 12 ] ],
//   root: {
//     type: 'val',
//     id: [ 0, 0 ],
//     value: {
//       type: 'obj',
//       id: [ 1234, 1 ],
//       map: {
//         id: { type: 'con', id: [ 1234, 2 ], value: 'xyz' },
//         text: {
//           type: 'str',
//           id: [ 1234, 3 ],
//           chunks: [ { id: [ 1234, 4 ], value: 'hello' } ]
//         },
//         temperature: { type: 'con', id: [ 1234, 9 ], value: 36.6 }
//       }
//     }
//   }
// }
const verboseDecoded = verboseDecoder.decode(verboseEncoded);
console.log(verboseDecoded.root + '');
// root 0.0
// └─ obj 1234.1
//    ├─ "id"
//    │   └─ con 1234.2 { "xyz" }
//    ├─ "text"
//    │   └─ str 1234.3 { "hello" }
//    │      └─ StrChunk 1234.4!5 len:5 { "hello" }
//    └─ "temperature"
//        └─ con 1234.9 { 36.6 }

import {Encoder as CompactEncoder} from '../codec/structural/compact/Encoder';
import {Decoder as CompactDecoder} from '../codec/structural/compact/Decoder';
const compactEncoder = new CompactEncoder();
const compactDecoder = new CompactDecoder();
const compactEncoded = compactEncoder.encode(model);
console.log(formatWithOptions({depth: 30}, compactEncoded));
// [
//   [ 1234, 11 ],
//   [
//     2,
//     [ -1, 10 ],
//     {
//       id: [ 0, [ -1, 9 ], 'xyz' ],
//       text: [
//         4,
//         [ -1, 8 ],
//         [ [ [ -1, 7 ], 'hello' ] ]
//       ],
//       temperature: [ 0, [ -1, 2 ], 36.6 ]
//     }
//   ]
// ]
const compactDecoded = compactDecoder.decode(compactEncoded);
console.log(compactDecoded.root + '');
// root 0.0
// └─ obj 1234.1
//    ├─ "id"
//    │   └─ con 1234.2 { "xyz" }
//    ├─ "text"
//    │   └─ str 1234.3 { "hello" }
//    │      └─ StrChunk 1234.4!5 len:5 { "hello" }
//    └─ "temperature"
//        └─ con 1234.9 { 36.6 }

import {Encoder as IndexedEncoder} from '../codec/indexed/binary/Encoder';
import {Decoder as IndexedDecoder} from '../codec/indexed/binary/Decoder';
const indexedEncoder = new IndexedEncoder();
const indexedDecoder = new IndexedDecoder();
const indexedEncoded = indexedEncoder.encode(model);
console.log(formatWithOptions({depth: 30}, indexedEncoded));
// {
//   c: Uint8Array(4) [ 1, 210, 9, 11 ],
//   r: Uint8Array(1) [ 1 ],
//   '0_1': Uint8Array(25) [
//      67,  98, 105, 100,   2, 100, 116,
//     101, 120, 116,   3, 120,  11, 116,
//     101, 109, 112, 101, 114,  97, 116,
//     117, 114, 101,   9
//   ],
//   '0_2': Uint8Array(5) [ 0, 99, 120, 121, 122 ],
//   '0_3': Uint8Array(8) [
//     129,   4, 101, 104,
//     101, 108, 108, 111
//   ],
//   '0_9': Uint8Array(10) [
//       0, 251,  64,  66,
//      76, 204, 204, 204,
//     204, 205
//   ]
// }
const indexedDecoded = indexedDecoder.decode(indexedEncoded);
console.log(indexedDecoded.root + '');
// root 0.0
// └─ obj 1234.1
//    ├─ "id"
//    │   └─ con 1234.2 { "xyz" }
//    ├─ "text"
//    │   └─ str 1234.3 { "hello" }
//    │      └─ StrChunk 1234.4!5 len:5 { "hello" }
//    └─ "temperature"
//        └─ con 1234.9 { 36.6 }

import {Encoder as SidecarEncoder} from '../codec/sidecar/binary/Encoder';
import {Decoder as SidecarDecoder} from '../codec/sidecar/binary/Decoder';
const sidecarEncoder = new SidecarEncoder();
const sidecarDecoder = new SidecarDecoder();
const [view, sidecar] = sidecarEncoder.encode(model);
console.log(formatWithOptions({depth: 30}, sidecar));
// Uint8Array(18) [
//   0,   0, 0, 10,  26, 67, 25,
//   0,  18, 0, 24, 129, 23,  5,
//   1, 210, 9, 11
// ]
const sidecarDecoded = sidecarDecoder.decode(model.view() as any, sidecar);
console.log(sidecarDecoded.root + '');
// root 0.0
// └─ obj 1234.1
//    ├─ "id"
//    │   └─ con 1234.2 { "xyz" }
//    ├─ "temperature"
//    │   └─ con 1234.9 { 36.6 }
//    └─ "text"
//        └─ str 1234.3 { "hello" }
//           └─ StrChunk 1234.4!5 len:5 { "hello" }
