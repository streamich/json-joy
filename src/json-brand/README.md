# json-brand

TypeScript branded type for a JSON string.

```ts
import {JSON, json} from 'json-joy/lib/json-brand';

const str = '{"hello": "world"}' as json<{hello: string}>;

JSON.parse(str).hello; // OK
JSON.parse(str).foo; // Error: ...
```
