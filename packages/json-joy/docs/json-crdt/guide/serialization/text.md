`json-joy` specifies various ways to serialize JSON CRDT documents. You can
serialize it to a human-readable string or JSON, as well to a highly compact
an performant binary formats. You can also serialize each document node
separately or serialize the document metadata separately from the view.
In this section we will cover all of those options.

For the purpose of this guide we will use the following document as an example:

```js
const schema = s.obj({
  id: s.con('xyz'),
  text: s.str('hello'),
  temperature: s.con(36.6),
});

const model = Model
  .withLogicalClock(1234)
  .setSchema(schema);
```


## Textual serialization

For the purposes of debugging and logging you can serialize the document to
a human-readable string, which follows a similar structure how JSON CRDT model
is represented in the JSON CRDT specification. These strings are not meant to
be parsed back into a model.

You can retrieve the text base representation by calling the `model.toString()`
method, or simply casting the model to a string:


```ts
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
```

You can also serialize just the structure of the document, by casting the
`model.root` object to a string:

```ts
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
```


## Structural binary serialization

The model has a built-in binary serialization, which is used by default when
you call `model.toBinary()` method. This method returns a `Uint8Array` which
can be stored or sent over the network.

```ts
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
```

To un-serialize the model back from the binary format you can use the
`Model.fromBinary()` method:

```ts
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
```


## Structural verbose serialization

You can use the structural `verbose` encoding format. It is a human-readable,
it returns you a JSON-like POJO object, which you can then serialize to JSON,
CBOR, MessagePack, or any other format.

To use this format you will need to import and instantiate the `Encoder` and
`Decoder` classes:

```ts
import {Encoder as VerboseEncoder} from 'json-joy/es2020/json-crdt/codec/structural/verbose/Encoder';
import {Decoder as VerboseDecoder} from 'json-joy/es2020/json-crdt/codec/structural/verbose/Decoder';

const verboseEncoder = new VerboseEncoder();
const verboseDecoder = new VerboseDecoder();
```

To encode the model you can call the `verboseEncoder.encode()` method:


```ts
const verboseEncoded = verboseEncoder.encode(model);
console.log(verboseEncoded);
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
```

To decode the model you can call the `verboseDecoder.decode()` method:


```ts
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
```


## Structural compact serialization

You can use the structural `compact` encoding format. It is less human-readable,
it returns you a JSON-like POJO object, which you can then serialize to JSON,
CBOR, MessagePack, or any other format.

To use this format you will need to import and instantiate the `Encoder` and
`Decoder` classes:

```ts
import {Encoder as CompactEncoder} from '../codec/structural/compact/Encoder';
import {Decoder as CompactDecoder} from '../codec/structural/compact/Decoder';

const compactEncoder = new CompactEncoder();
const compactDecoder = new CompactDecoder();
```

To encode the model you can call the `compactEncoder.encode()` method:

```ts
const compactEncoded = compactEncoder.encode(model);
console.log(compactEncoded);
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
```

To decode the model you can call the `compactDecoder.decode()` method:


```ts
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
```


## Indexed serialization

Indexed serialization is a binary format, which stores the document in map
where keys are strings and values are binary encoded nodes. Each node is
encoded into its own binary blob. This allows you to store the document
in a database, where you can query and update individual nodes by their IDs.

To use this format you will need to import and instantiate the `Encoder` and
`Decoder` classes:

```ts
import {Encoder as IndexedEncoder} from '../codec/indexed/binary/Encoder';
import {Decoder as IndexedDecoder} from '../codec/indexed/binary/Decoder';

const indexedEncoder = new IndexedEncoder();
const indexedDecoder = new IndexedDecoder();
```

To encode the model you can call the `indexedEncoder.encode()` method:

```ts
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
```

To decode the model you can call the `indexedDecoder.decode()` method:

```ts
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
```


## Sidecar serialization

The `sidecar` format encodes the document metadata and the document view
separately. This allows you to store the document view in a format that
can be viewed without decoding the metadata.

To use this format you will need to import and instantiate the `Encoder` and
`Decoder` classes:

```ts
import {Encoder as SidecarEncoder} from '../codec/sidecar/binary/Encoder';
import {Decoder as SidecarDecoder} from '../codec/sidecar/binary/Decoder';

const sidecarEncoder = new SidecarEncoder();
const sidecarDecoder = new SidecarDecoder();
```

To encode the model you can call the `sidecarEncoder.encode()` method. It
returns a 2-tuple of `[view, sidecar]` where `view` is the model view encoded
as CBOR and `sidecar` is an opaque blob of CRDT metadata. You do no need to
store the view of the model in CBOR, you can store it in any format you want.

```ts
const [view, sidecar] = sidecarEncoder.encode(model);
console.log(formatWithOptions({depth: 30}, sidecar));
// Uint8Array(18) [
//   0,   0, 0, 10,  26, 67, 25,
//   0,  18, 0, 24, 129, 23,  5,
//   1, 210, 9, 11
// ]
```

To decode the model you can call the `sidecarDecoder.decode()` method:

```ts
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
```
