import {diffEdit} from '../str';
import {assertPatch} from './util';

const check = (src: string, dst: string, caret: number, expected: unknown) => {
  const patch = diffEdit(src, dst, caret);
  expect(patch).toEqual(expected);
  assertPatch(src, dst, patch);
};

describe('diffEdit() caret and boundary matrix', () => {
  test('insert at end, middle, and start', () => {
    check('ab', 'abz', 3, [
      [0, 'ab'],
      [1, 'z'],
    ]);
    check('ax', 'abx', 2, [
      [0, 'a'],
      [1, 'b'],
      [0, 'x'],
    ]);
    check('xy', 'abxy', 2, [
      [1, 'ab'],
      [0, 'xy'],
    ]);
  });

  test('delete at end, middle, and start', () => {
    check('abz', 'ab', 2, [
      [0, 'ab'],
      [-1, 'z'],
    ]);
    check('abx', 'ax', 1, [
      [0, 'a'],
      [-1, 'b'],
      [0, 'x'],
    ]);
    check('abxy', 'xy', 0, [
      [-1, 'ab'],
      [0, 'xy'],
    ]);
  });

  test('caret past the end of dst', () => {
    check('ab', 'abz', 10, [
      [0, 'ab'],
      [1, 'z'],
    ]);
    check('abz', 'ab', 10, [
      [0, 'ab'],
      [-1, 'z'],
    ]);
  });

  test('empty src and empty dst', () => {
    check('', 'ab', 2, [[1, 'ab']]);
    check('ab', '', 0, [[-1, 'ab']]);
  });

  test('negative caret falls back to full diff', () => {
    check('same', 'same', -1, [[0, 'same']]);
    check('ab', 'cd', -1, [
      [-1, 'ab'],
      [1, 'cd'],
    ]);
  });
});
