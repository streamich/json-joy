import {t} from '../../json-type';
import {JsonSerializerCodegen} from '../json';
import {TType} from '../../json-type/types';

const exec = (type: TType, json: unknown, expected: unknown = json) => {
  const codegen = new JsonSerializerCodegen({type});
  const fn = codegen.run().compile();
  // console.log(fn.toString());
  const serialized = fn(json);
  // console.log('serialized', serialized);
  const decoded = JSON.parse(serialized);
  expect(decoded).toStrictEqual(expected);
};

describe('"str" type', () => {
  test('serializes a plain short string', () => {
    const type = t.str;
    const json = "asdf";
    exec(type, json);
  });

  test('serializes a long string', () => {
    const type = t.str;
    const json = "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789";
    exec(type, json);
  });

  test('serializes a const string', () => {
    const type = t.String({const: "asdf"});
    const json = "555";
    exec(type, json, 'asdf');
  });
});

describe('"num" type', () => {
  test('serializes numbers', () => {
    const type = t.num;
    exec(type, 0);
    exec(type, 1);
    exec(type, -1);
    exec(type, 4.234);
    exec(type, -23.23);
  });

  test('serializes a const number', () => {
    const type = t.Number({const: 7});
    const json = 123;
    exec(type, json, 7);
  });

  test('serializes integers', () => {
    const type = t.Number({const: 7});
    const json = 123;
    exec(type, json, 7);
  });
});

describe('"nil" type', () => {
  test('serializes null', () => {
    const type = t.nil;
    exec(type, null);
    exec(type, 123, null);
  });
});

describe('"bool" type', () => {
  test('serializes boolean', () => {
    const type = t.bool;
    exec(type, true);
    exec(type, false);
    exec(type, 123, true);
    exec(type, 0, false);
  });
});

describe('"arr" type', () => {
  test('serializes an array', () => {
    const type = t.Array(t.num)
    exec(type, [1, 2, 3]);
  });

  test('serializes an array in array', () => {
    const type = t.Array(t.Array(t.num))
    exec(type, [[1, 2, 3]]);
  });
});

describe('"obj" type', () => {
  test('serializes object with required fields', () => {
    const type = t.Object([
      t.Field('a', t.num),
      t.Field('b', t.str),
    ]);
    exec(type, {a: 123, b: 'asdf'});
  });

  test('serializes object with constant string with required fields', () => {
    const type = t.Object([
      t.Field('a', t.num),
      t.Field('b', t.String({const: 'asdf'})),
    ]);
    exec(type, {a: 123, b: 'asdf'});
  });

  test('can serialize optional fields', () => {
    const type = t.Object([
      t.Field('a', t.num),
      t.Field('b', t.String({const: 'asdf'})),
      t.Field('c', t.str, {isOptional: true}),
      t.Field('d', t.num, {isOptional: true}),
    ]);
    exec(type, {a: 123, b: 'asdf'});
    exec(type, {a: 123, b: 'asdf', c: 'qwerty'});
    exec(type, {a: 123, d: 4343.3, b: 'asdf', c: 'qwerty'});
  });

  test('can serialize object with unknown fields', () => {
    const type = t.Object([
      t.Field('a', t.num),
      t.Field('b', t.String({const: 'asdf'})),
      t.Field('c', t.str, {isOptional: true}),
      t.Field('d', t.num, {isOptional: true}),
    ], {unknownFields: true});
    exec(type, {a: 123, b: 'asdf'});
    exec(type, {a: 123, b: 'asdf', c: 'qwerty'});
    exec(type, {a: 123, d: 4343.3, b: 'asdf', c: 'qwerty', e: 'asdf'});
    exec(type, {a: 123, d: 4343.3, b: 'asdf', c: 'qwerty', e: 'asdf', z: true});
  });
});
