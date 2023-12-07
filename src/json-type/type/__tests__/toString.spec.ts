import {t} from '..';

test('can print a type', () => {
  const type = t
    .Object(
      t.prop('id', t.str.options({validator: ['id', 'uuid']})).options({
        description: 'The id of the object',
      }),
      t.prop('tags', t.Array(t.str).options({title: 'Tags'})).options({title: 'Always use tags'}),
      t.propOpt('optional', t.any),
      t.prop('booleanProperty', t.bool),
      t.prop('numberProperty', t.num.options({format: 'f64', gt: 3.14})),
      t.prop('binaryProperty', t.bin.options({format: 'cbor'})),
      t.prop('arrayProperty', t.Array(t.any)),
      t.prop('objectProperty', t.Object(t.prop('id', t.str.options({ascii: true, min: 3, max: 128})))),
      t.prop('unionProperty', t.Or(t.str, t.num, t.nil.options({description: ''}))),
      t.propOpt('enumAsConst', t.Or(t.Const('a' as const), t.Const('b' as const), t.Const('c' as const))),
      t.propOpt('refField', t.Ref('refId')),
      t.propOpt('und', t.undef),
      t.prop(
        'operation',
        t.Object(
          t.prop('type', t.Const('replace' as const).options({title: 'Always use replace'})),
          t.prop('path', t.str),
          t.prop('value', t.any),
        ),
      ),
      t.prop(
        'binaryOperation',
        t
          .Binary(
            t
              .Tuple(t.Const(7 as const).options({description: '7 is the magic number'}), t.str, t.any)
              .options({description: 'Should always have 3 elements'}),
          )
          .options({format: 'cbor'}),
      ),
      t.prop('map', t.Map(t.num)),
    )
    .options({unknownFields: true});
  // console.log(type + '');
  expect(type + '').toMatchInlineSnapshot(`
    "obj { unknownFields = !t }
    ├─ "id": { description = "The id of the object" }
    │   └─ str { validator = [ "id", "uuid" ] }
    ├─ "tags": { title = "Always use tags" }
    │   └─ arr { title = "Tags" }
    │      └─ str
    ├─ "optional"?:
    │   └─ any
    ├─ "booleanProperty":
    │   └─ bool
    ├─ "numberProperty":
    │   └─ num { format = "f64", gt = 3.14 }
    ├─ "binaryProperty":
    │   └─ bin { format = "cbor" }
    │      └─ any
    ├─ "arrayProperty":
    │   └─ arr
    │      └─ any
    ├─ "objectProperty":
    │   └─ obj
    │      └─ "id":
    │          └─ str { ascii = !t, min = 3, max = 128 }
    ├─ "unionProperty":
    │   └─ or { discriminator = [ "?", [ "==", !n, [ "$", "" ] ], 2, [ "?", [ "==", [ "type", [ "$", "" ] ], "number" ], 1, 0 ] ] }
    │      ├─ str
    │      ├─ num
    │      └─ const { description = "" } → null
    ├─ "enumAsConst"?:
    │   └─ or { discriminator = [ "?", [ "==", "c", [ "$", "" ] ], 2, [ "?", [ "==", "b", [ "$", "" ] ], 1, 0 ] ] }
    │      ├─ const → "a"
    │      ├─ const → "b"
    │      └─ const → "c"
    ├─ "refField"?:
    │   └─ ref → [refId]
    ├─ "und"?:
    │   └─ const → undefined
    ├─ "operation":
    │   └─ obj
    │      ├─ "type":
    │      │   └─ const { title = "Always use replace" } → "replace"
    │      ├─ "path":
    │      │   └─ str
    │      └─ "value":
    │          └─ any
    ├─ "binaryOperation":
    │   └─ bin { format = "cbor" }
    │      └─ tup { description = "Should always have 3 elements" }
    │         ├─ const { description = "7 is the magic number" } → 7
    │         ├─ str
    │         └─ any
    └─ "map":
        └─ map
           └─ num"
  `);
});
