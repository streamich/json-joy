# json-type

Type builder for JSON and MessagePack.

```ts
import {t} from 'json-joy/lib/json-type';

t.String(); // { kind: 'str' }
t.String({const: 'add'}); // { kind: 'str', const: 'add' }

const type = t.Object([
  t.Field(
    'collection',
    t.Object([
      t.Field('id', t.String({format: 'ascii', noJsonEscape: true})),
      t.Field('ts', t.num, {format: 'u64'}),
      t.Field('cid', t.String({format: 'ascii', noJsonEscape: true})),
      t.Field('prid', t.String({format: 'ascii', noJsonEscape: true})),
      t.Field('slug', t.String({format: 'ascii', noJsonEscape: true})),
      t.Field('name', t.str, {isOptional: true}),
      t.Field('src', t.str, {isOptional: true}),
      t.Field('doc', t.str, {isOptional: true}),
      t.Field('authz', t.str, {isOptional: true}),
      t.Field('active', t.bool),
    ]),
  ),
  t.Field(
    'block',
    t.Object([
      t.Field('id', t.String({format: 'ascii', noJsonEscape: true})),
      t.Field('ts', t.num, {format: 'u64'}),
      t.Field('cid', t.String({format: 'ascii', noJsonEscape: true})),
      t.Field('slug', t.String({format: 'ascii', noJsonEscape: true})),
    ]),
  ),
]);
```
