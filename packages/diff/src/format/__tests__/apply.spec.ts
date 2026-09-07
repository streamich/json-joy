import {apply, invertHunk, invertHunks} from '../apply';
import {ed} from '../ed';
import {hunks} from '../hunks';
import {parse} from '../parse';
import {FilePatch, Hunk, HUNK_OP_TYPE, HunkLine} from '../types';
import {unifiedHunks} from '../unified';
import {diff, text} from './util';

/** `1\n2\n…\nn\n`, the file every offset in these tests is counted against. */
const nums = (n: number, from = 1): string => Array.from({length: n}, (_, i) => String(i + from)).join('\n') + '\n';

/** Replaces one 1-based line of a file, keeping its terminator. */
const edit = (file: string, line: number, to: string): string => {
  const list = file.split('\n');
  list[line - 1] = to;
  return list.join('\n');
};

/** A unified patch between two texts, as `diff -U context` writes one. */
const patchOf = (a: string, b: string, context = 3): string => {
  const {src, dst, patch, opts} = diff(a, b);
  return text(unifiedHunks(hunks(src, dst, patch, {...opts, context}), {oldName: 'a', newName: 'b'}));
};

const read = (patch: string): FilePatch => parse(patch)[0];

/** The one-hunk case the offset and fuzz tests all drift: line 5 of ten. */
const A = nums(10);
const B = edit(A, 5, 'FIVE');
const P = read(patchOf(A, B));

describe('apply()', () => {
  test('applies a patch to the file it was made from', () => {
    const result = apply(A, P);
    expect(result.text).toBe(B);
    expect(result.rejected).toEqual([]);
    expect(result.alreadyApplied).toBe(false);
    expect(result.applied.length).toBe(1);
    expect(result.applied[0].offset).toBe(0);
    expect(result.applied[0].fuzz).toBe(0);
    // `patch` numbers hunks from 1 and prints where the hunk landed in the
    // result, context included: `Hunk #1 succeeded at 2`.
    expect(result.applied[0].index).toBe(1);
    expect(result.applied[0].line).toBe(2);
    expect(result.applied[0].hunk).toBe(P.hunks[0]);
  });

  test('a patch with no hunks changes nothing', () => {
    const result = apply(A, new FilePatch('a', 'b', []));
    expect(result.text).toBe(A);
    expect(result.applied).toEqual([]);
    expect(result.rejected).toEqual([]);
    expect(result.alreadyApplied).toBe(false);
  });

  test('applies every hunk of a multi-hunk patch', () => {
    const a = nums(30);
    const b = edit(edit(a, 5, 'FIVE'), 25, 'TWENTY-FIVE');
    const patch = read(patchOf(a, b));
    expect(patch.hunks.length).toBe(2);
    const result = apply(a, patch);
    expect(result.text).toBe(b);
    expect(result.applied.map((h) => h.index)).toEqual([1, 2]);
  });
});

describe('offset search', () => {
  test('finds the hunk later in the file and reports the offset', () => {
    const drifted = 'x\ny\n' + A;
    const result = apply(drifted, P);
    expect(result.text).toBe('x\ny\n' + B);
    expect(result.applied[0].offset).toBe(2);
    expect(result.applied[0].line).toBe(4);
  });

  test('finds it earlier, where the offset is negative', () => {
    const drifted = A.split('\n').slice(1).join('\n');
    const result = apply(drifted, P);
    expect(result.text).toBe(B.split('\n').slice(1).join('\n'));
    expect(result.applied[0].offset).toBe(-1);
  });

  test('a later hunk searches from the running offset, since drift accumulates', () => {
    const a = nums(30);
    const b = edit(edit(a, 5, 'FIVE'), 25, 'TWENTY-FIVE');
    const patch = read(patchOf(a, b));
    // Four lines above the first hunk and four more between the two, so the
    // second hunk sits eight lines from where it says it does - out of reach of
    // a search that starts there, in reach of one that starts from the offset
    // the first hunk established.
    const list = a.split('\n');
    list.splice(15, 0, 'i', 'j', 'k', 'l');
    const drifted = 'w\nx\ny\nz\n' + list.join('\n');
    const result = apply(drifted, patch, {maxOffset: 5});
    expect(result.rejected).toEqual([]);
    expect(result.applied.map((h) => h.offset)).toEqual([4, 8]);
    expect(result.text).toBe(drifted.replace('\n5\n', '\nFIVE\n').replace('\n25\n', '\nTWENTY-FIVE\n'));
  });

  test('takes the later of two candidates the same distance away', () => {
    const hunk = new Hunk(3, 3, 3, 3, [
      new HunkLine(HUNK_OP_TYPE.EQL, 'A'),
      new HunkLine(HUNK_OP_TYPE.DEL, 'B'),
      new HunkLine(HUNK_OP_TYPE.INS, 'C'),
      new HunkLine(HUNK_OP_TYPE.EQL, 'D'),
    ]);
    const result = apply('A\nB\nD\nz\nA\nB\nD\n', new FilePatch('a', 'b', [hunk]));
    expect(result.text).toBe('A\nB\nD\nz\nA\nC\nD\n');
    expect(result.applied[0].offset).toBe(2);
  });

  test('the search radius is bounded, and the bound is an option', () => {
    const drifted = nums(10, 100) + A;
    expect(apply(drifted, P, {maxOffset: 5}).rejected.map((h) => h.code)).toEqual(['context']);
    expect(apply(drifted, P, {maxOffset: 10}).text).toBe(nums(10, 100) + B);
  });
});

describe('fuzz', () => {
  test('ignores leading and trailing context to place a hunk, keeping the ones the file has', () => {
    const drifted = edit(A, 2, 'TWO');
    const result = apply(drifted, P);
    expect(result.text).toBe(edit(B, 2, 'TWO'));
    expect(result.applied[0].fuzz).toBe(1);
    expect(result.rejected).toEqual([]);
  });

  test('two levels of it, for two lines of context gone', () => {
    const drifted = edit(edit(A, 2, 'TWO'), 3, 'THREE');
    const result = apply(drifted, P);
    expect(result.text).toBe(edit(edit(B, 2, 'TWO'), 3, 'THREE'));
    expect(result.applied[0].fuzz).toBe(2);
  });

  test('`maxFuzz: 0` is an exact match or nothing', () => {
    const drifted = edit(A, 2, 'TWO');
    const result = apply(drifted, P, {maxFuzz: 0});
    expect(result.text).toBe(drifted);
    expect(result.rejected.map((h) => h.code)).toEqual(['context']);
  });

  test('never relaxes a line the hunk changes, at any level', () => {
    const drifted = edit(A, 5, 'V');
    for (const maxFuzz of [0, 1, 2, 3, 99]) {
      const result = apply(drifted, P, {maxFuzz});
      expect(result.text).toBe(drifted);
      expect(result.applied).toEqual([]);
      expect(result.rejected.length).toBe(1);
    }
  });

  test('never relaxes an interior context line either', () => {
    // Two changes three lines apart merge into one hunk, and the lines between
    // them are context *inside* it - which fuzz may not touch, or the hunk
    // applies to text it was not written for.
    const b = edit(edit(A, 5, 'FIVE'), 7, 'SEVEN');
    const patch = read(patchOf(A, b));
    expect(patch.hunks.length).toBe(1);
    expect(apply(edit(A, 6, 'SIX'), patch, {maxFuzz: 99}).rejected.length).toBe(1);
    // The same line is ordinary context in the hunk that does not span it.
    const near = read(patchOf(A, edit(A, 5, 'FIVE')));
    expect(apply(edit(A, 8, 'EIGHT'), near).applied[0].fuzz).toBe(1);
  });

  test('is capped at the context a hunk carries, so a `-U1` hunk fuzzes at most once', () => {
    const patch = read(patchOf(A, B, 1));
    expect(apply(edit(A, 4, 'FOUR'), patch, {maxFuzz: 2}).applied[0].fuzz).toBe(1);
    // Both context lines gone leaves the line the hunk changes to place it by,
    // and that is as far as fuzz goes here: one level, not the two asked for.
    const both = apply(edit(edit(A, 4, 'FOUR'), 6, 'SIX'), patch, {maxFuzz: 2});
    expect(both.applied[0].fuzz).toBe(1);
    expect(both.text).toBe(edit(edit(B, 4, 'FOUR'), 6, 'SIX'));
  });

  test('`fuzz` starts the search there, without skipping a hunk that has less context', () => {
    const zero = read(patchOf(A, B, 0));
    expect(apply(A, zero, {fuzz: 2}).text).toBe(B);
    const result = apply(edit(A, 2, 'TWO'), P, {fuzz: 2});
    expect(result.applied[0].fuzz).toBe(2);
  });
});

// A hunk missing its context at one end is missing it because the file stopped
// there, and that end is not something it may drift away from. Every case here
// was differentiated against `/usr/bin/patch --batch` and `git apply` first;
// the corpus-wide version is `probes/drift.mjs`, ledger entry `boundary-anchor`.
describe('boundary anchoring', () => {
  /** No trailing context: the change reaches the file's last line. */
  const tail = read(patchOf(A, edit(A, 10, 'TEN')));
  /** No leading context, and no context between changes either. */
  const head = read(patchOf(A, edit(A, 1, 'ONE')));

  test('a hunk with no trailing context has to end where the file ends', () => {
    expect(apply(A, tail).text).toBe(edit(A, 10, 'TEN'));
    // Grown below it, the end it was written against is not the end any more.
    expect(apply(A + '11\n', tail).rejected.map((h) => h.code)).toEqual(['context']);
    // Grown above it, the end is still the end, so it drifts like anything else.
    const moved = apply('0\n' + A, tail);
    expect(moved.text).toBe('0\n' + edit(A, 10, 'TEN'));
    expect(moved.applied[0].offset).toBe(1);
  });

  test('a hunk with no leading context and none inside has to start at line 1', () => {
    expect(apply(A, head).text).toBe(edit(A, 1, 'ONE'));
    expect(apply('x\n' + A, head).rejected.map((h) => h.code)).toEqual(['context']);
    // Growth below it moves nothing: line 1 is still line 1.
    expect(apply(A + '11\n', head).text).toBe(edit(A, 1, 'ONE') + '11\n');
  });

  test('context between two changes frees the head, which the tail is never freed by', () => {
    const inner = read(patchOf(A, edit(edit(A, 1, 'ONE'), 3, 'THREE')));
    expect(inner.hunks.length).toBe(1);
    const result = apply('x\n' + A, inner);
    expect(result.applied[0].offset).toBe(1);
    expect(result.text).toBe('x\n' + edit(edit(A, 1, 'ONE'), 3, 'THREE'));
  });

  test('a hunk with no context at all names no boundary and floats', () => {
    const zero = read(patchOf(A, edit(A, 1, 'ONE'), 0));
    expect(zero.hunks[0].lines.every((l) => l.op !== HUNK_OP_TYPE.EQL)).toBe(true);
    const result = apply('x\n' + A, zero);
    expect(result.applied[0].offset).toBe(1);
    expect(result.text).toBe('x\n' + edit(A, 1, 'ONE'));
  });

  test('a hunk changing both ends of its own range is placed by its tail', () => {
    // Two hunks that differ only in where they sit, each a change at both ends
    // with four context lines between. The one that cannot end where the file
    // does never applies; the one that can applies, and follows the end of the
    // file up but not down.
    const both = (start: number, first: string, last: string): FilePatch => {
      const lines = [new HunkLine(HUNK_OP_TYPE.DEL, String(start)), new HunkLine(HUNK_OP_TYPE.INS, first)];
      for (let i = start + 1; i < start + 5; i++) lines.push(new HunkLine(HUNK_OP_TYPE.EQL, String(i)));
      lines.push(new HunkLine(HUNK_OP_TYPE.DEL, String(start + 5)), new HunkLine(HUNK_OP_TYPE.INS, last));
      return new FilePatch('a', 'b', [new Hunk(start, 6, start, 6, lines)]);
    };
    expect(apply(A, both(1, 'I', 'VI')).rejected.map((h) => h.code)).toEqual(['context']);
    const at5 = apply(A, both(5, 'V', 'X'));
    expect(at5.text).toBe(edit(edit(A, 5, 'V'), 10, 'X'));
    expect(at5.applied[0].offset).toBe(0);
    expect(apply('0\n' + A, both(5, 'V', 'X')).applied[0].offset).toBe(1);
    expect(apply(A + '11\n', both(5, 'V', 'X')).rejected.length).toBe(1);
  });
});

describe('a file that lost its tail', () => {
  /** Lines 4 to 10 of a ten-line file, three lines of context each side. */
  const seven = read(patchOf(A, edit(A, 7, 'SEVEN')));

  test('the line the hunk names may hang off the end, and fuzz is what makes it fit', () => {
    const short = nums(9);
    const result = apply(short, seven);
    expect(result.text).toBe(edit(short, 7, 'SEVEN'));
    expect(result.applied[0].offset).toBe(0);
    expect(result.applied[0].fuzz).toBe(1);
  });

  test('nothing the search moved down to may, so a fuzzed hunk cannot slide off the end', () => {
    // A line above and the last line gone: the only place the trimmed pattern
    // still matches is one line down, where the hunk would run past the end.
    const result = apply('x\n' + nums(9), seven);
    expect(result.applied).toEqual([]);
    expect(result.text).toBe('x\n' + nums(9));
  });
});

describe('a fuzz level that leaves nothing to match', () => {
  test('places nothing, because an empty pattern matches everywhere', () => {
    // One context line each side of an insertion: at fuzz 1 there is no old
    // side left at all, and a hunk cannot be placed by evidence it dropped.
    const hunk = new Hunk(2, 2, 2, 3, [
      new HunkLine(HUNK_OP_TYPE.EQL, 'a'),
      new HunkLine(HUNK_OP_TYPE.INS, 'NEW'),
      new HunkLine(HUNK_OP_TYPE.EQL, 'b'),
    ]);
    const result = apply('x\nZ\nb\ny\n', new FilePatch('a', 'b', [hunk]));
    expect(result.text).toBe('x\nZ\nb\ny\n');
    expect(result.rejected.length).toBe(1);
  });

  test('a hunk that never had an old side is a different thing, and applies', () => {
    const insert = read(patchOf(nums(4), '1\n2\nNEW\n3\n4\n', 0));
    expect(insert.hunks[0].lines.every((l) => l.op === HUNK_OP_TYPE.INS)).toBe(true);
    expect(apply(nums(4), insert).text).toBe('1\n2\nNEW\n3\n4\n');
  });
});

// Every level here was measured against `/usr/bin/patch -F` first: the whole
// accepted region of (leading, trailing) context lines it will ignore, swept
// over a 6x6 matrix of shapes. The cap that falls out is half a hunk's context,
// never more than its leading run, and none at all where a side carries none.
describe('the fuzz cap', () => {
  /** One changed line at `at` of a forty-line file, with `pre`/`post` context. */
  const shaped = (pre: number, post: number, at: number): FilePatch => {
    const body: HunkLine[] = [];
    for (let i = at - pre; i < at; i++) body.push(new HunkLine(HUNK_OP_TYPE.EQL, String(i)));
    body.push(new HunkLine(HUNK_OP_TYPE.DEL, String(at)), new HunkLine(HUNK_OP_TYPE.INS, 'CHANGED'));
    for (let i = at + 1; i <= at + post; i++) body.push(new HunkLine(HUNK_OP_TYPE.EQL, String(i)));
    const count = pre + 1 + post;
    return new FilePatch('a', 'b', [new Hunk(at - pre, count, at - pre, count, body)]);
  };
  /** The same file with `j` outermost leading and `k` outermost trailing context lines rewritten. */
  const broken = (pre: number, post: number, at: number, j: number, k: number): string => {
    let file = nums(40);
    for (let x = 0; x < j; x++) file = edit(file, at - pre + x, 'MANGLED-lead-' + x);
    for (let x = 0; x < k; x++) file = edit(file, at + post - x, 'MANGLED-trail-' + x);
    return file;
  };
  /** The fuzz a shape reached, or `-1` for a hunk that did not go in at all. */
  const reach = (pre: number, post: number, j: number, k: number, at = 20): number => {
    const result = apply(broken(pre, post, at, j, k), shaped(pre, post, at));
    return result.applied.length ? result.applied[0].fuzz : -1;
  };

  test('is half the hunk context, so a hunk keeps some of every side it has', () => {
    // 2+1 caps at 1. The alternative, the larger side, reaches 2 — which takes
    // all of both sides and places the hunk by the line it changes alone.
    expect(reach(2, 1, 1, 0)).toBe(1);
    expect(reach(2, 1, 2, 0)).toBe(-1);
    expect(reach(2, 2, 2, 0)).toBe(2);
  });

  test('never exceeds the leading run, which is not the same as the smaller side', () => {
    // 3+1 reaches 2 although it carries one trailing line; 1+3 reaches only 1.
    expect(reach(3, 1, 2, 0)).toBe(2);
    expect(reach(3, 1, 3, 0)).toBe(-1);
    expect(reach(1, 3, 1, 0)).toBe(1);
    expect(reach(1, 3, 0, 2)).toBe(-1);
  });

  test('is zero where a side carries no context, which leaves nothing to place it by', () => {
    // At the boundary each shape names, so the anchor rule is not what refuses.
    expect(reach(3, 0, 0, 0, 40)).toBe(0);
    expect(reach(3, 0, 1, 0, 40)).toBe(-1);
    expect(reach(0, 3, 0, 0, 1)).toBe(0);
    expect(reach(0, 3, 0, 1, 1)).toBe(-1);
  });

  test('`maxFuzz` still bounds it from above', () => {
    // The shape allows four levels; the default allows two, and wins.
    const patch = shaped(4, 4, 20);
    const file = broken(4, 4, 20, 3, 0);
    expect(apply(file, patch, {maxFuzz: 4}).applied[0].fuzz).toBe(3);
    expect(apply(file, patch).applied).toEqual([]);
    expect(reach(4, 4, 2, 0)).toBe(2);
  });

  test('asking for more fuzz than a hunk carries does not skip the exact attempt', () => {
    // `fuzz` names the level to start at. A hunk that cannot reach it has no
    // such level, so the search starts where every search starts.
    const result = apply(nums(40), shaped(1, 1, 20), {fuzz: 2});
    expect(result.applied[0].fuzz).toBe(0);
    expect(result.applied[0].offset).toBe(0);
    expect(result.text).toBe(edit(nums(40), 20, 'CHANGED'));
  });
});

describe('a hunk cannot be placed before the hunk above it ended', () => {
  test('even where that is the only place its old side matches', () => {
    // Hunk 1 consumes lines 5-9. Hunk 2 says it goes at line 15 and its old
    // side occurs nowhere but inside those lines, so it has no place to go.
    const one = new Hunk(5, 5, 5, 5, [
      new HunkLine(HUNK_OP_TYPE.EQL, '5'),
      new HunkLine(HUNK_OP_TYPE.EQL, '6'),
      new HunkLine(HUNK_OP_TYPE.DEL, '7'),
      new HunkLine(HUNK_OP_TYPE.INS, 'SEVEN'),
      new HunkLine(HUNK_OP_TYPE.EQL, '8'),
      new HunkLine(HUNK_OP_TYPE.EQL, '9'),
    ]);
    const two = new Hunk(15, 3, 15, 3, [
      new HunkLine(HUNK_OP_TYPE.EQL, '8'),
      new HunkLine(HUNK_OP_TYPE.DEL, '9'),
      new HunkLine(HUNK_OP_TYPE.INS, 'NINE'),
      new HunkLine(HUNK_OP_TYPE.EQL, '10'),
    ]);
    const result = apply(nums(20), new FilePatch('a', 'b', [one, two]));
    expect(result.applied.map((h) => h.index)).toEqual([1]);
    expect(result.rejected.map((h) => h.index)).toEqual([2]);
    // And nothing of hunk 2 reached the file: line 9 is still line 9.
    expect(result.text).toBe(edit(nums(20), 7, 'SEVEN'));
  });
});

describe('a header that outruns its body', () => {
  test('deletes what the body shows and not what the count claims', () => {
    // `oldCount` says nine lines, the body carries one. Treating that as an ed
    // script's blind delete removes eight lines nothing in the patch ever named.
    const hunk = new Hunk(3, 9, 3, 1, [new HunkLine(HUNK_OP_TYPE.DEL, '3'), new HunkLine(HUNK_OP_TYPE.INS, 'THREE')]);
    const result = apply(nums(12), new FilePatch('a', 'b', [hunk]));
    expect(result.text).toBe(edit(nums(12), 3, 'THREE'));
    expect(result.rejected).toEqual([]);
  });

  test('while a hunk with no old-side text at all is still a blind delete', () => {
    const patch = parse('3,5d\n', {style: 'ed'})[0];
    expect(patch.hunks[0].lines.length).toBe(0);
    expect(apply(nums(8), patch).text).toBe('1\n2\n6\n7\n8\n');
  });
});

describe('rejection', () => {
  test('is whole-hunk, and the rest of the file still applies', () => {
    const a = nums(30);
    const b = edit(edit(a, 5, 'FIVE'), 25, 'TWENTY-FIVE');
    const patch = read(patchOf(a, b));
    const drifted = edit(a, 25, 'BROKEN');
    const result = apply(drifted, patch);
    expect(result.text).toBe(edit(drifted, 5, 'FIVE'));
    expect(result.applied.map((h) => h.index)).toEqual([1]);
    expect(result.rejected.length).toBe(1);
    expect(result.rejected[0].index).toBe(2);
    expect(result.rejected[0].code).toBe('context');
    // Verbatim: the hunk itself, which is what the command writes to `.rej`.
    expect(result.rejected[0].hunk).toBe(patch.hunks[1]);
  });

  test('a file nothing applies to comes back unchanged', () => {
    const result = apply('nothing\nlike\nit\n', P);
    expect(result.text).toBe('nothing\nlike\nit\n');
    expect(result.applied).toEqual([]);
  });

  test('names the source line it was looking at', () => {
    const drifted = 'x\ny\n' + edit(A, 5, 'V');
    const result = apply(drifted, P);
    expect(result.rejected[0].line).toBe(2);
  });
});

describe('reverse detection', () => {
  test('a patch applied twice is detected, not applied again', () => {
    const result = apply(B, P);
    expect(result.text).toBe(B);
    expect(result.applied).toEqual([]);
    expect(result.rejected.map((h) => h.code)).toEqual(['reversed']);
    expect(result.alreadyApplied).toBe(true);
  });

  test('and a fuzz level does not get to apply it again first', () => {
    // The reverse probe runs after the exact attempt and *before* any fuzz.
    // Run after the fuzz loop instead, this hunk matches at fuzz 1 two lines
    // down, applies a second time, reports success, and grows the file again on
    // every further run — with `alreadyApplied` false and nothing to prompt on.
    const src = 'a1\na2\na3\na4\na5\nx\ny\nz\n';
    const patch = read('--- a/f\n+++ b/f\n@@ -6,3 +6,5 @@\n x\n y\n z\n+y\n+z\n');
    const once = apply(src, patch);
    expect(once.text).toBe('a1\na2\na3\na4\na5\nx\ny\nz\ny\nz\n');
    const twice = apply(once.text, patch);
    expect(twice.text).toBe(once.text);
    expect(twice.applied).toEqual([]);
    expect(twice.rejected.map((h) => h.code)).toEqual(['reversed']);
    expect(twice.alreadyApplied).toBe(true);
  });

  test('a hunk that needs fuzz to go in at all still goes in', () => {
    // The probe above must not cost a hunk that is simply drifted: the inverse
    // has to be *there* for a reversal to be reported.
    const drifted = edit(A, 2, 'TWO');
    const result = apply(drifted, P);
    expect(result.applied[0].fuzz).toBe(1);
    expect(result.text).toBe(edit(B, 2, 'TWO'));
  });

  test('`reverse` applies it backwards', () => {
    const result = apply(B, P, {reverse: true});
    expect(result.text).toBe(A);
    expect(result.applied.length).toBe(1);
    expect(result.alreadyApplied).toBe(false);
  });

  test('one hunk of many reversed is not a reversed patch', () => {
    const a = nums(30);
    const b = edit(edit(a, 5, 'FIVE'), 25, 'TWENTY-FIVE');
    const patch = read(patchOf(a, b));
    const result = apply(edit(a, 25, 'TWENTY-FIVE'), patch);
    expect(result.applied.map((h) => h.index)).toEqual([1]);
    expect(result.rejected.map((h) => h.code)).toEqual(['reversed']);
    expect(result.alreadyApplied).toBe(false);
  });

  test('the probe obeys the boundary the forward search obeys', () => {
    // A hunk with no leading context is pinned to the first line of the file,
    // and so is its inverse. Asked unanchored, the probe finds the applied text
    // anywhere within reach and calls the patch already applied — here two
    // lines further down, where the forward search is not allowed to place the
    // hunk at all. A command acting on `alreadyApplied` then reports nothing to
    // do about a file it never patched.
    const patch = read('--- a/f\n+++ b/f\n@@ -1,2 +1,2 @@\n-orig\n+APPLIED\n tail\n');
    const elsewhere = apply('aaa\nbbb\nAPPLIED\ntail\n', patch);
    expect(elsewhere.rejected.map((h) => h.code)).toEqual(['context']);
    expect(elsewhere.alreadyApplied).toBe(false);
    // At the boundary it is a real reversal and is still reported as one.
    const applied = apply('APPLIED\ntail\n', patch);
    expect(applied.rejected.map((h) => h.code)).toEqual(['reversed']);
    expect(applied.alreadyApplied).toBe(true);
    // And the hunk still applies where it belongs.
    expect(apply('orig\ntail\n', patch).text).toBe('APPLIED\ntail\n');
  });

  test('a deletion with no context cannot be told from a hunk that simply misses', () => {
    // Its inverse has nothing to match, so a match would mean nothing. `patch`
    // cannot see this either: at zero context the information is not there.
    const zero = read(patchOf(nums(5), edit(nums(5), 3, '').replace('\n\n', '\n'), 0));
    const result = apply('x\ny\nz\n', zero);
    expect(result.rejected.map((h) => h.code)).toEqual(['context']);
    expect(result.alreadyApplied).toBe(false);
  });

  test('invertHunk swaps the two sides and their ranges', () => {
    const [hunk] = P.hunks;
    const back = invertHunk(hunk);
    expect(back.oldStart).toBe(hunk.newStart);
    expect(back.oldCount).toBe(hunk.newCount);
    expect(back.newStart).toBe(hunk.oldStart);
    expect(back.newCount).toBe(hunk.oldCount);
    expect(back.lines.map((l) => l.op)).toEqual(hunk.lines.map((l) => -l.op));
    expect(invertHunks(invertHunks(P.hunks))[0].lines.map((l) => l.op)).toEqual(hunk.lines.map((l) => l.op));
  });
});

describe('line endings', () => {
  test('a CRLF file and an LF patch is reported as such, not as a context mismatch', () => {
    const crlf = A.split('\n').join('\r\n');
    const result = apply(crlf, P);
    expect(result.text).toBe(crlf);
    expect(result.rejected.map((h) => h.code)).toEqual(['eol']);
  });

  test('and the other way round: a CRLF patch of an LF file', () => {
    const patch = parse(patchOf(A, B).split('\n').join('\r\n'))[0];
    expect(apply(A, patch).rejected.map((h) => h.code)).toEqual(['eol']);
    // Which is what `patch --strip-trailing-cr` is for, and the reader's job.
    const stripped = parse(patchOf(A, B).split('\n').join('\r\n'), {stripTrailingCr: true})[0];
    expect(apply(A, stripped).text).toBe(B);
  });
});

describe('ed scripts, whose deletions are blind', () => {
  const script = (a: string, b: string): FilePatch => {
    const {src, dst, patch} = diff(a, b);
    return parse(text(ed(src, dst, patch)))[0];
  };

  test('a change, applied without the deleted text ever being known', () => {
    const patch = script(A, B);
    expect(patch.hunks[0].lines.every((l) => l.op === HUNK_OP_TYPE.INS)).toBe(true);
    expect(apply(A, patch).text).toBe(B);
  });

  test('an append, a delete and a change in one script', () => {
    const a = nums(10);
    const b = ['1', '2', 'X', '4', '5', 'Y', '7', '8', '9', '10', 'Z'].join('\n') + '\n';
    expect(apply(a, script(a, b)).text).toBe(b);
  });

  test('deleting past the end of the file is a range failure, not a mismatch', () => {
    const patch = parse('9,10d\n', {style: 'ed'})[0];
    const result = apply(nums(5), patch);
    expect(result.text).toBe(nums(5));
    expect(result.rejected.map((h) => h.code)).toEqual(['range']);
  });

  test('a blind delete drifts with the running offset', () => {
    const patch = parse('3d\n', {style: 'ed'})[0];
    const result = apply(nums(5), patch);
    expect(result.text).toBe('1\n2\n4\n5\n');
    expect(result.applied[0].offset).toBe(0);
  });
});

describe('create and delete, which are text-level outcomes here', () => {
  test('a patch against an empty file creates its content', () => {
    const created = nums(4);
    const result = apply('', read(patchOf('', created)));
    expect(result.text).toBe(created);
    expect(result.rejected).toEqual([]);
  });

  test('a patch that deletes every line leaves nothing, not an empty line', () => {
    const result = apply(A, read(patchOf(A, '')));
    expect(result.text).toBe('');
    expect(result.rejected).toEqual([]);
  });
});

describe('the missing final newline', () => {
  test('survives a change to the last line', () => {
    const a = '1\n2\n3';
    const b = '1\n2\nZ';
    expect(apply(a, read(patchOf(a, b))).text).toBe(b);
  });

  test('is added and removed like any other change', () => {
    expect(apply('1\n2\n3\n', read(patchOf('1\n2\n3\n', '1\n2\n3'))).text).toBe('1\n2\n3');
    expect(apply('1\n2\n3', read(patchOf('1\n2\n3', '1\n2\n3\n'))).text).toBe('1\n2\n3\n');
  });

  test('belongs to the file, not to the hunk that landed on it', () => {
    // The hunk was written against a file that ended two lines later; the one
    // it is applied to ends where it ends.
    const a = nums(10);
    const result = apply(a + '11\n', read(patchOf(a, edit(a, 9, 'NINE'))));
    expect(result.text).toBe(edit(a, 9, 'NINE') + '11\n');
  });
});

describe('bounds', () => {
  test('a spent budget is reported as such, not as a mismatch', () => {
    const result = apply('x\n' + A, P, {maxCost: 1});
    expect(result.rejected.map((h) => h.code)).toEqual(['limit']);
    expect(result.text).toBe('x\n' + A);
  });

  test('absurd options terminate rather than hang or corrupt', () => {
    for (const opts of [
      {fuzz: -1},
      {fuzz: Number.NaN},
      {maxFuzz: -5},
      {maxFuzz: Number.NaN},
      {maxOffset: -1},
      {maxOffset: Number.NaN},
      {maxCost: -1},
      {maxCost: Number.NaN},
      {fuzz: 1.5, maxFuzz: 2.5, maxOffset: 1.5, maxCost: 1e9},
    ]) {
      const result = apply(A, P, opts);
      expect(result.applied.length + result.rejected.length).toBe(1);
      expect(result.text === A || result.text === B).toBe(true);
    }
  });
});
