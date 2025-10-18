import {AvroSchemaValidator} from '../AvroSchemaValidator';
import type {
  AvroRecordSchema,
  AvroEnumSchema,
  AvroArraySchema,
  AvroMapSchema,
  AvroUnionSchema,
  AvroFixedSchema,
} from '../types';

describe('AvroSchemaValidator', () => {
  let validator: AvroSchemaValidator;

  beforeEach(() => {
    validator = new AvroSchemaValidator();
  });

  describe('primitive schemas', () => {
    test('validates null schema', () => {
      expect(validator.validateSchema('null')).toBe(true);
      expect(validator.validateSchema({type: 'null'})).toBe(true);
    });

    test('validates boolean schema', () => {
      expect(validator.validateSchema('boolean')).toBe(true);
      expect(validator.validateSchema({type: 'boolean'})).toBe(true);
    });

    test('validates int schema', () => {
      expect(validator.validateSchema('int')).toBe(true);
      expect(validator.validateSchema({type: 'int'})).toBe(true);
    });

    test('validates long schema', () => {
      expect(validator.validateSchema('long')).toBe(true);
      expect(validator.validateSchema({type: 'long'})).toBe(true);
    });

    test('validates float schema', () => {
      expect(validator.validateSchema('float')).toBe(true);
      expect(validator.validateSchema({type: 'float'})).toBe(true);
    });

    test('validates double schema', () => {
      expect(validator.validateSchema('double')).toBe(true);
      expect(validator.validateSchema({type: 'double'})).toBe(true);
    });

    test('validates bytes schema', () => {
      expect(validator.validateSchema('bytes')).toBe(true);
      expect(validator.validateSchema({type: 'bytes'})).toBe(true);
    });

    test('validates string schema', () => {
      expect(validator.validateSchema('string')).toBe(true);
      expect(validator.validateSchema({type: 'string'})).toBe(true);
    });
  });

  describe('record schemas', () => {
    test('validates simple record schema', () => {
      const schema: AvroRecordSchema = {
        type: 'record',
        name: 'User',
        fields: [
          {name: 'id', type: 'int'},
          {name: 'name', type: 'string'},
        ],
      };
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('validates record with default values', () => {
      const schema: AvroRecordSchema = {
        type: 'record',
        name: 'User',
        fields: [
          {name: 'id', type: 'int'},
          {name: 'name', type: 'string', default: 'Unknown'},
        ],
      };
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('rejects record without name', () => {
      const schema = {
        type: 'record',
        fields: [{name: 'id', type: 'int'}],
      } as any;
      expect(validator.validateSchema(schema)).toBe(false);
    });

    test('rejects record with duplicate field names', () => {
      const schema: AvroRecordSchema = {
        type: 'record',
        name: 'User',
        fields: [
          {name: 'id', type: 'int'},
          {name: 'id', type: 'string'},
        ],
      };
      expect(validator.validateSchema(schema)).toBe(false);
    });
  });

  describe('enum schemas', () => {
    test('validates simple enum schema', () => {
      const schema: AvroEnumSchema = {
        type: 'enum',
        name: 'Color',
        symbols: ['RED', 'GREEN', 'BLUE'],
      };
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('validates enum with default', () => {
      const schema: AvroEnumSchema = {
        type: 'enum',
        name: 'Color',
        symbols: ['RED', 'GREEN', 'BLUE'],
        default: 'RED',
      };
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('rejects enum without symbols', () => {
      const schema: AvroEnumSchema = {
        type: 'enum',
        name: 'Color',
        symbols: [],
      };
      expect(validator.validateSchema(schema)).toBe(false);
    });

    test('rejects enum with duplicate symbols', () => {
      const schema: AvroEnumSchema = {
        type: 'enum',
        name: 'Color',
        symbols: ['RED', 'GREEN', 'RED'],
      };
      expect(validator.validateSchema(schema)).toBe(false);
    });

    test('rejects enum with invalid default', () => {
      const schema: AvroEnumSchema = {
        type: 'enum',
        name: 'Color',
        symbols: ['RED', 'GREEN', 'BLUE'],
        default: 'YELLOW',
      };
      expect(validator.validateSchema(schema)).toBe(false);
    });
  });

  describe('array schemas', () => {
    test('validates simple array schema', () => {
      const schema: AvroArraySchema = {
        type: 'array',
        items: 'string',
      };
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('validates nested array schema', () => {
      const schema: AvroArraySchema = {
        type: 'array',
        items: {
          type: 'array',
          items: 'int',
        },
      };
      expect(validator.validateSchema(schema)).toBe(true);
    });
  });

  describe('map schemas', () => {
    test('validates simple map schema', () => {
      const schema: AvroMapSchema = {
        type: 'map',
        values: 'string',
      };
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('validates complex map schema', () => {
      const schema: AvroMapSchema = {
        type: 'map',
        values: {
          type: 'record',
          name: 'Value',
          fields: [{name: 'data', type: 'string'}],
        },
      };
      expect(validator.validateSchema(schema)).toBe(true);
    });
  });

  describe('union schemas', () => {
    test('validates simple union schema', () => {
      const schema: AvroUnionSchema = ['null', 'string'];
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('validates complex union schema', () => {
      const schema: AvroUnionSchema = [
        'null',
        'string',
        {type: 'record', name: 'User', fields: [{name: 'id', type: 'int'}]},
      ];
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('rejects empty union', () => {
      const schema: AvroUnionSchema = [];
      expect(validator.validateSchema(schema)).toBe(false);
    });

    test('rejects union with duplicate types', () => {
      const schema: AvroUnionSchema = ['string', 'string'];
      expect(validator.validateSchema(schema)).toBe(false);
    });
  });

  describe('fixed schemas', () => {
    test('validates simple fixed schema', () => {
      const schema: AvroFixedSchema = {
        type: 'fixed',
        name: 'Hash',
        size: 16,
      };
      expect(validator.validateSchema(schema)).toBe(true);
    });

    test('rejects fixed with negative size', () => {
      const schema: AvroFixedSchema = {
        type: 'fixed',
        name: 'Hash',
        size: -1,
      };
      expect(validator.validateSchema(schema)).toBe(false);
    });
  });

  describe('value validation', () => {
    test('validates null values', () => {
      expect(validator.validateValue(null, 'null')).toBe(true);
      expect(validator.validateValue(undefined, 'null')).toBe(false);
    });

    test('validates boolean values', () => {
      expect(validator.validateValue(true, 'boolean')).toBe(true);
      expect(validator.validateValue(false, 'boolean')).toBe(true);
      expect(validator.validateValue('true', 'boolean')).toBe(false);
    });

    test('validates int values', () => {
      expect(validator.validateValue(42, 'int')).toBe(true);
      expect(validator.validateValue(-42, 'int')).toBe(true);
      expect(validator.validateValue(2147483647, 'int')).toBe(true);
      expect(validator.validateValue(-2147483648, 'int')).toBe(true);
      expect(validator.validateValue(2147483648, 'int')).toBe(false);
      expect(validator.validateValue(3.14, 'int')).toBe(false);
    });

    test('validates long values', () => {
      expect(validator.validateValue(42, 'long')).toBe(true);
      expect(validator.validateValue(BigInt(42), 'long')).toBe(true);
      expect(validator.validateValue(3.14, 'long')).toBe(false);
    });

    test('validates float and double values', () => {
      expect(validator.validateValue(3.14, 'float')).toBe(true);
      expect(validator.validateValue(42, 'float')).toBe(true);
      expect(validator.validateValue(3.14, 'double')).toBe(true);
      expect(validator.validateValue('3.14', 'float')).toBe(false);
    });

    test('validates bytes values', () => {
      expect(validator.validateValue(new Uint8Array([1, 2, 3]), 'bytes')).toBe(true);
      expect(validator.validateValue([1, 2, 3], 'bytes')).toBe(false);
    });

    test('validates string values', () => {
      expect(validator.validateValue('hello', 'string')).toBe(true);
      expect(validator.validateValue('', 'string')).toBe(true);
      expect(validator.validateValue(42, 'string')).toBe(false);
    });

    test('validates record values', () => {
      const schema: AvroRecordSchema = {
        type: 'record',
        name: 'User',
        fields: [
          {name: 'id', type: 'int'},
          {name: 'name', type: 'string'},
        ],
      };

      expect(validator.validateValue({id: 1, name: 'John'}, schema)).toBe(true);
      expect(validator.validateValue({id: 1}, schema)).toBe(false); // missing required field
      expect(validator.validateValue({id: '1', name: 'John'}, schema)).toBe(false); // wrong type
    });

    test('validates enum values', () => {
      const schema: AvroEnumSchema = {
        type: 'enum',
        name: 'Color',
        symbols: ['RED', 'GREEN', 'BLUE'],
      };

      expect(validator.validateValue('RED', schema)).toBe(true);
      expect(validator.validateValue('YELLOW', schema)).toBe(false);
      expect(validator.validateValue(0, schema)).toBe(false);
    });

    test('validates array values', () => {
      const schema: AvroArraySchema = {
        type: 'array',
        items: 'string',
      };

      expect(validator.validateValue(['a', 'b', 'c'], schema)).toBe(true);
      expect(validator.validateValue([], schema)).toBe(true);
      expect(validator.validateValue(['a', 1, 'c'], schema)).toBe(false);
    });

    test('validates map values', () => {
      const schema: AvroMapSchema = {
        type: 'map',
        values: 'int',
      };

      expect(validator.validateValue({a: 1, b: 2}, schema)).toBe(true);
      expect(validator.validateValue({}, schema)).toBe(true);
      expect(validator.validateValue({a: 1, b: 'two'}, schema)).toBe(false);
    });

    test('validates union values', () => {
      const schema: AvroUnionSchema = ['null', 'string', 'int'];

      expect(validator.validateValue(null, schema)).toBe(true);
      expect(validator.validateValue('hello', schema)).toBe(true);
      expect(validator.validateValue(42, schema)).toBe(true);
      expect(validator.validateValue(3.14, schema)).toBe(false);
    });

    test('validates fixed values', () => {
      const schema: AvroFixedSchema = {
        type: 'fixed',
        name: 'Hash',
        size: 4,
      };

      expect(validator.validateValue(new Uint8Array([1, 2, 3, 4]), schema)).toBe(true);
      expect(validator.validateValue(new Uint8Array([1, 2, 3]), schema)).toBe(false);
      expect(validator.validateValue(new Uint8Array([1, 2, 3, 4, 5]), schema)).toBe(false);
    });
  });
});
