import {agg} from '../line';

describe('agg()', () => {
  test('empty patch', () => {
    expect(agg([])).toEqual([]);
  });

  test('single line without newline', () => {
    expect(agg([[0, 'abc']])).toEqual([[[0, 'abc']]]);
  });

  test('merges adjacent same-type ops within a line', () => {
    expect(
      agg([
        [0, 'a'],
        [0, 'b\nc'],
      ]),
    ).toEqual([[[0, 'ab\n']], [[0, 'c']]]);
  });

  test('splits a multi-line op into one patch per line', () => {
    expect(agg([[-1, 'a\nb\nc']])).toEqual([[[-1, 'a\n']], [[-1, 'b\n']], [[-1, 'c']]]);
  });

  test('moves an equal line ending forward across deleted lines', () => {
    const lines = agg([
      [0, 'Hell'],
      [-1, 'o\n'],
      [-1, ' wor'],
      [-1, 'ld\n'],
      [-1, 'gog'],
      [0, 'o\n'],
    ]);
    expect(lines).toEqual([[[0, 'Hello\n']], [[-1, ' world\n']], [[-1, 'gogo\n']]]);
  });

  test('moves an equal line start backward across inserted lines', () => {
    const lines = agg([
      [0, 'ab'],
      [1, 'x\n'],
      [1, 'ab'],
      [0, 'y\n'],
    ]);
    expect(lines).toEqual([[[1, 'abx\n']], [[0, 'aby\n']]]);
  });

  test('drops empty ops', () => {
    expect(agg([[0, '']])).toEqual([]);
  });

  test('does not move a deleted line ending across a pure-insert line', () => {
    const lines = agg([
      [0, 'He'],
      [-1, 'llo\n'],
      [1, 'world\n'],
    ]);
    expect(lines).toEqual([
      [
        [0, 'He'],
        [-1, 'llo\n'],
      ],
      [[1, 'world\n']],
    ]);
  });

  test('does not move a deleted line ending into a [DEL, INS] line', () => {
    const lines = agg([
      [0, 'x'],
      [-1, 'p\n'],
      [-1, 'a'],
      [1, 'b\n'],
    ]);
    expect(lines).toEqual([
      [
        [0, 'x'],
        [-1, 'p\n'],
      ],
      [
        [-1, 'a'],
        [1, 'b\n'],
      ],
    ]);
  });
});
