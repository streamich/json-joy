# Bencode codecs

Implements [Bencode][bencode] encoder and decoder.

[bencode]: https://en.wikipedia.org/wiki/Bencode

Type coercion:

- Strings and `Uint8Array` are encoded as Bencode byte strings, decoded as `Uint8Array`.
- `Object` and `Map` are encoded as Bencode dictionaries, decoded as `Object`.
- `Array` and `Set` are encoded as Bencode lists, decoded as `Array`.
- `number` and `bigint` are encoded as Bencode integers, decoded as `number`.
- Float `number` are rounded and encoded as Bencode integers, decoded as `number`.


## Extensions

This codec extends the Bencode specification to support the following types:

- `null` (encoded as `n`)
- `undefined` (encoded as `u`)
- `boolean` (encoded as `t` for `true` and `f` for `false`)
