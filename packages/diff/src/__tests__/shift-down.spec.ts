import * as line from '../line';
import * as lines from '../lines';
import {shiftDown} from '../optimize';
import {assertApply, assertDiff} from './line';
import {int, logSeed, pick, random} from './rnd';
import {rounds} from './util';
import {PLACEMENT} from './shift-down-fixtures';

const DEL = line.LINE_PATCH_OP_TYPE.DEL;
const EQL = line.LINE_PATCH_OP_TYPE.EQL;
const INS = line.LINE_PATCH_OP_TYPE.INS;
const MIX = line.LINE_PATCH_OP_TYPE.MIX;

const shape = (patch: line.LinePatch): string =>
  patch.map(([type]) => (type === EQL ? '=' : type === DEL ? '-' : type === INS ? '+' : '?')).join('');

/** Number of source and destination lines an op list touches. */
const volume = (patch: line.LinePatch): number => {
  let n = 0;
  for (const [type] of patch) n += type === EQL ? 0 : type === MIX ? 2 : 1;
  return n;
};

/** Per-file changed-line flags, the representation the pass works on. */
const flagsOf = (src: string[], dst: string[], patch: line.LinePatch): [Uint8Array, Uint8Array] => {
  const changedSrc = new Uint8Array(src.length);
  const changedDst = new Uint8Array(dst.length);
  for (const [type, si, di] of patch) {
    if (type !== EQL && type !== INS) changedSrc[si] = 1;
    if (type !== EQL && type !== DEL) changedDst[di] = 1;
  }
  return [changedSrc, changedDst];
};

const rebuild = (srcLength: number, dstLength: number, cs: Uint8Array, cd: Uint8Array): line.LinePatch => {
  const out: line.LinePatch = [];
  let i = 0;
  let j = 0;
  while (true) {
    while (i < srcLength && cs[i]) out.push([DEL, i++, j - 1]);
    while (j < dstLength && cd[j]) out.push([INS, i - 1, j++]);
    if (i >= srcLength || j >= dstLength) break;
    out.push([EQL, i++, j++]);
  }
  return out;
};

/**
 * The pass in the other direction, for the tests that show the direction is not
 * a coin flip. Sliding down through a reversed file is sliding up through the
 * original, so this runs the real pass on reversed inputs rather than keeping a
 * second copy of the algorithm that could drift from it.
 */
const shiftUp = (src: string[], dst: string[], patch: line.LinePatch): line.LinePatch => {
  const flip = (a: Uint8Array) => a.slice().reverse();
  const [cs, cd] = flagsOf(src, dst, patch);
  const rs = [...src].reverse();
  const rd = [...dst].reverse();
  const slid = shiftDown(rs, rd, rebuild(rs.length, rd.length, flip(cs), flip(cd)));
  const [rcs, rcd] = flagsOf(rs, rd, slid);
  return rebuild(src.length, dst.length, flip(rcs), flip(rcd));
};

describe('shiftDown()', () => {
  describe('direction', () => {
    test('an insertion lands on the last of the equal lines, not the first', () => {
      const src = ['a', 'b', 'b', 'c'];
      const dst = ['a', 'b', 'b', 'b', 'c'];
      const patch = shiftDown(src, dst, lines.diff(src, dst));
      // GNU emits `===+=` here; sliding up would give `=+===`.
      expect(patch).toEqual([
        [EQL, 0, 0],
        [EQL, 1, 1],
        [EQL, 2, 2],
        [INS, 2, 3],
        [EQL, 3, 4],
      ]);
      expect(shape(shiftUp(src, dst, lines.diff(src, dst)))).toBe('=+===');
    });

    test('a deletion lands on the last of the equal lines, not the first', () => {
      const src = ['a', 'b', 'b', 'b', 'c'];
      const dst = ['a', 'b', 'b', 'c'];
      const patch = shiftDown(src, dst, lines.diff(src, dst));
      // GNU emits `===-=` here; sliding up would give `=-===`.
      expect(patch).toEqual([
        [EQL, 0, 0],
        [EQL, 1, 1],
        [EQL, 2, 2],
        [DEL, 3, 2],
        [EQL, 4, 3],
      ]);
      expect(shape(shiftUp(src, dst, lines.diff(src, dst)))).toBe('=-===');
    });

    test('shifts the source file first, as GNU does', () => {
      // GNU shifts file 0, then file 1 against the already-shifted file 0. The
      // two orders are genuinely observable, and here GNU's is the one that
      // agrees with GNU: it emits `+=-++=`, shifting the destination first gives
      // `-+==++`. Nothing else in this suite can tell the two apart.
      const src = ['a', 'a', 'b'];
      const dst = ['b', 'a', 'b', 'b', 'b'];
      expect(shiftDown(src, dst, lines.diff(src, dst))).toEqual([
        [INS, -1, 0],
        [EQL, 0, 1],
        [DEL, 1, 1],
        [INS, 1, 2],
        [INS, 1, 3],
        [EQL, 2, 4],
      ]);
    });

    test('moves a run the raw script places too high', () => {
      const src = ['x', 'x', 'x', 'x'];
      const dst = ['x', 'y', 'x', 'y'];
      const raw = lines.diff(src, dst);
      expect(shape(raw)).toBe('=--+=+');
      // `=+=--+` is what GNU emits; both scripts are four edits long.
      expect(shape(shiftDown(src, dst, raw))).toBe('=+=--+');
      expect(shape(shiftUp(src, dst, lines.diff(src, dst)))).toBe('=--+=+');
      assertDiff(src, dst, shiftDown(src, dst, lines.diff(src, dst)));
    });
  });

  describe('a run sliding into the next one', () => {
    // Two single-line deletions separated by one equal line, all three lines
    // identical: the first run slides onto the gap and then meets the second.
    const src = ['x', 'a', 'a', 'a', 'y'];
    const dst = ['x', 'a', 'y'];
    const patch: line.LinePatch = [
      [EQL, 0, 0],
      [DEL, 1, 0],
      [EQL, 2, 1],
      [DEL, 3, 1],
      [EQL, 4, 2],
    ];

    test('stops at the boundary, leaving the two runs adjacent', () => {
      // GNU emits `==--=`. Sliding onto the already-changed line instead of
      // absorbing it clears the moving line without setting the already-set one,
      // giving `===--`: one deletion short, and no longer `dst`.
      expect(shiftDown(src, dst, patch)).toEqual([
        [EQL, 0, 0],
        [EQL, 1, 1],
        [DEL, 2, 1],
        [DEL, 3, 1],
        [EQL, 4, 2],
      ]);
    });

    test('keeps reconstructing the target', () => {
      const out = shiftDown(src, dst, patch);
      expect(volume(out)).toBe(volume(patch));
      assertDiff(src, dst, out);
      assertApply(src, dst, out);
    });
  });

  describe('degenerate input', () => {
    test('two empty files', () => {
      expect(shiftDown([], [], [])).toEqual([]);
    });

    test('an all-equal patch keeps its operations, in a fresh list', () => {
      const src = ['a', 'b'];
      const patch = lines.diff(src, src);
      const out = shiftDown(src, src, patch);
      expect(out).toEqual(patch);
      // Every path returns a new list of new operations, never the caller's.
      expect(out).not.toBe(patch);
      expect(out[0]).not.toBe(patch[0]);
      // `line.diff` reports "no change" as an empty patch, not as equalities.
      expect(shiftDown(src, src, line.diff(src, src))).toEqual([]);
    });

    test('single-line files', () => {
      // The insertion anchors on the line just deleted, as `lines.diff` does.
      expect(shiftDown(['a'], ['b'], lines.diff(['a'], ['b']))).toEqual([
        [DEL, 0, -1],
        [INS, 0, 0],
      ]);
      assertDiff(['a'], ['b'], shiftDown(['a'], ['b'], lines.diff(['a'], ['b'])));
    });

    test('a patch that is entirely deletions', () => {
      const src = ['a', 'b'];
      expect(shiftDown(src, [], lines.diff(src, []))).toEqual([
        [DEL, 0, -1],
        [DEL, 1, -1],
      ]);
    });

    test('a patch that is entirely insertions', () => {
      const dst = ['a', 'b'];
      expect(shiftDown([], dst, lines.diff([], dst))).toEqual([
        [INS, -1, 0],
        [INS, -1, 1],
      ]);
      // Insertions into a non-empty file slide to the end of the equal run.
      expect(shiftDown(['a'], ['a', 'a', 'a'], lines.diff(['a'], ['a', 'a', 'a']))).toEqual([
        [EQL, 0, 0],
        [INS, 0, 1],
        [INS, 0, 2],
      ]);
    });

    test('every line identical: the run reaches end of file and stops', () => {
      const long = ['a', 'a', 'a', 'a', 'a'];
      const short = ['a', 'a', 'a'];
      expect(shiftDown(long, short, lines.diff(long, short))).toEqual([
        [EQL, 0, 0],
        [EQL, 1, 1],
        [EQL, 2, 2],
        [DEL, 3, 2],
        [DEL, 4, 2],
      ]);
      expect(shiftDown(short, long, lines.diff(short, long))).toEqual([
        [EQL, 0, 0],
        [EQL, 1, 1],
        [EQL, 2, 2],
        [INS, 2, 3],
        [INS, 2, 4],
      ]);
    });

    test('a modification is expanded into a deletion and an insertion, always', () => {
      // Unconditional: the op list is rebuilt from changed-line flags, which
      // cannot say "modified in place", so this happens even when nothing slid.
      const src = ['a', 'b', 'c'];
      const dst = ['a', 'x', 'c'];
      const patch: line.LinePatch = [
        [EQL, 0, 0],
        [MIX, 1, 1],
        [EQL, 2, 2],
      ];
      expect(shiftDown(src, dst, patch)).toEqual(lines.diff(src, dst));
      assertDiff(src, dst, shiftDown(src, dst, patch));
    });

    test('does not mutate its arguments', () => {
      const src = ['a', 'a', 'a', 'b'];
      const dst = ['a', 'b'];
      const patch = lines.diff(src, dst);
      const srcCopy = [...src];
      const dstCopy = [...dst];
      const patchCopy = patch.map((op) => [...op]);
      shiftDown(src, dst, patch);
      expect(src).toEqual(srcCopy);
      expect(dst).toEqual(dstCopy);
      expect(patch).toEqual(patchCopy);
    });
  });

  describe('properties', () => {
    // Small pools so runs are dense and frequently slide into one another.
    const pools = [
      ['a', 'a', 'b'],
      ['a', 'b', 'c', 'a'],
      ['', 'x', 'x', 'y', 'z'],
      ['const x = 1;', '}', '', 'const x = 1;', 'return;'],
    ];

    const generate = (): [string[], string[]] => {
      const pool = pick(pools);
      const src: string[] = [];
      const length = int(30);
      for (let i = 0; i < length; i++) src.push(pick(pool));
      const dst = [...src];
      const edits = 1 + int(5);
      for (let e = 0; e < edits; e++) {
        switch (int(4)) {
          case 0:
            dst.splice(int(dst.length + 1), 0, pick(pool));
            break;
          case 1:
            dst.splice(int(dst.length + 1), int(3));
            break;
          case 2:
            if (dst.length) dst[int(dst.length)] = pick(pool) + ' edited';
            break;
          case 3: {
            const block = dst.splice(int(dst.length + 1), int(4));
            dst.splice(int(dst.length + 1), 0, ...block);
            break;
          }
        }
      }
      return [src, dst];
    };

    test('reconstruction is preserved, for lines.diff and line.diff alike', () => {
      for (let i = 0; i < rounds(600); i++) {
        const [src, dst] = generate();
        try {
          const fromLines = shiftDown(src, dst, lines.diff(src, dst));
          assertDiff(src, dst, fromLines);
          const fromLine = shiftDown(src, dst, line.diff(src, dst));
          assertDiff(src, dst, fromLine);
        } catch (error) {
          logSeed({src, dst});
          throw error;
        }
      }
    });

    test('edit volume is unchanged: the pass moves hunks, it does not resize them', () => {
      for (let i = 0; i < rounds(600); i++) {
        const [src, dst] = generate();
        const patch = lines.diff(src, dst);
        try {
          expect(volume(shiftDown(src, dst, patch))).toBe(volume(patch));
        } catch (error) {
          logSeed({src, dst});
          throw error;
        }
      }
    });

    test('idempotent and deterministic', () => {
      for (let i = 0; i < rounds(600); i++) {
        const [src, dst] = generate();
        const patch = lines.diff(src, dst);
        try {
          const once = shiftDown(src, dst, patch);
          expect(shiftDown(src, dst, patch)).toEqual(once);
          expect(shiftDown(src, dst, once)).toEqual(once);
        } catch (error) {
          logSeed({src, dst});
          throw error;
        }
      }
    });

    test('covers every line of both files exactly once', () => {
      // What lets the rebuild drop its ragged-tail fallback: for a complete
      // input patch the two sides always pair up and nothing is left over.
      for (let i = 0; i < rounds(600); i++) {
        const [src, dst] = generate();
        try {
          for (const produced of [lines.diff(src, dst), line.diff(src, dst)]) {
            // `line.diff` reports "no change" as an empty patch, which is not a
            // complete patch and so is outside this property.
            if (!produced.length && src.length) continue;
            const patch = shiftDown(src, dst, produced);
            const seenSrc = new Uint8Array(src.length);
            const seenDst = new Uint8Array(dst.length);
            for (const [type, si, di] of patch) {
              if (type !== INS) seenSrc[si]++;
              if (type !== DEL) seenDst[di]++;
            }
            for (const seen of [seenSrc, seenDst]) for (const count of seen) expect(count).toBe(1);
          }
        } catch (error) {
          logSeed({src, dst});
          throw error;
        }
      }
    });

    test('settles within the round cap, on arbitrary valid patches and long input', () => {
      // The pass repeats until the flags stop changing, bounded by a cap. Extra
      // rounds are a long-input phenomenon and are not confined to `lines.diff`
      // output — any monotone matching of equal lines is a valid patch — so this
      // stresses arbitrary alignments over long duplicate-heavy files, which is
      // where a third round appears. If the cap were ever too low the result
      // would silently stop being a fixed point, and this is what would say so.
      for (let i = 0; i < rounds(40); i++) {
        const pool = pick([
          ['a', 'b'],
          ['a', 'b', 'c'],
          ['a', 'a', 'b'],
        ]);
        const length = 200 + int(400);
        const src = Array.from({length}, () => pick(pool));
        const dst = Array.from({length}, () => pick(pool));
        // Any monotone matching of equal lines is a valid patch.
        const cs = new Uint8Array(src.length).fill(1);
        const cd = new Uint8Array(dst.length).fill(1);
        let a = 0;
        let b = 0;
        while (a < src.length && b < dst.length) {
          if (src[a] === dst[b] && random() < 0.65) {
            cs[a] = 0;
            cd[b] = 0;
            a++;
            b++;
          } else if (random() < 0.5) a++;
          else b++;
        }
        try {
          const once = shiftDown(src, dst, rebuild(src.length, dst.length, cs, cd));
          expect(shiftDown(src, dst, once)).toEqual(once);
          assertDiff(src, dst, once);
        } catch (error) {
          logSeed({srcLength: src.length, dstLength: dst.length});
          throw error;
        }
      }
    });

    test('survives a patch whose lines are all identical', () => {
      for (let i = 0; i < rounds(200); i++) {
        const src = new Array(int(20)).fill('same');
        const dst = new Array(int(20)).fill('same');
        try {
          assertDiff(src, dst, shiftDown(src, dst, lines.diff(src, dst)));
        } catch (error) {
          logSeed({srcLength: src.length, dstLength: dst.length});
          throw error;
        }
      }
    });

    test('survives random line arrays with no structure at all', () => {
      for (let i = 0; i < rounds(400); i++) {
        const src: string[] = [];
        const dst: string[] = [];
        for (let j = int(12); j > 0; j--) src.push(String(int(4)));
        for (let j = int(12); j > 0; j--) dst.push(String(int(4)));
        try {
          assertDiff(src, dst, shiftDown(src, dst, lines.diff(src, dst)));
        } catch (error) {
          logSeed({src, dst});
          throw error;
        }
      }
    });
  });

  describe('fidelity to GNU', () => {
    const split = (text: string): string[] => (text ? text.split('') : []);
    const FLOOR = 50;

    test('placement tracks GNU across the fixture corpus', () => {
      let raw = 0;
      let down = 0;
      let up = 0;
      for (const [a, b, placement] of PLACEMENT) {
        const src = split(a);
        const dst = split(b);
        const patch = lines.diff(src, dst);
        const slid = shiftDown(src, dst, patch);
        assertDiff(src, dst, slid);
        if (shape(patch) === placement) raw++;
        if (shape(slid) === placement) down++;
        if (shape(shiftUp(src, dst, lines.diff(src, dst))) === placement) up++;
      }
      expect(down).toBeGreaterThanOrEqual(FLOOR);
      // The claims that matter: the pass earns its place, and the direction is
      // not a coin flip.
      expect(down).toBeGreaterThan(raw);
      expect(down).toBeGreaterThan(up);
    });
  });
});
