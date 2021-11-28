import {t} from '../../json-type';
import {EncoderFull} from '../../json-pack/EncoderFull';
import {Decoder} from '../../json-pack/Decoder';
import {MsgPackSerializerCodegen} from '../msgpack';
import {TType} from '../../json-type/types';

const encoder = new EncoderFull();
const decoder = new Decoder();

const exec = (type: TType, json: unknown, expected: unknown = json) => {
  const codegen = new MsgPackSerializerCodegen({encoder});
  const fn = codegen.compile(type);
  // console.log(fn.toString());
  const blob = fn(json);
  const decoded = decoder.decode(blob);
  expect(decoded).toStrictEqual(expected);
};

describe('general', () => {
  test('serializes according to schema a POJO object', () => {
    const type = t.Object({
      fields: [
        t.Field('a', t.num),
        t.Field('b', t.str),
        t.Field('c', t.nil),
        t.Field('d', t.bool),
        t.Field('arr', t.Array(t.Object({
          fields: [
            t.Field('foo', t.Array(t.num)),
            t.Field('.!@#', t.str),
          ],
        }))),
        t.Field('bin', t.bin),
      ],
    });
    const json = {
      a: 1.1,
      b: 'sdf',
      c: null,
      d: true,
      arr: [{foo: [1], '.!@#': ''}, {'.!@#': '......', foo: [4, 4, 4.4]}],
      bin: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
    };

    exec(type, json);
  });

  test('supports "unknownFields" property', () => {
    const type = t.Object({
      fields: [
        t.Field('a', t.Object({
          fields: [],
          unknownFields: true,
        })),
      ],
    });
    const json = {
      a: {
        foo: 123,
      },
    };

    exec(type, json);
  });

  test('can encode object with optional fields', () => {
    const type = t.Object({
      fields: [
        t.Field('a', t.num),
        t.Field('b', t.num, {isOptional: true}),
        t.Field('c', t.bool),
        t.Field('d', t.nil, {isOptional: true}),
      ],
    });
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

    exec(type, json1);
    exec(type, json2);
    exec(type, json3);
  });

  test('example object', () => {
    const type = t.Object({
      fields: [
        t.Field('collection', t.Object({
          fields: [
            t.Field('id', t.str),
            t.Field('ts', t.num),
            t.Field('cid', t.str),
            t.Field('prid', t.str),
            t.Field('slug', t.str),
            t.Field('name', t.str, {isOptional: true}),
            t.Field('src', t.str, {isOptional: true}),
            t.Field('doc', t.str, {isOptional: true}),
            t.Field('authz', t.str, {isOptional: true}),
          ],
        })),
      ],
    });
    const json = {
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
    exec(type, json);
  });
});

describe('single value', () => {
  test('null', () => {
    const type = t.nil;
    const json = null;
    exec(type, json);
  });

  test('true and false', () => {
    exec(t.bool, true);
    exec(t.bool, false);
    exec(t.Boolean({const: false}), false);
    exec(t.Boolean({const: true}), true);
  });

  test('number', () => {
    exec(t.num, 1);
    exec(t.num, 0);;
    exec(t.num, 1.2);;
    exec(t.num, -3);;
    exec(t.num, -232123);
    exec(t.num, -232123.9);
    exec(t.Number({const: 3}), 3);
  });

  test('string', () => {
    exec(t.str, '');
    exec(t.str, 'asdf');
    exec(t.String({const: ''}), '');
    exec(t.String({const: 'asdf'}), 'asdf');
  });

  test('array', () => {
    exec(t.arr, []);
    exec(t.arr, [1, 2, 3]);
    exec(t.Array(t.num), [1, 2, 3]);
    exec(t.Array(t.str), ['1', '2', '3']);
  });

  test('object', () => {
    exec(t.Object({ fields: [] }), {});
    exec(t.Object({
      fields: [
        t.Field('a', t.str),
      ]
    }), {a: 'b'});
  });
});

describe('"str" type', () => {
  test('can encode a simple string', () => {
    const type = t.str;
    const json = 'asdf';
    exec(type, json);
  });

  test('can encode an ASCII optimized string', () => {
    const type = t.String({format: 'ascii'});
    const json = 'asdf';
    exec(type, json);
  });
});

describe('"num" type', () => {
  test('can encode number as integer', () => {
    exec(t.Number({format: 'i'}), 123);
    exec(t.Number({format: 'i'}), -123);
    exec(t.Number({format: 'i'}), 123.4, 123);
    exec(t.Number({format: 'i8'}), -123);
    exec(t.Number({format: 'i16'}), -123);
    exec(t.Number({format: 'i32'}), -123);
    exec(t.Number({format: 'i64'}), -123);
  });

  test('can encode number as unsigned integer', () => {
    exec(t.Number({format: 'u'}), 123);
    exec(t.Number({format: 'u8'}), 0);
    exec(t.Number({format: 'u16'}), 3223);
    exec(t.Number({format: 'u32'}), 32233);
    exec(t.Number({format: 'u64'}), 1);
  });
});

describe('"enum" type', () => {
  test('string enum', () => {
    const type = t.Enum(['add', 'replace']);
    const json = 'add';
    exec(type, json);
  });

  test('complex enum', () => {
    const type = t.Enum([{foo: 'bar'}, 'replace']);
    exec(type, 'replace');
    exec(type, {foo: 'bar'});
  });
});

describe('"or" type', () => {
  test('simple example', () => {
    const type = t.Or(t.num, t.str);
    exec(type, 123);
    exec(type, 'asdf');
  });
});

describe('"ref" type', () => {
  test('simple example', () => {
    const typeUser = t.Object('User', [
      t.Field('id', t.str),
    ]);
    const typeResponse = t.Object('Response', [
      t.Field('user', t.Ref('User')),
    ]);
    const codegen = new MsgPackSerializerCodegen({
      encoder,
      ref: () => typeUser,
    });
    const fn = codegen.compile(typeResponse);
    const json = {
      user: {
        id: '123',
      },
    };
    const blob = fn(json);
    const decoded = decoder.decode(blob);
    expect(decoded).toStrictEqual(json);
  });

  test('throws when ref cannot be resolved', () => {
    const typeResponse = t.Object('Response', [
      t.Field('user', t.Ref('User')),
    ]);
    const codegen = new MsgPackSerializerCodegen({
      encoder,
    });
    const callback = () => codegen.compile(typeResponse);
    expect(callback).toThrow(new Error('Unknown [ref = User].'));
  });

  test('can generate partial function, where encoder is injected', () => {
    const type = t.Object('User', [
      t.Field('id', t.str),
    ]);
    const codegen = new MsgPackSerializerCodegen({encoder});
    const fn = codegen.compilePartial(type);
    const json = {
      id: '123',
    };
    encoder.reset();
    expect(() => (fn as any)(json)).toThrow();
    fn(json, encoder);
    const blob = encoder.flush();
    const decoded = decoder.decode(blob);
    expect(decoded).toStrictEqual(json);
  });

  test('can serialize reference by resolving to type', () => {
    const typeId = t.String();
    const type = t.Object('User', [
      t.Field('name', t.str),
      t.Field('id', t.Ref('ID')),
      t.Field('createdAt', t.num),
    ]);
    const codegen = new MsgPackSerializerCodegen({
      encoder,
      ref: () => typeId,
    });
    const json = {
      name: 'John',
      id: '123',
      createdAt: 123,
    };
    const fn = codegen.compile(type);
    const blob = fn(json);
    const decoded = decoder.decode(blob);
    expect(decoded).toStrictEqual(json);
  });

  test('can serialize reference by partial serializer', () => {
    const typeId = t.String();
    const type = t.Object('User', [
      t.Field('name', t.str),
      t.Field('id', t.Ref('ID')),
      t.Field('createdAt', t.num),
    ]);
    const codegen = new MsgPackSerializerCodegen({
      encoder,
      ref: () => {
        const codegen2 = new MsgPackSerializerCodegen({encoder});
        return codegen2.compilePartial(typeId);
      },
    });
    const json = {
      name: 'John',
      id: '123',
      createdAt: 123,
    };
    const fn = codegen.compile(type);
    const blob = fn(json);
    const decoded = decoder.decode(blob);
    expect(decoded).toStrictEqual(json);
  });
});
