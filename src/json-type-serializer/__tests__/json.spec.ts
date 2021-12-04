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
    const json = 'asdf';
    exec(type, json);
  });

  test('serializes a long string', () => {
    const type = t.str;
    const json =
      '0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789';
    exec(type, json);
  });

  test('serializes a const string', () => {
    const type = t.String({const: 'asdf'});
    const json = '555';
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
    const type = t.Array(t.num);
    exec(type, [1, 2, 3]);
  });

  test('serializes an array in array', () => {
    const type = t.Array(t.Array(t.num));
    exec(type, [[1, 2, 3]]);
  });
});

describe('"obj" type', () => {
  test('serializes object with required fields', () => {
    const type = t.Object([t.Field('a', t.num), t.Field('b', t.str)]);
    exec(type, {a: 123, b: 'asdf'});
  });

  test('serializes object with constant string with required fields', () => {
    const type = t.Object([t.Field('a', t.num), t.Field('b', t.String({const: 'asdf'}))]);
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
    const type = t.Object(
      [
        t.Field('a', t.num),
        t.Field('b', t.String({const: 'asdf'})),
        t.Field('c', t.str, {isOptional: true}),
        t.Field('d', t.num, {isOptional: true}),
      ],
      {unknownFields: true},
    );
    exec(type, {a: 123, b: 'asdf'});
    exec(type, {a: 123, b: 'asdf', c: 'qwerty'});
    exec(type, {a: 123, d: 4343.3, b: 'asdf', c: 'qwerty', e: 'asdf'});
    exec(type, {a: 123, d: 4343.3, b: 'asdf', c: 'qwerty', e: 'asdf', z: true});
  });
});

describe('general', () => {
  test('serializes according to schema a POJO object', () => {
    const type = t.Object({
      fields: [
        t.Field('a', t.num),
        t.Field('b', t.str),
        t.Field('c', t.nil),
        t.Field('d', t.bool),
        t.Field(
          'arr',
          t.Array(
            t.Object({
              fields: [t.Field('foo', t.Array(t.num)), t.Field('.!@#', t.str)],
            }),
          ),
        ),
        t.Field('bin', t.bin),
      ],
    });
    const json = {
      a: 1.1,
      b: 'sdf',
      c: null,
      d: true,
      arr: [
        {foo: [1], '.!@#': ''},
        {'.!@#': '......', foo: [4, 4, 4.4]},
      ],
      bin: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
    };

    exec(type, json, {
      a: 1.1,
      b: 'sdf',
      c: null,
      d: true,
      arr: [
        {foo: [1], '.!@#': ''},
        {'.!@#': '......', foo: [4, 4, 4.4]},
      ],
      bin: 'data:application/octet-stream;base64,AQIDBAUGBwgJCg==',
    });
  });

  test('can encode binary', () => {
    const type = t.Object([t.Field('bin', t.bin)]);
    const json = {
      bin: new Uint8Array([1, 2, 3]),
    };

    exec(type, json, {
      bin: 'data:application/octet-stream;base64,AQID',
    });
  });
});

describe('"ref" type', () => {
  test('can serialize reference by resolving to type', () => {
    const typeId = t.String();
    const type = t.Object('User', [t.Field('name', t.str), t.Field('id', t.Ref('ID')), t.Field('createdAt', t.num)]);
    const codegen = new JsonSerializerCodegen({
      type,
      ref: () => typeId,
    });
    const fn = codegen.run().compile();
    const json = {
      name: 'John',
      id: '123',
      createdAt: 123,
    };
    const blob = fn(json);
    const decoded = JSON.parse(blob);
    expect(decoded).toStrictEqual(json);
  });

  test('can serialize reference by partial serializer', () => {
    const typeId = t.String();
    const type = t.Object('User', [t.Field('name', t.str), t.Field('id', t.Ref('ID')), t.Field('createdAt', t.num)]);
    const codegen = new JsonSerializerCodegen({
      type,
      ref: () => {
        const codegen2 = new JsonSerializerCodegen({type: typeId});
        return codegen2.run().compile();
      },
    });
    const fn = codegen.run().compile();
    const json = {
      name: 'John',
      id: '123',
      createdAt: 123,
    };
    const blob = fn(json);
    const decoded = JSON.parse(blob);
    expect(decoded).toStrictEqual(json);
  });
});
