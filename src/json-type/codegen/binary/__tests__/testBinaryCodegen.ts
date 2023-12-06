import {TypeSystem} from '../../../system';
import {Type} from '../../../type';

export const testBinaryCodegen = (transcode: (system: TypeSystem, type: Type, value: unknown) => void) => {
  describe('"any" type', () => {
    test('can encode any value - 1', () => {
      const system = new TypeSystem();
      const any = system.t.any;
      const value = {foo: 'bar'};
      const decoded = transcode(system, any, value);
      expect(decoded).toStrictEqual(value);
    });

    test('can encode any value - 2', () => {
      const system = new TypeSystem();
      const any = system.t.any;
      const value = 123;
      const decoded = transcode(system, any, value);
      expect(decoded).toStrictEqual(value);
    });
  });

  describe('"const" type', () => {
    test('can encode number const', () => {
      const system = new TypeSystem();
      const any = system.t.Const<123>(123);
      const value = {foo: 'bar'};
      const decoded = transcode(system, any, value);
      expect(decoded).toStrictEqual(123);
    });

    test('can encode array const', () => {
      const system = new TypeSystem();
      const any = system.t.Const(<const>[1, 2, 3]);
      const decoded = transcode(system, any, [false, true, null]);
      expect(decoded).toStrictEqual([1, 2, 3]);
    });
  });

  describe('"bool" type', () => {
    test('can encode booleans', () => {
      const system = new TypeSystem();
      const any = system.t.bool;
      expect(transcode(system, any, true)).toStrictEqual(true);
      expect(transcode(system, any, false)).toStrictEqual(false);
      expect(transcode(system, any, 1)).toStrictEqual(true);
      expect(transcode(system, any, 0)).toStrictEqual(false);
    });
  });

  describe('"num" type', () => {
    test('can encode any number', () => {
      const system = new TypeSystem();
      const any = system.t.num;
      expect(transcode(system, any, 0)).toBe(0);
      expect(transcode(system, any, 1)).toBe(1);
      expect(transcode(system, any, 123)).toBe(123);
      expect(transcode(system, any, 0xfaffaf78273)).toBe(0xfaffaf78273);
      expect(transcode(system, any, -234435)).toBe(-234435);
      expect(transcode(system, any, 1.234)).toBe(1.234);
    });

    test('can encode an integer', () => {
      const system = new TypeSystem();
      const any = system.t.num.options({format: 'i'});
      expect(transcode(system, any, 0)).toBe(0);
      expect(transcode(system, any, 1)).toBe(1);
      expect(transcode(system, any, 123)).toBe(123);
      expect(transcode(system, any, 0xfaffa273)).toBe(0xfaffa273);
      expect(transcode(system, any, 1.1)).toBe(1);
    });

    test('can encode an unsigned ints', () => {
      const system = new TypeSystem();
      const any = system.t.num.options({format: 'u8'});
      expect(transcode(system, any, 0)).toBe(0);
      expect(transcode(system, any, 1)).toBe(1);
      expect(transcode(system, any, 123)).toBe(123);
      expect(transcode(system, any, 1.1)).toBe(1);
    });

    test('can encode an floats', () => {
      const system = new TypeSystem();
      const any = system.t.num.options({format: 'f'});
      expect(transcode(system, any, 0)).toBe(0);
      expect(transcode(system, any, 1)).toBe(1);
      expect(transcode(system, any, 123)).toBe(123);
      expect(transcode(system, any, 1.1)).toBe(1.1);
      expect(transcode(system, any, 123.456)).toBe(123.456);
    });
  });

  describe('"str" type', () => {
    test('can encode regular strings', () => {
      const system = new TypeSystem();
      const type = system.t.str;
      let value = '';
      expect(transcode(system, type, value)).toBe(value);
      value = '1';
      expect(transcode(system, type, value)).toBe(value);
      value = 'asdfasdf';
      expect(transcode(system, type, value)).toBe(value);
      value = 'asdfasdfasdfas98ahcas982h39zsdKJHH9823asd';
      expect(transcode(system, type, value)).toBe(value);
      value =
        '❌🏎asdfasdfasdfasdfo(*@()J_!JOICPA:KD:ZCLZSLDIJ)(!J@LKDVlkdsjalkjf;asdlfj;laskdjf;lkajsdf⏰as98ahca🎉s982h39zsdKJHH9🥳823asd';
      expect(transcode(system, type, value)).toBe(value);
    });

    test('can encode ascii strings', () => {
      const system = new TypeSystem();
      const type = system.t.str.options({ascii: true});
      let value = '';
      expect(transcode(system, type, value)).toBe(value);
      value = '1';
      expect(transcode(system, type, value)).toBe(value);
      value = 'asdfasdf';
      expect(transcode(system, type, value)).toBe(value);
      value = 'asdfasdfasdfas98ahcas982h39zsdKJHH9823asd';
      expect(transcode(system, type, value)).toBe(value);
      value =
        '❌🏎asdfasdfasdfasdfo(*@()J_!JOICPA:KD:ZCLZSLDIJ)(!J@LKDVlkdsjalkjf;asdlfj;laskdjf;lkajsdf⏰as98ahca🎉s982h39zsdKJHH9🥳823asd';
      expect(transcode(system, type, value)).not.toBe(value);
    });
  });

  describe('"bin" type', () => {
    test('can encode binary data', () => {
      const system = new TypeSystem();
      const type = system.t.bin;
      let value = new Uint8Array();
      expect(transcode(system, type, value)).toStrictEqual(value);
      value = new Uint8Array([1, 3, 3]);
      expect(transcode(system, type, value)).toStrictEqual(value);
    });
  });

  describe('"arr" type', () => {
    test('can encode simple arrays', () => {
      const system = new TypeSystem();
      const type = system.t.arr;
      let value: any[] = [];
      expect(transcode(system, type, value)).toStrictEqual(value);
      value = [1, 2, 3];
      expect(transcode(system, type, value)).toStrictEqual(value);
    });

    test('can encode array inside array', () => {
      const system = new TypeSystem();
      const type = system.t.Array(system.t.arr);
      const value: any[] = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];
      expect(transcode(system, type, value)).toStrictEqual(value);
    });

    test('can encode array of strings', () => {
      const system = new TypeSystem();
      const type = system.t.Array(system.t.str);
      const value: any[] = ['1', '2', '3'];
      expect(transcode(system, type, value)).toStrictEqual(value);
    });
  });

  describe('"tup" type', () => {
    test('can encode a simple tuple', () => {
      const system = new TypeSystem();
      const t = system.t;
      const type = system.t.Tuple(t.str, t.num, t.bool);
      const value: any[] = ['abc', 123, true];
      expect(transcode(system, type, value)).toStrictEqual(value);
    });

    test('can encode an empty tuple', () => {
      const system = new TypeSystem();
      const t = system.t;
      const type = system.t.Tuple();
      const value: any[] = [];
      expect(transcode(system, type, value)).toStrictEqual(value);
    });

    test('can encode a tuple of arrays', () => {
      const system = new TypeSystem();
      const t = system.t;
      const type = system.t.Tuple(t.arr, t.arr);
      const value: any[] = [[], [1, 'b', false]];
      expect(transcode(system, type, value)).toStrictEqual(value);
    });
  });

  describe('"obj" type', () => {
    test('can encode empty object', () => {
      const system = new TypeSystem();
      const t = system.t;
      const type = t.obj;
      const value: {} = {};
      expect(transcode(system, type, value)).toStrictEqual(value);
    });

    test('can encode empty object, which has optional fields', () => {
      const system = new TypeSystem();
      const t = system.t;
      const type = t.Object(t.propOpt('field1', t.str));
      const value1: {} = {};
      expect(transcode(system, type, value1)).toStrictEqual(value1);
      const value2: {} = {field1: 'abc'};
      expect(transcode(system, type, value2)).toStrictEqual(value2);
    });

    test('can encode fixed size object', () => {
      const system = new TypeSystem();
      const t = system.t;
      const type = t.Object(t.prop('field1', t.str), t.prop('field2', t.num), t.prop('bool', t.bool));
      const value: {} = {
        field1: 'abc',
        field2: 123,
        bool: true,
      };
      expect(transcode(system, type, value)).toStrictEqual(value);
    });

    test('can encode object with an optional field', () => {
      const system = new TypeSystem();
      const t = system.t;
      const type = t.Object(t.prop('id', t.str), t.propOpt('name', t.str));
      const value: {} = {
        id: 'xxxxx',
        name: 'Go Lang',
      };
      expect(transcode(system, type, value)).toStrictEqual(value);
    });

    test('can encode object with a couple of optional fields', () => {
      const system = new TypeSystem();
      const t = system.t;
      const type = t.Object(
        t.prop('id', t.str),
        t.propOpt('name', t.str),
        t.prop('age', t.num),
        t.propOpt('address', t.str),
      );
      const value: {} = {
        id: 'xxxxx',
        name: 'Go Lang',
        age: 30,
        address: '123 Main St',
      };
      expect(transcode(system, type, {...value, unknownField: 123})).toStrictEqual(value);
    });

    test('can encode object with unknown fields', () => {
      const system = new TypeSystem();
      const t = system.t;
      const type = t
        .Object(t.prop('id', t.str), t.propOpt('name', t.str), t.prop('age', t.num), t.propOpt('address', t.str))
        .options({encodeUnknownFields: true});
      const value: {} = {
        id: 'xxxxx',
        name: 'Go Lang',
        ____unknownField: 123,
        age: 30,
        address: '123 Main St',
      };
      expect(transcode(system, type, value)).toStrictEqual(value);
    });

    test('can encode nested objects', () => {
      const system = new TypeSystem();
      const t = system.t;
      const type = t
        .Object(
          t.prop('id', t.str),
          t.propOpt('name', t.str),
          t.prop('addr', t.Object(t.prop('street', t.str))),
          t.prop(
            'interests',
            t.Object(t.propOpt('hobbies', t.Array(t.str)), t.propOpt('sports', t.Array(t.Tuple(t.num, t.str)))),
          ),
        )
        .options({encodeUnknownFields: true});
      const decoded = transcode(system, type, {
        id: 'xxxxx',
        name: 'Go Lang',
        ____unknownField: 123,
        addr: {
          street: '123 Main St',
          ____extra: true,
        },
        interests: {
          hobbies: ['hiking', 'biking'],
          sports: [
            [1, 'football'],
            [12333, 'skiing'],
          ],
          ______extraProp: 'abc',
        },
      });
      expect(decoded).toStrictEqual({
        id: 'xxxxx',
        name: 'Go Lang',
        ____unknownField: 123,
        addr: {
          street: '123 Main St',
        },
        interests: {
          hobbies: ['hiking', 'biking'],
          sports: [
            [1, 'football'],
            [12333, 'skiing'],
          ],
        },
      });
    });

    test('can encode object with only optional fields (encodeUnknownFields = true)', () => {
      const system = new TypeSystem();
      const t = system.t;
      const type = t
        .Object(t.propOpt('id', t.str), t.propOpt('name', t.str), t.propOpt('address', t.str))
        .options({encodeUnknownFields: true});
      let value: {} = {
        id: 'xxxxx',
        name: 'Go Lang',
        ____unknownField: 123,
        age: 30,
        address: '123 Main St',
      };
      expect(transcode(system, type, value)).toStrictEqual(value);
      value = {
        ____unknownField: 123,
        address: '123 Main St',
      };
      expect(transcode(system, type, value)).toStrictEqual(value);
      value = {
        ____unknownField: 123,
      };
      expect(transcode(system, type, value)).toStrictEqual(value);
      value = {};
      expect(transcode(system, type, value)).toStrictEqual(value);
    });

    test('can encode object with only optional fields (encodeUnknownFields = false)', () => {
      const system = new TypeSystem();
      const t = system.t;
      const type = t
        .Object(t.propOpt('id', t.str), t.propOpt('name', t.str), t.propOpt('address', t.str))
        .options({encodeUnknownFields: false});
      let value: {} = {
        id: 'xxxxx',
        name: 'Go Lang',
        address: '123 Main St',
      };
      expect(transcode(system, type, value)).toStrictEqual(value);
      value = {
        ____unknownField: 123,
        address: '123 Main St',
      };
      expect(transcode(system, type, value)).toStrictEqual({
        address: '123 Main St',
      });
      value = {
        ____unknownField: 123,
      };
      expect(transcode(system, type, value)).toStrictEqual({});
      value = {};
      expect(transcode(system, type, value)).toStrictEqual({});
    });
  });

  describe('"map" type', () => {
    test('can encode empty map', () => {
      const system = new TypeSystem();
      const t = system.t;
      const type = t.map;
      const value: {} = {};
      expect(transcode(system, type, value)).toStrictEqual(value);
    });

    test('can encode empty map with one key', () => {
      const system = new TypeSystem();
      const t = system.t;
      const type = t.map;
      const value: {} = {a: 'asdf'};
      expect(transcode(system, type, value)).toStrictEqual(value);
    });

    test('can encode typed map with two keys', () => {
      const system = new TypeSystem();
      const t = system.t;
      const type = t.Map(t.bool);
      const value: {} = {x: true, y: false};
      expect(transcode(system, type, value)).toStrictEqual(value);
    });

    test('can encode nested maps', () => {
      const system = new TypeSystem();
      const t = system.t;
      const type = t.Map(t.Map(t.bool));
      const value: {} = {a: {x: true, y: false}};
      expect(transcode(system, type, value)).toStrictEqual(value);
    });
  });

  describe('"ref" type', () => {
    test('can encode a simple reference', () => {
      const system = new TypeSystem();
      const t = system.t;
      system.alias('Obj', t.Object(t.prop('foo', t.str)));
      const type = t.Ref('Obj');
      expect(transcode(system, type, {foo: 'bar'})).toStrictEqual({foo: 'bar'});
    });
  });

  describe('"or" type', () => {
    test('can encode a simple union type', () => {
      const system = new TypeSystem();
      const t = system.t;
      const type = system.t.Or(t.str, t.num).options({
        discriminator: ['if', ['==', 'string', ['type', ['get', '']]], 0, 1],
      });
      expect(transcode(system, type, 123)).toStrictEqual(123);
      expect(transcode(system, type, 'asdf')).toStrictEqual('asdf');
    });
  });

  describe('various', () => {
    test('encodes benchmark example', () => {
      const system = new TypeSystem();
      const t = system.t;
      const response = system.alias(
        'Response',
        t.Object(
          t.prop(
            'collection',
            t.Object(
              t.prop('id', t.String({ascii: true, noJsonEscape: true})),
              t.prop('ts', t.num.options({format: 'u64'})),
              t.prop('cid', t.String({ascii: true, noJsonEscape: true})),
              t.prop('prid', t.String({ascii: true, noJsonEscape: true})),
              t.prop('slug', t.String({ascii: true, noJsonEscape: true})),
              t.propOpt('name', t.str),
              t.propOpt('src', t.str),
              t.propOpt('doc', t.str),
              t.propOpt('longText', t.str),
              t.prop('active', t.bool),
              t.prop('views', t.Array(t.num)),
            ),
          ),
          t.prop(
            'block',
            t.Object(
              t.prop('id', t.String({ascii: true, noJsonEscape: true})),
              t.prop('ts', t.num.options({format: 'u64'})),
              t.prop('cid', t.String({ascii: true, noJsonEscape: true})),
              t.prop('slug', t.String({ascii: true, noJsonEscape: true})),
            ),
          ),
        ),
      );
      const value = {
        collection: {
          id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
          ts: Date.now(),
          cid: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
          prid: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
          slug: 'slug-name',
          name: 'Super collection',
          src: '{"foo": "bar"}',
          longText:
            'After implementing a workaround for the first issue and merging the changes to another feature branch with some extra code and tests, the following error was printed in the stage’s log “JavaScript heap out of memory error.”',
          active: true,
          views: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        },
        block: {
          id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
          ts: Date.now(),
          cid: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
          slug: 'slug-name',
        },
      };
      const decoded = transcode(system, response.type, value);
      // console.log(decoded);
      expect(decoded).toStrictEqual(value);
    });

    test('serializes according to schema a POJO object', () => {
      const system = new TypeSystem();
      const t = system.t;
      const type = t.Object(
        t.prop('a', t.num),
        t.prop('b', t.str),
        t.prop('c', t.nil),
        t.prop('d', t.bool),
        t.prop('arr', t.Array(t.Object(t.prop('foo', t.Array(t.num)), t.prop('.!@#', t.str)))),
        t.prop('bin', t.bin),
      );
      const value = {
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
      const decoded = transcode(system, type, value);
      expect(decoded).toStrictEqual(value);
    });

    test('supports "encodeUnknownFields" property', () => {
      const system = new TypeSystem();
      const t = system.t;
      const type = t.Object(t.prop('a', t.Object().options({encodeUnknownFields: true})));
      const value = {
        a: {
          foo: 123,
        },
      };
      const decoded = transcode(system, type, value);
      expect(decoded).toStrictEqual(value);
    });

    test('supports "encodeUnknownFields" property', () => {
      const system = new TypeSystem();
      const t = system.t;
      const type = t.Object(t.prop('a', t.num), t.propOpt('b', t.num), t.prop('c', t.bool), t.propOpt('d', t.nil));
      const json1 = {
        a: 1.1,
        b: 3,
        c: true,
        d: null,
      };
      const json2 = {
        a: 1.1,
        c: true,
      };
      const json3 = {
        a: 1.1,
        c: true,
        b: 0,
      };
      const decoded1 = transcode(system, type, json1);
      expect(decoded1).toStrictEqual(json1);
      const decoded2 = transcode(system, type, json2);
      expect(decoded2).toStrictEqual(json2);
      const decoded = transcode(system, type, json3);
      expect(decoded).toStrictEqual(json3);
    });

    test('supports "encodeUnknownFields" property', () => {
      const system = new TypeSystem();
      const t = system.t;
      const type = t.Object(
        t.prop(
          'collection',
          t.Object(
            t.prop('id', t.str),
            t.prop('ts', t.num),
            t.prop('cid', t.str),
            t.prop('prid', t.str),
            t.prop('slug', t.str),
            t.propOpt('name', t.str),
            t.propOpt('src', t.str),
            t.propOpt('doc', t.str),
            t.propOpt('authz', t.str),
          ),
        ),
      );
      const value = {
        collection: {
          id: '123',
          ts: 123,
          cid: '123',
          prid: '123',
          slug: 'slug',
          name: 'name',
          src: 'src',
          authz: 'authz',
        },
      };
      const decoded = transcode(system, type, value);
      expect(decoded).toStrictEqual(value);
    });
  });
};
