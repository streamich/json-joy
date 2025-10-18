import {of} from 'rxjs';
import {type SchemaOf, t} from '..';
import type {NumSchema, TypeOf} from '../../schema';
import {validateSchema} from '../../schema/validate';
import {NumType, ObjType, StrType} from '../classes';
import {KeyType} from '../classes/ObjType';

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

describe('"fn" kind', () => {
  test('can use shorthand to define function', () => {
    const type1 = t.fn.title('My Function').inp(t.str).out(t.num);
    const type2 = t.Function(t.str, t.num, {title: 'My Function'});
    expect(type1.getSchema()).toEqual(type2.getSchema());
  });

  test('can use shorthand to define a streaming function', () => {
    const type1 = t.fn$.title('My Function').inp(t.str).out(t.num);
    const type2 = t.Function$(t.str, t.num, {title: 'My Function'});
    expect(type1.getSchema()).toEqual(type2.getSchema());
  });

  test('can set function implementation', () => {
    const _fn1 = t.fn
      .input(t.object({id: t.str}))
      .output(t.num)
      .title('My Function')
      .default(async ({id}) => {
        return 42;
      })
      .default(({id}) => 42)
      .description('This is a function that returns a number based on the input id.');
    const _fn2 = t.fn$
      .input(t.object({id: t.str}))
      .output(t.num)
      .title('My Rx Function')
      .default(() => {
        return of(42);
      });
    // console.log(fn1 + '');
    // console.log(fn2 + '');
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
  const type = t.Object(t.Key('id', t.str), t.KeyOpt('name', t.str), t.KeyOpt('age', t.num), t.Key('verified', t.bool));
  expect(type.getSchema()).toStrictEqual({
    kind: 'obj',
    keys: [
      {kind: 'key', key: 'id', value: {kind: 'str'}},
      {kind: 'key', key: 'name', value: {kind: 'str'}, optional: true},
      {kind: 'key', key: 'age', value: {kind: 'num'}, optional: true},
      {kind: 'key', key: 'verified', value: {kind: 'bool'}},
    ],
  });
  type T = TypeOf<SchemaOf<typeof type>>;
  const _val: T = {
    id: 'abc',
    verified: true,
  };
});

test('can build type using lowercase shortcuts', () => {
  const MyObject = t
    .object({
      type: t.con('user'),
      id: t.string(),
      name: t.string(),
      age: t.number(),
      coordinates: t.tuple(t.number(), t.number()),
      verified: t.boolean(),
      offsets: t.array(t.number()),
      enum: t.enum(1, 2, 'three'),
      optional: t.maybe(t.string()),
    })
    .opt('description', t.string());
  // console.log(MyObject + '');
  const MyObject2 = t.obj
    .prop('type', t.Const('user'))
    .prop('id', t.str)
    .prop('name', t.str)
    .prop('age', t.num)
    .prop('coordinates', t.Tuple([t.num, t.num]))
    .prop('verified', t.bool)
    .prop('offsets', t.array(t.num))
    .prop('enum', t.or(t.Const(1), t.Const(2), t.Const('three')))
    .prop('optional', t.or(t.str, t.undef))
    .opt('description', t.str);
  expect(MyObject.getSchema()).toEqual(MyObject2.getSchema());
  // type ObjType = t.infer<typeof MyObject>;
  // type ObjType2 = t.infer<typeof MyObject2>;
  // const obj: ObjType = {
  //   type: 'user',
  //   id: '123',
  //   name: 'Test',
  //   coordinates: [1.23, 4.56],
  //   age: 30,
  //   verified: true,
  //   offsets: [1, 2, 3],
  //   enum: 'three',
  //   optional: undefined,
  // } satisfies ObjType2;
});

test('can specify function with context', () => {
  const MyObject = t.object({
    fn: t.fn.inp(t.str).out(t.undef).ctx<{ip: string}>(),
  });
  // console.log(MyObject + '');
  const MyObject2 = t.obj.prop('fn', t.Function(t.str, t.undef).ctx<{ip: string}>());
  expect(MyObject.getSchema()).toEqual(MyObject2.getSchema());
  type ObjType = t.infer<typeof MyObject>;
  type ObjType2 = t.infer<typeof MyObject2>;
  const _obj: ObjType = {
    fn: async (req: string, ctx: {ip: string}): Promise<void> => {},
  } satisfies ObjType2;
});

describe('import()', () => {
  test('can import a number schema', () => {
    const type = t.import({
      kind: 'num',
      description: 'A number',
      format: 'i32',
    });
    expect(type).toBeInstanceOf(NumType);
    expect(type.kind()).toBe('num');
    expect(type.getSchema()).toStrictEqual({
      kind: 'num',
      description: 'A number',
      format: 'i32',
    });
  });

  test('can import an object schema', () => {
    const type = t.import({
      kind: 'obj',
      keys: [
        {kind: 'key', key: 'id', value: {kind: 'str'}},
        {kind: 'key', key: 'name', value: {kind: 'str'}, optional: true},
        {kind: 'key', key: 'age', value: {kind: 'num'}, optional: true},
        {kind: 'key', key: 'verified', value: {kind: 'bool'}},
      ],
    }) as ObjType<any>;
    expect(type).toBeInstanceOf(ObjType);
    expect(type.kind()).toBe('obj');
    const id = type.getField('id')!;
    expect(id).toBeInstanceOf(KeyType);
    expect(id.kind()).toBe('key');
    expect(id.val).toBeInstanceOf(StrType);
    expect(id.val.kind()).toBe('str');
    expect(type.getSchema()).toStrictEqual({
      kind: 'obj',
      keys: [
        {kind: 'key', key: 'id', value: {kind: 'str'}},
        {kind: 'key', key: 'name', value: {kind: 'str'}, optional: true},
        {kind: 'key', key: 'age', value: {kind: 'num'}, optional: true},
        {kind: 'key', key: 'verified', value: {kind: 'bool'}},
      ],
    });
  });
});

describe('validateSchema()', () => {
  test('can validate a number schema', () => {
    const schema: NumSchema = {
      kind: 'num',
      description: 'A number',
      format: 'i32',
    };
    expect(validateSchema(t.import(schema).getSchema())).toBeUndefined();
    expect(() => validateSchema({...schema, description: 123} as any)).toThrow(new Error('INVALID_DESCRIPTION'));
    expect(() => validateSchema({...schema, title: 123} as any)).toThrow(new Error('INVALID_TITLE'));
    expect(() => validateSchema({...schema, intro: null} as any)).toThrow(new Error('INVALID_INTRO'));
    expect(() => validateSchema({...schema, gt: null} as any)).toThrow(new Error('GT_TYPE'));
    expect(() => validateSchema({...schema, lt: null} as any)).toThrow(new Error('LT_TYPE'));
    expect(() => validateSchema({...schema, gte: '334'} as any)).toThrow(new Error('GTE_TYPE'));
    expect(() => validateSchema({...schema, lte: '334'} as any)).toThrow(new Error('LTE_TYPE'));
    expect(() => validateSchema({...schema, lt: 1, gt: 2} as any)).toThrow(new Error('GT_LT'));
    expect(() => validateSchema({...schema, format: 'int'} as any)).toThrow(new Error('FORMAT_INVALID'));
  });

  test('can validate a string schema', () => {
    const schema = {
      kind: 'str',
      description: 'A string',
    };
    expect(validateSchema({...schema} as any)).toBeUndefined();
    expect(() => validateSchema({...schema, description: 123} as any)).toThrow(new Error('INVALID_DESCRIPTION'));
    expect(() => validateSchema({...schema, title: 123} as any)).toThrow(new Error('INVALID_TITLE'));
    expect(() => validateSchema({...schema, intro: null} as any)).toThrow(new Error('INVALID_INTRO'));
    expect(() => validateSchema({...schema, min: null} as any)).toThrow(new Error('MIN_TYPE'));
    expect(() => validateSchema({...schema, max: 'asdf'} as any)).toThrow(new Error('MAX_TYPE'));
    expect(() => validateSchema({...schema, min: -1} as any)).toThrow(new Error('MIN_NEGATIVE'));
    expect(() => validateSchema({...schema, max: -1} as any)).toThrow(new Error('MAX_NEGATIVE'));
    expect(() => validateSchema({...schema, max: 0.5} as any)).toThrow(new Error('MAX_DECIMAL'));
    expect(() => validateSchema({...schema, min: 1.2} as any)).toThrow(new Error('MIN_DECIMAL'));
    expect(() => validateSchema({...schema, min: 5, max: 3} as any)).toThrow(new Error('MIN_MAX'));
    expect(() => validateSchema({...schema, ascii: 123} as any)).toThrow(new Error('ASCII'));
    expect(() => validateSchema({...schema, ascii: 'bytes'} as any)).toThrow(new Error('ASCII'));
  });

  test('validates an arbitrary self-constructed object', () => {
    const type = t.Object(
      t.Key('id', t.String()),
      t.Key('name', t.String({title: 'Name'})),
      t.Key('age', t.Number({format: 'u16'})),
    );
    validateSchema(type.getSchema());
  });

  test('validates array elements', () => {
    const type = t.import({
      kind: 'arr',
      description: 'An array',
      type: {kind: 'str', ascii: 'bytes'},
    });
    expect(() => validateSchema(type.getSchema())).toThrow(new Error('ASCII'));
  });

  test('validates array elements', () => {
    const type = t.import({
      kind: 'arr',
      description: 'An array',
      type: {kind: 'str', ascii: 'bytes'},
    });
    expect(() => validateSchema(type.getSchema())).toThrow(new Error('ASCII'));
  });

  test('validates object', () => {
    const type = t.import({
      kind: 'obj',
      description: 'An object',
      keys: [],
      decodeUnknownKeys: 123 as any,
    });
    expect(() => validateSchema(type.getSchema())).toThrow(new Error('DECODE_UNKNOWN_KEYS_TYPE'));
  });

  test('validates object fields', () => {
    const type = t.import({
      kind: 'obj',
      description: 'An object',
      keys: [
        {
          kind: 'key',
          key: 'id',
          value: {kind: 'str', ascii: 'bytes'} as any,
        },
      ],
    });
    expect(() => validateSchema(type.getSchema())).toThrow(new Error('ASCII'));
  });

  test('validates object fields - 2', () => {
    const type = t.import({
      kind: 'obj',
      description: 'An object',
      keys: [
        {
          kind: 'key',
          key: 'id',
          optional: 123,
          value: {kind: 'str'},
        } as any,
      ],
    });
    expect(() => validateSchema(type.getSchema())).toThrow(new Error('OPTIONAL_TYPE'));
  });

  test('validates ref', () => {
    const type = t.import({
      kind: 'ref',
    } as any);
    expect(() => validateSchema(type.getSchema())).toThrow(new Error('REF_TYPE'));
  });

  test('validates or', () => {
    const type = t.import({
      kind: 'or',
      types: [{kind: 'str', ascii: '123'} as any],
      discriminator: ['!', 0],
    });
    expect(() => validateSchema(type.getSchema())).toThrow(new Error('ASCII'));
  });
});
