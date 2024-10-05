import {SchemaOf, t} from '..';
import {TypeOf} from '../../schema';
import {NumberType, ObjectFieldType, ObjectType, StringType} from '../classes';

test('number', () => {
  const type = t.Number({
    description: 'A number',
    format: 'i32',
  });
  expect(type.getSchema()).toStrictEqual({
    kind: 'num',
    description: 'A number',
    format: 'i32',
  });
});

test('can construct a array type', () => {
  const type = t.Array(t.Or(t.num, t.str.options({title: 'Just a string'})));
  expect(type.getSchema()).toStrictEqual({
    kind: 'arr',
    type: {
      kind: 'or',
      types: [{kind: 'num'}, {kind: 'str', title: 'Just a string'}],
      discriminator: expect.any(Array),
    },
  });
});

test('array of any with options', () => {
  const type = t.Array(t.any.options({description: 'Any type'})).options({intro: 'An array of any type'});
  expect(type.getSchema()).toStrictEqual({
    kind: 'arr',
    intro: 'An array of any type',
    type: {
      kind: 'any',
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
    kind: 'obj',
    fields: [
      {kind: 'field', key: 'id', type: {kind: 'str'}},
      {kind: 'field', key: 'name', type: {kind: 'str'}, optional: true},
      {kind: 'field', key: 'age', type: {kind: 'num'}, optional: true},
      {kind: 'field', key: 'verified', type: {kind: 'bool'}},
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
      kind: 'num',
      description: 'A number',
      format: 'i32',
    });
    expect(type).toBeInstanceOf(NumberType);
    expect(type.getTypeName()).toBe('num');
    expect(type.getSchema()).toStrictEqual({
      kind: 'num',
      description: 'A number',
      format: 'i32',
    });
  });

  test('can import an object schema', () => {
    const type = t.import({
      kind: 'obj',
      fields: [
        {kind: 'field', key: 'id', type: {kind: 'str'}},
        {kind: 'field', key: 'name', type: {kind: 'str'}, optional: true},
        {kind: 'field', key: 'age', type: {kind: 'num'}, optional: true},
        {kind: 'field', key: 'verified', type: {kind: 'bool'}},
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
      kind: 'obj',
      fields: [
        {kind: 'field', key: 'id', type: {kind: 'str'}},
        {kind: 'field', key: 'name', type: {kind: 'str'}, optional: true},
        {kind: 'field', key: 'age', type: {kind: 'num'}, optional: true},
        {kind: 'field', key: 'verified', type: {kind: 'bool'}},
      ],
    });
  });
});

describe('validateSchema()', () => {
  test('can validate a number schema', () => {
    const schema = {
      kind: 'num',
      description: 'A number',
      format: 'i32',
    };
    expect(t.import(schema as any).validateSchema()).toBeUndefined();
    expect(() => t.import({...schema, description: 123} as any).validateSchema()).toThrow(
      new Error('INVALID_DESCRIPTION'),
    );
    expect(() => t.import({...schema, title: 123} as any).validateSchema()).toThrow(new Error('INVALID_TITLE'));
    expect(() => t.import({...schema, intro: null} as any).validateSchema()).toThrow(new Error('INVALID_INTRO'));
    expect(() => t.import({...schema, gt: null} as any).validateSchema()).toThrow(new Error('GT_TYPE'));
    expect(() => t.import({...schema, lt: null} as any).validateSchema()).toThrow(new Error('LT_TYPE'));
    expect(() => t.import({...schema, gte: '334'} as any).validateSchema()).toThrow(new Error('GTE_TYPE'));
    expect(() => t.import({...schema, lte: '334'} as any).validateSchema()).toThrow(new Error('LTE_TYPE'));
    expect(() => t.import({...schema, lt: 1, gt: 2} as any).validateSchema()).toThrow(new Error('GT_LT'));
    expect(() => t.import({...schema, format: 'int'} as any).validateSchema()).toThrow(new Error('FORMAT_INVALID'));
    expect(() => t.import({...schema, validator: 123} as any).validateSchema()).toThrow(new Error('INVALID_VALIDATOR'));
  });

  test('can validate a string schema', () => {
    const schema = {
      kind: 'str',
      description: 'A string',
    };
    expect(t.import(schema as any).validateSchema()).toBeUndefined();
    expect(() => t.import({...schema, description: 123} as any).validateSchema()).toThrow(
      new Error('INVALID_DESCRIPTION'),
    );
    expect(() => t.import({...schema, title: 123} as any).validateSchema()).toThrow(new Error('INVALID_TITLE'));
    expect(() => t.import({...schema, intro: null} as any).validateSchema()).toThrow(new Error('INVALID_INTRO'));
    expect(() => t.import({...schema, min: null} as any).validateSchema()).toThrow(new Error('MIN_TYPE'));
    expect(() => t.import({...schema, max: 'asdf'} as any).validateSchema()).toThrow(new Error('MAX_TYPE'));
    expect(() => t.import({...schema, min: -1} as any).validateSchema()).toThrow(new Error('MIN_NEGATIVE'));
    expect(() => t.import({...schema, max: -1} as any).validateSchema()).toThrow(new Error('MAX_NEGATIVE'));
    expect(() => t.import({...schema, max: 0.5} as any).validateSchema()).toThrow(new Error('MAX_DECIMAL'));
    expect(() => t.import({...schema, min: 1.2} as any).validateSchema()).toThrow(new Error('MIN_DECIMAL'));
    expect(() => t.import({...schema, min: 5, max: 3} as any).validateSchema()).toThrow(new Error('MIN_MAX'));
    expect(() => t.import({...schema, ascii: 123} as any).validateSchema()).toThrow(new Error('ASCII'));
    expect(() => t.import({...schema, ascii: 'bytes'} as any).validateSchema()).toThrow(new Error('ASCII'));
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
      kind: 'arr',
      description: 'An array',
      type: {kind: 'str', ascii: 'bytes'},
    });
    expect(() => type.validateSchema()).toThrow(new Error('ASCII'));
  });

  test('validates array elements', () => {
    const type = t.import({
      kind: 'arr',
      description: 'An array',
      type: {kind: 'str', ascii: 'bytes'},
    });
    expect(() => type.validateSchema()).toThrow(new Error('ASCII'));
  });

  test('validates object', () => {
    const type = t.import({
      kind: 'obj',
      description: 'An object',
      fields: [],
      unknownFields: 123 as any,
    });
    expect(() => type.validateSchema()).toThrow(new Error('UNKNOWN_FIELDS_TYPE'));
  });

  test('validates object fields', () => {
    const type = t.import({
      kind: 'obj',
      description: 'An object',
      fields: [{kind: 'field', key: 'id', type: {kind: 'str', ascii: 'bytes'} as any}],
    });
    expect(() => type.validateSchema()).toThrow(new Error('ASCII'));
  });

  test('validates object fields - 2', () => {
    const type = t.import({
      kind: 'obj',
      description: 'An object',
      fields: [{kind: 'field', key: 'id', optional: 123, type: {kind: 'str'}} as any],
    });
    expect(() => type.validateSchema()).toThrow(new Error('OPTIONAL_TYPE'));
  });

  test('validates ref', () => {
    const type = t.import({
      kind: 'ref',
    } as any);
    expect(() => type.validateSchema()).toThrow(new Error('REF_TYPE'));
  });

  test('validates or', () => {
    const type = t.import({
      kind: 'or',
      types: [{kind: 'str', ascii: '123'} as any],
      discriminator: ['!', 0],
    });
    expect(() => type.validateSchema()).toThrow(new Error('ASCII'));
  });
});
