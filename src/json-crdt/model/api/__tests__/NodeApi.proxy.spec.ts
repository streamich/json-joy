import {Model} from '../../Model';
import {s} from '../../../../json-crdt-patch';

describe('.$', () => {
  const model = Model.create(
    s.obj({
      obj: s.obj({
        str: s.str('asdf'),
        num: s.con(1234),
        nested: s.json({
          address: {
            street: s.str('1st Ave'),
            city: s.str('New York'),
          },
        }),
      }),
      vec: s.vec(s.con('asdf'), s.con(1234), s.con(true), s.con(null)),
      arr: s.arr([s.con('asdf'), s.val(s.con(0))]),
      bin: s.bin(new Uint8Array([1, 2, 3])),
    }),
  );

  test('can use relative path starting from sub-object', () => {
    const obj = model.$.obj.nested.$;
    const str = obj?.$.address.city.$;
    expect(str?.view()).toBe('New York');
  });
});
