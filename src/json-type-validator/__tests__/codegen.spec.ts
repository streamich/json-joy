import {t} from '../../json-type/type';
import {createBoolValidator, createStrValidator, createObjValidator, ObjectValidatorError, ObjectValidatorSuccess} from '..';
import {TType} from '../../json-type/types/json';

const exec = (type: TType, json: unknown, error: ObjectValidatorSuccess | ObjectValidatorError) => {
  const fn1 = createBoolValidator(type);
  const fn2 = createStrValidator(type);
  const fn3 = createObjValidator(type);

  // console.log(fn1.toString());
  // console.log(fn2.toString());
  // console.log(fn3.toString());

  const result1 = fn1(json);
  const result2 = fn2(json);
  const result3 = fn3(json);

  // console.log('result1', result1);
  // console.log('result2', result2);
  // console.log('result3', result3);

  expect(result1).toBe(!!error);
  expect(result2).toStrictEqual(!error ? '' : JSON.stringify([error.code, ...error.path]));
  expect(result3).toStrictEqual(error);
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

describe('single root element', () => {
  test('null', () => {
    const type = t.nil;
    exec(type, null, null);
    exec(type, '123', {code: 'NIL', errno: 6, message: 'Not null.', path: []});
  });

  test('number', () => {
    const type = t.num;
    exec(type, 123, null);
    exec(type, 1.123, null);
    exec(type, -123, null);
    exec(type, -5.5, null);
    exec(type, '123', {code: 'NUM', errno: 2, message: 'Not a number.', path: []});
  });

  test('const number', () => {
    const type = t.Number({const: 66});
    exec(type, 66, null);
    exec(type, 67, {code: 'NUM_CONST', errno: 3, message: 'Invalid number constant.', path: []});
  });

  test('string', () => {
    const type = t.str;
    exec(type, '', null);
    exec(type, 'a', null);
    exec(type, 'asdf', null);
    exec(type, 123, {code: 'STR', errno: 0, message: 'Not a string.', path: []});
  });

  test('const string', () => {
    const type = t.String({const: 'asdf'});
    exec(type, 'asdf', null);
    exec(type, '', {code: 'STR_CONST', errno: 1, message: 'Invalid string constant.', path: []});
    exec(type, 123, {code: 'STR_CONST', errno: 1, message: 'Invalid string constant.', path: []});
  });
});
