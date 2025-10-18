import {b} from '@jsonjoy.com/buffers/lib/b';
import {ValidationError} from '../../../constants';
import {type OrSchema, type Schema, s} from '../../../schema';
import {ModuleType} from '../../../type/classes/ModuleType';
import {ValidatorCodegen, type ValidatorCodegenOptions} from '../ValidatorCodegen';

const exec = (schema: Schema, json: unknown, error: any, options: Partial<ValidatorCodegenOptions> = {}) => {
  const system = new ModuleType();
  const type = system.t.import(schema);

  const fn1 = ValidatorCodegen.get({type, errors: 'boolean', ...options});
  const fn2 = ValidatorCodegen.get({type, errors: 'string', ...options});
  const fn3 = ValidatorCodegen.get({type, errors: 'object', ...options});

  // console.log(fn1.toString());
  // console.log(fn2.toString());
  // console.log(fn3.toString());

  const result1 = fn1(json);
  const result2 = fn2(json);
  const result3 = fn3(json);

  // console.log('result1', result1);
  // console.log('result2', result2);
  // console.log('result3', result3);

  expect(result3).toStrictEqual(error);
  expect(result2).toStrictEqual(!error ? '' : JSON.stringify([error.code, ...error.path]));
  expect(result1).toBe(!!error);
};

test('validates according to schema a POJO object', () => {
  const type = s.Object({
    decodeUnknownKeys: false,
    keys: [
      s.Key(
        'collection',
        s.Object({
          decodeUnknownKeys: false,
          keys: [
            s.Key('id', s.str),
            s.Key('ts', s.num),
            s.Key('cid', s.str),
            s.Key('prid', s.str),
            s.KeyOpt('slug', s.str),
            s.KeyOpt('name', s.str),
            s.KeyOpt('src', s.str),
            s.KeyOpt('authz', s.str),
            s.Key('tags', s.Array(s.str)),
          ],
        }),
      ),
      s.Key('bin.', s.bin),
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

describe('"any" type', () => {
  test('accepts any value', () => {
    const type = s.any;
    exec(type, 123, null);
    exec(type, 'abc', null);
    exec(type, {}, null);
    exec(type, [], null);
    exec(type, null, null);
    exec(type, undefined, null);
  });
});

describe('"con" type', () => {
  test('validates constant value', () => {
    const type = s.Const<'foo'>('foo');
    exec(type, 'foo', null);
    exec(type, 'bar', {
      code: 'CONST',
      errno: ValidationError.CONST,
      message: 'Invalid constant.',
      path: [],
    });
    exec(type, 123, {
      code: 'CONST',
      errno: ValidationError.CONST,
      message: 'Invalid constant.',
      path: [],
    });
    exec(type, null, {
      code: 'CONST',
      errno: ValidationError.CONST,
      message: 'Invalid constant.',
      path: [],
    });
  });

  test('const boolean', () => {
    const type1 = s.Const<true>(true);
    const type2 = s.Const<false>(false);
    exec(type1, true, null);
    exec(type1, false, {
      code: 'CONST',
      errno: ValidationError.CONST,
      message: 'Invalid constant.',
      path: [],
    });
    exec(type1, '123', {
      code: 'CONST',
      errno: ValidationError.CONST,
      message: 'Invalid constant.',
      path: [],
    });
    exec(type1, 123, {
      code: 'CONST',
      errno: ValidationError.CONST,
      message: 'Invalid constant.',
      path: [],
    });
    exec(type2, false, null);
    exec(type2, true, {
      code: 'CONST',
      errno: ValidationError.CONST,
      message: 'Invalid constant.',
      path: [],
    });
    exec(type2, '123', {
      code: 'CONST',
      errno: ValidationError.CONST,
      message: 'Invalid constant.',
      path: [],
    });
    exec(type2, 123, {
      code: 'CONST',
      errno: ValidationError.CONST,
      message: 'Invalid constant.',
      path: [],
    });
  });
});

describe('"bool" type', () => {
  test('boolean', () => {
    const type = s.bool;
    exec(type, true, null);
    exec(type, false, null);
    exec(type, 123, {
      code: 'BOOL',
      errno: ValidationError.BOOL,
      message: 'Not a boolean.',
      path: [],
    });
  });
});

describe('"str" type', () => {
  test('validates a basic string', () => {
    const type = s.str;
    exec(type, '', null);
    exec(type, 'asdf', null);
    exec(type, 123, {
      code: 'STR',
      errno: ValidationError.STR,
      message: 'Not a string.',
      path: [],
    });
    exec(type, null, {
      code: 'STR',
      errno: ValidationError.STR,
      message: 'Not a string.',
      path: [],
    });
  });

  test('validates "min"', () => {
    const type = s.String({min: 3});
    exec(type, 'asdf', null);
    exec(type, '', {
      code: 'STR_LEN',
      errno: ValidationError.STR_LEN,
      message: 'Invalid string length.',
      path: [],
    });
    exec(type, '12', {
      code: 'STR_LEN',
      errno: ValidationError.STR_LEN,
      message: 'Invalid string length.',
      path: [],
    });
  });

  test('validates "max"', () => {
    const type = s.String({max: 5});
    exec(type, '', null);
    exec(type, 'asdf', null);
    exec(type, 'asdfd', null);
    exec(type, 'asdfdf', {
      code: 'STR_LEN',
      errno: ValidationError.STR_LEN,
      message: 'Invalid string length.',
      path: [],
    });
    exec(type, 'aasdf sdfdf', {
      code: 'STR_LEN',
      errno: ValidationError.STR_LEN,
      message: 'Invalid string length.',
      path: [],
    });
  });

  test('validates "min" and "max"', () => {
    const type = s.String({min: 3, max: 5});
    exec(type, 'aaa', null);
    exec(type, 'bbbb', null);
    exec(type, 'vvvvv', null);
    exec(type, '', {
      code: 'STR_LEN',
      errno: ValidationError.STR_LEN,
      message: 'Invalid string length.',
      path: [],
    });
    exec(type, 'asdfdf', {
      code: 'STR_LEN',
      errno: ValidationError.STR_LEN,
      message: 'Invalid string length.',
      path: [],
    });
    exec(type, 'aasdf sdfdf', {
      code: 'STR_LEN',
      errno: ValidationError.STR_LEN,
      message: 'Invalid string length.',
      path: [],
    });
  });

  test('validates "min" and "max" of equal size', () => {
    const type = s.String({min: 4, max: 4});
    exec(type, 'aaa', {
      code: 'STR_LEN',
      errno: ValidationError.STR_LEN,
      message: 'Invalid string length.',
      path: [],
    });
    exec(type, 'bbbb', null);
    exec(type, 'vvvvv', {
      code: 'STR_LEN',
      errno: ValidationError.STR_LEN,
      message: 'Invalid string length.',
      path: [],
    });
    exec(type, '', {
      code: 'STR_LEN',
      errno: ValidationError.STR_LEN,
      message: 'Invalid string length.',
      path: [],
    });
    exec(type, 'asdfdf', {
      code: 'STR_LEN',
      errno: ValidationError.STR_LEN,
      message: 'Invalid string length.',
      path: [],
    });
    exec(type, 'aasdf sdfdf', {
      code: 'STR_LEN',
      errno: ValidationError.STR_LEN,
      message: 'Invalid string length.',
      path: [],
    });
  });
  test('validates minLength and maxLength of equal size', () => {
    const type = s.String({min: 4, max: 4});
    exec(type, 'aaa', {
      code: 'STR_LEN',
      errno: ValidationError.STR_LEN,
      message: 'Invalid string length.',
      path: [],
    });
    exec(type, 'bbbb', null);
    exec(type, 'vvvvv', {
      code: 'STR_LEN',
      errno: ValidationError.STR_LEN,
      message: 'Invalid string length.',
      path: [],
    });
    exec(type, '', {
      code: 'STR_LEN',
      errno: ValidationError.STR_LEN,
      message: 'Invalid string length.',
      path: [],
    });
    exec(type, 'asdfdf', {
      code: 'STR_LEN',
      errno: ValidationError.STR_LEN,
      message: 'Invalid string length.',
      path: [],
    });
    exec(type, 'aasdf sdfdf', {
      code: 'STR_LEN',
      errno: ValidationError.STR_LEN,
      message: 'Invalid string length.',
      path: [],
    });
  });
});

describe('"bin" type', () => {
  test('validates a binary blob', () => {
    const type = s.bin;
    exec(type, b(), null);
    exec(type, b(1, 2, 3), null);
    exec(type, 123, {
      code: 'BIN',
      errno: ValidationError.BIN,
      message: 'Not a binary.',
      path: [],
    });
    exec(type, null, {
      code: 'BIN',
      errno: ValidationError.BIN,
      message: 'Not a binary.',
      path: [],
    });
  });

  test('validates "min"', () => {
    const type = s.Binary(s.any, {min: 3});
    exec(type, b(1, 2, 3, 4), null);
    exec(type, b(), {
      code: 'BIN_LEN',
      errno: ValidationError.BIN_LEN,
      message: 'Invalid binary length.',
      path: [],
    });
    exec(type, b(1, 2), {
      code: 'BIN_LEN',
      errno: ValidationError.BIN_LEN,
      message: 'Invalid binary length.',
      path: [],
    });
  });

  test('validates "max"', () => {
    const type = s.Binary(s.any, {max: 5});
    exec(type, b(), null);
    exec(type, b(1, 2, 3, 4), null);
    exec(type, b(1, 2, 3, 4, 5), null);
    exec(type, b(1, 2, 3, 4, 5, 6), {
      code: 'BIN_LEN',
      errno: ValidationError.BIN_LEN,
      message: 'Invalid binary length.',
      path: [],
    });
    exec(type, b(1, 2, 3, 4, 5, 6, 7, 8, 9), {
      code: 'BIN_LEN',
      errno: ValidationError.BIN_LEN,
      message: 'Invalid binary length.',
      path: [],
    });
  });

  test('validates "min" and "max"', () => {
    const type = s.Binary(s.any, {min: 3, max: 5});
    exec(type, b(1, 2, 3), null);
    exec(type, b(1, 2, 3, 4), null);
    exec(type, b(1, 2, 3, 4, 5), null);
    exec(type, b(), {
      code: 'BIN_LEN',
      errno: ValidationError.BIN_LEN,
      message: 'Invalid binary length.',
      path: [],
    });
    exec(type, b(1, 2, 3, 4, 5, 6), {
      code: 'BIN_LEN',
      errno: ValidationError.BIN_LEN,
      message: 'Invalid binary length.',
      path: [],
    });
    exec(type, b(1, 2, 3, 4, 5, 6, 7, 8, 9), {
      code: 'BIN_LEN',
      errno: ValidationError.BIN_LEN,
      message: 'Invalid binary length.',
      path: [],
    });
  });
});

describe('"num" type', () => {
  test('validates general number type', () => {
    const type = s.num;
    exec(type, 123, null);
    exec(type, -123, null);
    exec(type, 0, null);
    exec(type, '123', {
      code: 'NUM',
      errno: ValidationError.NUM,
      message: 'Not a number.',
      path: [],
    });
    exec(type, '-123', {
      code: 'NUM',
      errno: ValidationError.NUM,
      message: 'Not a number.',
      path: [],
    });
    exec(type, '0', {
      code: 'NUM',
      errno: ValidationError.NUM,
      message: 'Not a number.',
      path: [],
    });
    exec(type, '', {
      code: 'NUM',
      errno: ValidationError.NUM,
      message: 'Not a number.',
      path: [],
    });
    exec(type, null, {
      code: 'NUM',
      errno: ValidationError.NUM,
      message: 'Not a number.',
      path: [],
    });
  });

  test('validates integer type', () => {
    const type = s.Number({format: 'i'});
    exec(type, 123, null);
    exec(type, -123, null);
    exec(type, 0, null);
    exec(type, 123.4, {
      code: 'INT',
      errno: ValidationError.INT,
      message: 'Not an integer.',
      path: [],
    });
    exec(type, -1.1, {
      code: 'INT',
      errno: ValidationError.INT,
      message: 'Not an integer.',
      path: [],
    });
  });

  test('validates unsigned integer type', () => {
    const type = s.Number({format: 'u'});
    exec(type, 123, null);
    exec(type, 0, null);
    exec(type, -123, {
      code: 'UINT',
      errno: ValidationError.UINT,
      message: 'Not an unsigned integer.',
      path: [],
    });
    exec(type, 123.4, {
      code: 'INT',
      errno: ValidationError.INT,
      message: 'Not an integer.',
      path: [],
    });
    exec(type, -1.1, {
      code: 'INT',
      errno: ValidationError.INT,
      message: 'Not an integer.',
      path: [],
    });
  });

  test('validates i8', () => {
    const type = s.Number({format: 'i8'});
    exec(type, 123, null);
    exec(type, 0, null);
    exec(type, -12, null);
    exec(type, 127, null);
    exec(type, -127, null);
    exec(type, -128, null);
    exec(type, 128, {
      code: 'INT',
      errno: ValidationError.INT,
      message: 'Not an integer.',
      path: [],
    });
    exec(type, -129, {
      code: 'INT',
      errno: ValidationError.INT,
      message: 'Not an integer.',
      path: [],
    });
  });

  test('validates u8', () => {
    const type = s.Number({format: 'u8'});
    exec(type, 123, null);
    exec(type, 0, null);
    exec(type, -12, {
      code: 'UINT',
      errno: ValidationError.UINT,
      message: 'Not an unsigned integer.',
      path: [],
    });
    exec(type, 127, null);
    exec(type, 222, null);
    exec(type, 255, null);
    exec(type, 256, {
      code: 'UINT',
      errno: ValidationError.UINT,
      message: 'Not an unsigned integer.',
      path: [],
    });
    exec(type, 333, {
      code: 'UINT',
      errno: ValidationError.UINT,
      message: 'Not an unsigned integer.',
      path: [],
    });
  });

  test('validates i16', () => {
    const type = s.Number({format: 'i16'});
    exec(type, 123, null);
    exec(type, 0x33, null);
    exec(type, 0x3333, null);
    exec(type, -0x33, null);
    exec(type, -0x3333, null);
    exec(type, 0, null);
    exec(type, -44, null);
    exec(type, 0x7fff - 1, null);
    exec(type, 0x7fff, null);
    exec(type, 0x7fff + 1, {
      code: 'INT',
      errno: ValidationError.INT,
      message: 'Not an integer.',
      path: [],
    });
    exec(type, -0x8000 + 1, null);
    exec(type, -0x8000, null);
    exec(type, -0x8000 - 1, {
      code: 'INT',
      errno: ValidationError.INT,
      message: 'Not an integer.',
      path: [],
    });
  });

  test('validates u16', () => {
    const type = s.Number({format: 'u16'});
    exec(type, 123, null);
    exec(type, 0x33, null);
    exec(type, 0x3333, null);
    exec(type, -0x33, {
      code: 'UINT',
      errno: ValidationError.UINT,
      message: 'Not an unsigned integer.',
      path: [],
    });
    exec(type, -0x3333, {
      code: 'UINT',
      errno: ValidationError.UINT,
      message: 'Not an unsigned integer.',
      path: [],
    });
    exec(type, 0, null);
    exec(type, -44, {
      code: 'UINT',
      errno: ValidationError.UINT,
      message: 'Not an unsigned integer.',
      path: [],
    });
    exec(type, 0x7fff - 1, null);
    exec(type, 0x7fff, null);
    exec(type, 0xffff - 1, null);
    exec(type, 0xffff, null);
    exec(type, 0xffff + 1, {
      code: 'UINT',
      errno: ValidationError.UINT,
      message: 'Not an unsigned integer.',
      path: [],
    });
    exec(type, -0x8000 + 1, {
      code: 'UINT',
      errno: ValidationError.UINT,
      message: 'Not an unsigned integer.',
      path: [],
    });
    exec(type, -0x8000, {
      code: 'UINT',
      errno: ValidationError.UINT,
      message: 'Not an unsigned integer.',
      path: [],
    });
  });

  test('validates i32', () => {
    const type = s.Number({format: 'i32'});
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
    exec(type, 0x7fffffff - 1, null);
    exec(type, 0x7fffffff, null);
    exec(type, 0x7fffffff + 1, {
      code: 'INT',
      errno: ValidationError.INT,
      message: 'Not an integer.',
      path: [],
    });
    exec(type, -0x80000000 + 1, null);
    exec(type, -0x80000000, null);
    exec(type, -0x80000000 - 1, {
      code: 'INT',
      errno: ValidationError.INT,
      message: 'Not an integer.',
      path: [],
    });
  });

  test('validates u32', () => {
    const type = s.Number({format: 'u32'});
    exec(type, 123, null);
    exec(type, 0x33, null);
    exec(type, 0x3333, null);
    exec(type, -0x33, {
      code: 'UINT',
      errno: ValidationError.UINT,
      message: 'Not an unsigned integer.',
      path: [],
    });
    exec(type, -0x3333, {
      code: 'UINT',
      errno: ValidationError.UINT,
      message: 'Not an unsigned integer.',
      path: [],
    });
    exec(type, 0, null);
    exec(type, -44, {
      code: 'UINT',
      errno: ValidationError.UINT,
      message: 'Not an unsigned integer.',
      path: [],
    });
    exec(type, 0x7fff - 1, null);
    exec(type, 0x7fff, null);
    exec(type, 0xffff - 1, null);
    exec(type, 0xffff, null);
    exec(type, 0xffffffff, null);
    exec(type, 0xffffffff + 1, {
      code: 'UINT',
      errno: ValidationError.UINT,
      message: 'Not an unsigned integer.',
      path: [],
    });
    exec(type, -0x8000 + 1, {
      code: 'UINT',
      errno: ValidationError.UINT,
      message: 'Not an unsigned integer.',
      path: [],
    });
    exec(type, -0x8000, {
      code: 'UINT',
      errno: ValidationError.UINT,
      message: 'Not an unsigned integer.',
      path: [],
    });
  });

  test('validates i64', () => {
    const type = s.Number({format: 'i64'});
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
    exec(type, -44.123, {
      code: 'INT',
      errno: ValidationError.INT,
      message: 'Not an integer.',
      path: [],
    });
    exec(type, 1.1, {
      code: 'INT',
      errno: ValidationError.INT,
      message: 'Not an integer.',
      path: [],
    });
  });

  test('validates u64', () => {
    const type = s.Number({format: 'u64'});
    exec(type, 123, null);
    exec(type, 0x33, null);
    exec(type, 0x3333, null);
    exec(type, 0x333333, null);
    exec(type, 0x33333333, null);
    exec(type, 0x3333333333, null);
    exec(type, 0x333333333333, null);
    exec(type, -0x33, {
      code: 'UINT',
      errno: ValidationError.UINT,
      message: 'Not an unsigned integer.',
      path: [],
    });
    exec(type, -0x3333, {
      code: 'UINT',
      errno: ValidationError.UINT,
      message: 'Not an unsigned integer.',
      path: [],
    });
    exec(type, -0x333333, {
      code: 'UINT',
      errno: ValidationError.UINT,
      message: 'Not an unsigned integer.',
      path: [],
    });
    exec(type, -0x33333333, {
      code: 'UINT',
      errno: ValidationError.UINT,
      message: 'Not an unsigned integer.',
      path: [],
    });
    exec(type, -0x3333333333, {
      code: 'UINT',
      errno: ValidationError.UINT,
      message: 'Not an unsigned integer.',
      path: [],
    });
    exec(type, -0x333333333333, {
      code: 'UINT',
      errno: ValidationError.UINT,
      message: 'Not an unsigned integer.',
      path: [],
    });
    exec(type, 0, null);
    exec(type, -44.123, {
      code: 'INT',
      errno: ValidationError.INT,
      message: 'Not an integer.',
      path: [],
    });
    exec(type, 1.1, {
      code: 'INT',
      errno: ValidationError.INT,
      message: 'Not an integer.',
      path: [],
    });
  });
});

describe('"arr" type', () => {
  test('can have array of unknown elements', () => {
    const type = s.Array(s.any);
    exec(type, [], null);
    exec(type, [1], null);
    exec(type, [1, 2, 3], null);
    exec(type, [1, 'adsf'], null);
    exec(type, [1, {}], null);
    exec(
      type,
      {},
      {
        code: 'ARR',
        errno: ValidationError.ARR,
        message: 'Not an array.',
        path: [],
      },
    );
    exec(type, null, {
      code: 'ARR',
      errno: ValidationError.ARR,
      message: 'Not an array.',
      path: [],
    });
    exec(type, 123, {
      code: 'ARR',
      errno: ValidationError.ARR,
      message: 'Not an array.',
      path: [],
    });
    exec(type, 'asdf', {
      code: 'ARR',
      errno: ValidationError.ARR,
      message: 'Not an array.',
      path: [],
    });
  });

  test('array of numbers', () => {
    const type = s.Array(s.num);
    exec(type, [], null);
    exec(type, [1], null);
    exec(type, [1, 2, 3], null);
    exec(type, [1, 2.5, -3], null);
    exec(type, [1, 'adsf'], {
      code: 'NUM',
      errno: ValidationError.NUM,
      message: 'Not a number.',
      path: [1],
    });
  });

  test('head 2-tuple', () => {
    const type = s.Tuple([s.num, s.str]);
    exec(type, [0, ''], null);
    exec(type, [1, 'x'], null);
    exec(type, ['', 'x'], {
      code: 'NUM',
      errno: ValidationError.NUM,
      message: 'Not a number.',
      path: [0],
    });
    exec(type, [-1, true], {
      code: 'STR',
      errno: ValidationError.STR,
      message: 'Not a string.',
      path: [1],
    });
  });

  test('named head 2-tuple', () => {
    const type = s.Tuple([s.Key('num', s.num), s.Key('str', s.str)]);
    exec(type, [0, ''], null);
    exec(type, [1, 'x'], null);
    exec(type, ['', 'x'], {
      code: 'NUM',
      errno: ValidationError.NUM,
      message: 'Not a number.',
      path: [0, 'num'],
    });
    exec(type, [-1, true], {
      code: 'STR',
      errno: ValidationError.STR,
      message: 'Not a string.',
      path: [1, 'str'],
    });
  });

  test('head + elements', () => {
    const type = s.Tuple([s.Const<true>(true)], s.num);
    exec(type, [true, 123], null);
    exec(type, [true, 123, 456], null);
    exec(type, [true, 123, '123'], {
      code: 'NUM',
      errno: ValidationError.NUM,
      message: 'Not a number.',
      path: [2],
    });
  });

  test('elements + tail', () => {
    const type = s.Tuple([], s.num, [s.Const<true>(true)]);
    exec(type, [123, true], null);
    exec(type, [123, 456, true], null);
    exec(type, [123, '123', true], {
      code: 'NUM',
      errno: ValidationError.NUM,
      message: 'Not a number.',
      path: [1],
    });
    exec(type, [123, 456, 'true'], {
      code: 'CONST',
      errno: ValidationError.CONST,
      message: 'Invalid constant.',
      path: [2],
    });
  });

  test('head + elements + tail', () => {
    const type = s.Tuple([s.num, s.bool], s.str, [s.bool]);
    exec(type, [123, true, false], null);
    exec(type, [123, true, 'hello', false], null);
    exec(type, [123, true, 'hello', 'world', false], null);
    exec(type, [123, true, 456, false], {
      code: 'STR',
      errno: ValidationError.STR,
      message: 'Not a string.',
      path: [2],
    });
    exec(type, [123, true, 'hello', 456, false], {
      code: 'STR',
      errno: ValidationError.STR,
      message: 'Not a string.',
      path: [3],
    });
    exec(type, [123, true, 'hello', null], {
      code: 'BOOL',
      errno: ValidationError.BOOL,
      message: 'Not a boolean.',
      path: [3],
    });
    exec(type, ['', true, 'hello', null], {
      code: 'NUM',
      errno: ValidationError.NUM,
      message: 'Not a number.',
      path: [0],
    });
  });
});

describe('"obj" type', () => {
  test('object can have unknown fields', () => {
    const type = s.obj;
    exec(type, {}, null);
    exec(type, {a: 'b'}, null);
  });

  test('"null" is not of type "obj"', () => {
    const type = s.obj;
    exec(type, null, {
      code: 'OBJ',
      errno: ValidationError.OBJ,
      message: 'Not an object.',
      path: [],
    });
  });

  test('object can have a field of any type', () => {
    const type = s.Object({
      keys: [s.Key('foo', s.any)],
    });
    exec(type, {foo: 123}, null);
    exec(type, {foo: null}, null);
    exec(type, {foo: 'asdf'}, null);
    exec(
      type,
      {},
      {
        code: 'KEY',
        errno: ValidationError.KEY,
        message: 'Missing key.',
        path: ['foo'],
      },
    );
  });

  test('can detect extra properties in object', () => {
    const type = s.Object({
      keys: [s.Key('foo', s.any), s.KeyOpt('zup', s.any)],
    });
    exec(type, {foo: 123}, null);
    exec(type, {foo: 123, zup: 'asdf'}, null);
    exec(
      type,
      {foo: 123, bar: 'asdf'},
      {
        code: 'KEYS',
        errno: ValidationError.KEYS,
        message: 'Too many or missing object keys.',
        path: ['bar'],
      },
      undefined,
    );
  });

  test('can disable extra property check', () => {
    const type = s.Object({
      keys: [s.Key('foo', s.any), s.KeyOpt('zup', s.any)],
    });
    exec(type, {foo: 123}, null, {skipObjectExtraFieldsCheck: true});
    exec(type, {foo: 123, zup: 'asdf'}, null, {
      skipObjectExtraFieldsCheck: true,
    });
    exec(type, {foo: 123, bar: 'asdf'}, null, {
      skipObjectExtraFieldsCheck: true,
    });
    exec(type, {foo: 123, zup: '1', bar: 'asdf'}, null, {
      skipObjectExtraFieldsCheck: true,
    });
  });
});

describe('"map" type', () => {
  test('can have a map of unknown values', () => {
    const type = s.Map(s.any);
    exec(type, {}, null);
    exec(type, {a: 'b'}, null);
    exec(type, {a: 123}, null);
    exec(type, {a: null}, null);
    exec(type, {a: {}}, null);
    exec(type, {a: []}, null);
    exec(type, [], {
      code: 'MAP',
      errno: ValidationError.MAP,
      message: 'Not a map.',
      path: [],
    });
  });

  test('can have a map of numbers', () => {
    const type = s.Map(s.num);
    exec(type, {}, null);
    exec(type, {a: 123}, null);
    exec(type, {a: -123}, null);
    exec(type, {a: 0}, null);
    exec(
      type,
      {a: '123'},
      {
        code: 'NUM',
        errno: ValidationError.NUM,
        message: 'Not a number.',
        path: ['a'],
      },
    );
    exec(
      type,
      {_: 123, a: '123'},
      {
        code: 'NUM',
        errno: ValidationError.NUM,
        message: 'Not a number.',
        path: ['a'],
      },
    );
  });
});

describe('"or" type', () => {
  test('a single type', () => {
    const type = s.Or(s.num);
    exec(type, 123, null);
    exec(type, 0, null);
    exec(type, '', {
      code: 'NUM',
      errno: ValidationError.NUM,
      message: 'Not a number.',
      path: [],
    });
  });

  test('checks inner type', () => {
    const type = s.Or(s.Object(s.Key('type', s.Const<'num'>('num')), s.Key('foo', s.num)), s.num);
    exec(type, {type: 'num', foo: 123}, null);
    exec(
      type,
      {type: 'num', foo: '123'},
      {
        code: 'NUM',
        errno: ValidationError.NUM,
        message: 'Not a number.',
        path: ['foo'],
      },
    );
  });

  test('object key can be of multiple types', () => {
    const type = s.Object({
      keys: [
        s.Key('foo', {
          ...s.Or(s.num, s.str),
          discriminator: [
            'if',
            ['==', 'number', ['type', ['get', '']]],
            0,
            ['if', ['==', 'string', ['type', ['get', '']]], 1, -1],
          ],
        }),
      ],
    });
    exec(type, {foo: 123}, null);
    exec(type, {foo: '123'}, null);
    exec(
      type,
      {foo: false},
      {
        code: 'OR',
        errno: ValidationError.OR,
        message: 'None of types matched.',
        path: ['foo'],
      },
    );
  });

  test('array can be of multiple types', () => {
    const type = s.Object({
      keys: [
        s.Key(
          'gg',
          s.Array({
            ...s.Or(s.num, s.str),
            discriminator: [
              'if',
              ['==', 'number', ['type', ['get', '']]],
              0,
              ['if', ['==', 'string', ['type', ['get', '']]], 1, -1],
            ],
          }),
        ),
      ],
    });
    exec(type, {gg: []}, null);
    exec(type, {gg: [1]}, null);
    exec(type, {gg: [1, 2]}, null);
    exec(type, {gg: [1, '3', '']}, null);
    exec(
      type,
      {gg: [1, '3', false]},
      {
        code: 'OR',
        errno: ValidationError.OR,
        message: 'None of types matched.',
        path: ['gg', 2],
      },
    );
  });

  test('root value can be of multiple types', () => {
    const type = {
      ...s.Or(s.num, s.str, s.obj),
      discriminator: [
        'if',
        ['==', 'number', ['type', ['get', '']]],
        0,
        ['if', ['==', 'string', ['type', ['get', '']]], 1, ['if', ['==', 'object', ['type', ['get', '']]], 2, -1]],
      ],
    } as OrSchema;
    exec(type, 123, null);
    exec(type, 'asdf', null);
    exec(type, {}, null);
    exec(type, {foo: 'bar'}, null);
    exec(type, [], {
      code: 'OR',
      errno: ValidationError.OR,
      message: 'None of types matched.',
      path: [],
    });
    exec(type, null, {
      code: 'OR',
      errno: ValidationError.OR,
      message: 'None of types matched.',
      path: [],
    });
  });
});

describe('"ref" type', () => {
  test('a single type', () => {
    const system = new ModuleType();
    system.t
      .object({
        foo: system.t.string(),
      })
      .alias('TheObject');
    const type = system.t.object({
      x: system.t.Ref('TheObject'),
    });
    const validator = ValidatorCodegen.get({type, errors: 'object'});
    expect(validator({x: {foo: 'bar'}})).toBe(null);
    expect(validator({x: {foo: 123}})).toMatchObject({
      code: 'REF',
      path: ['x'],
      ref: {
        code: 'STR',
        path: ['foo'],
      },
    });
  });
});

describe('single root element', () => {
  test('null', () => {
    const type = s.nil;
    exec(type, null, null);
    exec(type, '123', {
      code: 'CONST',
      errno: ValidationError.CONST,
      message: 'Invalid constant.',
      path: [],
    });
  });

  test('number', () => {
    const type = s.num;
    exec(type, 123, null);
    exec(type, 1.123, null);
    exec(type, -123, null);
    exec(type, -5.5, null);
    exec(type, '123', {
      code: 'NUM',
      errno: ValidationError.NUM,
      message: 'Not a number.',
      path: [],
    });
  });

  test('const number', () => {
    const type = s.Const<66>(66);
    exec(type, 66, null);
    exec(type, 67, {
      code: 'CONST',
      errno: ValidationError.CONST,
      message: 'Invalid constant.',
      path: [],
    });
  });

  test('falsy const number', () => {
    const type = s.Const<0>(0);
    exec(type, 0, null);
    exec(type, 1, {
      code: 'CONST',
      errno: ValidationError.CONST,
      message: 'Invalid constant.',
      path: [],
    });
  });

  test('string', () => {
    const type = s.str;
    exec(type, '', null);
    exec(type, 'a', null);
    exec(type, 'asdf', null);
    exec(type, 123, {
      code: 'STR',
      errno: ValidationError.STR,
      message: 'Not a string.',
      path: [],
    });
  });

  test('const string', () => {
    const type = s.Const<'asdf'>('asdf');
    exec(type, 'asdf', null);
    exec(type, '', {
      code: 'CONST',
      errno: ValidationError.CONST,
      message: 'Invalid constant.',
      path: [],
    });
    exec(type, 123, {
      code: 'CONST',
      errno: ValidationError.CONST,
      message: 'Invalid constant.',
      path: [],
    });
  });

  test('falsy const string', () => {
    const type = s.Const<''>('');
    exec(type, '', null);
    exec(type, 'asdf', {
      code: 'CONST',
      errno: ValidationError.CONST,
      message: 'Invalid constant.',
      path: [],
    });
    exec(type, 123, {
      code: 'CONST',
      errno: ValidationError.CONST,
      message: 'Invalid constant.',
      path: [],
    });
  });
});

describe('custom validators', () => {
  test('can specify a custom validator for a string', () => {
    const system = new ModuleType();
    const type = system.t.String().validator((value) => value !== 'a', 'is-a');
    const validator = ValidatorCodegen.get({type, errors: 'object'});
    const res1 = validator('a');
    expect(res1).toStrictEqual(null);
    const res2 = validator('b');
    expect(res2).toStrictEqual({
      code: 'VALIDATION',
      errno: ValidationError.VALIDATION,
      message: 'Custom validator failed.',
      path: [],
      validator: 'is-a',
      ref: true,
    });
  });

  test('can specify multiple validators', () => {
    const system = new ModuleType();
    const type = system.t.str
      .validator((value) => value !== 'a' && value !== 'b', 'is-ab')
      .validator((value) => value !== 'a', 'is-a');
    const validator = ValidatorCodegen.get({type, errors: 'object'});
    const res1 = validator('a');
    const res2 = validator('b');
    const res3 = validator('c');
    expect(res1).toStrictEqual(null);
    expect(res2).toStrictEqual({
      code: 'VALIDATION',
      errno: ValidationError.VALIDATION,
      message: 'Custom validator failed.',
      path: [],
      validator: 'is-a',
      ref: true,
    });
    expect(res3).toStrictEqual({
      code: 'VALIDATION',
      errno: ValidationError.VALIDATION,
      message: 'Custom validator failed.',
      path: [],
      validator: 'is-ab',
      ref: true,
    });
  });

  test('returns the error, which validator throws', () => {
    const system = new ModuleType();
    const type = system.t.Object(
      system.t.Key(
        'id',
        system.t.str.validator((id: string): void => {
          if (!/^[a-z]+$/.test(id)) throw new Error('Asset ID must be a string.');
        }, 'assetId'),
      ),
    );
    const validator = ValidatorCodegen.get({type, errors: 'object'});
    expect(validator({id: 'xxxxxxx'})).toBe(null);
    expect(validator({id: '123'})).toStrictEqual({
      code: 'VALIDATION',
      errno: ValidationError.VALIDATION,
      message: 'Custom validator failed.',
      path: ['id'],
      ref: new Error('Asset ID must be a string.'),
      validator: 'assetId',
    });
  });

  test('returns the error, which validator throws, even inside a "ref" type', () => {
    const system = new ModuleType();
    system.t.str
      .validator((id: string) => {
        if (id === 'xxxxxxx') return;
        if (id === 'y') return;
        throw new Error('Asset ID must be a string.');
      }, 'assetId')
      .alias('ID');
    const type = system.t.Object(system.t.Key('id', system.t.Ref('ID')));
    const validator = ValidatorCodegen.get({type, errors: 'object'});
    expect(validator({id: 'xxxxxxx'})).toBe(null);
    expect(validator({id: 'y'})).toBe(null);
    expect(validator({id: '123'})).toStrictEqual({
      code: 'REF',
      errno: ValidationError.REF,
      message: 'Validation error in referenced type.',
      path: ['id'],
      refId: 'ID',
      ref: {
        code: 'VALIDATION',
        errno: ValidationError.VALIDATION,
        message: 'Custom validator failed.',
        path: [],
        validator: 'assetId',
        ref: new Error('Asset ID must be a string.'),
      },
    });
  });
});
