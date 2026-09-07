import * as lines from '../../lines';
import {ed, edHunks} from '../ed';
import {parse} from '../parse';
import {Hunk, HunkLine, HUNK_OP_TYPE} from '../types';
import {int, logSeed, pick, random} from '../../__tests__/rnd';
import {File, diff, text} from './util';

const seq = (n: number): string[] => Array.from({length: n}, (_, i) => String(i + 1));
const write = (a: string, b: string): string => {
  const {src, dst, patch, opts} = diff(a, b);
  return text(ed(src, dst, patch, opts));
};

/**
 * A line-buffer `ed`, enough of one to replay a `diff -e` script. Addresses are
 * resolved against the buffer *as it stands*, which is the whole point: a script
 * emitted top-down renumbers the lines its own later commands address, and only
 * an interpreter that mutates as it goes notices.
 */
export const edApply = (src: string[], script: string): string[] => {
  const buf = src.slice();
  const rows = script.split('\n');
  if (rows[rows.length - 1] === '') rows.pop();
  let i = 0;
  let cur = buf.length;
  const input = (at: number): void => {
    const add: string[] = [];
    while (i < rows.length && rows[i] !== '.') add.push(rows[i++]);
    i++;
    buf.splice(at, 0, ...add);
    cur = at + add.length;
  };
  while (i < rows.length) {
    const cmd = rows[i++];
    const m = /^(\d+)(?:,(\d+))?([acd])$/.exec(cmd);
    if (m) {
      const from = Number(m[1]);
      const to = m[2] === undefined ? from : Number(m[2]);
      if (m[3] === 'a') input(from);
      else {
        buf.splice(from - 1, to - from + 1);
        cur = from - 1;
        if (m[3] === 'c') input(from - 1);
      }
    } else if (cmd === 'a') input(cur);
    else if (cmd === 's/.//') buf[cur - 1] = buf[cur - 1].slice(1);
    else throw new Error('unsupported ed command: ' + JSON.stringify(cmd));
  }
  return buf;
};

describe('ed()', () => {
  test('identical files yield nothing', () => {
    expect(write('a\nb\n', 'a\nb\n')).toBe('');
    expect(write('', '')).toBe('');
  });

  test('an append names the line it follows', () => {
    const src = seq(10).join('\n') + '\n';
    const dst = ['1', '2', '3', 'X', '4', '5', '6', '7', '8', '9', '10'].join('\n') + '\n';
    expect(write(src, dst)).toBe('3a\nX\n.\n');
  });

  test('a prepend is 0a', () => {
    expect(write('1\n2\n', 'X\n1\n2\n')).toBe('0a\nX\n.\n');
  });

  test('a deletion carries no terminator', () => {
    const src = ['1', '2', '3', 'X', '4', '5', '6', '7', '8'].join('\n') + '\n';
    expect(write(src, seq(8).join('\n') + '\n')).toBe('4d\n');
  });

  test('a change collapses a single-line range', () => {
    const src = seq(10).join('\n') + '\n';
    const dst = ['1', '2', '3', 'P', 'Q', 'R', '6', '7', '8', '9', '10'].join('\n') + '\n';
    expect(write(src, dst)).toBe('4,5c\nP\nQ\nR\n.\n');
    expect(write('a\nb\nc\n', 'a\nx\nc\n')).toBe('2c\nx\n.\n');
  });

  test('a file created from nothing, and one emptied', () => {
    expect(write('', 'a\nb\nc\n')).toBe('0a\na\nb\nc\n.\n');
    expect(write('a\nb\nc\n', '')).toBe('1,3d\n');
  });

  describe('bottom-up', () => {
    test('the last hunk is emitted first', () => {
      const src = seq(10).join('\n') + '\n';
      const dst = ['X', '2', '3', '4', '5', '6', '7', '8', '9', 'Y'].join('\n') + '\n';
      expect(write(src, dst)).toBe('10c\nY\n.\n1c\nX\n.\n');
    });

    test('addresses stay valid as the script applies', () => {
      const src = seq(9).join('\n') + '\n';
      const dst = ['1', '3', '4', 'Z', '5', '6', '7', '8', '9'].join('\n') + '\n';
      expect(write(src, dst)).toBe('4a\nZ\n.\n2d\n');
      expect(edApply(new File(src).lines, write(src, dst))).toEqual(new File(dst).lines);
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
          expect(edApply(src, text(ed(src, dst, patch)))).toEqual(dst);
        } catch (error) {
          logSeed({i, src, dst});
          throw error;
        }
      }
    });
  });

  describe('a line that is a single dot', () => {
    test('is written .. and taken back down with s/.//', () => {
      expect(write('x\ny\n', 'x\n.\ny\n')).toBe('1a\n..\n.\ns/.//\n');
      expect(edApply(['x', 'y'], write('x\ny\n', 'x\n.\ny\n'))).toEqual(['x', '.', 'y']);
    });

    test('closes the block, so no terminator follows when it is last', () => {
      expect(write('x\ny\n', 'x\nz\n.\ny\n')).toBe('1a\nz\n..\n.\ns/.//\n');
    });

    test('reopens insert mode with a bare a for the lines after it', () => {
      const out = write('x\ny\n', 'x\n.\n.\nz\ny\n');
      expect(out).toBe('1a\n..\n.\ns/.//\na\n..\n.\ns/.//\na\nz\n.\n');
      expect(edApply(['x', 'y'], out)).toEqual(['x', '.', '.', 'z', 'y']);
    });

    test('as the whole replacement of a file', () => {
      expect(write('x\n', '.\n')).toBe('1c\n..\n.\ns/.//\n');
      expect(edApply(['x'], write('x\n', '.\n'))).toEqual(['.']);
    });
  });

  test('a missing final newline is dropped — an ed script cannot carry one', () => {
    expect(write('a\nb\nc', 'a\nb\nz')).toBe('3c\nz\n.\n');
    expect(write('a\nb\nc\n', 'a\nb\nz')).toBe('3c\nz\n.\n');
  });

  describe('the hunk that is only a final newline', () => {
    test('is dropped, leaving nothing at all', () => {
      expect(write('a\nb\nc', 'a\nb\nc\n')).toBe('');
      expect(write('a\nb\nc\n', 'a\nb\nc')).toBe('');
      expect(write('A', 'A\n')).toBe('');
    });

    test('does not take a real change with it', () => {
      expect(write('x\nA', 'y\nA\n')).toBe('1,2c\ny\nA\n.\n');
      expect(write('a\nb\nc', 'a\nZ\nc\n')).toBe('2,3c\nZ\nc\n.\n');
    });

    test('leaves the other hunks of the script alone', () => {
      const out = write('1\n2\n3\n4\n5\n6\n7\n8\n9\nZ', '1\nX\n3\n4\n5\n6\n7\n8\n9\nZ\n');
      expect(out).toBe('2c\nX\n.\n');
      expect(edApply('1 2 3 4 5 6 7 8 9 Z'.split(' '), out)).toEqual('1 X 3 4 5 6 7 8 9 Z'.split(' '));
    });

    test('edHunks drops a hand-built no-op and keeps the rest', () => {
      const real = new Hunk(1, 1, 1, 1, [new HunkLine(HUNK_OP_TYPE.DEL, 'a'), new HunkLine(HUNK_OP_TYPE.INS, 'X')]);
      const noop = new Hunk(9, 1, 9, 1, [
        new HunkLine(HUNK_OP_TYPE.DEL, 'Z', true),
        new HunkLine(HUNK_OP_TYPE.INS, 'Z'),
      ]);
      expect(text(edHunks([real, noop]))).toBe('1c\nX\n.\n');
      expect(text(edHunks([noop]))).toBe('');
      // Same counts, different text: a real change, not a no-op.
      const real2 = new Hunk(9, 1, 9, 1, [new HunkLine(HUNK_OP_TYPE.DEL, 'Z'), new HunkLine(HUNK_OP_TYPE.INS, 'Y')]);
      expect(text(edHunks([real2]))).toBe('9c\nY\n.\n');
    });
  });

  test('edHunks takes hunks read off the wire, which is what its docs promise', () => {
    // The no-op check used to index `lines[oldCount + i]`, which is only where
    // the old side sits for a hunk `hunks()` built: a parsed ed hunk holds no
    // old side at all and a context-bearing one interleaves it, and both threw
    // a TypeError here.
    const script = write(
      seq(10).join('\n') + '\n',
      ['1', 'X', '3', '4', '5', '6', '7', '8', '9', 'Z'].join('\n') + '\n',
    );
    expect(script).toBe('10c\nZ\n.\n2c\nX\n.\n');
    const [file] = parse(script);
    expect(file.hunks.map((h) => [h.oldCount, h.newCount])).toEqual([
      [1, 1],
      [1, 1],
    ]);
    expect(text(edHunks(file.hunks))).toBe(script);
    // Context-bearing hunks are not what `ed` takes, but they must not throw:
    // what is dropped is the hunk that changes nothing, read off its content.
    const changed = new Hunk(4, 3, 4, 3, [
      new HunkLine(HUNK_OP_TYPE.EQL, 'a'),
      new HunkLine(HUNK_OP_TYPE.DEL, 'b'),
      new HunkLine(HUNK_OP_TYPE.INS, 'c'),
      new HunkLine(HUNK_OP_TYPE.EQL, 'd'),
    ]);
    expect(text(edHunks([changed]))).toBe('4,6c\nc\n.\n');
    const unchanged = new Hunk(4, 3, 4, 3, [
      new HunkLine(HUNK_OP_TYPE.EQL, 'a'),
      new HunkLine(HUNK_OP_TYPE.DEL, 'b'),
      new HunkLine(HUNK_OP_TYPE.INS, 'b'),
      new HunkLine(HUNK_OP_TYPE.EQL, 'd'),
    ]);
    expect(text(edHunks([unchanged]))).toBe('');
  });

  test('edHunks renders hunks assembled by hand, last first', () => {
    const first = new Hunk(1, 1, 1, 1, [new HunkLine(HUNK_OP_TYPE.DEL, 'a'), new HunkLine(HUNK_OP_TYPE.INS, 'X')]);
    const second = new Hunk(5, 0, 6, 1, [new HunkLine(HUNK_OP_TYPE.INS, 'Y')]);
    expect(text(edHunks([first, second]))).toBe('5a\nY\n.\n1c\nX\n.\n');
    expect(text(edHunks([]))).toBe('');
  });
});
