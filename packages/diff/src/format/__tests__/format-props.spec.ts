// Properties over random pairs. A hunk table can look plausible in every
// printed column and still be unapplicable, which is the failure mode a fidelity
// table cannot see - so these replay the hunks rather than inspecting them.
import * as lines from '../../lines';
import {hunks} from '../hunks';
import {normal} from '../normal';
import {HUNK_OP_TYPE} from '../types';
import {unified} from '../unified';
import {int, logSeed, pick, random} from '../../__tests__/rnd';
import {diff, replay, text} from './util';

const ALPHABET = ['a', 'b', 'c', 'function f() {', '  return 1;', '}', '', 'const x = 2;'];

const file = (length: number): string[] => Array.from({length}, () => pick(ALPHABET));

const mutate = (src: string[], rate: number): string[] => {
  const dst: string[] = [];
  for (const line of src) {
    const r = random();
    if (r < rate / 3) continue;
    else if (r < (2 * rate) / 3) dst.push(pick(ALPHABET));
    else if (r < rate) {
      dst.push(pick(ALPHABET));
      dst.push(line);
    } else dst.push(line);
  }
  return dst;
};

const edits = (patch: ReturnType<typeof lines.diff>): number => {
  let n = 0;
  for (const [type] of patch) if (type !== 0) n++;
  return n;
};

describe('format properties', () => {
  test('hunks replay to the destination file at every context width', () => {
    for (let i = 0; i < 200; i++) {
      const src = file(int(40));
      const dst = mutate(src, pick([0.05, 0.2, 0.6]));
      const patch = lines.diff(src, dst);
      for (const context of [0, 1, 2, 3, 10]) {
        const grouped = hunks(src, dst, patch, {context});
        try {
          expect(replay(src, grouped)).toEqual(dst);
        } catch (error) {
          logSeed({i, context, src, dst});
          throw error;
        }
      }
    }
  });

  test('every style emits the patch’s whole edit volume, once', () => {
    for (let i = 0; i < 200; i++) {
      const src = file(int(40));
      const dst = mutate(src, pick([0.05, 0.2, 0.6]));
      const patch = lines.diff(src, dst);
      const expected = edits(patch);
      const count = (out: string, marks: string) => {
        let n = 0;
        for (const line of out.split('\n')) if (line && marks.includes(line[0]) && line !== '---') n++;
        return n;
      };
      try {
        for (const context of [0, 1, 3, 10])
          expect(count(text(unified(src, dst, patch, {context})), '-+')).toBe(expected);
        expect(count(text(normal(src, dst, patch)), '<>')).toBe(expected);
      } catch (error) {
        logSeed({i, src, dst});
        throw error;
      }
    }
  });

  test('context lines are the source lines they claim to be', () => {
    for (let i = 0; i < 100; i++) {
      const src = file(int(40));
      const dst = mutate(src, 0.15);
      const grouped = hunks(src, dst, lines.diff(src, dst));
      for (const hunk of grouped) {
        let si = hunk.oldCount ? hunk.oldStart - 1 : hunk.oldStart;
        for (const line of hunk.lines) {
          if (line.op === HUNK_OP_TYPE.INS) continue;
          try {
            expect(line.text).toBe(src[si]);
          } catch (error) {
            logSeed({i, src, dst});
            throw error;
          }
          si++;
        }
      }
    }
  });

  test('a missing final newline is only ever marked on a last line', () => {
    let seen = 0;
    for (let i = 0; i < 100; i++) {
      const a = file(1 + int(20)).join('\n');
      const b = mutate(a.split('\n'), 0.3).join('\n');
      const {src, dst, patch, opts} = diff(a, b);
      if (!dst.length) continue;
      const rows = text(unified(src, dst, patch, opts)).split('\n');
      for (let k = 0; k < rows.length; k++) {
        if (rows[k] !== '\\ No newline at end of file') continue;
        seen++;
        const marked = rows[k - 1];
        try {
          expect(marked.slice(1)).toBe(marked[0] === '+' ? dst[dst.length - 1] : src[src.length - 1]);
        } catch (error) {
          logSeed({i, a, b});
          throw error;
        }
      }
    }
    expect(seen).toBeGreaterThan(0); // the assertion above must have run
  });
});
