# `binary` codec for JSON Patch+ patches

`binary` encodes JSON Patch+ operations in the same shape as [`compact` encoding](../compact/README.md),
but serializes it into binary MessagePack format instead of textual JSON.

The implementation in this folder is efficient as it does not create
intermediary `compact` representation&mdash;instead it goes straight to
MessagePack from JSON Patch+ operations.

## Usage

```ts
import {OpTest, OpReplace} from 'json-joy/{lib,es6,ems}/json-patch';
import {Encoder, Decoder} from 'json-joy/{lib,es6,ems}/json-patch/codec/binary';

const encoder = new Encoder();
const decoder = new Decoder();

const patch = [new OpTest('/foo', 'bar'), new OpReplace('/foo', 'baz')];

const encoded = encoder.encode(patch);
const decoded = decoder.decode(encoded);
```
