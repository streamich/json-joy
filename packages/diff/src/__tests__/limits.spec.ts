import {LINE_PATCH_OP_TYPE, type LinePatch} from '../line';
import {bestSplit, deadlineLimits, type DiffLimits, defaultLineCost} from '../limits';
import * as lines from '../lines';
import * as str from '../str';
import * as tok from '../tok';
import {assertDiff} from './line';
import {int, logSeed, pick, random} from './rnd';
import {assertPatch, rounds} from './util';

const EQL = str.PATCH_OP_TYPE.EQL;
const DEL = str.PATCH_OP_TYPE.DEL;
const INS = str.PATCH_OP_TYPE.INS;

/** Replays a token patch against both sides; the property a bail-out can break. */
const assertTok = <T>(src: T[], dst: T[], patch: tok.TokenPatch): void => {
  const outSrc: T[] = [];
  const outDst: T[] = [];
  let si = 0;
  let di = 0;
  for (const [type, count] of patch) {
    expect(count).toBeGreaterThan(0);
    if (type !== INS) for (let i = 0; i < count; i++) outSrc.push(src[si + i]);
    if (type !== DEL) for (let i = 0; i < count; i++) outDst.push(dst[di + i]);
    if (type !== INS) si += count;
    if (type !== DEL) di += count;
  }
  expect(outSrc).toEqual(src);
  expect(outDst).toEqual(dst);
  for (let i = 1; i < patch.length; i++) {
    expect(patch[i][0]).not.toBe(patch[i - 1][0]);
    if (patch[i - 1][0] === INS) expect(patch[i][0]).not.toBe(DEL);
  }
};

/**
 * Reconstruction for file-sized patches. `assertDiff` checks every index with
 * its own `expect`, which on a 40k operation patch costs more than the diff.
 */
const assertRebuild = (src: string[], dst: string[], patch: LinePatch): void => {
  const out: string[] = [];
  let si = 0;
  for (const [type, s, d] of patch) {
    if (type === LINE_PATCH_OP_TYPE.INS) out.push(dst[d]);
    else {
      // Deletions and equalities walk the source in order, so a line dropped
      // by a bail-out lands here rather than hiding inside the edit volume.
      if (s !== si++) throw new Error('source line ' + si + ' skipped, patch has ' + s);
      if (type !== LINE_PATCH_OP_TYPE.DEL) out.push(type === LINE_PATCH_OP_TYPE.EQL ? src[s] : dst[d]);
    }
  }
  expect(si).toBe(src.length);
  expect(out.join('\n')).toBe(dst.join('\n'));
};

const tokVolume = (patch: tok.TokenPatch): number => {
  let n = 0;
  for (const [type, count] of patch) if (type !== EQL) n += count;
  return n;
};

const strVolume = (patch: str.Patch): number => {
  let n = 0;
  for (const [type, txt] of patch) if (type !== EQL) n += txt.length;
  return n;
};

/**
 * Shapes a bail-out is most likely to break: duplicate-heavy pools where the
 * Myers grid is full of equal tokens, block moves, and pairs with no common
 * token at all.
 */
const pools = [
  ['a', 'a', 'b'],
  ['a', 'b', 'c', 'a'],
  ['', 'x', 'x', 'y', 'z'],
  ['const x = 1;', '}', '', 'const x = 1;', 'return;'],
];

const generate = (): [string[], string[]] => {
  const pool = pick(pools);
  const src: string[] = [];
  const length = int(40);
  for (let i = 0; i < length; i++) src.push(pick(pool));
  if (int(8) === 0) return [src, Array.from({length: int(20)}, () => 'nothing in common ' + int(1000))];
  const dst = [...src];
  const edits = 1 + int(6);
  for (let e = 0; e < edits; e++) {
    switch (int(4)) {
      case 0:
        dst.splice(int(dst.length + 1), 0, pick(pool));
        break;
      case 1:
        dst.splice(int(dst.length + 1), int(4));
        break;
      case 2:
        if (dst.length) dst[int(dst.length)] = pick(pool) + ' edited';
        break;
      case 3: {
        const block = dst.splice(int(dst.length + 1), int(5));
        dst.splice(int(dst.length + 1), 0, ...block);
        break;
      }
    }
  }
  return [src, dst];
};

const wellFormed = ['a', 'b', 'c', 'x', ' ', '\n', 'word', '😀', '🙂', '👨‍👩‍👧‍👦', 'é'];
/** Lone surrogates: legal in a JS string, and the shapes the repair passes rewrite. */
const illFormed = [...wellFormed, '\ud83d', '\udfff'];

const generateStr = (): [string, string] => {
  let a = '';
  const length = int(60);
  for (let i = 0; i < length; i++) a += pick(illFormed);
  let b = a;
  const edits = 1 + int(5);
  for (let e = 0; e < edits; e++) {
    const at = int(b.length + 1);
    // Editing at an arbitrary offset also splits pairs, so `b` is ill-formed
    // whether or not the pool was.
    b = int(2) ? b.slice(0, at) + pick(illFormed) + b.slice(at) : b.slice(0, at) + b.slice(at + int(4));
  }
  return [a, b];
};

/** A file-sized pair with no token in common: unbounded this is seconds of work. */
const disjoint = (n: number): [string[], string[]] => [
  Array.from({length: n}, (_, i) => 'left ' + i),
  Array.from({length: n}, (_, i) => 'right ' + i),
];

/** A file-sized pair with a real common subsequence, edited at `rate`. */
const edited = (n: number, rate: number): [string[], string[]] => {
  const src = Array.from({length: n}, (_, i) => 'line ' + i + ' ' + int(1000));
  return [src, src.map((line) => (random() < rate ? line + ' edited' : line))];
};

describe('defaultLineCost()', () => {
  test('is a work budget: a power of two, 4096 down to 64, halving as the input grows', () => {
    expect(defaultLineCost(0, 0)).toBe(4096);
    expect(defaultLineCost(4096, 4096)).toBe(4096);
    expect(defaultLineCost(4097, 4096)).toBe(2048);
    expect(defaultLineCost(50000, 50000)).toBe(256);
    expect(defaultLineCost(10e6, 10e6)).toBe(64);
    expect(defaultLineCost(1e9, 1e9)).toBe(64);
  });

  test('never increases as the input grows, and keeps the work bounded', () => {
    let prev = Infinity;
    for (let n = 1; n < 1e9; n *= 3) {
      const cost = defaultLineCost(n, n);
      expect(cost).toBeLessThanOrEqual(prev);
      expect(cost).toBeGreaterThanOrEqual(64);
      // The bounded worst case, `(n + m) * maxCost` Myers cells, stays inside
      // the budget until the floor takes over.
      if (cost > 64) expect(2 * n * cost).toBeLessThanOrEqual(1 << 25);
      prev = cost;
    }
  });

  test('holds the work flat only up to 524288 elements, then the floor takes over', () => {
    // The domain of the flat worst case, pinned so it cannot quietly move.
    // Past the crossover the bound stops falling — below 64 the diff collapses
    // towards the trivial one — so the cost grows with the input again, and a
    // caller who needs a wall-clock guarantee there wants a deadline.
    const cells = (n: number) => 2 * n * defaultLineCost(n, n);
    expect(cells(262144)).toBe(1 << 25);
    expect(cells(524288)).toBe(2 * (1 << 25));
    expect(cells(1048576)).toBe(4 * (1 << 25));
  });

  test('cannot bind on input too small to reach it', () => {
    // No range needs more than `ceil((n + m)/2)`, so under 8192 elements the
    // bound is there to be ignored: the diff is exactly the unbounded one.
    for (let size = 2; size <= 8192; size *= 2)
      expect(defaultLineCost(size / 2, size / 2)).toBeGreaterThanOrEqual(Math.ceil(size / 2));
  });

  test('realistic input never reaches it, so the diff stays minimal', () => {
    const [src, dst] = edited(5000, 0.05);
    const limits: DiffLimits = {maxCost: defaultLineCost(src.length, dst.length)};
    expect(lines.diff(src, dst, limits)).toEqual(lines.diff(src, dst));
    expect(limits.hitLimit).toBeFalsy();
  });

  test('pathological input does reach it, and degrades instead of stalling', () => {
    const [src, dst] = disjoint(10000);
    const limits: DiffLimits = {maxCost: defaultLineCost(src.length, dst.length)};
    const patch = lines.diff(src, dst, limits);
    expect(limits.hitLimit).toBe(true);
    assertRebuild(src, dst, patch);
  });
});

describe('the default stays exact', () => {
  test('an empty bag, a huge budget and no bag at all agree, and none reports a limit', () => {
    for (let i = 0; i < rounds(200); i++) {
      const [src, dst] = generate();
      const [a, b] = generateStr();
      const empty: DiffLimits = {};
      const huge: DiffLimits = {maxCost: 1e9};
      try {
        expect(tok.diff(src, dst, empty)).toEqual(tok.diff(src, dst));
        expect(tok.diff(src, dst, huge)).toEqual(tok.diff(src, dst));
        expect(lines.diff(src, dst, empty)).toEqual(lines.diff(src, dst));
        expect(str.diff(a, b, empty)).toEqual(str.diff(a, b));
        expect(str.diff(a, b, huge)).toEqual(str.diff(a, b));
        expect(empty.hitLimit).toBeUndefined();
        expect(huge.hitLimit).toBeUndefined();
      } catch (error) {
        logSeed({src, dst, a, b});
        throw error;
      }
    }
  });

  test('an always-valid deadline changes nothing but is consulted', () => {
    const [src, dst] = edited(400, 0.1);
    let calls = 0;
    const limits: DiffLimits = {deadline: {isValid: () => (calls++, true)}};
    expect(lines.diff(src, dst, limits)).toEqual(lines.diff(src, dst));
    expect(limits.hitLimit).toBeUndefined();
    expect(calls).toBeGreaterThan(0);
  });
});

describe('determinism', () => {
  test('the same input and budget give the same output, every time', () => {
    for (let i = 0; i < rounds(200); i++) {
      const [src, dst] = generate();
      const [a, b] = generateStr();
      const maxCost = int(6);
      try {
        const first = tok.diff(src, dst, {maxCost});
        const firstStr = str.diff(a, b, {maxCost});
        for (let r = 0; r < 4; r++) {
          expect(tok.diff(src, dst, {maxCost})).toEqual(first);
          expect(str.diff(a, b, {maxCost})).toEqual(firstStr);
        }
      } catch (error) {
        logSeed({src, dst, a, b, maxCost});
        throw error;
      }
    }
  });

  test('a pair diffs the same whichever order the pairs are visited in', () => {
    // Nothing may accumulate between calls: a bail-out that remembered anything
    // across diffs would show up here and nowhere else.
    const pairs = Array.from({length: rounds(120)}, () => generate());
    const limits: DiffLimits = {maxCost: 3};
    const forward = pairs.map(([src, dst]) => lines.diff(src, dst, limits));
    const backward: ReturnType<typeof lines.diff>[] = [];
    for (let i = pairs.length - 1; i >= 0; i--) backward[i] = lines.diff(pairs[i][0], pairs[i][1], limits);
    expect(backward).toEqual(forward);
  });

  test('the clock is never consulted when no deadline is passed', () => {
    // The whole point of a cost budget: the same input cannot diff differently
    // on a slower machine, which it could if anything here read the clock.
    const [src, dst] = edited(300, 0.2);
    const [a, b] = [src.join('\n'), dst.join('\n')];
    const now = Date.now;
    let calls = 0;
    Date.now = () => {
      calls++;
      return now();
    };
    try {
      lines.diff(src, dst);
      lines.diff(src, dst, {maxCost: 4});
      str.diff(a, b, {maxCost: 4});
      tok.diff(src, dst, {maxCost: 0});
    } finally {
      Date.now = now;
    }
    expect(calls).toBe(0);
  });
});

describe('the bound binds', () => {
  test('a pair with nothing in common is bounded, and says so', () => {
    // 20k disjoint lines is seconds of work unbounded. `hitLimit` is the
    // deterministic evidence that it was not spent; a wall-clock assertion here
    // would only be a slow machine away from a false failure.
    const [src, dst] = disjoint(20000);
    const limits: DiffLimits = {maxCost: 64};
    const patch = lines.diff(src, dst, limits);
    expect(limits.hitLimit).toBe(true);
    assertRebuild(src, dst, patch);
  });

  test('a budget far below the sane one still returns, rather than recursing to death', () => {
    // Regression: splitting at the best diagonal alone recurses once per
    // `maxCost` elements, which overflowed the stack here. Sliding a low
    // progress split along its diagonal is what bounds the depth.
    for (const maxCost of [0, 1, 2, 8]) {
      const [src, dst] = disjoint(10000);
      const limits: DiffLimits = {maxCost};
      const patch = lines.diff(src, dst, limits);
      expect(limits.hitLimit).toBe(true);
      assertRebuild(src, dst, patch);
    }
  });

  test('a budget of zero explores nothing, but still splits rather than giving up', () => {
    const src = ['a', 'b', 'c', 'd'];
    const dst = ['a', 'x', 'y', 'd'];
    const limits: DiffLimits = {maxCost: 0};
    // Prefix and suffix trimming still runs, so the equal ends survive.
    expect(tok.diff(src, dst, limits)).toEqual([
      [EQL, 1],
      [DEL, 2],
      [INS, 2],
      [EQL, 1],
    ]);
    expect(limits.hitLimit).toBe(true);
    // On a range long enough to slide within, zero exploration still finds
    // most of the commonality: the split point moves into the range instead
    // of collapsing it into a delete plus an insert.
    const [longSrc, longDst] = edited(2000, 0.005);
    const zero: DiffLimits = {maxCost: 0};
    expect(tokVolume(tok.diff(longSrc, longDst, zero))).toBeLessThan((longSrc.length + longDst.length) / 10);
    expect(zero.hitLimit).toBe(true);
  });

  test('a NaN or negative budget bounds the search instead of silently disabling it', () => {
    // Budget arithmetic that lands on NaN used to fall through to the
    // unbounded search, which is the multi-second freeze this exists to stop.
    const [src, dst] = disjoint(4000);
    for (const maxCost of [Number.NaN, -1, Number.NEGATIVE_INFINITY]) {
      const limits: DiffLimits = {maxCost};
      const patch = lines.diff(src, dst, limits);
      expect(limits.hitLimit).toBe(true);
      assertRebuild(src, dst, patch);
    }
    // Infinity is a budget nothing can exceed, so it stays exact.
    const infinite: DiffLimits = {maxCost: Number.POSITIVE_INFINITY};
    expect(lines.diff(['a', 'b'], ['a', 'c'], infinite)).toEqual(lines.diff(['a', 'b'], ['a', 'c']));
    expect(infinite.hitLimit).toBeUndefined();
  });

  test('hitLimit says a bound was hit, not that the output differs from minimal', () => {
    // The flag is decidable, "is this diff minimal" is not: knowing that would
    // mean computing the diff the bound exists to avoid. On realistic input a
    // bounded run usually lands on the minimal diff anyway, flag and all.
    const src = Array.from({length: 2000}, (_, i) => 'line ' + i);
    const dst = src.map((line, i) => (i % 400 === 7 ? line + ' edited' : line));
    const limits: DiffLimits = {maxCost: 1};
    expect(tok.diff(src, dst, limits)).toEqual(tok.diff(src, dst));
    expect(limits.hitLimit).toBe(true);
  });

  test('hitLimit is only ever set, so it survives a run that degrades late', () => {
    const limits: DiffLimits = {maxCost: 2};
    lines.diff(['a'], ['a'], limits);
    expect(limits.hitLimit).toBeUndefined();
    lines.diff(...disjoint(400), limits);
    expect(limits.hitLimit).toBe(true);
    // Not cleared by a later exact run: the caller resets it, as documented.
    lines.diff(['a', 'b'], ['a', 'c'], limits);
    expect(limits.hitLimit).toBe(true);
  });
});

describe('the degraded diff is still a diff', () => {
  test('tokens: reconstruction and canonical shape hold at every budget', () => {
    for (let i = 0; i < rounds(400); i++) {
      const [src, dst] = generate();
      const maxCost = int(8);
      try {
        assertTok(src, dst, tok.diff(src, dst, {maxCost}));
      } catch (error) {
        logSeed({src, dst, maxCost});
        throw error;
      }
    }
  });

  test('lines: the patch still rebuilds the destination', () => {
    for (let i = 0; i < rounds(400); i++) {
      const [src, dst] = generate();
      const maxCost = int(8);
      try {
        assertDiff(src, dst, lines.diff(src, dst, {maxCost}));
      } catch (error) {
        logSeed({src, dst, maxCost});
        throw error;
      }
    }
  });

  test('strings: apply, invert and surrogate handling survive a bail-out', () => {
    for (let i = 0; i < rounds(400); i++) {
      const [a, b] = generateStr();
      const maxCost = int(8);
      try {
        assertPatch(a, b, str.diff(a, b, {maxCost}));
        assertPatch(a, b, str.diffEdit(a, b, int(b.length + 2) - 1, {maxCost}));
        // Both bounds, and ill-formed input under both: the repair passes run
        // over whatever a bail-out hands them.
        assertPatch(a, b, str.diff(a, b, {deadline: {isValid: () => false}}));
      } catch (error) {
        logSeed({a, b, maxCost});
        throw error;
      }
    }
  });

  test('a deadline expiring part way through leaves a correct patch', () => {
    for (let i = 0; i < rounds(200); i++) {
      const [src, dst] = generate();
      const [a, b] = generateStr();
      let budget = int(12);
      const deadline = {isValid: () => budget-- > 0};
      try {
        assertDiff(src, dst, lines.diff(src, dst, {deadline}));
        budget = int(12);
        assertPatch(a, b, str.diff(a, b, {deadline}));
      } catch (error) {
        logSeed({src, dst, a, b});
        throw error;
      }
    }
  });

  test('an empty side, an identical pair and empty input degrade to nothing surprising', () => {
    for (const maxCost of [0, 1, 4]) {
      const limits: DiffLimits = {maxCost};
      expect(tok.diff([], [], limits)).toEqual([]);
      expect(tok.diff(['a'], ['a'], limits)).toEqual([[EQL, 1]]);
      expect(tok.diff(['a', 'b'], [], limits)).toEqual([[DEL, 2]]);
      expect(tok.diff([], ['a', 'b'], limits)).toEqual([[INS, 2]]);
      expect(limits.hitLimit).toBeUndefined();
      expect(str.diff('', '', limits)).toEqual([]);
      expect(lines.diff(['x'], ['x'], limits)).toEqual([[0, 0, 0]]);
    }
  });
});

describe('the degraded diff is not the trivial one', () => {
  /**
   * Both bounds, every time. Quality measured only against `maxCost` is how a
   * deadline path that collapsed into delete-all plus insert-all stayed green:
   * an expired clock degrades through the same split, so it is held to the
   * same standard here.
   */
  const bothBounds = (cost: number): [name: string, limits: DiffLimits][] => [
    ['maxCost ' + cost, {maxCost: cost}],
    ['expired clock', {deadline: {isValid: () => false}}],
  ];

  test('a bounded diff of a lightly edited file stays near the minimal one', () => {
    // The point of splitting at the best diagonal instead of falling back to
    // delete-all plus insert-all: at 1/500th of the sane budget the script is
    // still within a few percent of minimal, not 20x it.
    const [src, dst] = edited(4000, 0.05);
    const minimal = tokVolume(tok.diff(src, dst));
    for (const [name, limits] of bothBounds(8)) {
      const degraded = tokVolume(tok.diff(src, dst, limits));
      try {
        expect(limits.hitLimit).toBe(true);
        expect(degraded).toBeLessThan(minimal * 1.5);
        expect(degraded).toBeLessThan((src.length + dst.length) / 10);
      } catch (error) {
        logSeed({bound: name, minimal, degraded});
        throw error;
      }
    }
  });

  test('the same holds for the string core', () => {
    const a = 'the quick brown fox jumps over the lazy dog\n'.repeat(200);
    const b = a.replace(/fox/g, 'cat').replace(/lazy/g, 'idle');
    const minimal = strVolume(str.diff(a, b));
    for (const [name, limits] of bothBounds(8)) {
      const degraded = strVolume(str.diff(a, b, limits));
      try {
        expect(limits.hitLimit).toBe(true);
        expect(degraded).toBeLessThan(minimal * 1.5);
        expect(degraded).toBeLessThan((a.length + b.length) / 4);
      } catch (error) {
        logSeed({bound: name, minimal, degraded});
        throw error;
      }
    }
  });

  test('and for a duplicate-heavy file, where the grid is worst', () => {
    const pool = ['a', 'b', 'c', 'd', 'e'];
    const src = Array.from({length: 4000}, () => pick(pool));
    const dst = src.map((line) => (random() < 0.1 ? pick(pool) : line));
    for (const [name, limits] of bothBounds(16)) {
      const degraded = tokVolume(tok.diff(src, dst, limits));
      try {
        expect(degraded).toBeLessThan((src.length + dst.length) / 4);
      } catch (error) {
        logSeed({bound: name, degraded});
        throw error;
      }
    }
  });

  test('a clock that dies on a file with five edited lines still finds the five', () => {
    // The shape that exposed the collapse: 2000 lines, 5 of them edited. The
    // trivial diff is 4000 operations, the minimal one is 10.
    const src = Array.from({length: 2000}, (_, i) => 'line ' + i);
    const dst = src.map((line, i) => (i % 400 === 7 ? line + ' edited' : line));
    const minimal = tokVolume(tok.diff(src, dst));
    expect(minimal).toBe(10);
    for (const [, limits] of bothBounds(1)) {
      expect(tokVolume(tok.diff(src, dst, limits))).toBeLessThanOrEqual(minimal * 3);
      expect(limits.hitLimit).toBe(true);
    }
  });
});

describe('deadline', () => {
  test('an expired deadline degrades before the first pass, not after it', () => {
    const [src, dst] = disjoint(20000);
    let calls = 0;
    const limits: DiffLimits = {deadline: {isValid: () => (calls++, false)}};
    const patch = lines.diff(src, dst, limits);
    // One question asked, one answer honoured: no full `d` pass over 20k lines,
    // and the ranges below inherit a cost bound rather than the dead clock, so
    // they never ask again. The call count is the deterministic form of "it
    // returned quickly"; the clock itself is not asserted on anywhere here.
    expect(calls).toBe(1);
    expect(limits.hitLimit).toBe(true);
    assertRebuild(src, dst, patch);
  });

  test('an expired clock is never worse than the tightest budget', () => {
    // The ranges under the bail-out finish as a bounded run rather than as a
    // blind one, so on tokens the clock dominates the budget it replaces:
    // measured over 50,000 pairs, better on a third, never worse.
    //
    // The string core only gets the trivial bound. Its repair passes rewrite
    // whatever a split hands them, and on a string carrying a lone surrogate —
    // which any edit at an arbitrary offset can produce — more search can cost
    // a few characters of edit volume rather than save them. That is the same
    // non-monotonicity a larger `maxCost` shows, not something the clock does.
    for (let i = 0; i < rounds(300); i++) {
      const [src, dst] = generate();
      const [a, b] = generateStr();
      const expired = (): DiffLimits => ({deadline: {isValid: () => false}});
      try {
        const clock = tok.diff(src, dst, expired());
        assertTok(src, dst, clock);
        expect(tokVolume(clock)).toBeLessThanOrEqual(tokVolume(tok.diff(src, dst, {maxCost: 0})));
        const text = str.diff(a, b, expired());
        assertPatch(a, b, text);
        expect(strVolume(text)).toBeLessThanOrEqual(a.length + b.length);
      } catch (error) {
        logSeed({src, dst, a, b});
        throw error;
      }
    }
  });

  test('a clock dying mid-search leaves the rest bounded, not blind', () => {
    // Without the inherited budget the ranges below explore nothing at all,
    // so a split that lands off the true alignment can never be repaired and
    // the tail of the file degenerates. Measured on this shape: 35204
    // operations of a possible 40000, against 2236 with the budget.
    const [src, dst] = edited(20000, 0.05);
    const minimal = tokVolume(tok.diff(src, dst));
    for (const expiry of [3, 12, 20]) {
      let left = expiry;
      const limits: DiffLimits = {deadline: {isValid: () => left-- > 0}};
      const degraded = tokVolume(tok.diff(src, dst, limits));
      try {
        expect(limits.hitLimit).toBe(true);
        expect(degraded).toBeLessThan(minimal * 2);
      } catch (error) {
        logSeed({expiry, minimal, degraded});
        throw error;
      }
    }
  });

  test('a deadline and a budget coexist, either one may trip', () => {
    const [src, dst] = disjoint(2000);
    const byCost: DiffLimits = {maxCost: 4, deadline: {isValid: () => true}};
    assertRebuild(src, dst, lines.diff(src, dst, byCost));
    expect(byCost.hitLimit).toBe(true);
    const byClock: DiffLimits = {maxCost: 1e9, deadline: {isValid: () => false}};
    assertRebuild(src, dst, lines.diff(src, dst, byClock));
    expect(byClock.hitLimit).toBe(true);
  });
});

describe('deadlineLimits()', () => {
  test('hands the ranges below a real budget, never the cost that ran out', () => {
    // The cost reached is spent globally, so a clock reaches a deep range with
    // nothing left, and a zero budget there splits a length-mismatched range
    // blind. Measured on 2000 lines with five edited: 1606 operations of a
    // possible 4000 when the budget came from the cost reached, 12 when it
    // comes from here, against 10 minimal.
    for (const size of [16, 1024, 65536, 1e6]) {
      const {maxCost, deadline, hitLimit} = deadlineLimits(size, size);
      expect(maxCost).toBe(defaultLineCost(size, size));
      expect(maxCost).toBeGreaterThan(0);
      // Carrying the clock down would put every range below it back where it
      // started: expired, exploring nothing.
      expect(deadline).toBeUndefined();
      expect(hitLimit).toBeUndefined();
    }
  });
});

describe('bestSplit()', () => {
  /** A diagonal vector of `length`, with `[diagonal, x]` entries placed around `vOffset`. */
  const vec = (length: number, vOffset: number, entries: [k: number, x: number][] = []): number[] => {
    const v = new Array(length).fill(-1);
    for (const [k, x] of entries) v[vOffset + k] = x;
    return v;
  };

  test('no diagonal reached still splits, it does not give up on the range', () => {
    // Where a bound that expired before the first iteration lands. Returning
    // the origin would make the range a delete plus an insert, and every range
    // under it too, which is the fallback the design rejects.
    expect(bestSplit(vec(128, 64), vec(128, 64), 64, 64, 64)).toEqual([8, 8]);
    // Too short to slide within: the caller's trivial branch takes it.
    expect(bestSplit(vec(8, 4), vec(8, 4), 4, 3, 3)).toEqual([0, 0]);
  });

  test('takes the diagonal that travelled furthest', () => {
    // Forward reached (30, 30), backward only 2 from each end: forward wins.
    expect(bestSplit(vec(128, 64, [[0, 30]]), vec(128, 64, [[0, 2]]), 64, 64, 64)).toEqual([30, 30]);
    // Backward reached 30 from the end, forward only 2: backward wins.
    expect(bestSplit(vec(128, 64, [[0, 2]]), vec(128, 64, [[0, 30]]), 64, 64, 64)).toEqual([34, 34]);
  });

  test('a tie goes to the backward path, as in GNU', () => {
    expect(bestSplit(vec(128, 64, [[0, 20]]), vec(128, 64, [[0, 20]]), 64, 64, 64)).toEqual([44, 44]);
  });

  test('clamps a diagonal that ran past the end of either side', () => {
    expect(bestSplit(vec(128, 64, [[0, 500]]), vec(128, 64), 64, 64, 64)).toEqual([64, 64]);
    // y would be 44 on a side only 8 long, so x follows the diagonal back in.
    expect(bestSplit(vec(64, 32, [[-4, 40]]), vec(64, 32), 32, 40, 8)).toEqual([4, 8]);
    // A diagonal the range cannot reach at all is ignored, which leaves
    // nothing reached and hands the range to the slide.
    expect(bestSplit(vec(64, 32, [[-20, 40]]), vec(64, 32), 32, 40, 8)).toEqual([3, 3]);
  });

  test('slides a low progress split along its own diagonal', () => {
    // 4 of 2000 is far too little: the split moves up to 1/8 of the range so
    // the recursion cannot take one step per `maxCost` elements.
    expect(bestSplit(vec(2048, 1024, [[0, 2]]), vec(2048, 1024), 1024, 1000, 1000)).toEqual([125, 125]);
    // Same rule from the other end.
    expect(bestSplit(vec(2048, 1024), vec(2048, 1024, [[0, 2]]), 1024, 1000, 1000)).toEqual([875, 875]);
    // A split that already covers enough is left where it is.
    expect(bestSplit(vec(2048, 1024, [[0, 400]]), vec(2048, 1024), 1024, 1000, 1000)).toEqual([400, 400]);
  });
});
