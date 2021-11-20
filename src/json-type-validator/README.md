# json-type-validator

This library implements JSON validation according to `json-type` schema. It
generates the most efficient JavaScript code for validation given the schema.

The generated validator functions return truthy value or error information on
validation failure. And `false` or a falsy value on success.


## Usage

```ts
import {t} from 'json-joy/es2020/json-type';
import {createBoolValidator} from 'json-joy/es2020/json-type-validator';

const type = t.Object({
  fields: [
    t.Field('id', t.str),
    t.Field('name', t.str, {isOptional: true}),
  ],
});

const json = {
  id: '123',
  name: 'John',
};

const validator = createBoolValidator(type /* , options */);

const err1 = validator(json);   // false
const err2 = validator({});     // true
```

To see insides of the validator function use `.toString()`.

```ts
console.log(validator.toString());
```

If you want your validator to return more info about the error, use
`createStrValidator` or `createObjValidator`.

```ts
import {createStrValidator, createObjValidator} from 'json-joy/es2020/json-type-validator';
```


## Benchmark

`json-type-validator` in general should be faster than any JSON Schema
validator. But the most significant boost in performance can be achieved by
disable extra properties validation with `skipObjectExtraFieldsCheck`, which
will allow extra properties present on objects. This is useful when you want
to validate incoming HTTP or RPC requests and don't mind extra properties.

```
node benchmarks/json-type-validator/collection-object.js
[fastest handcrafted validator with no additional properties check] x 1,009,294,371 ops/sec ±0.15% (101 runs sampled), 1 ns/op
json-joy/json-type-codegen x 24,968,269 ops/sec ±0.34% (95 runs sampled), 40 ns/op
json-joy/json-type-codegen {skipObjectExtraFieldsCheck: true} x 1,009,697,981 ops/sec ±0.05% (100 runs sampled), 1 ns/op
json-joy/json-type-codegen {skipObjectExtraFieldsCheck: true, unsafeMode: true} x 1,012,393,134 ops/sec ±0.06% (99 runs sampled), 1 ns/op
ajv x 12,818,090 ops/sec ±0.22% (100 runs sampled), 78 ns/op
@exodus/schemasafe x 7,501,602 ops/sec ±0.05% (99 runs sampled), 133 ns/op
Fastest is json-joy/json-type-codegen {skipObjectExtraFieldsCheck: true, unsafeMode: true}
```
