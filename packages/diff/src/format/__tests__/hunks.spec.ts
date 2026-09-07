import {LINE_PATCH_OP_TYPE} from '../../line';
import * as lines from '../../lines';
import {context as contextFormat} from '../context';
import {diffKeys, hunks} from '../hunks';
import {HUNK_OP_TYPE} from '../types';
import {unified} from '../unified';
import {diff, replay, text} from './util';

const seq = (n: number): string[] => Array.from({length: n}, (_, i) => String(i + 1));

describe('hunks()', () => {
  test('no changes yields no hunks', () => {
    expect(hunks(['a', 'b'], ['a', 'b'], lines.diff(['a', 'b'], ['a', 'b']))).toEqual([]);
    expect(hunks([], [], [])).toEqual([]);
  });

  test('groups a change with its context and numbers it 1-based', () => {
    const src = seq(10);
    const dst = ['1', '2', '3', 'X', '4', '5', '6', '7', '8', '9', '10'];
    const [hunk, ...rest] = hunks(src, dst, lines.diff(src, dst));
    expect(rest).toEqual([]);
    expect([hunk.oldStart, hunk.oldCount, hunk.newStart, hunk.newCount]).toEqual([1, 6, 1, 7]);
    expect(hunk.lines.map((l) => l.op)).toEqual([0, 0, 0, HUNK_OP_TYPE.INS, 0, 0, 0]);
  });

  test('a pure insertion numbers the line BEFORE it, with a zero count', () => {
    const src = seq(10);
    const dst = ['1', '2', '3', 'X', '4', '5', '6', '7', '8', '9', '10'];
    const [hunk] = hunks(src, dst, lines.diff(src, dst), {context: 0});
    expect([hunk.oldStart, hunk.oldCount, hunk.newStart, hunk.newCount]).toEqual([3, 0, 4, 1]);
  });

  test('a pure deletion numbers the destination line before it', () => {
    const src = ['1', '2', '3', 'X', '4'];
    const dst = ['1', '2', '3', '4'];
    const [hunk] = hunks(src, dst, lines.diff(src, dst), {context: 0});
    expect([hunk.oldStart, hunk.oldCount, hunk.newStart, hunk.newCount]).toEqual([4, 1, 3, 0]);
  });

  test('insertion into an empty file starts at 0', () => {
    const dst = ['a', 'b', 'c'];
    const [hunk] = hunks([], dst, lines.diff([], dst));
    expect([hunk.oldStart, hunk.oldCount, hunk.newStart, hunk.newCount]).toEqual([0, 0, 1, 3]);
  });

  test('emptying a file ends at 0', () => {
    const src = ['a', 'b', 'c'];
    const [hunk] = hunks(src, [], lines.diff(src, []));
    expect([hunk.oldStart, hunk.oldCount, hunk.newStart, hunk.newCount]).toEqual([1, 3, 0, 0]);
  });

  test('merges two changes exactly 2*context apart, splits at one more', () => {
    const src = seq(15);
    const merged = [...src];
    merged[0] = 'X';
    merged[7] = 'Y'; // six unchanged lines between the two changes
    expect(hunks(src, merged, lines.diff(src, merged))).toHaveLength(1);
    const split = [...src];
    split[0] = 'X';
    split[8] = 'Y'; // seven
    expect(hunks(src, split, lines.diff(src, split))).toHaveLength(2);
  });

  test('context 0 never merges', () => {
    const src = seq(15);
    const dst = [...src];
    dst[0] = 'X';
    dst[1] = 'Y';
    dst[3] = 'Z';
    expect(hunks(src, dst, lines.diff(src, dst), {context: 0})).toHaveLength(2);
  });

  test('context is clipped at both ends of the file', () => {
    const src = ['a', 'b'];
    const dst = ['a', 'x'];
    const [hunk] = hunks(src, dst, lines.diff(src, dst), {context: 100});
    expect([hunk.oldStart, hunk.oldCount, hunk.newStart, hunk.newCount]).toEqual([1, 2, 1, 2]);
    expect(hunk.lines).toHaveLength(3);
  });

  describe('a context width that is not a non-negative integer', () => {
    // `-1` used to make a hunk end before it began, so the loop never advanced:
    // it spun allocating hunks until the heap died. `1.5` indexed the op array
    // with a fraction and threw. Both are reachable from `diff -U <argv>`.
    const src = ['a', 'b', 'c', 'd', 'e'];
    const dst = ['a', 'b', 'X', 'd', 'e'];
    const patch = lines.diff(src, dst);
    const at = (context: number) => {
      const out = hunks(src, dst, patch, {context});
      return out.map((h) => [h.oldStart, h.oldCount, h.newStart, h.newCount]);
    };

    test('negative is clamped to 0, and terminates', () => {
      expect(at(-1)).toEqual(at(0));
      expect(at(-1000)).toEqual(at(0));
      expect(at(Number.NEGATIVE_INFINITY)).toEqual(at(0));
    });

    test('NaN is clamped to 0, not to the whole file', () => {
      expect(at(Number.NaN)).toEqual(at(0));
    });

    test('a fraction is floored', () => {
      expect(at(1.5)).toEqual(at(1));
      expect(at(0.5)).toEqual(at(0));
      expect(at(3.999)).toEqual(at(3));
    });

    test('Infinity is the whole file, in one hunk', () => {
      expect(at(Number.POSITIVE_INFINITY)).toEqual([[1, 5, 1, 5]]);
    });

    test('the writers on top render the clamped width', () => {
      const same = (bad: number, clamped: number) => {
        expect(text(unified(src, dst, patch, {context: bad}))).toBe(text(unified(src, dst, patch, {context: clamped})));
        expect(text(contextFormat(src, dst, patch, {context: bad}))).toBe(
          text(contextFormat(src, dst, patch, {context: clamped})),
        );
      };
      same(-1, 0);
      same(Number.NaN, 0);
      same(1.5, 1);
    });
  });

  test('a MIX op becomes a delete plus an insert', () => {
    const src = ['a', 'b'];
    const dst = ['a', 'bb'];
    const patch = [
      [LINE_PATCH_OP_TYPE.EQL, 0, 0],
      [LINE_PATCH_OP_TYPE.MIX, 1, 1],
    ] as const;
    const [hunk] = hunks(src, dst, patch as any, {context: 0});
    expect([hunk.oldStart, hunk.oldCount, hunk.newStart, hunk.newCount]).toEqual([2, 1, 2, 1]);
    expect(hunk.lines.map((l) => [l.op, l.text])).toEqual([
      [HUNK_OP_TYPE.DEL, 'b'],
      [HUNK_OP_TYPE.INS, 'bb'],
    ]);
  });

  test('deletions of a run come before its insertions', () => {
    const src = ['a', 'b', 'c'];
    const dst = ['a', 'x', 'y', 'c'];
    const [hunk] = hunks(src, dst, lines.diff(src, dst), {context: 0});
    expect(hunk.lines.map((l) => l.op)).toEqual([HUNK_OP_TYPE.DEL, HUNK_OP_TYPE.INS, HUNK_OP_TYPE.INS]);
  });

  test('section callback gets the source index the hunk starts at', () => {
    const src = seq(20);
    const dst = [...src];
    dst[9] = 'X';
    const seen: number[] = [];
    const [hunk] = hunks(src, dst, lines.diff(src, dst), {
      section: (i) => {
        seen.push(i);
        return 'fn ' + i;
      },
    });
    expect(seen).toEqual([6]);
    expect(hunk.section).toBe('fn 6');
  });

  describe('no trailing newline', () => {
    test('marks the deleted and the inserted last line', () => {
      const {src, dst, patch, opts} = diff('a\nb\nc', 'a\nb\nz');
      const [hunk] = hunks(src, dst, patch, opts);
      expect(hunk.lines.map((l) => [l.text, l.noEol])).toEqual([
        ['a', false],
        ['b', false],
        ['c', true],
        ['z', true],
      ]);
    });

    test('marks only the side that lacks the newline', () => {
      const {src, dst, patch, opts} = diff('a\nb\nc', 'a\nb\nc\n');
      const [hunk] = hunks(src, dst, patch, opts);
      expect(hunk.lines.map((l) => [l.op, l.text, l.noEol])).toEqual([
        [HUNK_OP_TYPE.EQL, 'a', false],
        [HUNK_OP_TYPE.EQL, 'b', false],
        [HUNK_OP_TYPE.DEL, 'c', true],
        [HUNK_OP_TYPE.INS, 'c', false],
      ]);
    });

    test('marks a context line when both files end unterminated on it', () => {
      const {src, dst, patch, opts} = diff('a\nb\nc', 'x\nb\nc');
      const [hunk] = hunks(src, dst, patch, opts);
      expect(hunk.lines.map((l) => [l.op, l.text, l.noEol])).toEqual([
        [HUNK_OP_TYPE.DEL, 'a', false],
        [HUNK_OP_TYPE.INS, 'x', false],
        [HUNK_OP_TYPE.EQL, 'b', false],
        [HUNK_OP_TYPE.EQL, 'c', true],
      ]);
    });

    test('a one-line unterminated file', () => {
      const {src, dst, patch, opts} = diff('a', 'b');
      const [hunk] = hunks(src, dst, patch, opts);
      expect([hunk.oldStart, hunk.oldCount, hunk.newStart, hunk.newCount]).toEqual([1, 1, 1, 1]);
      expect(hunk.lines.map((l) => [l.text, l.noEol])).toEqual([
        ['a', true],
        ['b', true],
      ]);
    });
  });

  describe('diffKeys()', () => {
    test('leaves a terminated file alone', () => {
      const ls = ['a', 'b'];
      expect(diffKeys(ls, false)).toBe(ls);
      expect(diffKeys(ls)).toBe(ls);
      expect(diffKeys([], true)).toEqual([]);
    });

    test('makes an unterminated last line differ from a terminated one', () => {
      const ls = ['a', 'b'];
      const keys = diffKeys(ls, true);
      expect(ls).toEqual(['a', 'b']);
      expect(keys[0]).toBe('a');
      expect(keys[1]).not.toBe('b');
      expect(lines.diff(keys, ls).some(([t]) => t !== LINE_PATCH_OP_TYPE.EQL)).toBe(true);
    });

    test('without it the two files look identical and nothing is emitted', () => {
      const ls = ['a', 'b'];
      expect(hunks(ls, ls, lines.diff(ls, ls), {srcNoEol: true})).toEqual([]);
    });
  });

  describe('ignorable', () => {
    /** 16 numbered lines. */
    const src = seq(16);
    /** `src` with `insert` spliced in after line `n`, 1-based. */
    const at = (n: number, ...insert: string[]): string[] => {
      const dst = [...src];
      dst.splice(n, 0, ...insert);
      return dst;
    };
    const blank = (dst: string[]) => (op: HUNK_OP_TYPE, index: number) =>
      (op === HUNK_OP_TYPE.INS ? dst[index] : src[index]) === '';
    const group = (dst: string[], context: number, ignorable?: (op: HUNK_OP_TYPE, i: number) => boolean) =>
      hunks(src, dst, lines.diff(src, dst), {context, ignorable});

    test('a change run whose every line is ignorable is not a hunk', () => {
      const dst = at(2, '');
      expect(group(dst, 0)).toHaveLength(1);
      expect(group(dst, 0, blank(dst))).toEqual([]);
      expect(group(dst, 3, blank(dst))).toEqual([]);
    });

    test('a run of ignorable and ordinary lines together still counts', () => {
      const dst = at(2, '', 'NEW');
      const [hunk, ...rest] = group(dst, 0, blank(dst));
      expect(rest).toEqual([]);
      expect(hunk.lines.map((l) => l.text)).toEqual(['', 'NEW']);
    });

    test('the line numbers of what was dropped stay where they were', () => {
      // The blank line still occupies line 3 of the destination, so the change
      // at source line 8 is still `8` -> `9`. A filter over the *input* would
      // renumber it, which is the mistake this option exists to prevent.
      const dst = at(2, '');
      dst[8] = 'EIGHT';
      const [hunk, ...rest] = group(dst, 0, blank(dst));
      expect(rest).toEqual([]);
      expect([hunk.oldStart, hunk.oldCount, hunk.newStart, hunk.newCount]).toEqual([8, 1, 9, 1]);
    });

    test('a kept hunk prints the ignorable runs it absorbed', () => {
      // Two lines apart at width 3, so they merge - and then the blank line is
      // rendered as an ordinary insertion inside the hunk.
      const dst = at(4, '');
      dst[1] = 'TWO';
      const [hunk, ...rest] = group(dst, 3, blank(dst));
      expect(rest).toEqual([]);
      expect(hunk.lines.filter((l) => l.op === HUNK_OP_TYPE.INS).map((l) => l.text)).toEqual(['TWO', '']);
    });

    test('an ignorable run merges within `context`, not `2 * context + 1`', () => {
      // Gap 3 at width 3: an ordinary run would merge (3 < 7) and an ignorable
      // one does not (3 >= 3), so it becomes a hunk of its own and is dropped.
      const near = at(4, '');
      near[1] = 'TWO';
      const far = at(5, '');
      far[1] = 'TWO';
      expect(group(near, 3).map((h) => h.lines.length)).toEqual([9]);
      expect(group(far, 3).map((h) => h.lines.length)).toEqual([10]);
      expect(group(near, 3, blank(near)).map((h) => h.lines.length)).toEqual([9]);
      expect(group(far, 3, blank(far)).map((h) => h.lines.length)).toEqual([6]);
    });

    test('the threshold is read off the FOLLOWING run only', () => {
      // Ignorable first, ordinary second, gap 3: the second sets the threshold,
      // so the two merge and the hunk is the one no filter would have changed.
      const dst = at(2, '');
      dst[6] = 'SIX';
      expect(group(dst, 3, blank(dst))).toEqual(group(dst, 3));
    });

    test('without the option nothing about the grouping changes', () => {
      const dst = at(4, '');
      dst[1] = 'TWO';
      const patch = lines.diff(src, dst);
      for (const context of [0, 1, 3, 10])
        expect(hunks(src, dst, patch, {context, ignorable: () => false})).toEqual(hunks(src, dst, patch, {context}));
    });
  });

  test('replays against the source file at every context width', () => {
    const src = seq(30);
    const dst = [...src];
    dst[0] = 'X';
    dst.splice(10, 2, 'Y');
    dst.splice(20, 0, 'Z');
    const patch = lines.diff(src, dst);
    for (const context of [0, 1, 3, 10, 100]) expect(replay(src, hunks(src, dst, patch, {context}))).toEqual(dst);
  });
});
