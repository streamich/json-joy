import {Model} from '../..';
import {s} from '../../../../json-crdt-patch';

export const schema = s.obj({
  str: s.str('abc'),
  num: s.con(123),
  bool: s.con(true),
  null: s.con(null),
  obj: s.obj({
    str: s.str('asdf'),
    num: s.con(1234),
    address: s.obj({
      city: s.str<string>('New York'),
      zip: s.con(10001),
    }),
  }),
  vec: s.vec(s.con('asdf'), s.con(1234), s.con(true), s.con(null)),
  arr: s.arr([s.con('asdf'), s.val(s.con(0))]),
  bin: s.bin(new Uint8Array([1, 2, 3])),
});

export const createTypedModel = () => Model.create(schema);

export const createUntypedModel = () => {
  const doc = Model.create();
  doc.api.root({
    foo: 'bar',
    obj: {
      nested: {
        value: 42,
        deep: {
          another: 'value',
        },
      },
    },
    arr: [
      1,
      2,
      {
        nested: [1, 2, 3],
        deep: {
          value: 4,
        },
      },
    ],
  });
  return doc;
};
