The `MsgPackDecoder` class allows to parse values from a MessagePack blob without fully
decoding it. This is useful when you want to save CPU or memory resources, when
you only need few specific values from a larger document.


### Finding by path (skipping)

You can retrieve specific values from the document by path without
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
document, it could be better to parse the whole document.
