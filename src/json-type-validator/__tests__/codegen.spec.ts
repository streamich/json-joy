import {t, TType} from '../../json-type';
import {
  createBoolValidator,
  createStrValidator,
  createObjValidator,
  ObjectValidatorError,
  ObjectValidatorSuccess,
  JsonTypeValidatorError,
  JsonTypeValidatorCodegenOptions,
} from '..';

const exec = (
  type: TType,
  json: unknown,
  error: ObjectValidatorSuccess | ObjectValidatorError,
  options: Omit<JsonTypeValidatorCodegenOptions, 'errorReporting'> = {},
) => {
  const fn1 = createBoolValidator(type, options);
  const fn2 = createStrValidator(type, options);
  const fn3 = createObjValidator(type, options);

  // console.log(fn1.toString());
  // console.log(fn2.toString());
  // console.log(fn3.toString());

  const result3 = fn3(json);
  const result2 = fn2(json);
  const result1 = fn1(json);

  // console.log('result1', result1);
  // console.log('result2', result2);
  // console.log('result3', result3);

  expect(result3).toStrictEqual(error);
  expect(result2).toStrictEqual(!error ? '' : JSON.stringify([error.code, ...error.path]));
  expect(result1).toBe(!!error);
};

test('validates according to schema a POJO object', () => {
  const type = t.Object({
    unknownFields: false,
    fields: [
      t.Field(
        'collection',
        t.Object({
          unknownFields: false,
          fields: [
            t.Field('id', t.str),
            t.Field('ts', t.num),
            t.Field('cid', t.str),
            t.Field('prid', t.str),
            t.Field('slug', t.str, {isOptional: true}),
            t.Field('name', t.str, {isOptional: true}),
            t.Field('src', t.str, {isOptional: true}),
            t.Field('authz', t.str, {isOptional: true}),
            t.Field('tags', t.Array(t.str)),
          ],
        }),
      ),
      t.Field('bin.', t.bin),
    ],
  });
  const json = {
    collection: {
      id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      ts: Date.now(),
      cid: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      prid: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      slug: 'slug-name',
      name: 'Super collection',
      src: '{"foo": "bar"}',
      authz: 'export const (ctx) => ctx.userId === "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";',
      tags: ['foo', 'bar'],
    },
    'bin.': new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
  };
  exec(type, json, null);
});

test('can have array of unknown elements', () => {
  const type = t.Array(t.any);
  exec(type, [], null);
  exec(type, [1], null);
  exec(type, [1, 2, 3], null);
  exec(type, [1, 'adsf'], null);
  exec(type, [1, {}], null);
  exec(type, {}, {code: 'ARR', errno: JsonTypeValidatorError.ARR, message: 'Not an array.', path: []});
  exec(type, null, {code: 'ARR', errno: JsonTypeValidatorError.ARR, message: 'Not an array.', path: []});
  exec(type, 123, {code: 'ARR', errno: JsonTypeValidatorError.ARR, message: 'Not an array.', path: []});
  exec(type, 'asdf', {code: 'ARR', errno: JsonTypeValidatorError.ARR, message: 'Not an array.', path: []});
});

test('object can have a field of any type', () => {
  const type = t.Object({
    fields: [t.Field('foo', t.any)],
  });
  exec(type, {foo: 123}, null);
  exec(type, {foo: null}, null);
  exec(type, {foo: 'asdf'}, null);
  exec(type, {}, {code: 'KEY', errno: JsonTypeValidatorError.KEY, message: 'Missing key.', path: ['foo']});
});

test('can detect extra properties in object', () => {
  const type = t.Object({
    fields: [t.Field('foo', t.any), t.Field('zup', t.any, {isOptional: true})],
  });
  exec(type, {foo: 123}, null);
  exec(type, {foo: 123, zup: 'asdf'}, null);
  exec(
    type,
    {foo: 123, bar: 'asdf'},
    {code: 'KEYS', errno: 10, message: 'Too many or missing object keys.', path: ['bar']},
  );
});

test('can disable extra property check', () => {
  const type = t.Object({
    fields: [t.Field('foo', t.any), t.Field('zup', t.any, {isOptional: true})],
  });
  exec(type, {foo: 123}, null, {skipObjectExtraFieldsCheck: true});
  exec(type, {foo: 123, zup: 'asdf'}, null, {skipObjectExtraFieldsCheck: true});
  exec(type, {foo: 123, bar: 'asdf'}, null, {skipObjectExtraFieldsCheck: true});
  exec(type, {foo: 123, zup: '1', bar: 'asdf'}, null, {skipObjectExtraFieldsCheck: true});
});


describe('"str" type', () => {
  test('validates a basic string', () => {
    const type = t.str;
    exec(type, '', null);
    exec(type, 'asdf', null);
    exec(type, 123, {code: 'STR', errno: JsonTypeValidatorError.STR, message: 'Not a string.', path: []});
    exec(type, null, {code: 'STR', errno: JsonTypeValidatorError.STR, message: 'Not a string.', path: []});
  });

  test('validates minLength', () => {
    const type = t.String({minLength: 3});
    exec(type, 'asdf', null);
    exec(type, '', {code: 'STR_LEN', errno: JsonTypeValidatorError.STR_LEN, message: 'Invalid string length.', path: []});
    exec(type, '12', {code: 'STR_LEN', errno: JsonTypeValidatorError.STR_LEN, message: 'Invalid string length.', path: []});
  });

  test('validates maxLength', () => {
    const type = t.String({maxLength: 5});
    exec(type, '', null);
    exec(type, 'asdf', null);
    exec(type, 'asdfd', null);
    exec(type, 'asdfdf', {code: 'STR_LEN', errno: JsonTypeValidatorError.STR_LEN, message: 'Invalid string length.', path: []});
    exec(type, 'aasdf sdfdf', {code: 'STR_LEN', errno: JsonTypeValidatorError.STR_LEN, message: 'Invalid string length.', path: []});
  });

  test('validates minLength and maxLength', () => {
    const type = t.String({minLength: 3, maxLength: 5});
    exec(type, 'aaa', null);
    exec(type, 'bbbb', null);
    exec(type, 'vvvvv', null);
    exec(type, '', {code: 'STR_LEN', errno: JsonTypeValidatorError.STR_LEN, message: 'Invalid string length.', path: []});
    exec(type, 'asdfdf', {code: 'STR_LEN', errno: JsonTypeValidatorError.STR_LEN, message: 'Invalid string length.', path: []});
    exec(type, 'aasdf sdfdf', {code: 'STR_LEN', errno: JsonTypeValidatorError.STR_LEN, message: 'Invalid string length.', path: []});
  });

  test('validates minLength and maxLength of equal size', () => {
    const type = t.String({minLength: 4, maxLength: 4});
    exec(type, 'aaa', {code: 'STR_LEN', errno: JsonTypeValidatorError.STR_LEN, message: 'Invalid string length.', path: []});
    exec(type, 'bbbb', null);
    exec(type, 'vvvvv', {code: 'STR_LEN', errno: JsonTypeValidatorError.STR_LEN, message: 'Invalid string length.', path: []});
    exec(type, '', {code: 'STR_LEN', errno: JsonTypeValidatorError.STR_LEN, message: 'Invalid string length.', path: []});
    exec(type, 'asdfdf', {code: 'STR_LEN', errno: JsonTypeValidatorError.STR_LEN, message: 'Invalid string length.', path: []});
    exec(type, 'aasdf sdfdf', {code: 'STR_LEN', errno: JsonTypeValidatorError.STR_LEN, message: 'Invalid string length.', path: []});
  });

  test('throws on invalid length values', () => {
    expect(() => createBoolValidator(t.String({minLength: 4, maxLength: 3}))).toThrow();
    expect(() => createBoolValidator(t.String({maxLength: 3.1}))).toThrow();
    expect(() => createBoolValidator(t.String({maxLength: -1}))).toThrow();
    expect(() => createBoolValidator(t.String({minLength: -1}))).toThrow();
    expect(() => createBoolValidator(t.String({minLength: 2.2}))).toThrow();
  });
});

describe('"num" type', () => {
  test('validates general number type', () => {
    const type = t.num;
    exec(type, 123, null);
    exec(type, -123, null);
    exec(type, 0, null);
    exec(type, '123', {code: 'NUM', errno: JsonTypeValidatorError.NUM, message: 'Not a number.', path: []});
    exec(type, '-123', {code: 'NUM', errno: JsonTypeValidatorError.NUM, message: 'Not a number.', path: []});
    exec(type, '0', {code: 'NUM', errno: JsonTypeValidatorError.NUM, message: 'Not a number.', path: []});
    exec(type, '', {code: 'NUM', errno: JsonTypeValidatorError.NUM, message: 'Not a number.', path: []});
    exec(type, null, {code: 'NUM', errno: JsonTypeValidatorError.NUM, message: 'Not a number.', path: []});
  });

  test('validates integer type', () => {
    const type = t.Number({format: 'i'})
    exec(type, 123, null);
    exec(type, -123, null);
    exec(type, 0, null);
    exec(type, 123.4, {code: 'INT', errno: JsonTypeValidatorError.INT, message: 'Not an integer.', path: []});
    exec(type, -1.1, {code: 'INT', errno: JsonTypeValidatorError.INT, message: 'Not an integer.', path: []});
  });

  test('validates unsigned integer type', () => {
    const type = t.Number({format: 'u'})
    exec(type, 123, null);
    exec(type, 0, null);
    exec(type, -123, {code: 'UINT', errno: JsonTypeValidatorError.UINT, message: 'Not an unsigned integer.', path: []});
    exec(type, 123.4, {code: 'INT', errno: JsonTypeValidatorError.INT, message: 'Not an integer.', path: []});
    exec(type, -1.1, {code: 'INT', errno: JsonTypeValidatorError.INT, message: 'Not an integer.', path: []});
  });

  test('validates i8', () => {
    const type = t.Number({format: 'i8'})
    exec(type, 123, null);
    exec(type, 0, null);
    exec(type, -12, null);
    exec(type, 127, null);
    exec(type, -127, null);
    exec(type, -128, null);
    exec(type, 128, {code: 'INT', errno: JsonTypeValidatorError.INT, message: 'Not an integer.', path: []});
    exec(type, -129, {code: 'INT', errno: JsonTypeValidatorError.INT, message: 'Not an integer.', path: []});
  });

  test('validates u8', () => {
    const type = t.Number({format: 'u8'})
    exec(type, 123, null);
    exec(type, 0, null);
    exec(type, -12, {code: 'UINT', errno: JsonTypeValidatorError.UINT, message: 'Not an unsigned integer.', path: []});
    exec(type, 127, null);
    exec(type, 222, null);
    exec(type, 255, null);
    exec(type, 256, {code: 'UINT', errno: JsonTypeValidatorError.UINT, message: 'Not an unsigned integer.', path: []});
    exec(type, 333, {code: 'UINT', errno: JsonTypeValidatorError.UINT, message: 'Not an unsigned integer.', path: []});
  });

  test('validates i16', () => {
    const type = t.Number({format: 'i16'})
    exec(type, 123, null);
    exec(type, 0x33, null);
    exec(type, 0x3333, null);
    exec(type, -0x33, null);
    exec(type, -0x3333, null);
    exec(type, 0, null);
    exec(type, -44, null);
    exec(type, 0x7FFF - 1, null);
    exec(type, 0x7FFF, null);
    exec(type, 0x7FFF + 1, {code: 'INT', errno: JsonTypeValidatorError.INT, message: 'Not an integer.', path: []});
    exec(type, -0x8000 + 1, null);
    exec(type, -0x8000, null);
    exec(type, -0x8000 - 1, {code: 'INT', errno: JsonTypeValidatorError.INT, message: 'Not an integer.', path: []});
  });

  test('validates u16', () => {
    const type = t.Number({format: 'u16'})
    exec(type, 123, null);
    exec(type, 0x33, null);
    exec(type, 0x3333, null);
    exec(type, -0x33, {code: 'UINT', errno: JsonTypeValidatorError.UINT, message: 'Not an unsigned integer.', path: []});
    exec(type, -0x3333, {code: 'UINT', errno: JsonTypeValidatorError.UINT, message: 'Not an unsigned integer.', path: []});
    exec(type, 0, null);
    exec(type, -44, {code: 'UINT', errno: JsonTypeValidatorError.UINT, message: 'Not an unsigned integer.', path: []});
    exec(type, 0x7FFF - 1, null);
    exec(type, 0x7FFF, null);
    exec(type, 0xFFFF - 1, null);
    exec(type, 0xFFFF, null);
    exec(type, 0xFFFF + 1, {code: 'UINT', errno: JsonTypeValidatorError.UINT, message: 'Not an unsigned integer.', path: []});
    exec(type, -0x8000 + 1, {code: 'UINT', errno: JsonTypeValidatorError.UINT, message: 'Not an unsigned integer.', path: []});
    exec(type, -0x8000, {code: 'UINT', errno: JsonTypeValidatorError.UINT, message: 'Not an unsigned integer.', path: []});
  });

  test('validates i32', () => {
    const type = t.Number({format: 'i32'})
    exec(type, 123, null);
    exec(type, 0x33, null);
    exec(type, 0x3333, null);
    exec(type, 0x333333, null);
    exec(type, 0x33333333, null);
    exec(type, -0x33, null);
    exec(type, -0x3333, null);
    exec(type, -0x333333, null);
    exec(type, -0x33333333, null);
    exec(type, 0, null);
    exec(type, -44, null);
    exec(type, 0x7FFFFFFF - 1, null);
    exec(type, 0x7FFFFFFF, null);
    exec(type, 0x7FFFFFFF + 1, {code: 'INT', errno: JsonTypeValidatorError.INT, message: 'Not an integer.', path: []});
    exec(type, -0x80000000 + 1, null);
    exec(type, -0x80000000, null);
    exec(type, -0x80000000 - 1, {code: 'INT', errno: JsonTypeValidatorError.INT, message: 'Not an integer.', path: []});
  });

  test('validates u32', () => {
    const type = t.Number({format: 'u32'})
    exec(type, 123, null);
    exec(type, 0x33, null);
    exec(type, 0x3333, null);
    exec(type, -0x33, {code: 'UINT', errno: JsonTypeValidatorError.UINT, message: 'Not an unsigned integer.', path: []});
    exec(type, -0x3333, {code: 'UINT', errno: JsonTypeValidatorError.UINT, message: 'Not an unsigned integer.', path: []});
    exec(type, 0, null);
    exec(type, -44, {code: 'UINT', errno: JsonTypeValidatorError.UINT, message: 'Not an unsigned integer.', path: []});
    exec(type, 0x7FFF - 1, null);
    exec(type, 0x7FFF, null);
    exec(type, 0xFFFF - 1, null);
    exec(type, 0xFFFF, null);
    exec(type, 0xFFFFFFFF, null);
    exec(type, 0xFFFFFFFF + 1, {code: 'UINT', errno: JsonTypeValidatorError.UINT, message: 'Not an unsigned integer.', path: []});
    exec(type, -0x8000 + 1, {code: 'UINT', errno: JsonTypeValidatorError.UINT, message: 'Not an unsigned integer.', path: []});
    exec(type, -0x8000, {code: 'UINT', errno: JsonTypeValidatorError.UINT, message: 'Not an unsigned integer.', path: []});
  });

  test('validates i64', () => {
    const type = t.Number({format: 'i64'})
    exec(type, 123, null);
    exec(type, 0x33, null);
    exec(type, 0x3333, null);
    exec(type, 0x333333, null);
    exec(type, 0x33333333, null);
    exec(type, 0x3333333333, null);
    exec(type, 0x333333333333, null);
    exec(type, -0x33, null);
    exec(type, -0x3333, null);
    exec(type, -0x333333, null);
    exec(type, -0x33333333, null);
    exec(type, -0x3333333333, null);
    exec(type, -0x333333333333, null);
    exec(type, 0, null);
    exec(type, -44.123, {code: 'INT', errno: JsonTypeValidatorError.INT, message: 'Not an integer.', path: []});
    exec(type, 1.1, {code: 'INT', errno: JsonTypeValidatorError.INT, message: 'Not an integer.', path: []});
  });

  test('validates u64', () => {
    const type = t.Number({format: 'u64'})
    exec(type, 123, null);
    exec(type, 0x33, null);
    exec(type, 0x3333, null);
    exec(type, 0x333333, null);
    exec(type, 0x33333333, null);
    exec(type, 0x3333333333, null);
    exec(type, 0x333333333333, null);
    exec(type, -0x33, {code: 'UINT', errno: JsonTypeValidatorError.UINT, message: 'Not an unsigned integer.', path: []});
    exec(type, -0x3333, {code: 'UINT', errno: JsonTypeValidatorError.UINT, message: 'Not an unsigned integer.', path: []});
    exec(type, -0x333333, {code: 'UINT', errno: JsonTypeValidatorError.UINT, message: 'Not an unsigned integer.', path: []});
    exec(type, -0x33333333, {code: 'UINT', errno: JsonTypeValidatorError.UINT, message: 'Not an unsigned integer.', path: []});
    exec(type, -0x3333333333, {code: 'UINT', errno: JsonTypeValidatorError.UINT, message: 'Not an unsigned integer.', path: []});
    exec(type, -0x333333333333, {code: 'UINT', errno: JsonTypeValidatorError.UINT, message: 'Not an unsigned integer.', path: []});
    exec(type, 0, null);
    exec(type, -44.123, {code: 'INT', errno: JsonTypeValidatorError.INT, message: 'Not an integer.', path: []});
    exec(type, 1.1, {code: 'INT', errno: JsonTypeValidatorError.INT, message: 'Not an integer.', path: []});
  });
});

describe('"ref" type', () => {
  test('can be used to reference other types', () => {
    const userType = t.Object({
      id: 'User',
      fields: [t.Field('id', t.str), t.Field('name', t.str)],
    });
    const type = t.Object({
      id: 'UserResponse',
      fields: [t.Field('user', t.Ref('User'))],
    });
    const userValidator = createObjValidator(userType, {
      skipObjectExtraFieldsCheck: true,
      unsafeMode: true,
    });
    const userResponseValidator = createObjValidator(type, {
      skipObjectExtraFieldsCheck: true,
      unsafeMode: true,
      ref: (ref) => (ref === 'User' ? userValidator : undefined),
    });
    const json1 = {
      user: {
        id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        name: 'Super user',
      },
    };
    expect(userResponseValidator(json1)).toBe(null);
    const json2 = {
      user: {
        id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      },
    };
    expect(userResponseValidator(json2)).toEqual({
      type: 'UserResponse',
      code: 'REF',
      errno: 13,
      message: 'Validation error in referenced type.',
      path: ['user'],
      ref: {
        type: 'User',
        code: 'STR',
        errno: 0,
        message: 'Not a string.',
        path: ['name'],
      },
    });
  });

  test('throws on missing ref resolver', () => {
    const type = t.Object({
      id: 'UserResponse',
      fields: [t.Field('user', t.Ref('User'))],
    });
    const callback = () =>
      createObjValidator(type, {
        skipObjectExtraFieldsCheck: true,
        unsafeMode: true,
      });
    expect(callback).toThrow(
      new Error('Could not resolve validator for [ref = User]. Provide it through .ref option.'),
    );
  });
});

describe('"or" type', () => {
  test('object key can be of multiple types', () => {
    const type = t.Object({
      fields: [t.Field('foo', t.Or(t.num, t.str))],
    });
    exec(type, {foo: 123}, null);
    exec(type, {foo: '123'}, null);
    exec(
      type,
      {foo: false},
      {code: 'OR', errno: JsonTypeValidatorError.OR, message: 'None of types matched.', path: ['foo']},
    );
  });

  test('array can be of multiple types', () => {
    const type = t.Object({
      fields: [t.Field('gg', t.Array(t.Or(t.num, t.str)))],
    });
    exec(type, {gg: []}, null);
    exec(type, {gg: [1]}, null);
    exec(type, {gg: [1, 2]}, null);
    exec(type, {gg: [1, '3', '']}, null);
    exec(
      type,
      {gg: [1, '3', false]},
      {code: 'OR', errno: JsonTypeValidatorError.OR, message: 'None of types matched.', path: ['gg', 2]},
    );
  });

  test('root value can be of multiple types', () => {
    const type = t.Or(t.str, t.num, t.obj);
    exec(type, 123, null);
    exec(type, 'asdf', null);
    exec(type, {}, null);
    exec(type, {foo: 'bar'}, null);
    exec(type, [], {code: 'OR', errno: 12, message: 'None of types matched.', path: []});
    exec(type, null, {code: 'OR', errno: 12, message: 'None of types matched.', path: []});
  });
});

describe('"obj" type', () => {
  test('object can have unknown fields', () => {
    const type = t.obj;
    exec(type, {}, null);
    exec(type, {a: 'b'}, null);
  });

  test('"null" is not of type "obj"', () => {
    const type = t.obj;
    exec(type, null, {code: 'OBJ', errno: 8, message: 'Not an object.', path: []});
  });
});

describe('"enum" type', () => {
  test('can create a basic enum type', () => {
    const type = t.Enum(['a', 'b', 'c']);
    exec(type, 'a', null);
    exec(type, 'b', null);
    exec(type, 'c', null);
    exec(type, 'd', {code: 'ENUM', errno: 14, message: 'Not an enum value.', path: []});
  });

  test('enum can be a complex object', () => {
    const type = t.Enum([{foo: 'bar'}, [5]]);
    exec(type, 'd', {code: 'ENUM', errno: 14, message: 'Not an enum value.', path: []});
    exec(type, {}, {code: 'ENUM', errno: 14, message: 'Not an enum value.', path: []});
    exec(type, {foo: 'baz'}, {code: 'ENUM', errno: 14, message: 'Not an enum value.', path: []});
    exec(type, {foo: 'bar'}, null);
    exec(type, [], {code: 'ENUM', errno: 14, message: 'Not an enum value.', path: []});
    exec(type, [5.5], {code: 'ENUM', errno: 14, message: 'Not an enum value.', path: []});
    exec(type, [5], null);
  });

  test('throws on empty "enum"', () => {
    const type = {__t: 'enum', values: []};
    const callback = () => exec(type, 1, null);
    expect(callback).toThrow(new Error('Enum values are not specified.'));
  });

  test('"enum" can be part of an object', () => {
    const type = t.Object([
      t.Field('op', t.Enum(['add', 'replace', 'test'])),
      t.Field('path', t.str),
      t.Field('value', t.any),
    ]);
    exec(type, {op: 'add', path: '/foo/bar', value: 123}, null);
    exec(type, {op: 'replace', path: '/foo/bar', value: 123}, null);
    exec(type, {op: 'test', path: '/foo/bar', value: 123}, null);
    exec(
      type,
      {op: 'delete', path: '/foo/bar', value: 123},
      {code: 'ENUM', errno: 14, message: 'Not an enum value.', path: ['op']},
    );
  });
});

describe('single root element', () => {
  test('null', () => {
    const type = t.nil;
    exec(type, null, null);
    exec(type, '123', {code: 'NIL', errno: JsonTypeValidatorError.NIL, message: 'Not null.', path: []});
  });

  test('number', () => {
    const type = t.num;
    exec(type, 123, null);
    exec(type, 1.123, null);
    exec(type, -123, null);
    exec(type, -5.5, null);
    exec(type, '123', {code: 'NUM', errno: JsonTypeValidatorError.NUM, message: 'Not a number.', path: []});
  });

  test('const number', () => {
    const type = t.Number({const: 66});
    exec(type, 66, null);
    exec(type, 67, {
      code: 'NUM_CONST',
      errno: JsonTypeValidatorError.NUM_CONST,
      message: 'Invalid number constant.',
      path: [],
    });
  });

  test('falsy const number', () => {
    const type = t.Number({const: 0});
    exec(type, 0, null);
    exec(type, 1, {
      code: 'NUM_CONST',
      errno: JsonTypeValidatorError.NUM_CONST,
      message: 'Invalid number constant.',
      path: [],
    });
  });

  test('string', () => {
    const type = t.str;
    exec(type, '', null);
    exec(type, 'a', null);
    exec(type, 'asdf', null);
    exec(type, 123, {code: 'STR', errno: JsonTypeValidatorError.STR, message: 'Not a string.', path: []});
  });

  test('const string', () => {
    const type = t.String({const: 'asdf'});
    exec(type, 'asdf', null);
    exec(type, '', {
      code: 'STR_CONST',
      errno: JsonTypeValidatorError.STR_CONST,
      message: 'Invalid string constant.',
      path: [],
    });
    exec(type, 123, {
      code: 'STR_CONST',
      errno: JsonTypeValidatorError.STR_CONST,
      message: 'Invalid string constant.',
      path: [],
    });
  });

  test('falsy const string', () => {
    const type = t.String({const: ''});
    exec(type, '', null);
    exec(type, 'asdf', {
      code: 'STR_CONST',
      errno: JsonTypeValidatorError.STR_CONST,
      message: 'Invalid string constant.',
      path: [],
    });
    exec(type, 123, {
      code: 'STR_CONST',
      errno: JsonTypeValidatorError.STR_CONST,
      message: 'Invalid string constant.',
      path: [],
    });
  });

  test('boolean', () => {
    const type = t.bool;
    exec(type, true, null);
    exec(type, false, null);
    exec(type, 123, {code: 'BOOL', errno: JsonTypeValidatorError.BOOL, message: 'Not a boolean.', path: []});
  });

  test('const boolean', () => {
    const type1 = t.Boolean({const: true});
    const type2 = t.Boolean({const: false});
    exec(type1, true, null);
    exec(type1, false, {
      code: 'BOOL_CONST',
      errno: JsonTypeValidatorError.BOOL_CONST,
      message: 'Invalid boolean constant.',
      path: [],
    });
    exec(type1, '123', {
      code: 'BOOL_CONST',
      errno: JsonTypeValidatorError.BOOL_CONST,
      message: 'Invalid boolean constant.',
      path: [],
    });
    exec(type1, 123, {
      code: 'BOOL_CONST',
      errno: JsonTypeValidatorError.BOOL_CONST,
      message: 'Invalid boolean constant.',
      path: [],
    });
    exec(type2, false, null);
    exec(type2, true, {
      code: 'BOOL_CONST',
      errno: JsonTypeValidatorError.BOOL_CONST,
      message: 'Invalid boolean constant.',
      path: [],
    });
    exec(type2, '123', {
      code: 'BOOL_CONST',
      errno: JsonTypeValidatorError.BOOL_CONST,
      message: 'Invalid boolean constant.',
      path: [],
    });
    exec(type2, 123, {
      code: 'BOOL_CONST',
      errno: JsonTypeValidatorError.BOOL_CONST,
      message: 'Invalid boolean constant.',
      path: [],
    });
  });
});

describe('validators', () => {
  test('can specify a custom validator for a string', () => {
    const type = t.String({
      validator: 'is-a',
    });
    const validator = createObjValidator(type, {
      customValidators: [
        {
          name: 'is-a',
          types: ['string'],
          fn: (value) => (value === 'a' ? false : true),
        },
      ],
    });
    const res1 = validator('a');
    expect(res1).toStrictEqual(null);
    const res2 = validator('b');
    expect(res2).toStrictEqual({
      code: 'VALIDATION',
      errno: 15,
      message: 'Custom validator failed.',
      path: [],
      validator: 'is-a',
      ref: true,
    });
  });

  test('can specify multiple validators', () => {
    const type = t.String({
      validator: ['is-ab', 'is-a'],
    });
    const validator = createObjValidator(type, {
      customValidators: [
        {
          name: 'is-ab',
          types: ['string'],
          fn: (value) => (value === 'a' || value === 'b' ? false : true),
        },
        {
          name: 'is-a',
          types: ['string'],
          fn: (value) => (value === 'a' ? false : true),
        },
      ],
    });
    const res1 = validator('a');
    const res2 = validator('b');
    const res3 = validator('c');
    expect(res1).toStrictEqual(null);
    expect(res2).toStrictEqual({
      code: 'VALIDATION',
      errno: 15,
      message: 'Custom validator failed.',
      path: [],
      validator: 'is-a',
      ref: true,
    });
    expect(res3).toStrictEqual({
      code: 'VALIDATION',
      errno: 15,
      message: 'Custom validator failed.',
      path: [],
      validator: 'is-ab',
      ref: true,
    });
  });

  test('throws if custom validator is not provided', () => {
    const type = t.Object([
      t.Field(
        'id',
        t.String({
          validator: ['assetId'],
        }),
      ),
    ]);
    const callback = () => createObjValidator(type, {});
    expect(callback).toThrow(new Error('Custom validator "assetId" not found.'));
  });

  test('returns the error, which validator throws', () => {
    const type = t.Object([
      t.Field(
        'id',
        t.String({
          validator: ['assetId'],
        }),
      ),
    ]);
    const validator = createObjValidator(type, {
      customValidators: [
        {
          name: 'assetId',
          types: ['string'],
          fn: (id: string): void => {
            if (!/^[a-z]+$/.test(id)) throw new Error('Asset ID must be a string.');
          },
        },
      ],
    });
    expect(validator({id: 'xxxxxxx'})).toBe(null);
    expect(validator({id: '123'})).toStrictEqual({
      code: 'VALIDATION',
      errno: 15,
      message: 'Custom validator failed.',
      path: ['id'],
      ref: new Error('Asset ID must be a string.'),
      validator: 'assetId',
    });
  });

  test('returns the error, which validator throws, even inside a "ref" type', () => {
    const idType = t.String('ID', {validator: 'assetId'});
    const type = t.Object([t.Field('id', t.Ref('ID'))]);
    const idValidator = createObjValidator(idType, {
      customValidators: [
        {
          name: 'assetId',
          types: ['string'],
          fn: (id: string) => {
            if (id === 'xxxxxxx') return;
            if (id === 'y') return;
            throw new Error('Asset ID must be a string.');
          },
        },
      ],
    });
    const validator = createObjValidator(type, {
      ref: (id) => {
        if (id === 'ID') return idValidator;
        return undefined;
      },
    });
    expect(validator({id: 'xxxxxxx'})).toBe(null);
    expect(validator({id: 'y'})).toBe(null);
    expect(validator({id: '123'})).toStrictEqual({
      code: 'REF',
      errno: 13,
      message: 'Validation error in referenced type.',
      path: ['id'],
      ref: {
        type: 'ID',
        code: 'VALIDATION',
        errno: 15,
        message: 'Custom validator failed.',
        path: [],
        validator: 'assetId',
        ref: new Error('Asset ID must be a string.'),
      },
    });
  });
});
