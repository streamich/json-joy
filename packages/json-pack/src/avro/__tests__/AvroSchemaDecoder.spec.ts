import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {AvroSchemaEncoder} from '../AvroSchemaEncoder';
import {AvroSchemaDecoder} from '../AvroSchemaDecoder';
import type {
  AvroSchema,
  AvroRecordSchema,
  AvroEnumSchema,
  AvroArraySchema,
  AvroMapSchema,
  AvroUnionSchema,
  AvroFixedSchema,
} from '../types';

describe('AvroSchemaDecoder', () => {
  const setup = () => {
    const writer = new Writer();
    const encoder = new AvroSchemaEncoder(writer);
    const decoder = new AvroSchemaDecoder();
    return {writer, encoder, decoder};
  };

  describe('primitive types with schema validation', () => {
    test('decodes null with null schema', () => {
      const {encoder, decoder} = setup();
      const schema: AvroSchema = 'null';
      const value = null;
      const encoded = encoder.encode(value, schema);
      const decoded = decoder.decode(encoded, schema);
      expect(decoded).toBe(null);
    });

    test('decodes boolean with boolean schema', () => {
      const {encoder, decoder} = setup();
      const schema: AvroSchema = 'boolean';
      const value = true;
      const encoded = encoder.encode(value, schema);
      const decoded = decoder.decode(encoded, schema);
      expect(decoded).toBe(true);
    });

    test('decodes int with int schema', () => {
      const {encoder, decoder} = setup();
      const schema: AvroSchema = 'int';
      const value = 42;
      const encoded = encoder.encode(value, schema);
      const decoded = decoder.decode(encoded, schema);
      expect(decoded).toBe(42);
    });

    test('decodes long with long schema', () => {
      const {encoder, decoder} = setup();
      const schema: AvroSchema = 'long';
      const value = BigInt(1000000);
      const encoded = encoder.encode(value, schema);
      const decoded = decoder.decode(encoded, schema);
      expect(decoded).toBe(Number(value));
    });

    test('decodes large long as bigint', () => {
      const {encoder, decoder} = setup();
      const schema: AvroSchema = 'long';
      const value = BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1);
      const encoded = encoder.encode(value, schema);
      const decoded = decoder.decode(encoded, schema);
      expect(decoded).toBe(value);
    });

    test('decodes float with float schema', () => {
      const {encoder, decoder} = setup();
      const schema: AvroSchema = 'float';
      const value = Math.PI;
      const encoded = encoder.encode(value, schema);
      const decoded = decoder.decode(encoded, schema);
      expect(decoded).toBeCloseTo(value, 6);
    });

    test('decodes double with double schema', () => {
      const {encoder, decoder} = setup();
      const schema: AvroSchema = 'double';
      const value = Math.PI;
      const encoded = encoder.encode(value, schema);
      const decoded = decoder.decode(encoded, schema);
      expect(decoded).toBe(value);
    });

    test('decodes bytes with bytes schema', () => {
      const {encoder, decoder} = setup();
      const schema: AvroSchema = 'bytes';
      const value = new Uint8Array([1, 2, 3, 4, 5]);
      const encoded = encoder.encode(value, schema);
      const decoded = decoder.decode(encoded, schema);
      expect(decoded).toEqual(value);
    });

    test('decodes string with string schema', () => {
      const {encoder, decoder} = setup();
      const schema: AvroSchema = 'string';
      const value = 'Hello, Avro!';
      const encoded = encoder.encode(value, schema);
      const decoded = decoder.decode(encoded, schema);
      expect(decoded).toBe(value);
    });
  });

  describe('record schemas', () => {
    test('decodes simple record', () => {
      const {encoder, decoder} = setup();
      const schema: AvroRecordSchema = {
        type: 'record',
        name: 'User',
        fields: [
          {name: 'name', type: 'string'},
          {name: 'age', type: 'int'},
          {name: 'active', type: 'boolean'},
        ],
      };
      const value = {name: 'Alice', age: 30, active: true};
      const encoded = encoder.encode(value, schema);
      const decoded = decoder.decode(encoded, schema);
      expect(decoded).toEqual(value);
    });

    test('decodes record with default values', () => {
      const {encoder, decoder} = setup();
      const schema: AvroRecordSchema = {
        type: 'record',
        name: 'User',
        fields: [
          {name: 'name', type: 'string'},
          {name: 'age', type: 'int', default: 25},
        ],
      };
      const value = {name: 'Bob', age: 25};
      const encoded = encoder.encode(value, schema);
      const decoded = decoder.decode(encoded, schema);
      expect(decoded).toEqual(value);
    });

    test('decodes nested record', () => {
      const {encoder, decoder} = setup();
      const schema: AvroRecordSchema = {
        type: 'record',
        name: 'Person',
        fields: [
          {name: 'name', type: 'string'},
          {
            name: 'address',
            type: {
              type: 'record',
              name: 'Address',
              fields: [
                {name: 'street', type: 'string'},
                {name: 'city', type: 'string'},
              ],
            },
          },
        ],
      };
      const value = {
        name: 'Charlie',
        address: {street: '123 Main St', city: 'Anytown'},
      };
      const encoded = encoder.encode(value, schema);
      const decoded = decoder.decode(encoded, schema);
      expect(decoded).toEqual(value);
    });
  });

  describe('enum schemas', () => {
    test('decodes valid enum value', () => {
      const {encoder, decoder} = setup();
      const schema: AvroEnumSchema = {
        type: 'enum',
        name: 'Color',
        symbols: ['RED', 'GREEN', 'BLUE'],
      };
      const value = 'GREEN';
      const encoded = encoder.encode(value, schema);
      const decoded = decoder.decode(encoded, schema);
      expect(decoded).toBe('GREEN');
    });

    test('throws on invalid enum index during decoding', () => {
      const {writer, decoder} = setup();
      const schema: AvroEnumSchema = {
        type: 'enum',
        name: 'Color',
        symbols: ['RED', 'GREEN', 'BLUE'],
      };

      // Manually create invalid enum data (index 5)
      writer.reset();
      const invalidIndex = 5;
      const zigzag = (invalidIndex << 1) ^ (invalidIndex >> 31);
      let n = zigzag >>> 0;
      while (n >= 0x80) {
        writer.u8((n & 0x7f) | 0x80);
        n >>>= 7;
      }
      writer.u8(n & 0x7f);
      const invalidData = writer.flush();

      expect(() => decoder.decode(invalidData, schema)).toThrow('Invalid enum index 5');
    });
  });

  describe('array schemas', () => {
    test('decodes array of primitives', () => {
      const {encoder, decoder} = setup();
      const schema: AvroArraySchema = {
        type: 'array',
        items: 'int',
      };
      const value = [1, 2, 3, 4, 5];
      const encoded = encoder.encode(value, schema);
      const decoded = decoder.decode(encoded, schema);
      expect(decoded).toEqual(value);
    });

    test('decodes empty array', () => {
      const {encoder, decoder} = setup();
      const schema: AvroArraySchema = {
        type: 'array',
        items: 'string',
      };
      const value: string[] = [];
      const encoded = encoder.encode(value, schema);
      const decoded = decoder.decode(encoded, schema);
      expect(decoded).toEqual(value);
    });

    test('decodes nested arrays', () => {
      const {encoder, decoder} = setup();
      const schema: AvroArraySchema = {
        type: 'array',
        items: {
          type: 'array',
          items: 'int',
        },
      };
      const value = [[1, 2], [3, 4, 5], [6]];
      const encoded = encoder.encode(value, schema);
      const decoded = decoder.decode(encoded, schema);
      expect(decoded).toEqual(value);
    });
  });

  describe('map schemas', () => {
    test('decodes map of primitives', () => {
      const {encoder, decoder} = setup();
      const schema: AvroMapSchema = {
        type: 'map',
        values: 'string',
      };
      const value = {key1: 'value1', key2: 'value2'};
      const encoded = encoder.encode(value, schema);
      const decoded = decoder.decode(encoded, schema);
      expect(decoded).toEqual(value);
    });

    test('decodes empty map', () => {
      const {encoder, decoder} = setup();
      const schema: AvroMapSchema = {
        type: 'map',
        values: 'int',
      };
      const value: Record<string, number> = {};
      const encoded = encoder.encode(value, schema);
      const decoded = decoder.decode(encoded, schema);
      expect(decoded).toEqual(value);
    });

    test('decodes complex map', () => {
      const {encoder, decoder} = setup();
      const schema: AvroMapSchema = {
        type: 'map',
        values: {
          type: 'record',
          name: 'Value',
          fields: [{name: 'count', type: 'int'}],
        },
      };
      const value = {item1: {count: 10}, item2: {count: 20}};
      const encoded = encoder.encode(value, schema);
      const decoded = decoder.decode(encoded, schema);
      expect(decoded).toEqual(value);
    });
  });

  describe('union schemas', () => {
    test('decodes union value - null', () => {
      const {encoder, decoder} = setup();
      const schema: AvroUnionSchema = ['null', 'string'];
      const value = null;
      const encoded = encoder.encode(value, schema);
      const decoded = decoder.decode(encoded, schema);
      expect(decoded).toBe(null);
    });

    test('decodes union value - string', () => {
      const {encoder, decoder} = setup();
      const schema: AvroUnionSchema = ['null', 'string'];
      const value = 'hello';
      const encoded = encoder.encode(value, schema);
      const decoded = decoder.decode(encoded, schema);
      expect(decoded).toBe('hello');
    });

    test('decodes complex union', () => {
      const {encoder, decoder} = setup();
      const schema: AvroUnionSchema = [
        'null',
        'int',
        {
          type: 'record',
          name: 'Person',
          fields: [{name: 'name', type: 'string'}],
        },
      ];
      const value = {name: 'Alice'};
      const encoded = encoder.encode(value, schema);
      const decoded = decoder.decode(encoded, schema);
      expect(decoded).toEqual(value);
    });
  });

  describe('fixed schemas', () => {
    test('decodes fixed-length data', () => {
      const {encoder, decoder} = setup();
      const schema: AvroFixedSchema = {
        type: 'fixed',
        name: 'MD5',
        size: 16,
      };
      const value = new Uint8Array(16).fill(42);
      const encoded = encoder.encode(value, schema);
      const decoded = decoder.decode(encoded, schema);
      expect(decoded).toEqual(value);
    });
  });

  describe('schema validation during decoding', () => {
    test('throws on invalid schema', () => {
      const {decoder} = setup();
      const invalidSchema = {type: 'invalid'} as any;
      const data = new Uint8Array([0]);
      expect(() => decoder.decode(data, invalidSchema)).toThrow('Invalid Avro schema');
    });

    test('validates schema type in typed read methods', () => {
      const {decoder} = setup();
      decoder.reader.reset(new Uint8Array([1])); // boolean true
      expect(() => decoder.readBoolean('boolean')).not.toThrow();
      expect(() => decoder.readBoolean('int')).toThrow('Expected schema type boolean, got int');
    });
  });

  describe('round-trip compatibility', () => {
    test('encodes and decodes complex nested data', () => {
      const {encoder, decoder} = setup();
      const schema: AvroRecordSchema = {
        type: 'record',
        name: 'ComplexData',
        fields: [
          {name: 'id', type: 'long'},
          {name: 'name', type: 'string'},
          {name: 'tags', type: {type: 'array', items: 'string'}},
          {name: 'metadata', type: {type: 'map', values: 'string'}},
          {
            name: 'status',
            type: {
              type: 'enum',
              name: 'Status',
              symbols: ['ACTIVE', 'INACTIVE', 'PENDING'],
            },
          },
          {
            name: 'optional_field',
            type: ['null', 'string'],
          },
        ],
      };

      const value = {
        id: BigInt(12345),
        name: 'Test Record',
        tags: ['tag1', 'tag2', 'tag3'],
        metadata: {key1: 'value1', key2: 'value2'},
        status: 'ACTIVE',
        optional_field: 'optional value',
      };

      const encoded = encoder.encode(value, schema);
      const decoded = decoder.decode(encoded, schema);
      expect(decoded).toEqual({
        id: Number(value.id), // bigint converted to number if in safe range
        name: value.name,
        tags: value.tags,
        metadata: value.metadata,
        status: value.status,
        optional_field: value.optional_field,
      });
    });

    test('handles all primitive types in single record', () => {
      const {encoder, decoder} = setup();
      const schema: AvroRecordSchema = {
        type: 'record',
        name: 'AllTypes',
        fields: [
          {name: 'null_field', type: 'null'},
          {name: 'bool_field', type: 'boolean'},
          {name: 'int_field', type: 'int'},
          {name: 'long_field', type: 'long'},
          {name: 'float_field', type: 'float'},
          {name: 'double_field', type: 'double'},
          {name: 'bytes_field', type: 'bytes'},
          {name: 'string_field', type: 'string'},
        ],
      };

      const value = {
        null_field: null,
        bool_field: true,
        int_field: 42,
        long_field: BigInt(1000000),
        float_field: 3.14,
        double_field: Math.PI,
        bytes_field: new Uint8Array([1, 2, 3]),
        string_field: 'hello world',
      };

      const encoded = encoder.encode(value, schema);
      const decoded = decoder.decode(encoded, schema);
      expect(decoded).toEqual({
        null_field: null,
        bool_field: true,
        int_field: 42,
        long_field: Number(value.long_field),
        float_field: expect.any(Number), // Float precision
        double_field: Math.PI,
        bytes_field: new Uint8Array([1, 2, 3]),
        string_field: 'hello world',
      });
      expect((decoded as any).float_field).toBeCloseTo(3.14, 6);
    });
  });

  describe('error handling', () => {
    // Basic error handling tests are covered in other test suites
    // The decoders are designed to be robust and handle various input scenarios
  });
});
