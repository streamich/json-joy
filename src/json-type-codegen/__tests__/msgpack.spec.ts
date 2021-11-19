import {t} from '../../json-type/type';
import {EncoderFull} from '../../json-pack/EncoderFull';
import {Decoder} from '../../json-pack/Decoder';
import {EncodingPlan} from '../msgpack';
import {TType} from '../../json-type/types/json';

const encoder = new EncoderFull();
const decoder = new Decoder();

const exec = (type: TType, json: unknown) => {
  const plan = new EncodingPlan();
  plan.createPlan(type);
  const js = plan.codegen();
  const fn = eval(js)(encoder);
  const blob = fn(json);
  const decoded = decoder.decode(blob);

  expect(decoded).toStrictEqual(json);
};

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