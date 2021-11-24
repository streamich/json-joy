# Base64


## Encoder

- Implements base base64 encoding algorithm compatible with Node's Buffer.
- Isomorphic&mdash;it can be used in both Node and the browser.
- Faster than the Node's implementation for short blobs, smaller than 40 bytes.
- Uses Node's implementation for long blobs, if available. Hence, it also works
  in browser, but in Node environment will perform faster for short strings.


### Usage

Use encoder compatible with Node's Buffer:

```ts
import {encode} from 'json-joy/{lib,es2020}/util/base64';

encode(new Uint8Array([1, 2, 3]));
```

Create your custom encoder:

```ts
import {createEncode} from 'json-joy/{lib,es2020}/util/base64';

const encode = createEncode('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+_');

encode(new Uint8Array([1, 2, 3]));
```
