import * as line from '../line';
import * as lines from '../lines';
import {assertDiff} from './line';
import {int, logSeed, pick} from './rnd';

describe('lines.diff()', () => {
  test('substitution becomes delete + insert (no MIX)', () => {
    expect(lines.diff(['a', 'b', 'c'], ['a', 'x', 'c'])).toEqual([
      [line.LINE_PATCH_OP_TYPE.EQL, 0, 0],
      [line.LINE_PATCH_OP_TYPE.DEL, 1, 0],
      [line.LINE_PATCH_OP_TYPE.INS, 1, 1],
      [line.LINE_PATCH_OP_TYPE.EQL, 2, 2],
    ]);
  });

  test('empty inputs', () => {
    expect(lines.diff([], [])).toEqual([]);
    expect(lines.diff(['a', 'b'], [])).toEqual([
      [line.LINE_PATCH_OP_TYPE.DEL, 0, -1],
      [line.LINE_PATCH_OP_TYPE.DEL, 1, -1],
    ]);
    expect(lines.diff([], ['a', 'b'])).toEqual([
      [line.LINE_PATCH_OP_TYPE.INS, -1, 0],
      [line.LINE_PATCH_OP_TYPE.INS, -1, 1],
    ]);
  });

  test('equal inputs yield all-equal ops', () => {
    expect(lines.diff(['a', 'b'], ['a', 'b'])).toEqual([
      [line.LINE_PATCH_OP_TYPE.EQL, 0, 0],
      [line.LINE_PATCH_OP_TYPE.EQL, 1, 1],
    ]);
  });

  test('matches line.diff index convention on a move (no modified lines)', () => {
    const src = ['H', 'J', 'W', 'M'];
    const dst = ['M', 'H', 'J', 'W'];
    expect(lines.diff(src, dst)).toEqual([
      [line.LINE_PATCH_OP_TYPE.INS, -1, 0],
      [line.LINE_PATCH_OP_TYPE.EQL, 0, 1],
      [line.LINE_PATCH_OP_TYPE.EQL, 1, 2],
      [line.LINE_PATCH_OP_TYPE.EQL, 2, 3],
      [line.LINE_PATCH_OP_TYPE.DEL, 3, 3],
    ]);
  });

  test('reconstructs and applies validly across many cases', () => {
    const cases: [string[], string[]][] = [
      [
        ['0', '1', '3', 'x', 'y', '4', '5'],
        ['1', '2', '3', '4', 'a', 'b', 'c', '5'],
      ],
      [
        ['a', 'x'],
        ['b', 'c', 'd'],
      ],
      [['1'], []],
      [[], ['1']],
      [
        ['1', '1', '2'],
        ['1', '1'],
      ],
      [
        ['1', '2', '3'],
        ['1', '3'],
      ],
      [
        ['b', 'a'],
        ['7', '3', 'd', '7', '9', '9', '9'],
      ],
      [['1', '2', '3', '4', '5', '6'], ['3']],
      [
        ['', '7', '20', '09'],
        ['', ''],
      ],
    ];
    for (const [src, dst] of cases) {
      const patch = lines.diff(src, dst);
      // assertDiff validates reconstruction, index ranges/monotonicity, and line.apply replay.
      assertDiff(src, dst, patch);
    }
  });

  test('never emits MIX ops', () => {
    for (let i = 0; i < 1000; i++) {
      const src: string[] = [];
      const dst: string[] = [];
      const la = int(8);
      const lb = int(8);
      for (let j = 0; j < la; j++) src.push(pick(['a', 'b', 'c', '', 'x1', 'y2']));
      for (let j = 0; j < lb; j++) dst.push(pick(['a', 'b', 'c', '', 'x1', 'y2']));
      const patch = lines.diff(src, dst);
      try {
        for (const op of patch) expect(op[0]).not.toBe(line.LINE_PATCH_OP_TYPE.MIX);
        assertDiff(src, dst, patch);
      } catch (error) {
        logSeed({src, dst});
        throw error;
      }
    }
  });
});
