import {apply} from '../apply';
import {EDIT_TYPE} from '../constants';

test('can edit a string', () => {
  const doc = {
    foo: 'hello',
  };

  const result = apply(doc, [[], [], [], [], [[EDIT_TYPE.OT_STRING, ['foo'], [5, ' world!']]]]);

  expect(result).toStrictEqual({
    foo: 'hello world!',
  });
});

test('can edit a string - 2', () => {
  const doc = {
    foo: 'hello',
    arr: ['12'],
    b: {
      id: 'xxxxxxxx--xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    },
  };

  const result = apply(doc, [
    [],
    [],
    [],
    [],
    [
      [EDIT_TYPE.OT_STRING, ['foo'], [5, ' world!']],
      [EDIT_TYPE.OT_STRING, ['arr', 0], [2, '3']],
      [EDIT_TYPE.OT_STRING, ['b', 'id'], [8, -1]],
    ],
  ]);

  expect(result).toStrictEqual({
    foo: 'hello world!',
    arr: ['123'],
    b: {
      id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    },
  });
});
