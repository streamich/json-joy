import {bin, line, lines, optimize, str, tok, word} from '../index';

test('exposes the str, line, lines, bin, optimize, tok, and word modules', () => {
  expect(typeof str.diff).toBe('function');
  expect(typeof line.diff).toBe('function');
  expect(typeof lines.diff).toBe('function');
  expect(typeof bin.diff).toBe('function');
  expect(typeof optimize.coarsen).toBe('function');
  expect(typeof tok.diff).toBe('function');
  expect(typeof word.diff).toBe('function');
  expect(str.diff('a', 'b')).toEqual([
    [str.PATCH_OP_TYPE.DEL, 'a'],
    [str.PATCH_OP_TYPE.INS, 'b'],
  ]);
});
