# JSON Pointer

Utilities to work with [JSON Pointers][json-pointer].

[json-pointer]: https://tools.ietf.org/html/rfc6901

```js
import {find, parseJsonPointer} from 'json-joy';
// or 
import {find, parseJsonPointer} from 'json-joy/{lib,es6,esm}/json-pointer';

const doc = {
  foo: {
    bar: 123,
  }
};

const path = parseJsonPointer('/foo/bar');
const ref = find(doc, path);

console.log(ref);
// { val: 123, obj: { bar: 123 }, key: 'bar' }
```

Convert JSON Pointer to  path array and back.

```js
console.log(parseJsonPointer('/f~0o~1o/bar/1/baz'));
// [ 'f~o/o', 'bar', '1', 'baz' ]

console.log(formatJsonPointer(['f~o/o', 'bar', '1', 'baz']));
// /f~0o~1o/bar/1/baz
```

Decode and encode a single step of JSON Pointer.

```js
console.log(unescapeComponent('~0~1'));
// ~/

console.log(escapeComponent('~/'));
// ~0~1
```
