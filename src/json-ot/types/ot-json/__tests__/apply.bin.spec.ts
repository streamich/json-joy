import {apply} from '../apply';
import {EDIT_TYPE} from '../constants';

const b = (...arr: number[]) => new Uint8Array(arr);

test('can edit binary data', () => {
  const doc = {
    foo: b(1, 2),
  };

  const result = apply(doc, [[], [], [], [], [[EDIT_TYPE.OT_BINARY, ['foo'], [2, b(3)]]]]);

  expect(result).toStrictEqual({
    foo: b(1, 2, 3),
  });
});

test('can edit binary data - 2', () => {
  const doc = {
    foo: b(1, 2),
    bar: b(),
  };

  const result = apply(doc, [
    [],
    [],
    [],
    [],
    [
      [EDIT_TYPE.OT_BINARY, ['foo'], [-1, 1, b(3)]],
      [EDIT_TYPE.OT_BINARY, ['bar'], [b(1, 2, 3)]],
    ],
  ]);

  expect(result).toStrictEqual({
    foo: b(2, 3),
    bar: b(1, 2, 3),
  });
});
