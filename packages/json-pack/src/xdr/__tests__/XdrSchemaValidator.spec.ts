import {XdrSchemaValidator} from '../XdrSchemaValidator';
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

describe('XdrSchemaValidator', () => {
  let validator: XdrSchemaValidator;

  beforeEach(() => {
    validator = new XdrSchemaValidator();
  });

  describe('primitive schemas', () => {
    test('validates void schema', () => {
      const schema: XdrSchema = {type: 'void'};
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('validates int schema', () => {
      const schema: XdrSchema = {type: 'int'};
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('validates unsigned_int schema', () => {
      const schema: XdrSchema = {type: 'unsigned_int'};
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('validates boolean schema', () => {
      const schema: XdrSchema = {type: 'boolean'};
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('validates hyper schema', () => {
      const schema: XdrSchema = {type: 'hyper'};
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('validates unsigned_hyper schema', () => {
      const schema: XdrSchema = {type: 'unsigned_hyper'};
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('validates float schema', () => {
      const schema: XdrSchema = {type: 'float'};
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('validates double schema', () => {
      const schema: XdrSchema = {type: 'double'};
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('validates quadruple schema', () => {
      const schema: XdrSchema = {type: 'quadruple'};
      expect(validator.validateSchema(schema)).toBe(true);
    });
  });

  describe('enum schemas', () => {
    test('validates simple enum schema', () => {
      const schema: XdrEnumSchema = {
        type: 'enum',
        values: {RED: 0, GREEN: 1, BLUE: 2},
      };
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('rejects enum without values', () => {
      const schema = {type: 'enum'} as any;
      expect(validator.validateSchema(schema)).toBe(false);
    });

    test('rejects enum with duplicate values', () => {
      const schema: XdrEnumSchema = {
        type: 'enum',
        values: {RED: 0, GREEN: 1, BLUE: 1}, // duplicate value
      };
      expect(validator.validateSchema(schema)).toBe(false);
    });

    test('rejects enum with non-integer values', () => {
      const schema: XdrEnumSchema = {
        type: 'enum',
        values: {RED: 0.5, GREEN: 1, BLUE: 2}, // non-integer
      };
      expect(validator.validateSchema(schema)).toBe(false);
    });
  });

  describe('opaque schemas', () => {
    test('validates simple opaque schema', () => {
      const schema: XdrOpaqueSchema = {
        type: 'opaque',
        size: 10,
      };
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('rejects opaque with negative size', () => {
      const schema: XdrOpaqueSchema = {
        type: 'opaque',
        size: -1,
      };
      expect(validator.validateSchema(schema)).toBe(false);
    });

    test('rejects opaque with non-integer size', () => {
      const schema: XdrOpaqueSchema = {
        type: 'opaque',
        size: 10.5,
      };
      expect(validator.validateSchema(schema)).toBe(false);
    });

    test('validates variable-length opaque schema', () => {
      const schema: XdrVarlenOpaqueSchema = {
        type: 'vopaque',
      };
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('validates variable-length opaque schema with size limit', () => {
      const schema: XdrVarlenOpaqueSchema = {
        type: 'vopaque',
        size: 100,
      };
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('rejects variable-length opaque with negative size', () => {
      const schema: XdrVarlenOpaqueSchema = {
        type: 'vopaque',
        size: -1,
      };
      expect(validator.validateSchema(schema)).toBe(false);
    });
  });

  describe('string schemas', () => {
    test('validates simple string schema', () => {
      const schema: XdrStringSchema = {
        type: 'string',
      };
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('validates string schema with size limit', () => {
      const schema: XdrStringSchema = {
        type: 'string',
        size: 50,
      };
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('rejects string with negative size', () => {
      const schema: XdrStringSchema = {
        type: 'string',
        size: -1,
      };
      expect(validator.validateSchema(schema)).toBe(false);
    });
  });

  describe('array schemas', () => {
    test('validates simple array schema', () => {
      const schema: XdrArraySchema = {
        type: 'array',
        elements: {type: 'int'},
        size: 10,
      };
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('validates nested array schema', () => {
      const schema: XdrArraySchema = {
        type: 'array',
        elements: {
          type: 'array',
          elements: {type: 'int'},
          size: 5,
        },
        size: 3,
      };
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('rejects array without elements schema', () => {
      const schema = {
        type: 'array',
        size: 10,
      } as any;
      expect(validator.validateSchema(schema)).toBe(false);
    });

    test('rejects array with negative size', () => {
      const schema: XdrArraySchema = {
        type: 'array',
        elements: {type: 'int'},
        size: -1,
      };
      expect(validator.validateSchema(schema)).toBe(false);
    });

    test('validates variable-length array schema', () => {
      const schema: XdrVarlenArraySchema = {
        type: 'varray',
        elements: {type: 'string'},
      };
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('validates variable-length array schema with size limit', () => {
      const schema: XdrVarlenArraySchema = {
        type: 'varray',
        elements: {type: 'int'},
        size: 100,
      };
      expect(validator.validateSchema(schema)).toBe(true);
    });
  });

  describe('struct schemas', () => {
    test('validates simple struct schema', () => {
      const schema: XdrStructSchema = {
        type: 'struct',
        fields: [
          [{type: 'int'}, 'id'],
          [{type: 'string'}, 'name'],
        ],
      };
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('validates empty struct schema', () => {
      const schema: XdrStructSchema = {
        type: 'struct',
        fields: [],
      };
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('validates nested struct schema', () => {
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
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('rejects struct without fields', () => {
      const schema = {type: 'struct'} as any;
      expect(validator.validateSchema(schema)).toBe(false);
    });

    test('rejects struct with duplicate field names', () => {
      const schema: XdrStructSchema = {
        type: 'struct',
        fields: [
          [{type: 'int'}, 'id'],
          [{type: 'string'}, 'id'], // duplicate field name
        ],
      };
      expect(validator.validateSchema(schema)).toBe(false);
    });

    test('rejects struct with invalid field format', () => {
      const schema = {
        type: 'struct',
        fields: [
          [{type: 'int'}], // missing field name
        ],
      } as any;
      expect(validator.validateSchema(schema)).toBe(false);
    });

    test('rejects struct with empty field name', () => {
      const schema: XdrStructSchema = {
        type: 'struct',
        fields: [
          [{type: 'int'}, ''], // empty field name
        ],
      };
      expect(validator.validateSchema(schema)).toBe(false);
    });
  });

  describe('union schemas', () => {
    test('validates simple union schema', () => {
      const schema: XdrUnionSchema = {
        type: 'union',
        arms: [
          [0, {type: 'int'}],
          [1, {type: 'string'}],
        ],
      };
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('validates union schema with default', () => {
      const schema: XdrUnionSchema = {
        type: 'union',
        arms: [
          [0, {type: 'int'}],
          [1, {type: 'string'}],
        ],
        default: {type: 'void'},
      };
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('validates union with different discriminant types', () => {
      const schema: XdrUnionSchema = {
        type: 'union',
        arms: [
          [0, {type: 'int'}],
          ['red', {type: 'string'}],
          [true, {type: 'boolean'}],
        ],
      };
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('rejects empty union', () => {
      const schema: XdrUnionSchema = {
        type: 'union',
        arms: [],
      };
      expect(validator.validateSchema(schema)).toBe(false);
    });

    test('rejects union with duplicate discriminants', () => {
      const schema: XdrUnionSchema = {
        type: 'union',
        arms: [
          [0, {type: 'int'}],
          [0, {type: 'string'}], // duplicate discriminant
        ],
      };
      expect(validator.validateSchema(schema)).toBe(false);
    });

    test('rejects union with invalid arm format', () => {
      const schema = {
        type: 'union',
        arms: [
          [0], // missing arm schema
        ],
      } as any;
      expect(validator.validateSchema(schema)).toBe(false);
    });

    test('rejects union with invalid default schema', () => {
      const schema = {
        type: 'union',
        arms: [[0, {type: 'int'}]],
        default: {type: 'invalid'},
      } as any;
      expect(validator.validateSchema(schema)).toBe(false);
    });
  });

  describe('invalid schemas', () => {
    test('rejects null schema', () => {
      expect(validator.validateSchema(null as any)).toBe(false);
    });

    test('rejects undefined schema', () => {
      expect(validator.validateSchema(undefined as any)).toBe(false);
    });

    test('rejects schema without type', () => {
      expect(validator.validateSchema({} as any)).toBe(false);
    });

    test('rejects schema with invalid type', () => {
      expect(validator.validateSchema({type: 'invalid'} as any)).toBe(false);
    });

    test('rejects non-object schema', () => {
      expect(validator.validateSchema('string' as any)).toBe(false);
    });
  });

  describe('value validation', () => {
    test('validates void values', () => {
      const schema: XdrSchema = {type: 'void'};
      expect(validator.validateValue(null, schema)).toBe(true);
      expect(validator.validateValue(undefined, schema)).toBe(true);
      expect(validator.validateValue(42, schema)).toBe(false);
    });

    test('validates int values', () => {
      const schema: XdrSchema = {type: 'int'};
      expect(validator.validateValue(42, schema)).toBe(true);
      expect(validator.validateValue(-2147483648, schema)).toBe(true);
      expect(validator.validateValue(2147483647, schema)).toBe(true);
      expect(validator.validateValue(2147483648, schema)).toBe(false); // out of range
      expect(validator.validateValue(-2147483649, schema)).toBe(false); // out of range
      expect(validator.validateValue(3.14, schema)).toBe(false); // not integer
      expect(validator.validateValue('42', schema)).toBe(false); // not number
    });

    test('validates unsigned_int values', () => {
      const schema: XdrSchema = {type: 'unsigned_int'};
      expect(validator.validateValue(42, schema)).toBe(true);
      expect(validator.validateValue(0, schema)).toBe(true);
      expect(validator.validateValue(4294967295, schema)).toBe(true);
      expect(validator.validateValue(-1, schema)).toBe(false); // negative
      expect(validator.validateValue(4294967296, schema)).toBe(false); // out of range
    });

    test('validates boolean values', () => {
      const schema: XdrSchema = {type: 'boolean'};
      expect(validator.validateValue(true, schema)).toBe(true);
      expect(validator.validateValue(false, schema)).toBe(true);
      expect(validator.validateValue(0, schema)).toBe(false);
      expect(validator.validateValue('true', schema)).toBe(false);
    });

    test('validates hyper values', () => {
      const schema: XdrSchema = {type: 'hyper'};
      expect(validator.validateValue(42, schema)).toBe(true);
      expect(validator.validateValue(BigInt(123), schema)).toBe(true);
      expect(validator.validateValue(BigInt(-123), schema)).toBe(true);
      expect(validator.validateValue(3.14, schema)).toBe(false); // not integer
      expect(validator.validateValue('42', schema)).toBe(false);
    });

    test('validates unsigned_hyper values', () => {
      const schema: XdrSchema = {type: 'unsigned_hyper'};
      expect(validator.validateValue(42, schema)).toBe(true);
      expect(validator.validateValue(BigInt(123), schema)).toBe(true);
      expect(validator.validateValue(0, schema)).toBe(true);
      expect(validator.validateValue(BigInt(0), schema)).toBe(true);
      expect(validator.validateValue(-1, schema)).toBe(false); // negative
      expect(validator.validateValue(BigInt(-123), schema)).toBe(false); // negative
    });

    test('validates float values', () => {
      const schema: XdrSchema = {type: 'float'};
      expect(validator.validateValue(3.14, schema)).toBe(true);
      expect(validator.validateValue(42, schema)).toBe(true); // integers are valid floats
      expect(validator.validateValue(Infinity, schema)).toBe(true);
      expect(validator.validateValue(NaN, schema)).toBe(true);
      expect(validator.validateValue('3.14', schema)).toBe(false);
    });

    test('validates enum values', () => {
      const schema: XdrEnumSchema = {
        type: 'enum',
        values: {RED: 0, GREEN: 1, BLUE: 2},
      };
      expect(validator.validateValue('RED', schema)).toBe(true);
      expect(validator.validateValue('GREEN', schema)).toBe(true);
      expect(validator.validateValue('YELLOW', schema)).toBe(false); // not in enum
      expect(validator.validateValue(0, schema)).toBe(false); // not string
    });

    test('validates opaque values', () => {
      const schema: XdrOpaqueSchema = {
        type: 'opaque',
        size: 4,
      };
      expect(validator.validateValue(new Uint8Array([1, 2, 3, 4]), schema)).toBe(true);
      expect(validator.validateValue(new Uint8Array([1, 2, 3]), schema)).toBe(false); // wrong size
      expect(validator.validateValue([1, 2, 3, 4], schema)).toBe(false); // not Uint8Array
    });

    test('validates variable-length opaque values', () => {
      const schema: XdrVarlenOpaqueSchema = {
        type: 'vopaque',
        size: 10,
      };
      expect(validator.validateValue(new Uint8Array([1, 2, 3]), schema)).toBe(true);
      expect(validator.validateValue(new Uint8Array(10), schema)).toBe(true);
      expect(validator.validateValue(new Uint8Array(11), schema)).toBe(false); // too large
    });

    test('validates string values', () => {
      const schema: XdrStringSchema = {
        type: 'string',
        size: 10,
      };
      expect(validator.validateValue('hello', schema)).toBe(true);
      expect(validator.validateValue('', schema)).toBe(true);
      expect(validator.validateValue('this is too long', schema)).toBe(false); // too long
      expect(validator.validateValue(42, schema)).toBe(false); // not string
    });

    test('validates array values', () => {
      const schema: XdrArraySchema = {
        type: 'array',
        elements: {type: 'int'},
        size: 3,
      };
      expect(validator.validateValue([1, 2, 3], schema)).toBe(true);
      expect(validator.validateValue([1, 2], schema)).toBe(false); // wrong size
      expect(validator.validateValue([1, 2, 3, 4], schema)).toBe(false); // wrong size
      expect(validator.validateValue([1, 'hello', 3], schema)).toBe(false); // wrong element type
    });

    test('validates variable-length array values', () => {
      const schema: XdrVarlenArraySchema = {
        type: 'varray',
        elements: {type: 'int'},
        size: 5,
      };
      expect(validator.validateValue([1, 2, 3], schema)).toBe(true);
      expect(validator.validateValue([], schema)).toBe(true);
      expect(validator.validateValue([1, 2, 3, 4, 5], schema)).toBe(true);
      expect(validator.validateValue([1, 2, 3, 4, 5, 6], schema)).toBe(false); // too large
    });

    test('validates struct values', () => {
      const schema: XdrStructSchema = {
        type: 'struct',
        fields: [
          [{type: 'int'}, 'id'],
          [{type: 'string'}, 'name'],
        ],
      };
      expect(validator.validateValue({id: 42, name: 'test'}, schema)).toBe(true);
      expect(validator.validateValue({id: 42}, schema)).toBe(false); // missing field
      expect(validator.validateValue({id: 'hello', name: 'test'}, schema)).toBe(false); // wrong type
      expect(validator.validateValue(null, schema)).toBe(false); // not object
      expect(validator.validateValue([42, 'test'], schema)).toBe(false); // array not object
    });

    test('validates union values', () => {
      const schema: XdrUnionSchema = {
        type: 'union',
        arms: [
          [0, {type: 'int'}],
          [1, {type: 'string'}],
        ],
      };
      expect(validator.validateValue(42, schema)).toBe(true); // matches int arm
      expect(validator.validateValue('hello', schema)).toBe(true); // matches string arm
      expect(validator.validateValue(true, schema)).toBe(false); // matches no arm
    });

    test('validates union values with default', () => {
      const schema: XdrUnionSchema = {
        type: 'union',
        arms: [[0, {type: 'int'}]],
        default: {type: 'string'},
      };
      expect(validator.validateValue(42, schema)).toBe(true); // matches int arm
      expect(validator.validateValue('hello', schema)).toBe(true); // matches default
      expect(validator.validateValue(true, schema)).toBe(false); // matches neither
    });
  });
});
