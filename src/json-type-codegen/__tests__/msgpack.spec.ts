import {t} from '../../json-type/type';
import {EncoderFull} from '../../json-pack/EncoderFull';
import {Decoder} from '../../json-pack/Decoder';
import {EncodingPlan} from '../msgpack';

const encoder = new EncoderFull();
const decoder = new Decoder();

test('serializes according to schema', () => {
  const type = t.Object({
    fields: [
      t.Field('a', t.num),
      t.Field('b', t.str),
      t.Field('c', t.nil),
      t.Field('d', t.bool),
      t.Field('arr', t.Array(t.Object({
        fields: [
          t.Field('foo', t.Array(t.num)),
        ],
      }))),
      t.Field('bin', t.bin),
    ],
  });

  const plan = new EncodingPlan();
  const js = plan.createPlan(type);
  const fn = eval(js)(encoder);
  const json = {
    a: 1.1,
    b: 'sdf',
    c: null,
    d: true,
    arr: [{foo: [1]}, {foo: [4, 4, 4.4]}],
    bin: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
  };
  const blob = fn(json);
  const decoded = decoder.decode(blob);

  expect(decoded).toStrictEqual(json);
});
