# json-type Validator

This library implements JSON validation according to `json-type` schema. It
generates the most efficient JavaScript code for validation given the schema.

The generated validator functions return truthy value or error information on
validation failure. And `false` or a falsy value on success.

## Usage

```ts
const type = t.Object(t.prop('id', t.str), t.propOpt('name', t.str));

const json = {
  id: '123',
  name: 'John',
};

const validator = type.compileValidator('boolean');

const err1 = validator(json); // false
const err2 = validator({}); // true
```

To see insides of the validator function use `.toString()`.

```ts
console.log(validator.toString());
```

If you want your validator to return more info about the error, use
`string` or `object` validator types.
