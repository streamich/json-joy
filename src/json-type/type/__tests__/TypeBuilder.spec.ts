import {SchemaOf, t} from '..';
import {TypeOf} from '../../schema';
import {NumberType, ObjectFieldType, ObjectType, StringType} from '../classes';

test('number', () => {
  const type = t.Number({
    description: 'A number',
    format: 'i32',
  });
  expect(type.getSchema()).toStrictEqual({
    __t: 'num',
    description: 'A number',
    format: 'i32',
  });
});

test('can construct a array type', () => {
  const type = t.Array(t.Or(t.num, t.str.options({title: 'Just a string'})));
  expect(type.getSchema()).toStrictEqual({
    __t: 'arr',
    type: {
      __t: 'or',
      types: [{__t: 'num'}, {__t: 'str', title: 'Just a string'}],
      discriminator: expect.any(Array),
    },
  });
});

test('array of any with options', () => {
  const type = t.Array(t.any.options({description: 'Any type'})).options({intro: 'An array of any type'});
  expect(type.getSchema()).toStrictEqual({
    __t: 'arr',
    intro: 'An array of any type',
    type: {
      __t: 'any',
      description: 'Any type',
    },
  });
});

test('can construct a realistic object', () => {
  const type = t.Object(
    t.prop('id', t.str),
    t.propOpt('name', t.str),
    t.propOpt('age', t.num),
    t.prop('verified', t.bool),
  );
  expect(type.getSchema()).toStrictEqual({
    __t: 'obj',
    fields: [
      {__t: 'field', key: 'id', type: {__t: 'str'}},
      {__t: 'field', key: 'name', type: {__t: 'str'}, optional: true},
      {__t: 'field', key: 'age', type: {__t: 'num'}, optional: true},
      {__t: 'field', key: 'verified', type: {__t: 'bool'}},
    ],
  });
  type T = TypeOf<SchemaOf<typeof type>>;
  const val: T = {
    id: 'abc',
    verified: true,
  };
});

describe('import()', () => {
  test('can import a number schema', () => {
    const type = t.import({
      __t: 'num',
      description: 'A number',
      format: 'i32',
    });
    expect(type).toBeInstanceOf(NumberType);
    expect(type.getTypeName()).toBe('num');
    expect(type.getSchema()).toStrictEqual({
      __t: 'num',
      description: 'A number',
      format: 'i32',
    });
  });

  test('can import an object schema', () => {
    const type = t.import({
      __t: 'obj',
      fields: [
        {__t: 'field', key: 'id', type: {__t: 'str'}},
        {__t: 'field', key: 'name', type: {__t: 'str'}, optional: true},
        {__t: 'field', key: 'age', type: {__t: 'num'}, optional: true},
        {__t: 'field', key: 'verified', type: {__t: 'bool'}},
      ],
    }) as ObjectType<any>;
    expect(type).toBeInstanceOf(ObjectType);
    expect(type.getTypeName()).toBe('obj');
    const id = type.getField('id')!;
    expect(id).toBeInstanceOf(ObjectFieldType);
    expect(id.getTypeName()).toBe('field');
    expect(id.value).toBeInstanceOf(StringType);
    expect(id.value.getTypeName()).toBe('str');
    expect(type.getSchema()).toStrictEqual({
      __t: 'obj',
      fields: [
        {__t: 'field', key: 'id', type: {__t: 'str'}},
        {__t: 'field', key: 'name', type: {__t: 'str'}, optional: true},
        {__t: 'field', key: 'age', type: {__t: 'num'}, optional: true},
        {__t: 'field', key: 'verified', type: {__t: 'bool'}},
      ],
    });
  });
});

describe('validateSchema()', () => {
  test('can validate a number schema', () => {
    const schema = {
      __t: 'num',
      description: 'A number',
      format: 'i32',
    };
    expect(t.import(schema as any).validateSchema()).toBeUndefined();
    expect(() => t.import({...schema, description: 123} as any).validateSchema()).toThrowErrorMatchingInlineSnapshot(
      `"INVALID_DESCRIPTION"`,
    );
    expect(() => t.import({...schema, title: 123} as any).validateSchema()).toThrowErrorMatchingInlineSnapshot(
      `"INVALID_TITLE"`,
    );
    expect(() => t.import({...schema, intro: null} as any).validateSchema()).toThrowErrorMatchingInlineSnapshot(
      `"INVALID_INTRO"`,
    );
    expect(() => t.import({...schema, gt: null} as any).validateSchema()).toThrowErrorMatchingInlineSnapshot(
      `"GT_TYPE"`,
    );
    expect(() => t.import({...schema, lt: null} as any).validateSchema()).toThrowErrorMatchingInlineSnapshot(
      `"LT_TYPE"`,
    );
    expect(() => t.import({...schema, gte: '334'} as any).validateSchema()).toThrowErrorMatchingInlineSnapshot(
      `"GTE_TYPE"`,
    );
    expect(() => t.import({...schema, lte: '334'} as any).validateSchema()).toThrowErrorMatchingInlineSnapshot(
      `"LTE_TYPE"`,
    );
    expect(() => t.import({...schema, lt: 1, gt: 2} as any).validateSchema()).toThrowErrorMatchingInlineSnapshot(
      `"GT_LT"`,
    );
    expect(() => t.import({...schema, format: 'int'} as any).validateSchema()).toThrowErrorMatchingInlineSnapshot(
      `"FORMAT_INVALID"`,
    );
    expect(() => t.import({...schema, validator: 123} as any).validateSchema()).toThrowErrorMatchingInlineSnapshot(
      `"INVALID_VALIDATOR"`,
    );
  });

  test('can validate a string schema', () => {
    const schema = {
      __t: 'str',
      description: 'A string',
    };
    expect(t.import(schema as any).validateSchema()).toBeUndefined();
    expect(() => t.import({...schema, description: 123} as any).validateSchema()).toThrowErrorMatchingInlineSnapshot(
      `"INVALID_DESCRIPTION"`,
    );
    expect(() => t.import({...schema, title: 123} as any).validateSchema()).toThrowErrorMatchingInlineSnapshot(
      `"INVALID_TITLE"`,
    );
    expect(() => t.import({...schema, intro: null} as any).validateSchema()).toThrowErrorMatchingInlineSnapshot(
      `"INVALID_INTRO"`,
    );
    expect(() => t.import({...schema, min: null} as any).validateSchema()).toThrowErrorMatchingInlineSnapshot(
      `"MIN_TYPE"`,
    );
    expect(() => t.import({...schema, max: 'asdf'} as any).validateSchema()).toThrowErrorMatchingInlineSnapshot(
      `"MAX_TYPE"`,
    );
    expect(() => t.import({...schema, min: -1} as any).validateSchema()).toThrowErrorMatchingInlineSnapshot(
      `"MIN_NEGATIVE"`,
    );
    expect(() => t.import({...schema, max: -1} as any).validateSchema()).toThrowErrorMatchingInlineSnapshot(
      `"MAX_NEGATIVE"`,
    );
    expect(() => t.import({...schema, max: 0.5} as any).validateSchema()).toThrowErrorMatchingInlineSnapshot(
      `"MAX_DECIMAL"`,
    );
    expect(() => t.import({...schema, min: 1.2} as any).validateSchema()).toThrowErrorMatchingInlineSnapshot(
      `"MIN_DECIMAL"`,
    );
    expect(() => t.import({...schema, min: 5, max: 3} as any).validateSchema()).toThrowErrorMatchingInlineSnapshot(
      `"MIN_MAX"`,
    );
    expect(() => t.import({...schema, ascii: 123} as any).validateSchema()).toThrowErrorMatchingInlineSnapshot(
      `"ASCII"`,
    );
    expect(() => t.import({...schema, ascii: 'bytes'} as any).validateSchema()).toThrowErrorMatchingInlineSnapshot(
      `"ASCII"`,
    );
  });

  test('validates an arbitrary self-constructed object', () => {
    const type = t.Object(
      t.prop('id', t.String()),
      t.prop('name', t.String({title: 'Name'})),
      t.prop('age', t.Number({format: 'u16'})),
    );
    type.validateSchema();
  });

  test('validates array elements', () => {
    const type = t.import({
      __t: 'arr',
      description: 'An array',
      type: {__t: 'str', ascii: 'bytes'},
    });
    expect(() => type.validateSchema()).toThrowErrorMatchingInlineSnapshot(`"ASCII"`);
  });

  test('validates array elements', () => {
    const type = t.import({
      __t: 'arr',
      description: 'An array',
      type: {__t: 'str', ascii: 'bytes'},
    });
    expect(() => type.validateSchema()).toThrowErrorMatchingInlineSnapshot(`"ASCII"`);
  });

  test('validates object', () => {
    const type = t.import({
      __t: 'obj',
      description: 'An object',
      fields: [],
      unknownFields: 123 as any,
    });
    expect(() => type.validateSchema()).toThrowErrorMatchingInlineSnapshot(`"UNKNOWN_FIELDS_TYPE"`);
  });

  test('validates object fields', () => {
    const type = t.import({
      __t: 'obj',
      description: 'An object',
      fields: [{__t: 'field', key: 'id', type: {__t: 'str', ascii: 'bytes'} as any}],
    });
    expect(() => type.validateSchema()).toThrowErrorMatchingInlineSnapshot(`"ASCII"`);
  });

  test('validates object fields - 2', () => {
    const type = t.import({
      __t: 'obj',
      description: 'An object',
      fields: [{__t: 'field', key: 'id', optional: 123, type: {__t: 'str'}} as any],
    });
    expect(() => type.validateSchema()).toThrowErrorMatchingInlineSnapshot(`"OPTIONAL_TYPE"`);
  });

  test('validates ref', () => {
    const type = t.import({
      __t: 'ref',
    } as any);
    expect(() => type.validateSchema()).toThrowErrorMatchingInlineSnapshot(`"REF_TYPE"`);
  });

  test('validates or', () => {
    const type = t.import({
      __t: 'or',
      types: [{__t: 'str', ascii: '123'} as any],
      discriminator: ['!', 0],
    });
    expect(() => type.validateSchema()).toThrowErrorMatchingInlineSnapshot(`"ASCII"`);
  });
});
