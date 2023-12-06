import {t} from '..';
import {TypeSystem} from '../../system';

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
      t.prop('map', t.Map(t.str)),
    )
    .options({unknownFields: true});
  // console.log(JSON.stringify(type.toJsonSchema(), null, 2));
  expect(type.toJsonSchema()).toMatchInlineSnapshot(`
    {
      "properties": {
        "arrayProperty": {
          "items": {
            "type": [
              "string",
              "number",
              "boolean",
              "null",
              "array",
              "object",
            ],
          },
          "type": "array",
        },
        "binaryOperation": {
          "type": "binary",
        },
        "binaryProperty": {
          "type": "binary",
        },
        "booleanProperty": {
          "type": "boolean",
        },
        "enumAsConst": {
          "anyOf": [
            {
              "const": "a",
              "type": "string",
            },
            {
              "const": "b",
              "type": "string",
            },
            {
              "const": "c",
              "type": "string",
            },
          ],
        },
        "id": {
          "type": "string",
        },
        "map": {
          "patternProperties": {
            ".*": {
              "type": "string",
            },
          },
          "type": "object",
        },
        "numberProperty": {
          "exclusiveMinimum": 3.14,
          "type": "number",
        },
        "objectProperty": {
          "properties": {
            "id": {
              "maxLength": 128,
              "minLength": 3,
              "type": "string",
            },
          },
          "required": [
            "id",
          ],
          "type": "object",
        },
        "operation": {
          "properties": {
            "path": {
              "type": "string",
            },
            "type": {
              "const": "replace",
              "title": "Always use replace",
              "type": "string",
            },
            "value": {
              "type": [
                "string",
                "number",
                "boolean",
                "null",
                "array",
                "object",
              ],
            },
          },
          "required": [
            "type",
            "path",
            "value",
          ],
          "type": "object",
        },
        "optional": {
          "type": [
            "string",
            "number",
            "boolean",
            "null",
            "array",
            "object",
          ],
        },
        "refField": {
          "$ref": "#/$defs/refId",
        },
        "tags": {
          "items": {
            "type": "string",
          },
          "title": "Tags",
          "type": "array",
        },
        "und": {
          "const": undefined,
          "type": "undefined",
        },
        "unionProperty": {
          "anyOf": [
            {
              "type": "string",
            },
            {
              "type": "number",
            },
            {
              "const": null,
              "type": "object",
            },
          ],
        },
      },
      "required": [
        "id",
        "tags",
        "booleanProperty",
        "numberProperty",
        "binaryProperty",
        "arrayProperty",
        "objectProperty",
        "unionProperty",
        "operation",
        "binaryOperation",
        "map",
      ],
      "type": "object",
    }
  `);
});

test('exports "ref" type to JSON Schema "$defs"', () => {
  const system = new TypeSystem();
  const t = system.t;
  const type = t.Object(t.prop('id', t.str), t.prop('user', t.Ref('User')));
  const schema = type.toJsonSchema() as any;
  expect(schema.properties.user.$ref).toBe('#/$defs/User');
});
