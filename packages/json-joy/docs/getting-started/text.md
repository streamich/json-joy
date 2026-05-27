## Installation

Install the `json-joy` library from NPM using your favorite package manager.

```
npm install json-joy
```


## Usage

The `json-joy` library is structure as a collection of sub-libraries. To reduce
your browser-side bundle size all `json-joy` sub-libraries have to be imported
directly from their subfolder.

```ts
import from 'json-joy/{lib,es2020,es6,esm}/<library>';
```

For example:

```ts
import {deepEqual} from 'json-joy/es2020/json-equal';
```

All libraries can be imported from one of the below folders:

- `lib` --- ES5 compiled CommonJS code.
- `es2020` --- ES2020 compiled CommonJS code.
- `es6` --- ES6 compiled CommonJS code.
- `esm` --- latest TypeScript compiler supported EcmaScript modules code.
