# `json-pack` MessagePack Codec

Fast and lean implementation of [MessagePack](https://github.com/msgpack/msgpack/blob/master/spec.md) codec.

- Fastest implementation of MessagePack in JavaScript.
- Small footprint, small bundle size.
- Works in Node.js and browser.
- Supports binary fields.
- Supports extensions.
- Supports precomputed MessagePack values.


## Benchmarks

Faster than built-in `JSON.stringify` and `JSON.parse`, and any other library.

Encoding a 854 byte JSON object:

```
node benchmarks/json-pack.js
Size: 854
json-pack (v4) x 372,149 ops/sec ±0.63% (96 runs sampled), 2687 ns/op
json-pack (v3) x 273,234 ops/sec ±0.74% (95 runs sampled), 3660 ns/op
json-pack (v2) x 329,977 ops/sec ±0.48% (95 runs sampled), 3031 ns/op
JSON.stringify x 303,455 ops/sec ±0.94% (97 runs sampled), 3295 ns/op
@msgpack/msgpack x 211,446 ops/sec ±0.75% (90 runs sampled), 4729 ns/op
msgpack-lite x 106,048 ops/sec ±2.80% (90 runs sampled), 9430 ns/op
msgpack5 x 18,336 ops/sec ±2.52% (84 runs sampled), 54537 ns/op
messagepack x 18,907 ops/sec ±3.36% (81 runs sampled), 52890 ns/op
Fastest is json-pack (v4)
```

Decoding a 584 byte JSON object:

```
node benchmarks/json-pack.Decoder.js 
json-pack x 258,215 ops/sec ±0.97% (90 runs sampled), 3873 ns/op
JSON.parse x 224,616 ops/sec ±0.72% (91 runs sampled), 4452 ns/op
@msgpack/msgpack x 196,799 ops/sec ±0.74% (93 runs sampled), 5081 ns/op
msgpack x 62,323 ops/sec ±0.74% (92 runs sampled), 16045 ns/op
msgpack-lite x 52,794 ops/sec ±0.75% (92 runs sampled), 18941 ns/op
msgpack5 x 30,240 ops/sec ±0.76% (93 runs sampled), 33069 ns/op
messagepack x 2,740 ops/sec ±10.15% (49 runs sampled), 364983 ns/op
```


## Basic Usage

Use `MessagePackEncoder` and `MessagePackDecoder` to encode plain JSON values:

```ts
import {MessagePackEncoder, MessagePackDecoder} from '@jsonjoy.com/json-pack/lib/msgpack';

const encoder = new MessagePackEncoder();
const decoder = new MessagePackDecoder();

const data = {foo: 'bar'};
const buffer = encoder.encode(data);
const obj = decoder.decode(buffer);

console.log(obj); // { foo: 'bar' }
```

## Advanced Usage

### Basic usage

Use `Encoder` to encode plain JSON values.

```ts
import {Encoder, Decoder} from '@jsonjoy.com/json-pack/lib/msgpack';

const encoder = new Encoder();
const decoder = new Decoder();
const buffer = encoder.encode({foo: 'bar'});
const obj = decoder.decode(buffer);

console.log(obj); // { foo: 'bar' }
```

Use `EncoderFull` to encode data that is more complex than plain JSON. For
example, encode binary data using `ArrayBuffer`:

```ts
import {EncoderFull, Decoder} from '@jsonjoy.com/json-pack/lib/msgpack';

const encoder = new EncoderFull();
const decoder = new Decoder();
const buffer = encoder.encode({foo: new Uint8Array([1, 2, 3]).buffer});
const obj = decoder.decode(buffer);
console.log(obj); // { foo: ArrayBuffer { [1, 2, 3] } }
```


### Pre-computed values

You might have already encoded MessagePack value, to insert it into a bigger
MessagePack object as-is use `JsonPackValue` wrapper.

```ts
import {EncoderFull, Decoder, JsonPackValue} from '@jsonjoy.com/json-pack/lib/msgpack';

const encoder = new EncoderFull();
const decoder = new Decoder();
const buffer = encoder.encode({foo: 'bar'});
const value = new JsonPackValue(buffer);
const buffer2 = encoder.encode({baz: value});

const obj = decoder.decode(buffer2);
console.log(obj); // { baz: { foo: 'bar' } }
```

### Extensions

Use `JsonPackExtension` wrapper to encode extensions.

```ts
import {EncoderFull, Decoder, JsonPackExtension} from '@jsonjoy.com/json-pack/lib/msgpack';

const ext = new JsonPackExtension(1, new Uint8Array(8));
const encoder = new EncoderFull();
const decoder = new Decoder();
const buffer = encoder.encode({foo: ext});

const obj = decoder.decode(buffer);
console.log(obj); // { foo: JsonPackExtension } 
```

### Decoding one level at a time

You can use `.decodeOneLevel()` method to decode one level of objects or arrays
of Message Pack values at a time. Only the primitive values of the first level
are returned decoded, complex values&mdash;like objects and arrays&mdash;are
returned as `JsonPackValue` blobs.

```ts
const msgPack = encoder.encode({
  a: 1,
  b: [1],
});
const decoded = decoder.decodeOneLevel(msgPack);
console.log(decoded); // { a: 1, b: JsonPackValue {} }
```

### Stable binary output

Objects key order in JavaScript is not predictable, hence the same object can
result in different MessagePack blobs. Use `EncoderStable` to get stable
MessagePack blobs.

```ts
import {EncoderStable} from '@jsonjoy.com/json-pack/lib/msgpack';

const encoder = new EncoderStable();

const buf1 = encoder.encode({a: 1, b: 2});
const buf2 = encoder.encode({b: 2, a: 1});

// buf1.equals(buf2) == true
```
