A JSON serializer and parser which supports `Uint8Array` binary data.
Encodes binary data as Base64 encoded data URI strings.

Encodes POJOs to strings and decodes strings back to POJOs.

```ts
import * as jsonb from 'json-joy/lib/json-binary';

const data = {
  foo: new Uint8Array([1, 2, 3]),
};

const json = jsonb.stringify(data);
// {"foo":"data:application/octet-stream;base64,AAECAw=="}

const data2 = jsonb.parse(json);
// { foo: Uint8Array { 1, 2, 3 } }
```
