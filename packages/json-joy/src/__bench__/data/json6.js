module.exports = {
  name: 'json schema validation',
  json: {
    'empty schema - null': {
      schema: {},
      instance: null,
      errors: [],
    },
    'empty schema - boolean': {
      schema: {},
      instance: true,
      errors: [],
    },
    'empty schema - integer': {
      schema: {},
      instance: 1,
      errors: [],
    },
    'empty schema - float': {
      schema: {},
      instance: 3.14,
      errors: [],
    },
    'empty schema - string': {
      schema: {},
      instance: 'foo',
      errors: [],
    },
    'empty schema - array': {
      schema: {},
      instance: [],
      errors: [],
    },
    'empty schema - object': {
      schema: {},
      instance: {},
      errors: [],
    },
    'empty nullable schema - null': {
      schema: {
        nullable: true,
      },
      instance: null,
      errors: [],
    },
    'empty nullable schema - object': {
      schema: {
        nullable: true,
      },
      instance: {},
      errors: [],
    },
    'empty schema with metadata - null': {
      schema: {
        metadata: {},
      },
      instance: null,
      errors: [],
    },
    'ref schema - ref to empty definition': {
      schema: {
        definitions: {
          foo: {},
        },
        ref: 'foo',
      },
      instance: true,
      errors: [],
    },
    'ref schema - nested ref': {
      schema: {
        definitions: {
          foo: {
            ref: 'bar',
          },
          bar: {},
        },
        ref: 'foo',
      },
      instance: true,
      errors: [],
    },
    'ref schema - ref to type definition, ok': {
      schema: {
        definitions: {
          foo: {
            type: 'boolean',
          },
        },
        ref: 'foo',
      },
      instance: true,
      errors: [],
    },
    'ref schema - ref to type definition, fail': {
      schema: {
        definitions: {
          foo: {
            type: 'boolean',
          },
        },
        ref: 'foo',
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['definitions', 'foo', 'type'],
        },
      ],
    },
    'nullable ref schema - ref to type definition, ok': {
      schema: {
        definitions: {
          foo: {
            type: 'boolean',
          },
        },
        ref: 'foo',
        nullable: true,
      },
      instance: true,
      errors: [],
    },
    'nullable ref schema - ref to type definition, ok because null': {
      schema: {
        definitions: {
          foo: {
            type: 'boolean',
          },
        },
        ref: 'foo',
        nullable: true,
      },
      instance: null,
      errors: [],
    },
    'nullable ref schema - nullable: false ignored': {
      schema: {
        definitions: {
          foo: {
            type: 'boolean',
            nullable: false,
          },
        },
        ref: 'foo',
        nullable: true,
      },
      instance: null,
      errors: [],
    },
    'ref schema - recursive schema, ok': {
      schema: {
        definitions: {
          root: {
            elements: {
              ref: 'root',
            },
          },
        },
        ref: 'root',
      },
      instance: [],
      errors: [],
    },
    'ref schema - recursive schema, bad': {
      schema: {
        definitions: {
          root: {
            elements: {
              ref: 'root',
            },
          },
        },
        ref: 'root',
      },
      instance: [[], [[]], [[[], ['a']]]],
      errors: [
        {
          instancePath: ['2', '0', '1', '0'],
          schemaPath: ['definitions', 'root', 'elements'],
        },
      ],
    },
    'boolean type schema - null': {
      schema: {
        type: 'boolean',
      },
      instance: null,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'boolean type schema - boolean': {
      schema: {
        type: 'boolean',
      },
      instance: true,
      errors: [],
    },
    'boolean type schema - integer': {
      schema: {
        type: 'boolean',
      },
      instance: 1,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'boolean type schema - float': {
      schema: {
        type: 'boolean',
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'boolean type schema - string': {
      schema: {
        type: 'boolean',
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'boolean type schema - array': {
      schema: {
        type: 'boolean',
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'boolean type schema - object': {
      schema: {
        type: 'boolean',
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable boolean type schema - null': {
      schema: {
        type: 'boolean',
        nullable: true,
      },
      instance: null,
      errors: [],
    },
    'nullable boolean type schema - boolean': {
      schema: {
        type: 'boolean',
        nullable: true,
      },
      instance: true,
      errors: [],
    },
    'nullable boolean type schema - integer': {
      schema: {
        type: 'boolean',
        nullable: true,
      },
      instance: 1,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable boolean type schema - float': {
      schema: {
        type: 'boolean',
        nullable: true,
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable boolean type schema - string': {
      schema: {
        type: 'boolean',
        nullable: true,
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable boolean type schema - array': {
      schema: {
        type: 'boolean',
        nullable: true,
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable boolean type schema - object': {
      schema: {
        type: 'boolean',
        nullable: true,
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'float32 type schema - null': {
      schema: {
        type: 'float32',
      },
      instance: null,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'float32 type schema - boolean': {
      schema: {
        type: 'float32',
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'float32 type schema - integer': {
      schema: {
        type: 'float32',
      },
      instance: 1,
      errors: [],
    },
    'float32 type schema - float': {
      schema: {
        type: 'float32',
      },
      instance: 3.14,
      errors: [],
    },
    'float32 type schema - string': {
      schema: {
        type: 'float32',
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'float32 type schema - array': {
      schema: {
        type: 'float32',
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'float32 type schema - object': {
      schema: {
        type: 'float32',
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable float32 type schema - null': {
      schema: {
        type: 'float32',
        nullable: true,
      },
      instance: null,
      errors: [],
    },
    'nullable float32 type schema - boolean': {
      schema: {
        type: 'float32',
        nullable: true,
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable float32 type schema - integer': {
      schema: {
        type: 'float32',
        nullable: true,
      },
      instance: 1,
      errors: [],
    },
    'nullable float32 type schema - float': {
      schema: {
        type: 'float32',
        nullable: true,
      },
      instance: 3.14,
      errors: [],
    },
    'nullable float32 type schema - string': {
      schema: {
        type: 'float32',
        nullable: true,
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable float32 type schema - array': {
      schema: {
        type: 'float32',
        nullable: true,
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable float32 type schema - object': {
      schema: {
        type: 'float32',
        nullable: true,
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'float64 type schema - null': {
      schema: {
        type: 'float64',
      },
      instance: null,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'float64 type schema - boolean': {
      schema: {
        type: 'float64',
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'float64 type schema - integer': {
      schema: {
        type: 'float64',
      },
      instance: 1,
      errors: [],
    },
    'float64 type schema - float': {
      schema: {
        type: 'float64',
      },
      instance: 3.14,
      errors: [],
    },
    'float64 type schema - string': {
      schema: {
        type: 'float64',
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'float64 type schema - array': {
      schema: {
        type: 'float64',
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'float64 type schema - object': {
      schema: {
        type: 'float64',
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable float64 type schema - null': {
      schema: {
        type: 'float64',
        nullable: true,
      },
      instance: null,
      errors: [],
    },
    'nullable float64 type schema - boolean': {
      schema: {
        type: 'float64',
        nullable: true,
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable float64 type schema - integer': {
      schema: {
        type: 'float64',
        nullable: true,
      },
      instance: 1,
      errors: [],
    },
    'nullable float64 type schema - float': {
      schema: {
        type: 'float64',
        nullable: true,
      },
      instance: 3.14,
      errors: [],
    },
    'nullable float64 type schema - string': {
      schema: {
        type: 'float64',
        nullable: true,
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable float64 type schema - array': {
      schema: {
        type: 'float64',
        nullable: true,
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable float64 type schema - object': {
      schema: {
        type: 'float64',
        nullable: true,
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'int8 type schema - null': {
      schema: {
        type: 'int8',
      },
      instance: null,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'int8 type schema - boolean': {
      schema: {
        type: 'int8',
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'int8 type schema - integer': {
      schema: {
        type: 'int8',
      },
      instance: 1,
      errors: [],
    },
    'int8 type schema - float': {
      schema: {
        type: 'int8',
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'int8 type schema - string': {
      schema: {
        type: 'int8',
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'int8 type schema - array': {
      schema: {
        type: 'int8',
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'int8 type schema - object': {
      schema: {
        type: 'int8',
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable int8 type schema - null': {
      schema: {
        type: 'int8',
        nullable: true,
      },
      instance: null,
      errors: [],
    },
    'nullable int8 type schema - boolean': {
      schema: {
        type: 'int8',
        nullable: true,
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable int8 type schema - integer': {
      schema: {
        type: 'int8',
        nullable: true,
      },
      instance: 1,
      errors: [],
    },
    'nullable int8 type schema - float': {
      schema: {
        type: 'int8',
        nullable: true,
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable int8 type schema - string': {
      schema: {
        type: 'int8',
        nullable: true,
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable int8 type schema - array': {
      schema: {
        type: 'int8',
        nullable: true,
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable int8 type schema - object': {
      schema: {
        type: 'int8',
        nullable: true,
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'int8 type schema - min value': {
      schema: {
        type: 'int8',
      },
      instance: -128,
      errors: [],
    },
    'int8 type schema - max value': {
      schema: {
        type: 'int8',
      },
      instance: 127,
      errors: [],
    },
    'int8 type schema - less than min': {
      schema: {
        type: 'int8',
      },
      instance: -129,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'int8 type schema - more than max': {
      schema: {
        type: 'int8',
      },
      instance: 128,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'uint8 type schema - null': {
      schema: {
        type: 'uint8',
      },
      instance: null,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'uint8 type schema - boolean': {
      schema: {
        type: 'uint8',
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'uint8 type schema - integer': {
      schema: {
        type: 'uint8',
      },
      instance: 1,
      errors: [],
    },
    'uint8 type schema - float': {
      schema: {
        type: 'uint8',
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'uint8 type schema - string': {
      schema: {
        type: 'uint8',
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'uint8 type schema - array': {
      schema: {
        type: 'uint8',
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'uint8 type schema - object': {
      schema: {
        type: 'uint8',
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable uint8 type schema - null': {
      schema: {
        type: 'uint8',
        nullable: true,
      },
      instance: null,
      errors: [],
    },
    'nullable uint8 type schema - boolean': {
      schema: {
        type: 'uint8',
        nullable: true,
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable uint8 type schema - integer': {
      schema: {
        type: 'uint8',
        nullable: true,
      },
      instance: 1,
      errors: [],
    },
    'nullable uint8 type schema - float': {
      schema: {
        type: 'uint8',
        nullable: true,
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable uint8 type schema - string': {
      schema: {
        type: 'uint8',
        nullable: true,
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable uint8 type schema - array': {
      schema: {
        type: 'uint8',
        nullable: true,
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable uint8 type schema - object': {
      schema: {
        type: 'uint8',
        nullable: true,
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'uint8 type schema - min value': {
      schema: {
        type: 'uint8',
      },
      instance: 0,
      errors: [],
    },
    'uint8 type schema - max value': {
      schema: {
        type: 'uint8',
      },
      instance: 255,
      errors: [],
    },
    'uint8 type schema - less than min': {
      schema: {
        type: 'uint8',
      },
      instance: -1,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'uint8 type schema - more than max': {
      schema: {
        type: 'uint8',
      },
      instance: 256,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'int16 type schema - null': {
      schema: {
        type: 'int16',
      },
      instance: null,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'int16 type schema - boolean': {
      schema: {
        type: 'int16',
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'int16 type schema - integer': {
      schema: {
        type: 'int16',
      },
      instance: 1,
      errors: [],
    },
    'int16 type schema - float': {
      schema: {
        type: 'int16',
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'int16 type schema - string': {
      schema: {
        type: 'int16',
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'int16 type schema - array': {
      schema: {
        type: 'int16',
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'int16 type schema - object': {
      schema: {
        type: 'int16',
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable int16 type schema - null': {
      schema: {
        type: 'int16',
        nullable: true,
      },
      instance: null,
      errors: [],
    },
    'nullable int16 type schema - boolean': {
      schema: {
        type: 'int16',
        nullable: true,
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable int16 type schema - integer': {
      schema: {
        type: 'int16',
        nullable: true,
      },
      instance: 1,
      errors: [],
    },
    'nullable int16 type schema - float': {
      schema: {
        type: 'int16',
        nullable: true,
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable int16 type schema - string': {
      schema: {
        type: 'int16',
        nullable: true,
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable int16 type schema - array': {
      schema: {
        type: 'int16',
        nullable: true,
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable int16 type schema - object': {
      schema: {
        type: 'int16',
        nullable: true,
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'int16 type schema - min value': {
      schema: {
        type: 'int16',
      },
      instance: -32768,
      errors: [],
    },
    'int16 type schema - max value': {
      schema: {
        type: 'int16',
      },
      instance: 32767,
      errors: [],
    },
    'int16 type schema - less than min': {
      schema: {
        type: 'int16',
      },
      instance: -32769,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'int16 type schema - more than max': {
      schema: {
        type: 'int16',
      },
      instance: 32768,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'uint16 type schema - null': {
      schema: {
        type: 'uint16',
      },
      instance: null,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'uint16 type schema - boolean': {
      schema: {
        type: 'uint16',
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'uint16 type schema - integer': {
      schema: {
        type: 'uint16',
      },
      instance: 1,
      errors: [],
    },
    'uint16 type schema - float': {
      schema: {
        type: 'uint16',
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'uint16 type schema - string': {
      schema: {
        type: 'uint16',
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'uint16 type schema - array': {
      schema: {
        type: 'uint16',
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'uint16 type schema - object': {
      schema: {
        type: 'uint16',
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable uint16 type schema - null': {
      schema: {
        type: 'uint16',
        nullable: true,
      },
      instance: null,
      errors: [],
    },
    'nullable uint16 type schema - boolean': {
      schema: {
        type: 'uint16',
        nullable: true,
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable uint16 type schema - integer': {
      schema: {
        type: 'uint16',
        nullable: true,
      },
      instance: 1,
      errors: [],
    },
    'nullable uint16 type schema - float': {
      schema: {
        type: 'uint16',
        nullable: true,
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable uint16 type schema - string': {
      schema: {
        type: 'uint16',
        nullable: true,
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable uint16 type schema - array': {
      schema: {
        type: 'uint16',
        nullable: true,
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable uint16 type schema - object': {
      schema: {
        type: 'uint16',
        nullable: true,
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'uint16 type schema - min value': {
      schema: {
        type: 'uint16',
      },
      instance: 0,
      errors: [],
    },
    'uint16 type schema - max value': {
      schema: {
        type: 'uint16',
      },
      instance: 65535,
      errors: [],
    },
    'uint16 type schema - less than min': {
      schema: {
        type: 'uint16',
      },
      instance: -1,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'uint16 type schema - more than max': {
      schema: {
        type: 'uint16',
      },
      instance: 65536,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'int32 type schema - null': {
      schema: {
        type: 'int32',
      },
      instance: null,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'int32 type schema - boolean': {
      schema: {
        type: 'int32',
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'int32 type schema - integer': {
      schema: {
        type: 'int32',
      },
      instance: 1,
      errors: [],
    },
    'int32 type schema - float': {
      schema: {
        type: 'int32',
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'int32 type schema - string': {
      schema: {
        type: 'int32',
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'int32 type schema - array': {
      schema: {
        type: 'int32',
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'int32 type schema - object': {
      schema: {
        type: 'int32',
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable int32 type schema - null': {
      schema: {
        type: 'int32',
        nullable: true,
      },
      instance: null,
      errors: [],
    },
    'nullable int32 type schema - boolean': {
      schema: {
        type: 'int32',
        nullable: true,
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable int32 type schema - integer': {
      schema: {
        type: 'int32',
        nullable: true,
      },
      instance: 1,
      errors: [],
    },
    'nullable int32 type schema - float': {
      schema: {
        type: 'int32',
        nullable: true,
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable int32 type schema - string': {
      schema: {
        type: 'int32',
        nullable: true,
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable int32 type schema - array': {
      schema: {
        type: 'int32',
        nullable: true,
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable int32 type schema - object': {
      schema: {
        type: 'int32',
        nullable: true,
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'int32 type schema - min value': {
      schema: {
        type: 'int32',
      },
      instance: -2147483648,
      errors: [],
    },
    'int32 type schema - max value': {
      schema: {
        type: 'int32',
      },
      instance: 2147483647,
      errors: [],
    },
    'int32 type schema - less than min': {
      schema: {
        type: 'int32',
      },
      instance: -2147483649,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'int32 type schema - more than max': {
      schema: {
        type: 'int32',
      },
      instance: 2147483648,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'uint32 type schema - null': {
      schema: {
        type: 'uint32',
      },
      instance: null,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'uint32 type schema - boolean': {
      schema: {
        type: 'uint32',
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'uint32 type schema - integer': {
      schema: {
        type: 'uint32',
      },
      instance: 1,
      errors: [],
    },
    'uint32 type schema - float': {
      schema: {
        type: 'uint32',
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'uint32 type schema - string': {
      schema: {
        type: 'uint32',
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'uint32 type schema - array': {
      schema: {
        type: 'uint32',
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'uint32 type schema - object': {
      schema: {
        type: 'uint32',
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable uint32 type schema - null': {
      schema: {
        type: 'uint32',
        nullable: true,
      },
      instance: null,
      errors: [],
    },
    'nullable uint32 type schema - boolean': {
      schema: {
        type: 'uint32',
        nullable: true,
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable uint32 type schema - integer': {
      schema: {
        type: 'uint32',
        nullable: true,
      },
      instance: 1,
      errors: [],
    },
    'nullable uint32 type schema - float': {
      schema: {
        type: 'uint32',
        nullable: true,
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable uint32 type schema - string': {
      schema: {
        type: 'uint32',
        nullable: true,
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable uint32 type schema - array': {
      schema: {
        type: 'uint32',
        nullable: true,
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable uint32 type schema - object': {
      schema: {
        type: 'uint32',
        nullable: true,
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'uint32 type schema - min value': {
      schema: {
        type: 'uint32',
      },
      instance: 0,
      errors: [],
    },
    'uint32 type schema - max value': {
      schema: {
        type: 'uint32',
      },
      instance: 4294967295,
      errors: [],
    },
    'uint32 type schema - less than min': {
      schema: {
        type: 'uint32',
      },
      instance: -1,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'uint32 type schema - more than max': {
      schema: {
        type: 'uint32',
      },
      instance: 4294967296,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'string type schema - null': {
      schema: {
        type: 'string',
      },
      instance: null,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'string type schema - boolean': {
      schema: {
        type: 'string',
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'string type schema - integer': {
      schema: {
        type: 'string',
      },
      instance: 1,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'string type schema - float': {
      schema: {
        type: 'string',
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'string type schema - string': {
      schema: {
        type: 'string',
      },
      instance: 'foo',
      errors: [],
    },
    'string type schema - array': {
      schema: {
        type: 'string',
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'string type schema - object': {
      schema: {
        type: 'string',
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable string type schema - null': {
      schema: {
        type: 'string',
        nullable: true,
      },
      instance: null,
      errors: [],
    },
    'nullable string type schema - boolean': {
      schema: {
        type: 'string',
        nullable: true,
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable string type schema - integer': {
      schema: {
        type: 'string',
        nullable: true,
      },
      instance: 1,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable string type schema - float': {
      schema: {
        type: 'string',
        nullable: true,
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable string type schema - string': {
      schema: {
        type: 'string',
        nullable: true,
      },
      instance: 'foo',
      errors: [],
    },
    'nullable string type schema - array': {
      schema: {
        type: 'string',
        nullable: true,
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable string type schema - object': {
      schema: {
        type: 'string',
        nullable: true,
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'timestamp type schema - null': {
      schema: {
        type: 'timestamp',
      },
      instance: null,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'timestamp type schema - boolean': {
      schema: {
        type: 'timestamp',
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'timestamp type schema - integer': {
      schema: {
        type: 'timestamp',
      },
      instance: 1,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'timestamp type schema - float': {
      schema: {
        type: 'timestamp',
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'timestamp type schema - string': {
      schema: {
        type: 'timestamp',
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'timestamp type schema - array': {
      schema: {
        type: 'timestamp',
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'timestamp type schema - object': {
      schema: {
        type: 'timestamp',
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable timestamp type schema - null': {
      schema: {
        type: 'timestamp',
        nullable: true,
      },
      instance: null,
      errors: [],
    },
    'nullable timestamp type schema - boolean': {
      schema: {
        type: 'timestamp',
        nullable: true,
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable timestamp type schema - integer': {
      schema: {
        type: 'timestamp',
        nullable: true,
      },
      instance: 1,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable timestamp type schema - float': {
      schema: {
        type: 'timestamp',
        nullable: true,
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable timestamp type schema - string': {
      schema: {
        type: 'timestamp',
        nullable: true,
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable timestamp type schema - array': {
      schema: {
        type: 'timestamp',
        nullable: true,
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'nullable timestamp type schema - object': {
      schema: {
        type: 'timestamp',
        nullable: true,
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['type'],
        },
      ],
    },
    'timestamp type schema - 1985-04-12T23:20:50.52Z': {
      schema: {
        type: 'timestamp',
      },
      instance: '1985-04-12T23:20:50.52Z',
      errors: [],
    },
    'timestamp type schema - 1996-12-19T16:39:57-08:00': {
      schema: {
        type: 'timestamp',
      },
      instance: '1996-12-19T16:39:57-08:00',
      errors: [],
    },
    'timestamp type schema - 1990-12-31T23:59:60Z': {
      schema: {
        type: 'timestamp',
      },
      instance: '1990-12-31T23:59:60Z',
      errors: [],
    },
    'timestamp type schema - 1990-12-31T15:59:60-08:00': {
      schema: {
        type: 'timestamp',
      },
      instance: '1990-12-31T15:59:60-08:00',
      errors: [],
    },
    'timestamp type schema - 1937-01-01T12:00:27.87+00:20': {
      schema: {
        type: 'timestamp',
      },
      instance: '1937-01-01T12:00:27.87+00:20',
      errors: [],
    },
    'enum schema - null': {
      schema: {
        enum: ['foo', 'bar', 'baz'],
      },
      instance: null,
      errors: [
        {
          instancePath: [],
          schemaPath: ['enum'],
        },
      ],
    },
    'enum schema - boolean': {
      schema: {
        enum: ['foo', 'bar', 'baz'],
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['enum'],
        },
      ],
    },
    'enum schema - integer': {
      schema: {
        enum: ['foo', 'bar', 'baz'],
      },
      instance: 1,
      errors: [
        {
          instancePath: [],
          schemaPath: ['enum'],
        },
      ],
    },
    'enum schema - float': {
      schema: {
        enum: ['foo', 'bar', 'baz'],
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['enum'],
        },
      ],
    },
    'enum schema - string': {
      schema: {
        enum: ['foo', 'bar', 'baz'],
      },
      instance: 'foo',
      errors: [],
    },
    'enum schema - array': {
      schema: {
        enum: ['foo', 'bar', 'baz'],
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['enum'],
        },
      ],
    },
    'enum schema - object': {
      schema: {
        enum: ['foo', 'bar', 'baz'],
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['enum'],
        },
      ],
    },
    'nullable enum schema - null': {
      schema: {
        enum: ['foo', 'bar', 'baz'],
        nullable: true,
      },
      instance: null,
      errors: [],
    },
    'nullable enum schema - boolean': {
      schema: {
        enum: ['foo', 'bar', 'baz'],
        nullable: true,
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['enum'],
        },
      ],
    },
    'nullable enum schema - integer': {
      schema: {
        enum: ['foo', 'bar', 'baz'],
        nullable: true,
      },
      instance: 1,
      errors: [
        {
          instancePath: [],
          schemaPath: ['enum'],
        },
      ],
    },
    'nullable enum schema - float': {
      schema: {
        enum: ['foo', 'bar', 'baz'],
        nullable: true,
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['enum'],
        },
      ],
    },
    'nullable enum schema - string': {
      schema: {
        enum: ['foo', 'bar', 'baz'],
        nullable: true,
      },
      instance: 'foo',
      errors: [],
    },
    'nullable enum schema - array': {
      schema: {
        enum: ['foo', 'bar', 'baz'],
        nullable: true,
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['enum'],
        },
      ],
    },
    'nullable enum schema - object': {
      schema: {
        enum: ['foo', 'bar', 'baz'],
        nullable: true,
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['enum'],
        },
      ],
    },
    'enum schema - value not in enum': {
      schema: {
        enum: ['foo', 'bar', 'baz'],
        nullable: true,
      },
      instance: 'quux',
      errors: [
        {
          instancePath: [],
          schemaPath: ['enum'],
        },
      ],
    },
    'enum schema - ok': {
      schema: {
        enum: ['foo', 'bar', 'baz'],
        nullable: true,
      },
      instance: 'bar',
      errors: [],
    },
    'elements schema - null': {
      schema: {
        elements: {
          type: 'string',
        },
      },
      instance: null,
      errors: [
        {
          instancePath: [],
          schemaPath: ['elements'],
        },
      ],
    },
    'elements schema - boolean': {
      schema: {
        elements: {
          type: 'string',
        },
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['elements'],
        },
      ],
    },
    'elements schema - float': {
      schema: {
        elements: {
          type: 'string',
        },
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['elements'],
        },
      ],
    },
    'elements schema - integer': {
      schema: {
        elements: {
          type: 'string',
        },
      },
      instance: 1,
      errors: [
        {
          instancePath: [],
          schemaPath: ['elements'],
        },
      ],
    },
    'elements schema - string': {
      schema: {
        elements: {
          type: 'string',
        },
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['elements'],
        },
      ],
    },
    'elements schema - object': {
      schema: {
        elements: {
          type: 'string',
        },
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['elements'],
        },
      ],
    },
    'nullable elements schema - null': {
      schema: {
        elements: {
          type: 'string',
        },
        nullable: true,
      },
      instance: null,
      errors: [],
    },
    'nullable elements schema - boolean': {
      schema: {
        elements: {
          type: 'string',
        },
        nullable: true,
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['elements'],
        },
      ],
    },
    'nullable elements schema - float': {
      schema: {
        elements: {
          type: 'string',
        },
        nullable: true,
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['elements'],
        },
      ],
    },
    'nullable elements schema - integer': {
      schema: {
        elements: {
          type: 'string',
        },
        nullable: true,
      },
      instance: 1,
      errors: [
        {
          instancePath: [],
          schemaPath: ['elements'],
        },
      ],
    },
    'nullable elements schema - string': {
      schema: {
        elements: {
          type: 'string',
        },
        nullable: true,
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['elements'],
        },
      ],
    },
    'nullable elements schema - object': {
      schema: {
        elements: {
          type: 'string',
        },
        nullable: true,
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['elements'],
        },
      ],
    },
    'elements schema - empty array': {
      schema: {
        elements: {
          type: 'string',
        },
      },
      instance: [],
      errors: [],
    },
    'elements schema - all values ok': {
      schema: {
        elements: {
          type: 'string',
        },
      },
      instance: ['foo', 'bar', 'baz'],
      errors: [],
    },
    'elements schema - some values bad': {
      schema: {
        elements: {
          type: 'string',
        },
      },
      instance: ['foo', null, null],
      errors: [
        {
          instancePath: ['1'],
          schemaPath: ['elements', 'type'],
        },
        {
          instancePath: ['2'],
          schemaPath: ['elements', 'type'],
        },
      ],
    },
    'elements schema - all values bad': {
      schema: {
        elements: {
          type: 'string',
        },
      },
      instance: [null, null, null],
      errors: [
        {
          instancePath: ['0'],
          schemaPath: ['elements', 'type'],
        },
        {
          instancePath: ['1'],
          schemaPath: ['elements', 'type'],
        },
        {
          instancePath: ['2'],
          schemaPath: ['elements', 'type'],
        },
      ],
    },
    'elements schema - nested elements, ok': {
      schema: {
        elements: {
          elements: {
            type: 'string',
          },
        },
      },
      instance: [[], ['foo'], ['foo', 'bar', 'baz']],
      errors: [],
    },
    'elements schema - nested elements, bad': {
      schema: {
        elements: {
          elements: {
            type: 'string',
          },
        },
      },
      instance: [[null], ['foo'], ['foo', null, 'baz'], null],
      errors: [
        {
          instancePath: ['0', '0'],
          schemaPath: ['elements', 'elements', 'type'],
        },
        {
          instancePath: ['2', '1'],
          schemaPath: ['elements', 'elements', 'type'],
        },
        {
          instancePath: ['3'],
          schemaPath: ['elements', 'elements'],
        },
      ],
    },
    'properties schema - null': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
      },
      instance: null,
      errors: [
        {
          instancePath: [],
          schemaPath: ['properties'],
        },
      ],
    },
    'properties schema - boolean': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['properties'],
        },
      ],
    },
    'properties schema - float': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['properties'],
        },
      ],
    },
    'properties schema - integer': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
      },
      instance: 1,
      errors: [
        {
          instancePath: [],
          schemaPath: ['properties'],
        },
      ],
    },
    'properties schema - string': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['properties'],
        },
      ],
    },
    'properties schema - array': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['properties'],
        },
      ],
    },
    'nullable properties schema - null': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
        nullable: true,
      },
      instance: null,
      errors: [],
    },
    'nullable properties schema - boolean': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
        nullable: true,
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['properties'],
        },
      ],
    },
    'nullable properties schema - float': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
        nullable: true,
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['properties'],
        },
      ],
    },
    'nullable properties schema - integer': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
        nullable: true,
      },
      instance: 1,
      errors: [
        {
          instancePath: [],
          schemaPath: ['properties'],
        },
      ],
    },
    'nullable properties schema - string': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
        nullable: true,
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['properties'],
        },
      ],
    },
    'nullable properties schema - array': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
        nullable: true,
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['properties'],
        },
      ],
    },
    'properties and optionalProperties schema - null': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
        optionalProperties: {
          bar: {
            type: 'string',
          },
        },
      },
      instance: null,
      errors: [
        {
          instancePath: [],
          schemaPath: ['properties'],
        },
      ],
    },
    'properties and optionalProperties schema - boolean': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
        optionalProperties: {
          bar: {
            type: 'string',
          },
        },
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['properties'],
        },
      ],
    },
    'properties and optionalProperties schema - float': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
        optionalProperties: {
          bar: {
            type: 'string',
          },
        },
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['properties'],
        },
      ],
    },
    'properties and optionalProperties schema - integer': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
        optionalProperties: {
          bar: {
            type: 'string',
          },
        },
      },
      instance: 1,
      errors: [
        {
          instancePath: [],
          schemaPath: ['properties'],
        },
      ],
    },
    'properties and optionalProperties schema - string': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
        optionalProperties: {
          bar: {
            type: 'string',
          },
        },
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['properties'],
        },
      ],
    },
    'properties and optionalProperties schema - array': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
        optionalProperties: {
          bar: {
            type: 'string',
          },
        },
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['properties'],
        },
      ],
    },
    'optionalProperties schema - null': {
      schema: {
        optionalProperties: {
          foo: {
            type: 'string',
          },
        },
      },
      instance: null,
      errors: [
        {
          instancePath: [],
          schemaPath: ['optionalProperties'],
        },
      ],
    },
    'optionalProperties schema - boolean': {
      schema: {
        optionalProperties: {
          foo: {
            type: 'string',
          },
        },
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['optionalProperties'],
        },
      ],
    },
    'optionalProperties schema - float': {
      schema: {
        optionalProperties: {
          foo: {
            type: 'string',
          },
        },
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['optionalProperties'],
        },
      ],
    },
    'optionalProperties schema - integer': {
      schema: {
        optionalProperties: {
          foo: {
            type: 'string',
          },
        },
      },
      instance: 1,
      errors: [
        {
          instancePath: [],
          schemaPath: ['optionalProperties'],
        },
      ],
    },
    'optionalProperties schema - string': {
      schema: {
        optionalProperties: {
          foo: {
            type: 'string',
          },
        },
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['optionalProperties'],
        },
      ],
    },
    'optionalProperties schema - array': {
      schema: {
        optionalProperties: {
          foo: {
            type: 'string',
          },
        },
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['optionalProperties'],
        },
      ],
    },
    'strict properties - ok': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
      },
      instance: {
        foo: 'foo',
      },
      errors: [],
    },
    'strict properties - bad wrong type': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
      },
      instance: {
        foo: 123,
      },
      errors: [
        {
          instancePath: ['foo'],
          schemaPath: ['properties', 'foo', 'type'],
        },
      ],
    },
    'strict properties - bad missing property': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['properties', 'foo'],
        },
      ],
    },
    'strict properties - bad additional property': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
      },
      instance: {
        foo: 'foo',
        bar: 'bar',
      },
      errors: [
        {
          instancePath: ['bar'],
          schemaPath: [],
        },
      ],
    },
    'strict properties - bad additional property with explicit additionalProperties: false': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
        additionalProperties: false,
      },
      instance: {
        foo: 'foo',
        bar: 'bar',
      },
      errors: [
        {
          instancePath: ['bar'],
          schemaPath: [],
        },
      ],
    },
    'non-strict properties - ok': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
        additionalProperties: true,
      },
      instance: {
        foo: 'foo',
      },
      errors: [],
    },
    'non-strict properties - bad wrong type': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
        additionalProperties: true,
      },
      instance: {
        foo: 123,
      },
      errors: [
        {
          instancePath: ['foo'],
          schemaPath: ['properties', 'foo', 'type'],
        },
      ],
    },
    'non-strict properties - bad missing property': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
        additionalProperties: true,
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['properties', 'foo'],
        },
      ],
    },
    'non-strict properties - ok additional property': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
        additionalProperties: true,
      },
      instance: {
        foo: 'foo',
        bar: 'bar',
      },
      errors: [],
    },
    'strict optionalProperties - ok': {
      schema: {
        optionalProperties: {
          foo: {
            type: 'string',
          },
        },
      },
      instance: {
        foo: 'foo',
      },
      errors: [],
    },
    'strict optionalProperties - bad wrong type': {
      schema: {
        optionalProperties: {
          foo: {
            type: 'string',
          },
        },
      },
      instance: {
        foo: 123,
      },
      errors: [
        {
          instancePath: ['foo'],
          schemaPath: ['optionalProperties', 'foo', 'type'],
        },
      ],
    },
    'strict optionalProperties - ok missing property': {
      schema: {
        optionalProperties: {
          foo: {
            type: 'string',
          },
        },
      },
      instance: {},
      errors: [],
    },
    'strict optionalProperties - bad additional property': {
      schema: {
        optionalProperties: {
          foo: {
            type: 'string',
          },
        },
      },
      instance: {
        foo: 'foo',
        bar: 'bar',
      },
      errors: [
        {
          instancePath: ['bar'],
          schemaPath: [],
        },
      ],
    },
    'strict optionalProperties - bad additional property with explicit additionalProperties: false': {
      schema: {
        optionalProperties: {
          foo: {
            type: 'string',
          },
        },
        additionalProperties: false,
      },
      instance: {
        foo: 'foo',
        bar: 'bar',
      },
      errors: [
        {
          instancePath: ['bar'],
          schemaPath: [],
        },
      ],
    },
    'non-strict optionalProperties - ok': {
      schema: {
        optionalProperties: {
          foo: {
            type: 'string',
          },
        },
        additionalProperties: true,
      },
      instance: {
        foo: 'foo',
      },
      errors: [],
    },
    'non-strict optionalProperties - bad wrong type': {
      schema: {
        optionalProperties: {
          foo: {
            type: 'string',
          },
        },
        additionalProperties: true,
      },
      instance: {
        foo: 123,
      },
      errors: [
        {
          instancePath: ['foo'],
          schemaPath: ['optionalProperties', 'foo', 'type'],
        },
      ],
    },
    'non-strict optionalProperties - ok missing property': {
      schema: {
        optionalProperties: {
          foo: {
            type: 'string',
          },
        },
        additionalProperties: true,
      },
      instance: {},
      errors: [],
    },
    'non-strict optionalProperties - ok additional property': {
      schema: {
        optionalProperties: {
          foo: {
            type: 'string',
          },
        },
        additionalProperties: true,
      },
      instance: {
        foo: 'foo',
        bar: 'bar',
      },
      errors: [],
    },
    'strict mixed properties and optionalProperties - ok': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
        optionalProperties: {
          bar: {
            type: 'string',
          },
        },
      },
      instance: {
        foo: 'foo',
        bar: 'bar',
      },
      errors: [],
    },
    'strict mixed properties and optionalProperties - bad': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
        optionalProperties: {
          bar: {
            type: 'string',
          },
        },
      },
      instance: {
        foo: 123,
        bar: 123,
      },
      errors: [
        {
          instancePath: ['foo'],
          schemaPath: ['properties', 'foo', 'type'],
        },
        {
          instancePath: ['bar'],
          schemaPath: ['optionalProperties', 'bar', 'type'],
        },
      ],
    },
    'strict mixed properties and optionalProperties - bad additional property': {
      schema: {
        properties: {
          foo: {
            type: 'string',
          },
        },
        optionalProperties: {
          bar: {
            type: 'string',
          },
        },
      },
      instance: {
        foo: 'foo',
        bar: 'bar',
        baz: 'baz',
      },
      errors: [
        {
          instancePath: ['baz'],
          schemaPath: [],
        },
      ],
    },
    'values schema - null': {
      schema: {
        values: {
          type: 'string',
        },
      },
      instance: null,
      errors: [
        {
          instancePath: [],
          schemaPath: ['values'],
        },
      ],
    },
    'values schema - boolean': {
      schema: {
        values: {
          type: 'string',
        },
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['values'],
        },
      ],
    },
    'values schema - float': {
      schema: {
        values: {
          type: 'string',
        },
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['values'],
        },
      ],
    },
    'values schema - integer': {
      schema: {
        values: {
          type: 'string',
        },
      },
      instance: 1,
      errors: [
        {
          instancePath: [],
          schemaPath: ['values'],
        },
      ],
    },
    'values schema - string': {
      schema: {
        values: {
          type: 'string',
        },
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['values'],
        },
      ],
    },
    'values schema - array': {
      schema: {
        values: {
          type: 'string',
        },
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['values'],
        },
      ],
    },
    'nullable values schema - null': {
      schema: {
        values: {
          type: 'string',
        },
        nullable: true,
      },
      instance: null,
      errors: [],
    },
    'nullable values schema - boolean': {
      schema: {
        values: {
          type: 'string',
        },
        nullable: true,
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['values'],
        },
      ],
    },
    'nullable values schema - float': {
      schema: {
        values: {
          type: 'string',
        },
        nullable: true,
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['values'],
        },
      ],
    },
    'nullable values schema - integer': {
      schema: {
        values: {
          type: 'string',
        },
        nullable: true,
      },
      instance: 1,
      errors: [
        {
          instancePath: [],
          schemaPath: ['values'],
        },
      ],
    },
    'nullable values schema - string': {
      schema: {
        values: {
          type: 'string',
        },
        nullable: true,
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['values'],
        },
      ],
    },
    'nullable values schema - array': {
      schema: {
        values: {
          type: 'string',
        },
        nullable: true,
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['values'],
        },
      ],
    },
    'values schema - empty object': {
      schema: {
        values: {
          type: 'string',
        },
      },
      instance: {},
      errors: [],
    },
    'values schema - all values ok': {
      schema: {
        values: {
          type: 'string',
        },
      },
      instance: {
        foo: 'foo',
        bar: 'bar',
        baz: 'baz',
      },
      errors: [],
    },
    'values schema - some values bad': {
      schema: {
        values: {
          type: 'string',
        },
      },
      instance: {
        foo: 'foo',
        bar: 123,
        baz: 123,
      },
      errors: [
        {
          instancePath: ['bar'],
          schemaPath: ['values', 'type'],
        },
        {
          instancePath: ['baz'],
          schemaPath: ['values', 'type'],
        },
      ],
    },
    'values schema - all values bad': {
      schema: {
        values: {
          type: 'string',
        },
      },
      instance: {
        foo: 123,
        bar: 123,
        baz: 123,
      },
      errors: [
        {
          instancePath: ['foo'],
          schemaPath: ['values', 'type'],
        },
        {
          instancePath: ['bar'],
          schemaPath: ['values', 'type'],
        },
        {
          instancePath: ['baz'],
          schemaPath: ['values', 'type'],
        },
      ],
    },
    'values schema - nested values, ok': {
      schema: {
        values: {
          values: {
            type: 'string',
          },
        },
      },
      instance: {
        a0: {
          b0: 'c',
        },
        a1: {},
        a2: {
          b0: 'c',
        },
      },
      errors: [],
    },
    'values schema - nested values, bad': {
      schema: {
        values: {
          values: {
            type: 'string',
          },
        },
      },
      instance: {
        a0: {
          b0: null,
        },
        a1: {
          b0: 'c',
        },
        a2: {
          b0: 'c',
          b1: null,
        },
        a3: null,
      },
      errors: [
        {
          instancePath: ['a0', 'b0'],
          schemaPath: ['values', 'values', 'type'],
        },
        {
          instancePath: ['a2', 'b1'],
          schemaPath: ['values', 'values', 'type'],
        },
        {
          instancePath: ['a3'],
          schemaPath: ['values', 'values'],
        },
      ],
    },
    'discriminator schema - null': {
      schema: {
        discriminator: 'foo',
        mapping: {},
      },
      instance: null,
      errors: [
        {
          instancePath: [],
          schemaPath: ['discriminator'],
        },
      ],
    },
    'discriminator schema - boolean': {
      schema: {
        discriminator: 'foo',
        mapping: {},
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['discriminator'],
        },
      ],
    },
    'discriminator schema - float': {
      schema: {
        discriminator: 'foo',
        mapping: {},
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['discriminator'],
        },
      ],
    },
    'discriminator schema - integer': {
      schema: {
        discriminator: 'foo',
        mapping: {},
      },
      instance: 1,
      errors: [
        {
          instancePath: [],
          schemaPath: ['discriminator'],
        },
      ],
    },
    'discriminator schema - string': {
      schema: {
        discriminator: 'foo',
        mapping: {},
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['discriminator'],
        },
      ],
    },
    'discriminator schema - array': {
      schema: {
        discriminator: 'foo',
        mapping: {},
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['discriminator'],
        },
      ],
    },
    'nullable discriminator schema - null': {
      schema: {
        discriminator: 'foo',
        mapping: {},
        nullable: true,
      },
      instance: null,
      errors: [],
    },
    'nullable discriminator schema - boolean': {
      schema: {
        discriminator: 'foo',
        mapping: {},
        nullable: true,
      },
      instance: true,
      errors: [
        {
          instancePath: [],
          schemaPath: ['discriminator'],
        },
      ],
    },
    'nullable discriminator schema - float': {
      schema: {
        discriminator: 'foo',
        mapping: {},
        nullable: true,
      },
      instance: 3.14,
      errors: [
        {
          instancePath: [],
          schemaPath: ['discriminator'],
        },
      ],
    },
    'nullable discriminator schema - integer': {
      schema: {
        discriminator: 'foo',
        mapping: {},
        nullable: true,
      },
      instance: 1,
      errors: [
        {
          instancePath: [],
          schemaPath: ['discriminator'],
        },
      ],
    },
    'nullable discriminator schema - string': {
      schema: {
        discriminator: 'foo',
        mapping: {},
        nullable: true,
      },
      instance: 'foo',
      errors: [
        {
          instancePath: [],
          schemaPath: ['discriminator'],
        },
      ],
    },
    'nullable discriminator schema - array': {
      schema: {
        discriminator: 'foo',
        mapping: {},
        nullable: true,
      },
      instance: [],
      errors: [
        {
          instancePath: [],
          schemaPath: ['discriminator'],
        },
      ],
    },
    'discriminator schema - discriminator missing': {
      schema: {
        discriminator: 'foo',
        mapping: {
          x: {
            properties: {
              a: {
                type: 'string',
              },
            },
          },
          y: {
            properties: {
              a: {
                type: 'float64',
              },
            },
          },
        },
      },
      instance: {},
      errors: [
        {
          instancePath: [],
          schemaPath: ['discriminator'],
        },
      ],
    },
    'discriminator schema - discriminator not string': {
      schema: {
        discriminator: 'foo',
        mapping: {
          x: {
            properties: {
              a: {
                type: 'string',
              },
            },
          },
          y: {
            properties: {
              a: {
                type: 'float64',
              },
            },
          },
        },
      },
      instance: {
        foo: null,
      },
      errors: [
        {
          instancePath: ['foo'],
          schemaPath: ['discriminator'],
        },
      ],
    },
    'discriminator schema - discriminator not in mapping': {
      schema: {
        discriminator: 'foo',
        mapping: {
          x: {
            properties: {
              a: {
                type: 'string',
              },
            },
          },
          y: {
            properties: {
              a: {
                type: 'float64',
              },
            },
          },
        },
      },
      instance: {
        foo: 'z',
      },
      errors: [
        {
          instancePath: ['foo'],
          schemaPath: ['mapping'],
        },
      ],
    },
    'discriminator schema - instance fails mapping schema': {
      schema: {
        discriminator: 'foo',
        mapping: {
          x: {
            properties: {
              a: {
                type: 'string',
              },
            },
          },
          y: {
            properties: {
              a: {
                type: 'float64',
              },
            },
          },
        },
      },
      instance: {
        foo: 'y',
        a: 'a',
      },
      errors: [
        {
          instancePath: ['a'],
          schemaPath: ['mapping', 'y', 'properties', 'a', 'type'],
        },
      ],
    },
    'discriminator schema - ok': {
      schema: {
        discriminator: 'foo',
        mapping: {
          x: {
            properties: {
              a: {
                type: 'string',
              },
            },
          },
          y: {
            properties: {
              a: {
                type: 'float64',
              },
            },
          },
        },
      },
      instance: {
        foo: 'x',
        a: 'a',
      },
      errors: [],
    },
  },
};
