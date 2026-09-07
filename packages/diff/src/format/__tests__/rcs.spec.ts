import * as lines from '../../lines';
import {rcs, rcsHunks} from '../rcs';
import {Hunk, HunkLine, HUNK_OP_TYPE} from '../types';
import {int, logSeed, pick, random} from '../../__tests__/rnd';
import {diff, text} from './util';

const seq = (n: number): string[] => Array.from({length: n}, (_, i) => String(i + 1));
const write = (a: string, b: string): string => {
  const {src, dst, patch, opts} = diff(a, b);
  return text(rcs(src, dst, patch, opts));
};

/**
 * An RCS diff applier, read the way RCS itself reads a delta: one forward pass
 * with a cursor into the original, copying up to each command's address and
 * refusing to go backwards. Rebuilding from a deletion bitmap instead would
 * accept `d4 2` followed by `a4 3` as readily as `a5 3` — both lines are deleted
 * either way — and only one of those is a legal script.
 */
export const rcsApply = (src: string[], script: string): string[] => {
  const rows = script.split('\n');
  if (rows[rows.length - 1] === '') rows.pop();
  const out: string[] = [];
  let at = 0;
  for (let i = 0; i < rows.length; ) {
    const cmd = rows[i++];
    const m = /^([ad])(\d+) (\d+)$/.exec(cmd);
    if (!m) throw new Error('unsupported RCS command: ' + JSON.stringify(cmd));
    const count = Number(m[3]);
    // `dN M` deletes M lines from original line N; `aN M` appends M after line N.
    const upto = m[1] === 'd' ? Number(m[2]) - 1 : Number(m[2]);
    if (upto < at) throw new Error(`address ${m[2]} is behind the cursor at ${at}: ` + JSON.stringify(cmd));
    while (at < upto) out.push(src[at++]);
    if (m[1] === 'd') at += count;
    else for (const line of rows.slice(i, (i += count))) out.push(line);
  }
  while (at < src.length) out.push(src[at++]);
  return out;
};

describe('rcs()', () => {
  test('identical files yield nothing', () => {
    expect(write('a\nb\n', 'a\nb\n')).toBe('');
    expect(write('', '')).toBe('');
  });

  test('an append names the line it follows', () => {
    const src = seq(10).join('\n') + '\n';
    const dst = ['1', '2', '3', 'X', '4', '5', '6', '7', '8', '9', '10'].join('\n') + '\n';
    expect(write(src, dst)).toBe('a3 1\nX\n');
  });

  test('a prepend is a0', () => {
    expect(write('1\n2\n', 'X\n1\n2\n')).toBe('a0 1\nX\n');
  });

  test('a deletion carries a count, not a range', () => {
    const src = ['1', '2', '3', 'X', '4', '5', '6', '7', '8'].join('\n') + '\n';
    expect(write(src, seq(8).join('\n') + '\n')).toBe('d4 1\n');
    expect(write('a\nb\nc\n', '')).toBe('d1 3\n');
  });

  test('a change is a delete plus an append after the last deleted line', () => {
    const src = seq(10).join('\n') + '\n';
    const dst = ['1', '2', '3', 'P', 'Q', 'R', '6', '7', '8', '9', '10'].join('\n') + '\n';
    expect(write(src, dst)).toBe('d4 2\na5 3\nP\nQ\nR\n');
  });

  test('a file created from nothing', () => {
    expect(write('', 'a\nb\nc\n')).toBe('a0 3\na\nb\nc\n');
  });

  test('hunks come in file order — every address is an original line', () => {
    const src = seq(10).join('\n') + '\n';
    const dst = ['X', '2', '3', '4', '5', '6', '7', '8', '9', 'Y'].join('\n') + '\n';
    expect(write(src, dst)).toBe('d1 1\na1 1\nX\nd10 1\na10 1\nY\n');
  });

  test('a dot line needs no escaping here', () => {
    expect(write('x\ny\n', 'x\n.\ny\n')).toBe('a1 1\n.\n');
    expect(write('x\ny\n', 'x\n.\n.\nz\ny\n')).toBe('a1 3\n.\n.\nz\n');
  });

  describe('no trailing newline', () => {
    test('is spelled by writing the last line without one, and never marked', () => {
      expect(write('a\nb\nc', 'a\nb\nz')).toBe('d3 1\na3 1\nz');
      expect(write('a\nb\nc\n', 'a\nb\nz')).toBe('d3 1\na3 1\nz');
    });

    test('a terminated destination keeps its terminator', () => {
      expect(write('a\nb\nc', 'a\nb\nc\n')).toBe('d3 1\na3 1\nc\n');
    });

    test('an unterminated source that is not inserted leaves no trace', () => {
      expect(write('a\nb\nc', 'x\nb\nc')).toBe('d1 1\na1 1\nx\n');
    });
  });

  test('replays to the destination over random pairs', () => {
    const alphabet = ['a', 'b', 'c', '.', '', 'function f() {', '}', 'const x = 2;'];
    for (let i = 0; i < 200; i++) {
      const src = Array.from({length: int(40)}, () => pick(alphabet));
      const rate = pick([0.05, 0.2, 0.6]);
      const dst: string[] = [];
      for (const line of src) {
        const r = random();
        if (r < rate / 3) continue;
        else if (r < (2 * rate) / 3) dst.push(pick(alphabet));
        else if (r < rate) {
          dst.push(pick(alphabet));
          dst.push(line);
        } else dst.push(line);
      }
      const patch = lines.diff(src, dst);
      try {
        expect(rcsApply(src, text(rcs(src, dst, patch)))).toEqual(dst);
      } catch (error) {
        logSeed({i, src, dst});
        throw error;
      }
    }
  });

  test('rcsHunks renders hunks assembled by hand', () => {
    const hunk = new Hunk(3, 0, 4, 1, [new HunkLine(HUNK_OP_TYPE.INS, 'X')]);
    expect(text(rcsHunks([hunk]))).toBe('a3 1\nX\n');
    expect(text(rcsHunks([]))).toBe('');
  });
});
