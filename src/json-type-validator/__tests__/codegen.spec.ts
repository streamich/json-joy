import {t} from '../../json-type/type';
import {createBoolValidator, createStrValidator, createObjValidator, ObjectValidatorError, ObjectValidatorSuccess, JsonTypeValidatorError} from '..';
import {TType} from '../../json-type/types/json';

const exec = (type: TType, json: unknown, error: ObjectValidatorSuccess | ObjectValidatorError) => {
  const fn1 = createBoolValidator(type);
  const fn2 = createStrValidator(type);
  const fn3 = createObjValidator(type);

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
      t.Field('collection', t.Object({
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
      })),
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
    fields: [
      t.Field('foo', t.any),
    ],
  });
  exec(type, {foo: 123}, null);
  exec(type, {foo: null}, null);
  exec(type, {foo: 'asdf'}, null);
  exec(type, {}, {code: 'KEY', errno: JsonTypeValidatorError.KEY, message: 'Missing key.', path: ['foo']});
});

describe('OR type', () => {
  test('object key can be of multiple types', () => {
    const type = t.Object({
      fields: [
        t.Field('foo', [t.num, t.str]),
      ],
    });
    exec(type, {foo: 123}, null);
    exec(type, {foo: '123'}, null);
    exec(type, {foo: false}, {code: 'OR', errno: JsonTypeValidatorError.OR, message: 'None of types matched.', path: ['foo']});
  });

  test('array can be of multiple types', () => {
    const type = t.Object({
      fields: [
        t.Field('gg', t.Array([t.num, t.str])),
      ],
    });
    exec(type, {gg: []}, null);
    exec(type, {gg: [1]}, null);
    exec(type, {gg: [1, 2]}, null);
    exec(type, {gg: [1, '3', '']}, null);
    exec(type, {gg: [1, '3', false]}, {code: 'OR', errno: JsonTypeValidatorError.OR, message: 'None of types matched.', path: ['gg', 2]});
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
    exec(type, 67, {code: 'NUM_CONST', errno: JsonTypeValidatorError.NUM_CONST, message: 'Invalid number constant.', path: []});
  });

  test('falsy const number', () => {
    const type = t.Number({const: 0});
    exec(type, 0, null);
    exec(type, 1, {code: 'NUM_CONST', errno: JsonTypeValidatorError.NUM_CONST, message: 'Invalid number constant.', path: []});
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
    exec(type, '', {code: 'STR_CONST', errno: JsonTypeValidatorError.STR_CONST, message: 'Invalid string constant.', path: []});
    exec(type, 123, {code: 'STR_CONST', errno: JsonTypeValidatorError.STR_CONST, message: 'Invalid string constant.', path: []});
  });

  test('falsy const string', () => {
    const type = t.String({const: ''});
    exec(type, '', null);
    exec(type, 'asdf', {code: 'STR_CONST', errno: JsonTypeValidatorError.STR_CONST, message: 'Invalid string constant.', path: []});
    exec(type, 123, {code: 'STR_CONST', errno: JsonTypeValidatorError.STR_CONST, message: 'Invalid string constant.', path: []});
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
    exec(type1, false, {code: 'BOOL_CONST', errno: JsonTypeValidatorError.BOOL_CONST, message: 'Invalid boolean constant.', path: []});
    exec(type1, '123', {code: 'BOOL_CONST', errno: JsonTypeValidatorError.BOOL_CONST, message: 'Invalid boolean constant.', path: []});
    exec(type1, 123, {code: 'BOOL_CONST', errno: JsonTypeValidatorError.BOOL_CONST, message: 'Invalid boolean constant.', path: []});
    exec(type2, false, null);
    exec(type2, true, {code: 'BOOL_CONST', errno: JsonTypeValidatorError.BOOL_CONST, message: 'Invalid boolean constant.', path: []});
    exec(type2, '123', {code: 'BOOL_CONST', errno: JsonTypeValidatorError.BOOL_CONST, message: 'Invalid boolean constant.', path: []});
    exec(type2, 123, {code: 'BOOL_CONST', errno: JsonTypeValidatorError.BOOL_CONST, message: 'Invalid boolean constant.', path: []});
  });
});
