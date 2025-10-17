import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {AvroSchemaEncoder} from '../AvroSchemaEncoder';
import type {
  AvroRecordSchema,
  AvroEnumSchema,
  AvroArraySchema,
  AvroMapSchema,
  AvroUnionSchema,
  AvroFixedSchema,
} from '../types';

describe('AvroSchemaEncoder', () => {
  let writer: Writer;
  let encoder: AvroSchemaEncoder;

  beforeEach(() => {
    writer = new Writer();
    encoder = new AvroSchemaEncoder(writer);
  });

  describe('primitive types with schema validation', () => {
    test('encodes null with null schema', () => {
      const result = encoder.encode(null, 'null');
      expect(result.length).toBe(0);
    });

    test('throws on null with non-null schema', () => {
      expect(() => encoder.encode(null, 'string')).toThrow();
    });

    test('encodes boolean with boolean schema', () => {
      const result = encoder.encode(true, 'boolean');
      expect(result).toEqual(new Uint8Array([1]));
    });

    test('throws on boolean with non-boolean schema', () => {
      expect(() => encoder.encode(true, 'string')).toThrow();
    });

    test('encodes int with int schema', () => {
      const result = encoder.encode(42, 'int');
      expect(result).toEqual(new Uint8Array([84])); // 42 zigzag encoded
    });

    test('throws on int out of range', () => {
      expect(() => encoder.encode(3000000000, 'int')).toThrow();
      expect(() => encoder.encode(3.14, 'int')).toThrow();
    });

    test('encodes long with long schema', () => {
      const result = encoder.encode(123456789, 'long');
      expect(result.length).toBeGreaterThan(0);
    });

    test('encodes bigint long with long schema', () => {
      const result = encoder.encode(BigInt('123456789012345'), 'long');
      expect(result.length).toBeGreaterThan(0);
    });

    test('encodes float with float schema', () => {
      const result = encoder.encode(3.14, 'float');
      expect(result.length).toBe(4);
    });

    test('encodes double with double schema', () => {
      const result = encoder.encode(Math.PI, 'double');
      expect(result.length).toBe(8);
    });

    test('encodes bytes with bytes schema', () => {
      const bytes = new Uint8Array([1, 2, 3]);
      const result = encoder.encode(bytes, 'bytes');
      expect(result[0]).toBe(3); // length 3 (not zigzag)
      expect(result.slice(1)).toEqual(bytes);
    });

    test('encodes string with string schema', () => {
      const result = encoder.encode('hello', 'string');
      expect(result[0]).toBe(5); // length 5 (not zigzag)
      expect(result.slice(1)).toEqual(new TextEncoder().encode('hello'));
    });
  });

  describe('record schemas', () => {
    test('encodes simple record', () => {
      const schema: AvroRecordSchema = {
        type: 'record',
        name: 'User',
        fields: [
          {name: 'id', type: 'int'},
          {name: 'name', type: 'string'},
        ],
      };

      const value = {id: 42, name: 'John'};
      const result = encoder.encode(value, schema);
      expect(result.length).toBeGreaterThan(0);
    });

    test('encodes record with default values', () => {
      const schema: AvroRecordSchema = {
        type: 'record',
        name: 'User',
        fields: [
          {name: 'id', type: 'int'},
          {name: 'name', type: 'string', default: 'Unknown'},
        ],
      };

      const value = {id: 42}; // name is missing but has default
      const result = encoder.encode(value, schema);
      expect(result.length).toBeGreaterThan(0);
    });

    test('throws on missing required field', () => {
      const schema: AvroRecordSchema = {
        type: 'record',
        name: 'User',
        fields: [
          {name: 'id', type: 'int'},
          {name: 'name', type: 'string'},
        ],
      };

      const value = {id: 42}; // name is missing and required
      expect(() => encoder.encode(value, schema)).toThrow();
    });

    test('throws on wrong field type', () => {
      const schema: AvroRecordSchema = {
        type: 'record',
        name: 'User',
        fields: [
          {name: 'id', type: 'int'},
          {name: 'name', type: 'string'},
        ],
      };

      const value = {id: '42', name: 'John'}; // id should be int
      expect(() => encoder.encode(value, schema)).toThrow();
    });
  });

  describe('enum schemas', () => {
    test('encodes valid enum value', () => {
      const schema: AvroEnumSchema = {
        type: 'enum',
        name: 'Color',
        symbols: ['RED', 'GREEN', 'BLUE'],
      };

      const result = encoder.encode('GREEN', schema);
      expect(result).toEqual(new Uint8Array([2])); // index 1 zigzag encoded is 2
    });

    test('throws on invalid enum value', () => {
      const schema: AvroEnumSchema = {
        type: 'enum',
        name: 'Color',
        symbols: ['RED', 'GREEN', 'BLUE'],
      };

      expect(() => encoder.encode('YELLOW', schema)).toThrow();
    });
  });

  describe('array schemas', () => {
    test('encodes array of primitives', () => {
      const schema: AvroArraySchema = {
        type: 'array',
        items: 'string',
      };

      const value = ['hello', 'world'];
      const result = encoder.encode(value, schema);
      expect(result[0]).toBe(2); // length 2 (not zigzag)
      expect(result[result.length - 1]).toBe(0); // end marker
    });

    test('encodes empty array', () => {
      const schema: AvroArraySchema = {
        type: 'array',
        items: 'int',
      };

      const result = encoder.encode([], schema);
      expect(result).toEqual(new Uint8Array([0, 0])); // length 0, end marker
    });

    test('throws on wrong item type', () => {
      const schema: AvroArraySchema = {
        type: 'array',
        items: 'int',
      };

      expect(() => encoder.encode([1, 'two', 3], schema)).toThrow();
    });
  });

  describe('map schemas', () => {
    test('encodes map of primitives', () => {
      const schema: AvroMapSchema = {
        type: 'map',
        values: 'int',
      };

      const value = {a: 1, b: 2};
      const result = encoder.encode(value, schema);
      expect(result[0]).toBe(2); // length 2 (not zigzag)
      expect(result[result.length - 1]).toBe(0); // end marker
    });

    test('encodes empty map', () => {
      const schema: AvroMapSchema = {
        type: 'map',
        values: 'string',
      };

      const result = encoder.encode({}, schema);
      expect(result).toEqual(new Uint8Array([0, 0])); // length 0, end marker
    });

    test('throws on wrong value type', () => {
      const schema: AvroMapSchema = {
        type: 'map',
        values: 'int',
      };

      expect(() => encoder.encode({a: 1, b: 'two'}, schema)).toThrow();
    });
  });

  describe('union schemas', () => {
    test('encodes union value with automatic type detection', () => {
      const schema: AvroUnionSchema = ['null', 'string', 'int'];

      // String value
      let result = encoder.encode('hello', schema);
      expect(result[0]).toBe(2); // index 1 zigzag (string is at index 1)

      // Null value
      result = encoder.encode(null, schema);
      expect(result[0]).toBe(0); // index 0 zigzag (null is at index 0)

      // Int value
      result = encoder.encode(42, schema);
      expect(result[0]).toBe(4); // index 2 zigzag (int is at index 2)
    });

    test('encodes union value with explicit index', () => {
      const schema: AvroUnionSchema = ['null', 'string'];

      const result = encoder.encode('hello', schema, 1);
      expect(result[0]).toBe(2); // index 1 zigzag encoded is 2
    });

    test('throws on value not matching any union type', () => {
      const schema: AvroUnionSchema = ['null', 'string'];

      expect(() => encoder.encode(42, schema)).toThrow();
    });

    test('throws on invalid union index', () => {
      const schema: AvroUnionSchema = ['null', 'string'];

      expect(() => encoder.encode('hello', schema, 5)).toThrow();
    });
  });

  describe('fixed schemas', () => {
    test('encodes fixed-length data', () => {
      const schema: AvroFixedSchema = {
        type: 'fixed',
        name: 'Hash',
        size: 4,
      };

      const value = new Uint8Array([1, 2, 3, 4]);
      const result = encoder.encode(value, schema);
      expect(result).toEqual(value);
    });

    test('throws on wrong fixed length', () => {
      const schema: AvroFixedSchema = {
        type: 'fixed',
        name: 'Hash',
        size: 4,
      };

      expect(() => encoder.encode(new Uint8Array([1, 2, 3]), schema)).toThrow();
      expect(() => encoder.encode(new Uint8Array([1, 2, 3, 4, 5]), schema)).toThrow();
    });
  });

  describe('schema validation', () => {
    test('throws on invalid schema', () => {
      const invalidSchema = {type: 'invalid'} as any;
      expect(() => encoder.encode('test', invalidSchema)).toThrow('Invalid Avro schema');
    });

    test('throws on value not conforming to schema', () => {
      // This should be caught by value validation
      expect(() => encoder.encode(42, 'string')).toThrow();
    });
  });

  describe('typed write methods', () => {
    test('writeNull with schema validation', () => {
      encoder.writeNull('null');
      const result = writer.flush();
      expect(result.length).toBe(0);

      expect(() => encoder.writeNull('string')).toThrow();
    });

    test('writeBoolean with schema validation', () => {
      encoder.writeBoolean(true, 'boolean');
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([1]));

      expect(() => encoder.writeBoolean(true, 'string')).toThrow();
    });

    test('writeInt with schema validation', () => {
      encoder.writeInt(42, 'int');
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([84]));

      expect(() => encoder.writeInt(42, 'string')).toThrow();
      expect(() => encoder.writeInt(3000000000, 'int')).toThrow();
    });

    test('writeNumber with different schemas', () => {
      writer.reset();
      encoder.writeNumber(42, 'int');
      let result = writer.flush();
      expect(result).toEqual(new Uint8Array([84]));

      writer.reset();
      encoder.writeNumber(42, 'long');
      result = writer.flush();
      expect(result.length).toBeGreaterThan(0);

      writer.reset();
      encoder.writeNumber(3.14, 'float');
      result = writer.flush();
      expect(result.length).toBe(4);

      writer.reset();
      encoder.writeNumber(3.14, 'double');
      result = writer.flush();
      expect(result.length).toBe(8);

      expect(() => encoder.writeNumber(42, 'string')).toThrow();
    });
  });

  describe('complex nested schemas', () => {
    test('encodes nested record with arrays and maps', () => {
      const schema: AvroRecordSchema = {
        type: 'record',
        name: 'ComplexRecord',
        fields: [
          {name: 'id', type: 'int'},
          {name: 'tags', type: {type: 'array', items: 'string'}},
          {name: 'metadata', type: {type: 'map', values: 'string'}},
          {
            name: 'status',
            type: {type: 'enum', name: 'Status', symbols: ['ACTIVE', 'INACTIVE']},
          },
        ],
      };

      const value = {
        id: 123,
        tags: ['tag1', 'tag2'],
        metadata: {key1: 'value1', key2: 'value2'},
        status: 'ACTIVE',
      };

      const result = encoder.encode(value, schema);
      expect(result.length).toBeGreaterThan(0);
    });

    test('encodes record with union fields', () => {
      const schema: AvroRecordSchema = {
        type: 'record',
        name: 'RecordWithUnion',
        fields: [
          {name: 'id', type: 'int'},
          {name: 'optionalField', type: ['null', 'string']},
        ],
      };

      // With null value
      let value: {id: number; optionalField: null | string} = {id: 1, optionalField: null};
      let result = encoder.encode(value, schema);
      expect(result.length).toBeGreaterThan(0);

      // With string value
      value = {id: 1, optionalField: 'test'};
      result = encoder.encode(value, schema);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
