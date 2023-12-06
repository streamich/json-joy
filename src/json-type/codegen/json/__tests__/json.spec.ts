import {Schema, s} from '../../../schema';
import {TypeSystem} from '../../../system';

const exec = (schema: Schema, json: unknown, expected: unknown = json) => {
  const system = new TypeSystem();
  const type = system.t.import(schema);
  const fn = type.jsonTextEncoder();
  // console.log(fn.toString());
  const serialized = fn(json);
  // console.log('serialized', serialized);
  const decoded = JSON.parse(serialized);
  expect(decoded).toStrictEqual(expected);
};

describe('"str" type', () => {
  test('serializes a plain short string', () => {
    const type = s.str;
    const json = 'asdf';
    exec(type, json);
  });

  test('serializes a long string', () => {
    const type = s.str;
    const json =
      '0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789';
    exec(type, json);
  });

  test('serializes a const string', () => {
    const type = s.Const<'asdf'>('asdf');
    const json = '555';
    exec(type, json, 'asdf');
  });
});

describe('"num" type', () => {
  test('serializes numbers', () => {
    const type = s.num;
    exec(type, 0);
    exec(type, 1);
    exec(type, -1);
    exec(type, 4.234);
    exec(type, -23.23);
  });

  test('serializes a const number', () => {
    const type = s.Const<7>(7);
    const json = 123;
    exec(type, json, 7);
  });

  test('serializes integers', () => {
    const type = s.Const<7>(7);
    const json = 123;
    exec(type, json, 7);
  });
});

describe('"nil" type', () => {
  test('serializes null', () => {
    const type = s.nil;
    exec(type, null);
    exec(type, 123, null);
  });
});

describe('"bool" type', () => {
  test('serializes boolean', () => {
    const type = s.bool;
    exec(type, true);
    exec(type, false);
    exec(type, 123, true);
    exec(type, 0, false);
  });
});

describe('"arr" type', () => {
  test('serializes an array', () => {
    const type = s.Array(s.num);
    exec(type, [1, 2, 3]);
  });

  test('serializes an array in array', () => {
    const type = s.Array(s.Array(s.num));
    exec(type, [[1, 2, 3]]);
  });
});

describe('"obj" type', () => {
  test('serializes object with required fields', () => {
    const type = s.Object([s.Field('a', s.num), s.Field('b', s.str)]);
    exec(type, {a: 123, b: 'asdf'});
  });

  test('serializes object with constant string with required fields', () => {
    const type = s.Object([s.Field('a', s.num), s.Field('b', s.Const<'asdf'>('asdf'))]);
    exec(type, {a: 123, b: 'asdf'});
  });

  test('can serialize optional fields', () => {
    const type = s.Object([
      s.Field('a', s.num),
      s.Field('b', s.Const<'asdf'>('asdf')),
      s.FieldOpt('c', s.str),
      s.FieldOpt('d', s.num),
    ]);
    exec(type, {a: 123, b: 'asdf'});
    exec(type, {a: 123, b: 'asdf', c: 'qwerty'});
    exec(type, {a: 123, d: 4343.3, b: 'asdf', c: 'qwerty'});
  });

  test('can serialize object with unknown fields', () => {
    const type = s.Object(
      [s.prop('a', s.num), s.prop('b', s.Const<'asdf'>('asdf')), s.propOpt('c', s.str), s.propOpt('d', s.num)],
      {encodeUnknownFields: true},
    );
    exec(type, {a: 123, b: 'asdf'});
    exec(type, {a: 123, b: 'asdf', c: 'qwerty'});
    exec(type, {a: 123, d: 4343.3, b: 'asdf', c: 'qwerty', e: 'asdf'});
    exec(type, {a: 123, d: 4343.3, b: 'asdf', c: 'qwerty', e: 'asdf', z: true});
  });
});

describe('"map" type', () => {
  test('serializes a map', () => {
    const type = s.Map(s.num);
    exec(type, {a: 1, b: 2, c: 3});
  });

  test('serializes empty map', () => {
    const type = s.Map(s.num);
    exec(type, {});
  });

  test('serializes a map with a single key', () => {
    const type = s.Map(s.num);
    exec(type, {'0': 0});
  });

  test('serializes a map in a map', () => {
    const type = s.Map(s.Map(s.bool));
    exec(type, {a: {b: true}});
  });
});

describe('general', () => {
  test('serializes according to schema a POJO object', () => {
    const type = s.Object({
      fields: [
        s.prop('a', s.num),
        s.prop('b', s.str),
        s.prop('c', s.nil),
        s.prop('d', s.bool),
        s.prop(
          'arr',
          s.Array(
            s.Object({
              fields: [s.prop('foo', s.Array(s.num)), s.prop('.!@#', s.str)],
            }),
          ),
        ),
        s.prop('bin', s.bin),
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
    const type = s.Object([s.Field('bin', s.bin)]);
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
    const system = new TypeSystem();
    system.alias('ID', system.t.str);
    const schema = s.Object([s.prop('name', s.str), s.prop('id', s.Ref<any>('ID')), s.prop('createdAt', s.num)]);
    const type = system.t.import(schema);
    const fn = type.jsonTextEncoder();
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
