import {Model} from '../../Model';
import {s} from '../../../../json-crdt-patch';

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
    val: s.val(s.con('Hello')),
    vec: s.vec(s.con('asdf'), s.con(1234), s.con(true), s.con(null)),
    arr: s.arr([s.con('asdf'), s.val(s.con(0))]),
    bin: s.bin(new Uint8Array([1, 2, 3])),
  }),
);

describe('.$', () => {
  test('can use relative path starting from sub-object', () => {
    const obj = model.$.obj.nested.$;
    const str = obj?.$.address.city.$;
    expect(str?.view()).toBe('New York');
  });
});

describe('.s', () => {
  test('can use relative path starting from sub-object', () => {
    const obj = model.s.obj.nested.$;
    const str = obj.s.address.city.$;
    expect(str?.view()).toBe('New York');
  });

  test('can resolve a "val" node', () => {
    const str = model.s.val._.$;
    expect(str.view()).toBe('Hello');
  });
});
