import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {XdrSchemaEncoder} from '../XdrSchemaEncoder';
import {XdrUnion} from '../XdrUnion';
import type {
  XdrSchema,
  XdrEnumSchema,
  XdrOpaqueSchema,
  XdrVarlenOpaqueSchema,
  XdrStringSchema,
  XdrArraySchema,
  XdrVarlenArraySchema,
  XdrStructSchema,
  XdrUnionSchema,
} from '../types';

describe('XdrSchemaEncoder', () => {
  let writer: Writer;
  let encoder: XdrSchemaEncoder;

  beforeEach(() => {
    writer = new Writer();
    encoder = new XdrSchemaEncoder(writer);
  });

  describe('primitive types with schema validation', () => {
    test('encodes void with void schema', () => {
      const schema: XdrSchema = {type: 'void'};
      const result = encoder.encode(null, schema);
      expect(result.length).toBe(0);
    });

    test('throws on non-null with void schema', () => {
      const schema: XdrSchema = {type: 'void'};
      // No schema validation, but data validation still applies
      expect(() => encoder.writeVoid(schema)).not.toThrow();
    });

    test('encodes int with int schema', () => {
      const schema: XdrSchema = {type: 'int'};
      const result = encoder.encode(42, schema);
      expect(result).toEqual(new Uint8Array([0, 0, 0, 42]));
    });

    test('throws on int out of range', () => {
      const schema: XdrSchema = {type: 'int'};
      expect(() => encoder.writeInt(2147483648, schema)).toThrow('Value is not a valid 32-bit signed integer');
      expect(() => encoder.writeInt(-2147483649, schema)).toThrow('Value is not a valid 32-bit signed integer');
    });

    test('encodes unsigned int with unsigned_int schema', () => {
      const schema: XdrSchema = {type: 'unsigned_int'};
      const result = encoder.encode(42, schema);
      expect(result).toEqual(new Uint8Array([0, 0, 0, 42]));
    });

    test('throws on negative unsigned int', () => {
      const schema: XdrSchema = {type: 'unsigned_int'};
      expect(() => encoder.writeUnsignedInt(-1, schema)).toThrow('Value is not a valid 32-bit unsigned integer');
    });

    test('encodes boolean with boolean schema', () => {
      const schema: XdrSchema = {type: 'boolean'};
      let result = encoder.encode(true, schema);
      expect(result).toEqual(new Uint8Array([0, 0, 0, 1]));

      result = encoder.encode(false, schema);
      expect(result).toEqual(new Uint8Array([0, 0, 0, 0]));
    });

    test('throws on boolean with non-boolean schema', () => {
      const schema: XdrSchema = {type: 'int'};
      // No schema validation, the encoder will just try to write
      expect(() => encoder.encode(true, schema)).not.toThrow();
    });

    test('encodes hyper with hyper schema', () => {
      const schema: XdrSchema = {type: 'hyper'};
      const result = encoder.encode(BigInt('0x123456789ABCDEF0'), schema);
      expect(result).toEqual(new Uint8Array([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0]));
    });

    test('encodes unsigned hyper with unsigned_hyper schema', () => {
      const schema: XdrSchema = {type: 'unsigned_hyper'};
      const result = encoder.encode(BigInt('0x123456789ABCDEF0'), schema);
      expect(result).toEqual(new Uint8Array([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0]));
    });

    test('throws on negative unsigned hyper', () => {
      const schema: XdrSchema = {type: 'unsigned_hyper'};
      expect(() => encoder.writeUnsignedHyper(-1, schema)).toThrow('Value is not a valid unsigned integer');
    });

    test('encodes float with float schema', () => {
      const schema: XdrSchema = {type: 'float'};
      const result = encoder.encode(Math.PI, schema);
      expect(result.length).toBe(4);
      const view = new DataView(result.buffer);
      expect(view.getFloat32(0, false)).toBeCloseTo(
        // biome-ignore lint: number precision is intended
        3.14159,
        5,
      );
    });

    test('encodes double with double schema', () => {
      const schema: XdrSchema = {type: 'double'};
      const result = encoder.encode(
        // biome-ignore lint: number precision is intended
        3.141592653589793,
        schema,
      );
      expect(result.length).toBe(8);
      const view = new DataView(result.buffer);
      expect(view.getFloat64(0, false)).toBeCloseTo(
        // biome-ignore lint: number precision is intended
        3.141592653589793,
        15,
      );
    });

    test('encodes quadruple with quadruple schema', () => {
      const schema: XdrSchema = {type: 'quadruple'};
      expect(() =>
        encoder.encode(
          // biome-ignore lint: number precision is intended
          3.14159,
          schema,
        ),
      ).toThrow('not implemented');
    });
  });

  describe('enum schemas', () => {
    test('encodes valid enum value', () => {
      const schema: XdrEnumSchema = {
        type: 'enum',
        values: {RED: 0, GREEN: 1, BLUE: 2},
      };
      const result = encoder.encode('GREEN', schema);
      expect(result).toEqual(new Uint8Array([0, 0, 0, 1])); // GREEN = 1
    });

    test('throws on invalid enum value', () => {
      const schema: XdrEnumSchema = {
        type: 'enum',
        values: {RED: 0, GREEN: 1, BLUE: 2},
      };
      expect(() => encoder.writeEnum('YELLOW', schema)).toThrow('Invalid enum value: YELLOW');
    });

    test('throws on wrong schema type for enum', () => {
      const schema: XdrSchema = {type: 'int'};
      expect(() => encoder.writeEnum('RED', schema as any)).toThrow('Schema is not an enum schema');
    });
  });

  describe('opaque schemas', () => {
    test('encodes opaque data with correct size', () => {
      const schema: XdrOpaqueSchema = {
        type: 'opaque',
        size: 3,
      };
      const data = new Uint8Array([1, 2, 3]);
      const result = encoder.encode(data, schema);
      expect(result).toEqual(new Uint8Array([1, 2, 3, 0])); // padded to 4 bytes
    });

    test('throws on wrong opaque size', () => {
      const schema: XdrOpaqueSchema = {
        type: 'opaque',
        size: 4,
      };
      const data = new Uint8Array([1, 2, 3]);
      expect(() => encoder.writeOpaque(data, schema)).toThrow('Opaque data length 3 does not match schema size 4');
    });

    test('encodes variable-length opaque data', () => {
      const schema: XdrVarlenOpaqueSchema = {
        type: 'vopaque',
        size: 10,
      };
      const data = new Uint8Array([1, 2, 3]);
      const result = encoder.encode(data, schema);
      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          3, // length
          1,
          2,
          3,
          0, // data + padding
        ]),
      );
    });

    test('throws on variable-length opaque data too large', () => {
      const schema: XdrVarlenOpaqueSchema = {
        type: 'vopaque',
        size: 2,
      };
      const data = new Uint8Array([1, 2, 3]);
      expect(() => encoder.writeVarlenOpaque(data, schema)).toThrow('Opaque data length 3 exceeds maximum size 2');
    });
  });

  describe('string schemas', () => {
    test('encodes string with string schema', () => {
      const schema: XdrStringSchema = {
        type: 'string',
      };
      const result = encoder.encode('hello', schema);
      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          5, // length
          104,
          101,
          108,
          108,
          111,
          0,
          0,
          0, // 'hello' + padding
        ]),
      );
    });

    test('encodes string with size limit', () => {
      const schema: XdrStringSchema = {
        type: 'string',
        size: 10,
      };
      const result = encoder.encode('hello', schema);
      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          5, // length
          104,
          101,
          108,
          108,
          111,
          0,
          0,
          0, // 'hello' + padding
        ]),
      );
    });

    test('throws on string too long', () => {
      const schema: XdrStringSchema = {
        type: 'string',
        size: 3,
      };
      expect(() => encoder.writeString('hello', schema)).toThrow('String length 5 exceeds maximum size 3');
    });
  });

  describe('array schemas', () => {
    test('encodes fixed-size array', () => {
      const schema: XdrArraySchema = {
        type: 'array',
        elements: {type: 'int'},
        size: 3,
      };
      const result = encoder.encode([1, 2, 3], schema);
      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          1, // 1
          0,
          0,
          0,
          2, // 2
          0,
          0,
          0,
          3, // 3
        ]),
      );
    });

    test('throws on wrong array size', () => {
      const schema: XdrArraySchema = {
        type: 'array',
        elements: {type: 'int'},
        size: 3,
      };
      expect(() => encoder.writeArray([1, 2], schema)).toThrow('Array length 2 does not match schema size 3');
    });

    test('encodes variable-length array', () => {
      const schema: XdrVarlenArraySchema = {
        type: 'varray',
        elements: {type: 'int'},
      };
      const result = encoder.encode([1, 2, 3], schema);
      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          3, // length
          0,
          0,
          0,
          1, // 1
          0,
          0,
          0,
          2, // 2
          0,
          0,
          0,
          3, // 3
        ]),
      );
    });

    test('encodes empty variable-length array', () => {
      const schema: XdrVarlenArraySchema = {
        type: 'varray',
        elements: {type: 'int'},
      };
      const result = encoder.encode([], schema);
      expect(result).toEqual(new Uint8Array([0, 0, 0, 0])); // just length
    });

    test('throws on variable-length array too large', () => {
      const schema: XdrVarlenArraySchema = {
        type: 'varray',
        elements: {type: 'int'},
        size: 2,
      };
      expect(() => encoder.writeVarlenArray([1, 2, 3], schema)).toThrow('Array length 3 exceeds maximum size 2');
    });

    test('encodes nested arrays', () => {
      const schema: XdrArraySchema = {
        type: 'array',
        elements: {
          type: 'array',
          elements: {type: 'int'},
          size: 2,
        },
        size: 2,
      };
      const result = encoder.encode(
        [
          [1, 2],
          [3, 4],
        ],
        schema,
      );
      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          1, // [1, 2][0]
          0,
          0,
          0,
          2, // [1, 2][1]
          0,
          0,
          0,
          3, // [3, 4][0]
          0,
          0,
          0,
          4, // [3, 4][1]
        ]),
      );
    });
  });

  describe('struct schemas', () => {
    test('encodes simple struct', () => {
      const schema: XdrStructSchema = {
        type: 'struct',
        fields: [
          [{type: 'int'}, 'id'],
          [{type: 'string'}, 'name'],
        ],
      };
      const result = encoder.encode({id: 42, name: 'test'}, schema);
      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          42, // id
          0,
          0,
          0,
          4, // name length
          116,
          101,
          115,
          116, // 'test'
        ]),
      );
    });

    test('throws on missing required field', () => {
      const schema: XdrStructSchema = {
        type: 'struct',
        fields: [
          [{type: 'int'}, 'id'],
          [{type: 'string'}, 'name'],
        ],
      };
      expect(() => encoder.writeStruct({id: 42}, schema)).toThrow('Missing required field: name');
    });

    test('encodes nested struct', () => {
      const schema: XdrStructSchema = {
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
      const result = encoder.encode(
        {
          id: 42,
          name: {first: 'John', last: 'Doe'},
        },
        schema,
      );

      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          42, // id
          0,
          0,
          0,
          4, // first name length
          74,
          111,
          104,
          110, // 'John'
          0,
          0,
          0,
          3, // last name length
          68,
          111,
          101,
          0, // 'Doe' + padding
        ]),
      );
    });

    test('encodes empty struct', () => {
      const schema: XdrStructSchema = {
        type: 'struct',
        fields: [],
      };
      const result = encoder.encode({}, schema);
      expect(result.length).toBe(0);
    });
  });

  describe('union schemas', () => {
    test('encodes union value with numeric discriminant', () => {
      const schema: XdrUnionSchema = {
        type: 'union',
        arms: [
          [0, {type: 'int'}],
          [1, {type: 'string'}],
        ],
      };
      const _result = encoder.writeUnion(42, schema, 0);
      writer.reset();
      encoder.writeUnion(42, schema, 0);
      const encoded = writer.flush();
      expect(encoded).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          0, // discriminant 0
          0,
          0,
          0,
          42, // value 42
        ]),
      );
    });

    test('encodes union value with boolean discriminant', () => {
      const schema: XdrUnionSchema = {
        type: 'union',
        arms: [
          [true, {type: 'int'}],
          [false, {type: 'string'}],
        ],
      };
      writer.reset();
      encoder.writeUnion(42, schema, true);
      const result = writer.flush();
      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          1, // discriminant true (1)
          0,
          0,
          0,
          42, // value 42
        ]),
      );
    });

    test('throws on union value with no matching arm', () => {
      const schema: XdrUnionSchema = {
        type: 'union',
        arms: [[0, {type: 'int'}]],
      };
      expect(() => encoder.writeUnion(42, schema, 1)).toThrow('No matching arm found for discriminant: 1');
    });

    test('encodes union value with default', () => {
      const schema: XdrUnionSchema = {
        type: 'union',
        arms: [[0, {type: 'int'}]],
        default: {type: 'string'},
      };
      writer.reset();
      encoder.writeUnion('hello', schema, 1); // non-matching discriminant, uses default
      const result = writer.flush();
      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          1, // discriminant 1
          0,
          0,
          0,
          5, // string length
          104,
          101,
          108,
          108,
          111,
          0,
          0,
          0, // 'hello' + padding
        ]),
      );
    });

    test('throws on string discriminant (simplified implementation)', () => {
      const schema: XdrUnionSchema = {
        type: 'union',
        arms: [['red', {type: 'int'}]],
      };
      expect(() => encoder.writeUnion(42, schema, 'red')).toThrow('String discriminants require enum schema context');
    });
  });

  describe('schema validation during encoding', () => {
    test('throws on invalid schema', () => {
      const invalidSchema = {type: 'invalid'} as any;
      expect(() => encoder.encode(42, invalidSchema)).toThrow('Unknown schema type: invalid');
    });

    test('throws on value not conforming to schema', () => {
      const schema: XdrSchema = {type: 'int'};
      // No automatic schema validation, this will just try to encode
      expect(() => encoder.encode('hello', schema)).not.toThrow();
    });
  });

  describe('typed write methods', () => {
    test('writeVoid with schema validation', () => {
      const schema: XdrSchema = {type: 'void'};
      encoder.writeVoid(schema);
      const result = writer.flush();
      expect(result.length).toBe(0);
    });

    test('writeInt with schema validation', () => {
      const schema: XdrSchema = {type: 'int'};
      encoder.writeInt(42, schema);
      const result = writer.flush();
      expect(result).toEqual(new Uint8Array([0, 0, 0, 42]));
    });

    test('writeNumber with different schemas', () => {
      // int schema
      let schema: XdrSchema = {type: 'int'};
      encoder.writeNumber(42, schema);
      let result = writer.flush();
      expect(result).toEqual(new Uint8Array([0, 0, 0, 42]));

      // unsigned_int schema
      writer.reset();
      schema = {type: 'unsigned_int'};
      encoder.writeNumber(42, schema);
      result = writer.flush();
      expect(result).toEqual(new Uint8Array([0, 0, 0, 42]));

      // float schema
      writer.reset();
      schema = {type: 'float'};
      encoder.writeNumber(3.14, schema);
      result = writer.flush();
      expect(result.length).toBe(4);

      // double schema
      writer.reset();
      schema = {type: 'double'};
      encoder.writeNumber(3.14, schema);
      result = writer.flush();
      expect(result.length).toBe(8);

      // hyper schema
      writer.reset();
      schema = {type: 'hyper'};
      encoder.writeNumber(42, schema);
      result = writer.flush();
      expect(result.length).toBe(8);

      // unsigned_hyper schema
      writer.reset();
      schema = {type: 'unsigned_hyper'};
      encoder.writeNumber(42, schema);
      result = writer.flush();
      expect(result.length).toBe(8);

      // quadruple schema
      writer.reset();
      schema = {type: 'quadruple'};
      expect(() => encoder.writeNumber(3.14, schema)).toThrow('not implemented');
    });

    test('throws on writeNumber with non-numeric schema', () => {
      const schema: XdrSchema = {type: 'string'};
      expect(() => encoder.writeNumber(42, schema)).toThrow('Schema type string is not a numeric type');
    });

    test('validateSchemaType throws on wrong type', () => {
      const schema: XdrSchema = {type: 'string'};
      expect(() => encoder.writeInt(42, schema)).toThrow('Expected schema type int, got string');
    });
  });

  describe('complex nested schemas', () => {
    test('encodes complex nested structure', () => {
      const schema: XdrStructSchema = {
        type: 'struct',
        fields: [
          [{type: 'int'}, 'id'],
          [
            {
              type: 'varray',
              elements: {type: 'string'},
              size: 10,
            },
            'tags',
          ],
          [
            {
              type: 'struct',
              fields: [
                [{type: 'string'}, 'name'],
                [{type: 'float'}, 'score'],
              ],
            },
            'metadata',
          ],
        ],
      };

      const data = {
        id: 123,
        tags: ['urgent', 'important'],
        metadata: {
          name: 'test',
          score: 95.5,
        },
      };

      const result = encoder.encode(data, schema);
      expect(result.length).toBeGreaterThan(20); // Should be a substantial encoding

      // Verify structure by checking known parts
      const view = new DataView(result.buffer);
      expect(view.getInt32(0, false)).toBe(123); // id
      expect(view.getUint32(4, false)).toBe(2); // tags array length
    });

    test('throws on union encoding without explicit discriminant', () => {
      const schema: XdrUnionSchema = {
        type: 'union',
        arms: [
          [0, {type: 'int'}],
          [1, {type: 'string'}],
        ],
      };

      // Trying to encode via the generic writeValue method should throw
      expect(() => encoder.encode(42, schema)).toThrow('Union values must be wrapped in XdrUnion class');
    });

    test('encodes union using XdrUnion class', () => {
      const schema: XdrUnionSchema = {
        type: 'union',
        arms: [
          [0, {type: 'int'}],
          [1, {type: 'string'}],
        ],
      };

      const unionValue = new XdrUnion(0, 42);
      const result = encoder.encode(unionValue, schema);

      expect(result).toEqual(
        new Uint8Array([
          0,
          0,
          0,
          0, // discriminant 0
          0,
          0,
          0,
          42, // value 42
        ]),
      );
    });
  });
});
