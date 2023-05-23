import {TypeSystem} from '../../../system';

test('encodes extra fields with "encodeUnknownFields" when referenced by ref', () => {
  const system = new TypeSystem();
  const {t} = system;
  const type = t.Object(t.prop('foo', t.str), t.propOpt('zzz', t.num)).options({encodeUnknownFields: true});
  system.alias('foo', type);
  const type2 = system.t.Ref('foo');
  const encoder = type2.jsonTextEncoder();
  expect(encoder({foo: 'bar', zzz: 1, baz: 123})).toBe('{"foo":"bar","zzz":1,"baz":123}');
});

test('add circular reference test', () => {
  const system = new TypeSystem();
  const {t} = system;
  const user = system.alias('User', t.Object(t.prop('id', t.str), t.propOpt('address', t.Ref('Address'))));
  const address = system.alias('Address', t.Object(t.prop('id', t.str), t.propOpt('user', t.Ref('User'))));
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
  const encoded1 = user.type.jsonTextEncoder()(value1);
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
  const encoded2 = address.type.jsonTextEncoder()(value2);
  const res2 = JSON.parse(encoded2);
  expect(res2).toStrictEqual(value2);
});

test('add circular reference test with chain of refs', () => {
  const system = new TypeSystem();
  const {t} = system;
  system.alias('User0', t.Object(t.prop('id', t.str), t.propOpt('address', t.Ref('Address'))));
  system.alias('User1', t.Ref('User0'));
  const user = system.alias('User', t.Ref('User1'));
  system.alias('Address0', t.Object(t.prop('id', t.str), t.propOpt('user', t.Ref('User'))));
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
  const encoded1 = user.type.jsonTextEncoder()(value1);
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
  const encoded2 = address.type.jsonTextEncoder()(value2);
  const res2 = JSON.parse(encoded2);
  expect(res2).toStrictEqual(value2);
});
