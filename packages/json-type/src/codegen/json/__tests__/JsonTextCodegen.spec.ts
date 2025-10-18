import {parse} from '@jsonjoy.com/json-pack/lib/json-binary/codec';
import {t} from '../../../type';
import {ModuleType} from '../../../type/classes/ModuleType';
import {JsonTextCodegen} from '../JsonTextCodegen';
import {unknown, Value} from '../../../value';

describe('"any" type', () => {
  test('stringify simple JSON', () => {
    const encoder = JsonTextCodegen.get(t.any);
    expect(encoder({foo: 'bar'})).toBe('{"foo":"bar"}');
  });

  test('binary data', () => {
    const encoder = JsonTextCodegen.get(t.any);
    const encoded = encoder({foo: new Uint8Array([97, 115, 100, 102])});
    const decoded = parse(encoded);
    expect(decoded).toEqual({foo: new Uint8Array([97, 115, 100, 102])});
  });

  test('stringify a number', () => {
    const encoder = JsonTextCodegen.get(t.any);
    expect(encoder(-1)).toBe('-1');
  });

  test('can encode "any" field', () => {
    const type = t.object({foo: t.any});
    const encoder = JsonTextCodegen.get(type);
    expect(encoder({foo: true})).toBe('{"foo":true}');
  });

  test('can encode anon Value<unknown>', () => {
    const type = t.object({foo: t.any});
    const value = unknown('test');
    const encoder = JsonTextCodegen.get(type);
    expect(encoder({foo: value})).toBe('{"foo":"test"}');
  });

  test('can encode typed Value<T>', () => {
    const type = t.object({foo: t.any});
    const value = new Value(123, t.con(123));
    const encoder = JsonTextCodegen.get(type);
    expect(encoder({foo: value})).toBe('{"foo":123}');
  });
});

describe('"bool" type', () => {
  test('stringify bools', () => {
    const encoder = JsonTextCodegen.get(t.bool);
    expect(encoder(true)).toBe('true');
    expect(encoder(false)).toBe('false');
    expect(encoder(1)).toBe('true');
    expect(encoder(0)).toBe('false');
  });
});

describe('"num" type', () => {
  test('stringify numbers', () => {
    const encoder = JsonTextCodegen.get(t.num);
    expect(encoder(1)).toBe('1');
    expect(encoder(0)).toBe('0');
    expect(encoder(-1)).toBe('-1');
  });
});

describe('"str" type', () => {
  test('stringify various strings', () => {
    const encoder = JsonTextCodegen.get(t.str);
    expect(encoder('')).toBe('""');
    expect(encoder('a')).toBe('"a"');
    expect(encoder('asdf')).toBe('"asdf"');
  });
});

describe('"bin" type', () => {
  test('stringify various binary strings', () => {
    const encoder = JsonTextCodegen.get(t.bin);
    expect(encoder(new Uint8Array([]))).toBe('"data:application/octet-stream;base64,"');
    expect(encoder(new Uint8Array([97]))).toBe('"data:application/octet-stream;base64,YQ=="');
    expect(encoder(new Uint8Array([97, 115, 100, 102]))).toBe('"data:application/octet-stream;base64,YXNkZg=="');
    expect(parse('"data:application/octet-stream;base64,YXNkZg=="')).toEqual(new Uint8Array([97, 115, 100, 102]));
  });
});

describe('"con" type', () => {
  test('stringify string const', () => {
    const encoder = JsonTextCodegen.get(t.con('xyz'));
    expect(encoder('xyz')).toBe('"xyz"');
    expect(encoder('')).toBe('"xyz"');
  });

  test('stringify object', () => {
    const encoder = JsonTextCodegen.get(t.con({foo: 'bar'}));
    expect(encoder({foo: 'bar'})).toBe('{"foo":"bar"}');
    expect(encoder({})).toBe('{"foo":"bar"}');
  });
});

describe('"obj" type', () => {
  test('stringify simple object', () => {
    const encoder = JsonTextCodegen.get(t.object({foo: t.str}));
    expect(encoder({foo: 'xyz'})).toBe('{"foo":"xyz"}');
    expect(encoder({foo: ''})).toBe('{"foo":""}');
  });

  test('stringify optional field', () => {
    const encoder = JsonTextCodegen.get(t.obj.opt('foo', t.str));
    expect(encoder({foo: 'xyz'})).toBe('{"foo":"xyz"}');
    expect(encoder({foo: ''})).toBe('{"foo":""}');
  });
});

describe('"or" type', () => {
  test('string or number', () => {
    const type = t.or(t.str, t.num);
    const encoder = JsonTextCodegen.get(type);
    expect(encoder('xyz')).toBe('"xyz"');
    expect(encoder(123)).toBe('123');
  });
});

test('encodes extra fields with "encodeUnknownFields" when referenced by ref', () => {
  const system = new ModuleType();
  const {t} = system;
  const type = t.Object(t.Key('foo', t.str), t.KeyOpt('zzz', t.num)).options({encodeUnknownKeys: true});
  system.alias('foo', type);
  const type2 = system.t.Ref('foo');
  const encoder = JsonTextCodegen.get(type2);
  expect(encoder({foo: 'bar', zzz: 1, baz: 123})).toBe('{"foo":"bar","zzz":1,"baz":123}');
});

test('add circular reference test', () => {
  const system = new ModuleType();
  const {t} = system;
  const user = system.alias('User', t.Object(t.Key('id', t.str), t.KeyOpt('address', t.Ref('Address'))));
  const address = system.alias('Address', t.Object(t.Key('id', t.str), t.KeyOpt('user', t.Ref('User'))));
  const value1 = {
    id: 'user-1',
    address: {
      id: 'address-1',
      user: {
        id: 'user-2',
        address: {
          id: 'address-2',
          user: {
            id: 'user-3',
          },
        },
      },
    },
  };
  const encoder1 = JsonTextCodegen.get(user.type);
  const encoded1 = encoder1(value1);
  const res1 = JSON.parse(encoded1);
  expect(res1).toStrictEqual(value1);
  const value2 = {
    id: 'address-1',
    user: {
      id: 'user-1',
      address: {
        id: 'address-2',
        user: {
          id: 'user-2',
          address: {
            id: 'address-3',
          },
        },
      },
    },
  };
  const encoded2 = JsonTextCodegen.get(address.type)(value2);
  const res2 = JSON.parse(encoded2);
  expect(res2).toStrictEqual(value2);
});

test('add circular reference test with chain of refs', () => {
  const system = new ModuleType();
  const {t} = system;
  system.alias('User0', t.Object(t.Key('id', t.str), t.KeyOpt('address', t.Ref('Address'))));
  system.alias('User1', t.Ref('User0'));
  const user = system.alias('User', t.Ref('User1'));
  system.alias('Address0', t.Object(t.Key('id', t.str), t.KeyOpt('user', t.Ref('User'))));
  system.alias('Address1', t.Ref('Address0'));
  const address = system.alias('Address', t.Ref('Address1'));
  const value1 = {
    id: 'user-1',
    address: {
      id: 'address-1',
      user: {
        id: 'user-2',
        address: {
          id: 'address-2',
          user: {
            id: 'user-3',
          },
        },
      },
    },
  };
  const encoded1 = JsonTextCodegen.get(user.type)(value1);
  const res1 = JSON.parse(encoded1);
  expect(res1).toStrictEqual(value1);
  const value2 = {
    id: 'address-1',
    user: {
      id: 'user-1',
      address: {
        id: 'address-2',
        user: {
          id: 'user-2',
          address: {
            id: 'address-3',
          },
        },
      },
    },
  };
  const encoded2 = JsonTextCodegen.get(address.type)(value2);
  const res2 = JSON.parse(encoded2);
  expect(res2).toStrictEqual(value2);
});
