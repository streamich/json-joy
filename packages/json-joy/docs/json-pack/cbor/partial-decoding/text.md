The `CborDecoder` class allows to parse values from a CBOR blob without fully
decoding it. This is useful when you want to save CPU or memory resources, when
you only need few specific values from a larger document.

~~~jj.note
[Try this example][link] without installation on RunKit.

[link]: https://runkit.com/streamich/json-joy-json-pack-cbor-partial-decoding
~~~

For these advanced decoding features you will need the to use the `CborDecoder`
class. Instantiate the decoder:

```ts
const decoder = new CborDecoder();
```

For our examples we will use the following CBOR encoded document:

```ts
const pojo = {
  id: 123,
  foo: 'bar',
  tags: ['a', 'b', 'c'],
  nested: {
    a: 1,
    b: 2,
    level2: {
      c: 3,
    }
  },
};

const encoder = new CborEncoder();
const encoded = encoder.encode(pojo);
```


### One level decoding

Then use the `decodeLevel()` method to decode only one level of JSON nesting,
while returning the rest of the document as a `Uint8Array` blobs.

```ts
const decodedLevel = decoder.decodeLevel(encoded);

console.log(decodedLevel);
// {
//   id: 123,
//   foo: 'bar',
//   tags: JsonPackValue {
//     val: Uint8Array(7) [
//       131, 97, 97, 97,
//        98, 97, 99
//     ]
//   },
//   nested: JsonPackValue {
//     val: Uint8Array(19) [
//       163,  97,  97,   1,  97,  98,   2,
//       120,   6, 108, 101, 118, 101, 108,
//        50, 161,  97,  99,   3
//     ]
//   }
// }
```


### Finding by path (skipping)

You can also retrieve specific values from the document by path without
decoding the whole document. The decoder skips over the values that are not
needed and returns only the value specified by the path.

```ts
decoder.reader.reset(encoded);
const tag = decoder.find(['tags', 1]).val();

console.log(tag);
// b
```

Skipping is much faster than full decoding, if you need to retrieve only one
or few values from the document. If you need to retrieve many values from the
document, it is better to use either the one level decoding or full document
decoding.
