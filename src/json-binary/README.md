# json-binary

A JSON serializer and parser which supports `Uint8Array` binary data.
Encodes binary data as Base64 encoded data URI strings.

```ts
import * as JSONB from 'json-joy/lib/json-binary';

const data = {
  foo: new Uint8Array([1, 2, 3]),
};

const json = JSONB.stringify(data);
// {"foo":"data:application/octet-stream;base64,AAECAw=="}

const data2 = JSONB.parse(json);
// { foo: Uint8Array { 1, 2, 3 } }
```
