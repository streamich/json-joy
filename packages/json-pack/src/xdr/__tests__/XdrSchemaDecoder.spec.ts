import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {XdrEncoder} from '../XdrEncoder';
import {XdrSchemaEncoder} from '../XdrSchemaEncoder';
import {XdrSchemaDecoder} from '../XdrSchemaDecoder';
import {XdrUnion} from '../XdrUnion';
import type {XdrSchema} from '../types';

describe('XdrSchemaDecoder', () => {
  let reader: Reader;
  let writer: Writer;
  let encoder: XdrEncoder;
  let schemaEncoder: XdrSchemaEncoder;
  let decoder: XdrSchemaDecoder;

  beforeEach(() => {
    reader = new Reader();
    writer = new Writer();
    encoder = new XdrEncoder(writer);
    schemaEncoder = new XdrSchemaEncoder(writer);
    decoder = new XdrSchemaDecoder(reader);
  });

  describe('primitive types with schema', () => {
    test('decodes void with void schema', () => {
      const schema: XdrSchema = {type: 'void'};
      const encoded = schemaEncoder.encode(null, schema);

      const result = decoder.decode(encoded, schema);
      expect(result).toBeUndefined();
    });

    test('decodes int with int schema', () => {
      const schema: XdrSchema = {type: 'int'};
      const value = 42;
      const encoded = schemaEncoder.encode(value, schema);

      const result = decoder.decode(encoded, schema);
      expect(result).toBe(value);
    });

    test('decodes unsigned int with unsigned_int schema', () => {
      const schema: XdrSchema = {type: 'unsigned_int'};
      const value = 4294967295;
      const encoded = schemaEncoder.encode(value, schema);

      const result = decoder.decode(encoded, schema);
      expect(result).toBe(value);
    });

    test('decodes boolean with boolean schema', () => {
      const schema: XdrSchema = {type: 'boolean'};

      let encoded = schemaEncoder.encode(true, schema);
      let result = decoder.decode(encoded, schema);
      expect(result).toBe(true);

      encoded = schemaEncoder.encode(false, schema);
      result = decoder.decode(encoded, schema);
      expect(result).toBe(false);
    });

    test('decodes hyper with hyper schema', () => {
      const schema: XdrSchema = {type: 'hyper'};
      const value = BigInt('0x123456789abcdef0');
      const encoded = schemaEncoder.encode(value, schema);

      const result = decoder.decode(encoded, schema);
      expect(result).toBe(value);
    });

    test('decodes unsigned hyper with unsigned_hyper schema', () => {
      const schema: XdrSchema = {type: 'unsigned_hyper'};
      const value = BigInt('0xffffffffffffffff');
      const encoded = schemaEncoder.encode(value, schema);

      const result = decoder.decode(encoded, schema);
      expect(result).toBe(value);
    });

    test('decodes float with float schema', () => {
      const schema: XdrSchema = {type: 'float'};
      const value = 3.14;
      const encoded = schemaEncoder.encode(value, schema);

      const result = decoder.decode(encoded, schema);
      expect(result).toBeCloseTo(value, 6);
    });

    test('decodes double with double schema', () => {
      const schema: XdrSchema = {type: 'double'};
      const value = Math.PI;
      const encoded = schemaEncoder.encode(value, schema);

      const result = decoder.decode(encoded, schema);
      expect(result).toBeCloseTo(value, 15);
    });

    test('throws on quadruple with quadruple schema', () => {
      const schema: XdrSchema = {type: 'quadruple'};
      const value = 1.0;

      expect(() => schemaEncoder.encode(value, schema)).toThrow('not implemented');
    });
  });

  describe('enum schemas', () => {
    test('decodes valid enum value by name', () => {
      const schema: XdrSchema = {
        type: 'enum',
        values: {RED: 0, GREEN: 1, BLUE: 2},
      };
      const encoded = schemaEncoder.encode('GREEN', schema);

      const result = decoder.decode(encoded, schema);
      expect(result).toBe('GREEN');
    });

    test('returns numeric value for unknown enum', () => {
      const schema: XdrSchema = {
        type: 'enum',
        values: {RED: 0, GREEN: 1, BLUE: 2},
      };

      // Manually encode a value that's not in the enum
      encoder.writeInt(99);
      const encoded = writer.flush();

      const result = decoder.decode(encoded, schema);
      expect(result).toBe(99);
    });
  });

  describe('opaque schemas', () => {
    test('decodes opaque data with correct size', () => {
      const schema: XdrSchema = {type: 'opaque', size: 5};
      const value = new Uint8Array([1, 2, 3, 4, 5]);
      const encoded = schemaEncoder.encode(value, schema);

      const result = decoder.decode(encoded, schema);
      expect(result).toEqual(value);
    });

    test('decodes variable-length opaque data', () => {
      const schema: XdrSchema = {type: 'vopaque'};
      const value = new Uint8Array([1, 2, 3, 4, 5]);
      const encoded = schemaEncoder.encode(value, schema);

      const result = decoder.decode(encoded, schema);
      expect(result).toEqual(value);
    });

    test('decodes variable-length opaque data with size limit', () => {
      const schema: XdrSchema = {type: 'vopaque', size: 10};
      const value = new Uint8Array([1, 2, 3, 4, 5]);
      const encoded = schemaEncoder.encode(value, schema);

      const result = decoder.decode(encoded, schema);
      expect(result).toEqual(value);
    });

    test('throws on variable-length opaque data too large', () => {
      const schema: XdrSchema = {type: 'vopaque', size: 3};

      // Manually encode data larger than limit
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      encoder.writeVarlenOpaque(data);
      const encoded = writer.flush();

      expect(() => decoder.decode(encoded, schema)).toThrow('exceeds maximum 3');
    });
  });

  describe('string schemas', () => {
    test('decodes string with string schema', () => {
      const schema: XdrSchema = {type: 'string'};
      const value = 'Hello, XDR!';
      const encoded = schemaEncoder.encode(value, schema);

      const result = decoder.decode(encoded, schema);
      expect(result).toBe(value);
    });

    test('decodes string with size limit', () => {
      const schema: XdrSchema = {type: 'string', size: 20};
      const value = 'Hello';
      const encoded = schemaEncoder.encode(value, schema);

      const result = decoder.decode(encoded, schema);
      expect(result).toBe(value);
    });

    test('throws on string too long', () => {
      const schema: XdrSchema = {type: 'string', size: 3};

      // Manually encode a string longer than limit
      const str = 'toolong';
      encoder.writeStr(str);
      const encoded = writer.flush();

      expect(() => decoder.decode(encoded, schema)).toThrow('exceeds maximum 3');
    });
  });

  describe('array schemas', () => {
    test('decodes fixed-size array', () => {
      const schema: XdrSchema = {
        type: 'array',
        elements: {type: 'int'},
        size: 3,
      };
      const value = [1, 2, 3];
      const encoded = schemaEncoder.encode(value, schema);

      const result = decoder.decode(encoded, schema);
      expect(result).toEqual(value);
    });

    test('decodes variable-length array', () => {
      const schema: XdrSchema = {
        type: 'varray',
        elements: {type: 'int'},
      };
      const value = [1, 2, 3, 4];
      const encoded = schemaEncoder.encode(value, schema);

      const result = decoder.decode(encoded, schema);
      expect(result).toEqual(value);
    });

    test('decodes empty variable-length array', () => {
      const schema: XdrSchema = {
        type: 'varray',
        elements: {type: 'int'},
      };
      const value: number[] = [];
      const encoded = schemaEncoder.encode(value, schema);

      const result = decoder.decode(encoded, schema);
      expect(result).toEqual(value);
    });

    test('throws on variable-length array too large', () => {
      const schema: XdrSchema = {
        type: 'varray',
        elements: {type: 'int'},
        size: 2,
      };

      // Manually encode array larger than limit
      const values = [1, 2, 3];
      encoder.writeUnsignedInt(values.length);
      values.forEach((v) => encoder.writeInt(v));
      const encoded = writer.flush();

      expect(() => decoder.decode(encoded, schema)).toThrow('exceeds maximum 2');
    });

    test('decodes nested arrays', () => {
      const schema: XdrSchema = {
        type: 'array',
        elements: {
          type: 'array',
          elements: {type: 'int'},
          size: 2,
        },
        size: 2,
      };
      const value = [
        [1, 2],
        [3, 4],
      ];
      const encoded = schemaEncoder.encode(value, schema);

      const result = decoder.decode(encoded, schema);
      expect(result).toEqual(value);
    });
  });

  describe('struct schemas', () => {
    test('decodes simple struct', () => {
      const schema: XdrSchema = {
        type: 'struct',
        fields: [
          [{type: 'int'}, 'id'],
          [{type: 'string'}, 'name'],
        ],
      };
      const value = {id: 42, name: 'test'};
      const encoded = schemaEncoder.encode(value, schema);

      const result = decoder.decode(encoded, schema);
      expect(result).toEqual(value);
    });

    test('decodes nested struct', () => {
      const schema: XdrSchema = {
        type: 'struct',
        fields: [
          [{type: 'int'}, 'id'],
          [
            {
              type: 'struct',
              fields: [
                [{type: 'string'}, 'first'],
                [{type: 'string'}, 'last'],
              ],
            },
            'name',
          ],
        ],
      };
      const value = {
        id: 42,
        name: {first: 'John', last: 'Doe'},
      };
      const encoded = schemaEncoder.encode(value, schema);

      const result = decoder.decode(encoded, schema);
      expect(result).toEqual(value);
    });

    test('decodes empty struct', () => {
      const schema: XdrSchema = {
        type: 'struct',
        fields: [],
      };
      const value = {};
      const encoded = schemaEncoder.encode(value, schema);

      const result = decoder.decode(encoded, schema);
      expect(result).toEqual(value);
    });
  });

  describe('union schemas', () => {
    test('decodes union value with numeric discriminant', () => {
      const schema: XdrSchema = {
        type: 'union',
        arms: [
          [0, {type: 'int'}],
          [1, {type: 'string'}],
        ],
      };

      // Test first arm
      let encoded = schemaEncoder.encode(new XdrUnion(0, 42), schema);
      let result = decoder.decode(encoded, schema) as XdrUnion;
      expect(result).toBeInstanceOf(XdrUnion);
      expect(result.discriminant).toBe(0);
      expect(result.value).toBe(42);

      // Test second arm
      encoded = schemaEncoder.encode(new XdrUnion(1, 'hello'), schema);
      result = decoder.decode(encoded, schema) as XdrUnion;
      expect(result).toBeInstanceOf(XdrUnion);
      expect(result.discriminant).toBe(1);
      expect(result.value).toBe('hello');
    });

    test('decodes union value with default', () => {
      const schema: XdrSchema = {
        type: 'union',
        arms: [
          [0, {type: 'int'}],
          [1, {type: 'string'}],
        ],
        default: {type: 'boolean'},
      };

      // Manually encode unknown discriminant
      encoder.writeInt(99); // discriminant
      encoder.writeBoolean(true); // default value
      const encoded = writer.flush();

      const result = decoder.decode(encoded, schema) as XdrUnion;
      expect(result).toBeInstanceOf(XdrUnion);
      expect(result.discriminant).toBe(99);
      expect(result.value).toBe(true);
    });

    test('throws on union value with no matching arm', () => {
      const schema: XdrSchema = {
        type: 'union',
        arms: [
          [0, {type: 'int'}],
          [1, {type: 'string'}],
        ],
      };

      // Manually encode unknown discriminant without default
      encoder.writeInt(99);
      encoder.writeInt(42); // some value
      const encoded = writer.flush();

      expect(() => decoder.decode(encoded, schema)).toThrow('No matching union arm for discriminant: 99');
    });
  });

  describe('invalid schemas', () => {
    test('throws on unknown schema type', () => {
      const schema = {type: 'invalid'} as any;
      const encoded = new Uint8Array([0, 0, 0, 42]);

      expect(() => decoder.decode(encoded, schema)).toThrow('Unknown schema type: invalid');
    });
  });

  describe('complex nested schemas', () => {
    test('decodes complex nested structure', () => {
      const schema: XdrSchema = {
        type: 'struct',
        fields: [
          [{type: 'int'}, 'version'],
          [
            {
              type: 'varray',
              elements: {
                type: 'struct',
                fields: [
                  [{type: 'string'}, 'name'],
                  [{type: 'enum', values: {ACTIVE: 1, INACTIVE: 0}}, 'status'],
                  [
                    {
                      type: 'union',
                      arms: [
                        [0, {type: 'int'}],
                        [1, {type: 'string'}],
                      ],
                    },
                    'data',
                  ],
                ],
              },
            },
            'items',
          ],
        ],
      };

      const value = {
        version: 1,
        items: [
          {
            name: 'item1',
            status: 'ACTIVE',
            data: new XdrUnion(0, 42),
          },
          {
            name: 'item2',
            status: 'INACTIVE',
            data: new XdrUnion(1, 'test'),
          },
        ],
      };

      const encoded = schemaEncoder.encode(value, schema);
      const result = decoder.decode(encoded, schema) as any;

      expect(result.version).toBe(1);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].name).toBe('item1');
      expect(result.items[0].status).toBe('ACTIVE');
      expect(result.items[0].data).toBeInstanceOf(XdrUnion);
      expect(result.items[0].data.discriminant).toBe(0);
      expect(result.items[0].data.value).toBe(42);
      expect(result.items[1].name).toBe('item2');
      expect(result.items[1].status).toBe('INACTIVE');
      expect(result.items[1].data).toBeInstanceOf(XdrUnion);
      expect(result.items[1].data.discriminant).toBe(1);
      expect(result.items[1].data.value).toBe('test');
    });
  });
});
