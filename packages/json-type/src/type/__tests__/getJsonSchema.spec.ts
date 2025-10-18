import {ModuleType, t} from '..';
import {typeToJsonSchema} from '../../json-schema';

test('can print a type', () => {
  const type = t
    .Object(
      t.Key('id', t.str).options({
        description: 'The id of the object',
      }),
      t.Key('tags', t.Array(t.str).options({title: 'Tags'})).options({title: 'Always use tags'}),
      t.KeyOpt('optional', t.any),
      t.Key('booleanProperty', t.bool),
      t.Key('numberProperty', t.num.options({format: 'f64', gt: 3.14})),
      t.Key('binaryProperty', t.bin.options({format: 'cbor'})),
      t.Key('arrayProperty', t.Array(t.any)),
      t.Key('objectProperty', t.Object(t.Key('id', t.str.options({ascii: true, min: 3, max: 128})))),
      t.Key('unionProperty', t.Or(t.str, t.num, t.nil.options({description: ''}))),
      t.KeyOpt('enumAsConst', t.Or(t.Const('a' as const), t.Const('b' as const), t.Const('c' as const))),
      t.KeyOpt('refField', t.Ref('refId')),
      t.KeyOpt('und', t.undef),
      t.Key(
        'operation',
        t.Object(
          t.Key('type', t.Const('replace' as const).options({title: 'Always use replace'})),
          t.Key('path', t.str),
          t.Key('value', t.any),
        ),
      ),
      t.Key(
        'binaryOperation',
        t
          .Binary(
            t
              .tuple(t.Const(7 as const).options({description: '7 is the magic number'}), t.str, t.any)
              .options({description: 'Should always have 3 elements'}),
          )
          .options({format: 'cbor'}),
      ),
      t.Key('map', t.Map(t.str)),
    )
    .options({decodeUnknownKeys: true});
  // console.log(JSON.stringify(type.toJsonSchema(), null, 2));
  expect(typeToJsonSchema(type)).toMatchInlineSnapshot(`
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
          "pattern": "^[\\x00-\\x7F]*$",
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
          "type": "null",
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
  const system = new ModuleType();
  const t = system.t;
  const type = t.Object(t.Key('id', t.str), t.Key('user', t.Ref('User')));
  const schema = typeToJsonSchema(type) as any;
  expect(schema.properties.user.$ref).toBe('#/$defs/User');
});
