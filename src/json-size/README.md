# `json-size`

This library implements methods to calculate the size of JSON objects.
It calculates the size of bytes necessary to store the final serialized JSON
in UTF-8 encoding.

## Usage

```ts
import {jsonSize} from 'json-joy/{lib,es5}/json-size';

jsonSize({1: 2, foo: 'bar'}) // 19
```
