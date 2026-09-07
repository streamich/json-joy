// The round-trip property: `parse(write(x))` is `x` again, for every style that
// can carry `x`. It is the one oracle that needs no host binary, so it runs in
// ordinary CI and is the first line of defence for both halves of `format` - a
// writer that drops a line and a reader that invents one both fail it.
//
// Ed and rcs carry less than a hunk holds, and the property is weakened exactly
// that far and no further; see `ed script` below.
import {contextHunks} from '../context';
import {edHunks} from '../ed';
import {hunks} from '../hunks';
import {normalHunks} from '../normal';
import {parse} from '../parse';
import {type Hunk, HUNK_OP_TYPE} from '../types';
import {unifiedHunks} from '../unified';
import {int, logSeed, pick, random} from '../../__tests__/rnd';
import {diff, text} from './util';

const ALPHABET = ['a', 'b', 'c', 'function f() {', '  return 1;', '}', '', 'const x = 2;', '.', '..', '---', '+++ b'];

const file = (length: number): string => Array.from({length}, () => pick(ALPHABET)).join('\n');

const mutate = (src: string, rate: number): string => {
  const dst: string[] = [];
  for (const line of src.split('\n')) {
    const r = random();
    if (r < rate / 3) continue;
    else if (r < (2 * rate) / 3) dst.push(pick(ALPHABET));
    else if (r < rate) {
      dst.push(pick(ALPHABET));
      dst.push(line);
    } else dst.push(line);
  }
  return dst.join('\n');
};

/** A random pair, half of them without a final newline on one side or both. */
const pair = (): [string, string] => {
  const a = file(1 + int(30));
  const b = mutate(a, pick([0.05, 0.2, 0.6]));
  return [a + (random() < 0.5 ? '\n' : ''), b + (random() < 0.5 ? '\n' : '')];
};

const labels = {oldName: 'a/one', newName: 'b/one'};

/** Every style's hunks for one pair, at one context width. */
const build = (a: string, b: string, context: number) => {
  const {src, dst, patch, opts} = diff(a, b);
  return {src, dst, grouped: hunks(src, dst, patch, {...opts, context}), opts};
};

/**
 * Replays hunks against `src`. Unlike the writers' replay this one deletes
 * *blind* where a hunk claims `oldCount` lines it holds no text for, which is
 * what an ed script's deletions are and the only way to apply one.
 */
const apply = (src: string[], list: Hunk[]): string[] => {
  const out: string[] = [];
  let si = 0;
  for (const hunk of list) {
    const start = hunk.oldCount ? hunk.oldStart - 1 : hunk.oldStart;
    while (si < start) out.push(src[si++]);
    for (const line of hunk.lines) {
      if (line.op === HUNK_OP_TYPE.INS) out.push(line.text);
      else if (line.op === HUNK_OP_TYPE.EQL) {
        out.push(src[si]);
        si++;
      } else si++;
    }
    si = start + hunk.oldCount;
  }
  while (si < src.length) out.push(src[si++]);
  return out;
};

describe('round trip against the writers', () => {
  test('unified, at every context width', () => {
    for (let i = 0; i < 200; i++) {
      const [a, b] = pair();
      for (const context of [0, 1, 3, 10]) {
        const {grouped} = build(a, b, context);
        if (!grouped.length) continue;
        const out = text(unifiedHunks(grouped, labels));
        try {
          const [read] = parse(out);
          expect(read.errors).toEqual([]);
          expect(read.oldName).toBe('a/one');
          expect(read.newName).toBe('b/one');
          expect(read.hunks).toEqual(grouped);
          expect(text(unifiedHunks(read.hunks, read))).toBe(out);
        } catch (error) {
          logSeed({i, context, a, b});
          throw error;
        }
      }
    }
  });

  test('context, at every context width', () => {
    for (let i = 0; i < 200; i++) {
      const [a, b] = pair();
      for (const context of [0, 1, 3, 10]) {
        const {grouped} = build(a, b, context);
        if (!grouped.length) continue;
        const out = text(contextHunks(grouped, labels));
        try {
          const [read] = parse(out);
          expect(read.errors).toEqual([]);
          expect(read.hunks).toEqual(grouped);
          expect(text(contextHunks(read.hunks, read))).toBe(out);
        } catch (error) {
          logSeed({i, context, a, b});
          throw error;
        }
      }
    }
  });

  test('normal', () => {
    for (let i = 0; i < 200; i++) {
      const [a, b] = pair();
      const {grouped} = build(a, b, 0);
      if (!grouped.length) continue;
      const out = text(normalHunks(grouped));
      try {
        const [read] = parse(out);
        expect(read.errors).toEqual([]);
        expect(read.hunks).toEqual(grouped);
        expect(text(normalHunks(read.hunks))).toBe(out);
      } catch (error) {
        logSeed({i, a, b});
        throw error;
      }
    }
  });

  test('ed script, as far as an ed script goes', () => {
    // An ed script carries no deleted text, no destination line numbers and no
    // missing final newline. What it does carry - the addresses, how many lines
    // go, and every inserted line - has to come back, and the way to check that
    // is to run the parsed hunks and see the destination file come out.
    let deletions = 0;
    for (let i = 0; i < 200; i++) {
      const [a, b] = pair();
      const {src, dst, grouped} = build(a.endsWith('\n') ? a : a + '\n', b.endsWith('\n') ? b : b + '\n', 0);
      if (!grouped.length) continue;
      const out = text(edHunks(grouped));
      try {
        const [read] = parse(out);
        expect(read.style).toBe('ed');
        expect(read.errors).toEqual([]);
        expect(apply(src, read.hunks)).toEqual(dst);
        expect(read.hunks.map((h) => [h.oldStart, h.oldCount, h.newCount])).toEqual(
          grouped.map((h) => [h.oldStart, h.oldCount, h.newCount]),
        );
        for (const hunk of read.hunks) {
          expect(hunk.lines.every((line) => line.op === HUNK_OP_TYPE.INS)).toBe(true);
          if (hunk.oldCount) deletions++;
        }
      } catch (error) {
        logSeed({i, a, b});
        throw error;
      }
    }
    expect(deletions).toBeGreaterThan(0); // blind deletions were actually exercised
  });

  test('a multi-file unified patch splits back into its files', () => {
    let out = '';
    const expected: Hunk[][] = [];
    for (let i = 0; i < 20; i++) {
      const [a, b] = pair();
      const {grouped} = build(a, b, 3);
      if (!grouped.length) continue;
      expected.push(grouped);
      out += text(unifiedHunks(grouped, {oldName: 'a/f' + i, newName: 'b/f' + i}));
    }
    const files = parse(out);
    expect(files.length).toBe(expected.length);
    for (let i = 0; i < files.length; i++) expect(files[i].hunks).toEqual(expected[i]);
  });
});

describe('fuzz', () => {
  /** One arbitrary edit to a patch file, of the kind a mail client or a hand makes. */
  const corrupt = (patch: string): string => {
    const lines = patch.split('\n');
    const at = int(lines.length);
    switch (int(8)) {
      case 0:
        lines.splice(at, 1);
        break;
      case 1:
        lines.splice(at, 0, lines[at] ?? '');
        break;
      case 2:
        lines.length = at;
        break;
      case 3:
        lines.splice(at, 0, pick(['', 'junk', '-- ', '> quoted', '\\ No newline at end of file', '@@ @@']));
        break;
      case 4: {
        const other = int(lines.length);
        const line = lines[at];
        lines[at] = lines[other];
        lines[other] = line;
        break;
      }
      case 5:
        lines[at] = (lines[at] ?? '').slice(int(4));
        break;
      case 6:
        lines[at] = (lines[at] ?? '').replace(/\d+/, String(int(1000)));
        break;
      default:
        lines[at] = String.fromCharCode(33 + int(90)) + (lines[at] ?? '').slice(1);
    }
    return lines.join('\n');
  };

  test('a corrupted patch is reported, never thrown and never mis-numbered', () => {
    for (let i = 0; i < 400; i++) {
      const [a, b] = pair();
      // `normal` and `ed` take context-free hunks; only the other two have a
      // width to pick.
      const style = int(4);
      const {grouped} = build(a, b, style < 2 ? pick([0, 1, 3]) : 0);
      if (!grouped.length) continue;
      let broken = [
        () => text(unifiedHunks(grouped, labels)),
        () => text(contextHunks(grouped, labels)),
        () => text(normalHunks(grouped)),
        () => text(edHunks(grouped)),
      ][style]();
      for (let k = 0; k <= int(3); k++) broken = corrupt(broken);
      const rows = broken.split('\n').length;
      try {
        for (const file of parse(broken))
          for (const error of file.errors) {
            expect(error.line).toBeGreaterThan(0);
            expect(error.line).toBeLessThanOrEqual(rows);
            expect(typeof error.message).toBe('string');
          }
      } catch (error) {
        logSeed({i, broken});
        throw error;
      }
    }
  });

  test('arbitrary text is either not a patch or a reported one', () => {
    const words = [
      '@@',
      '---',
      '+++',
      '***************',
      '1a2',
      '3,4c5',
      '.',
      's/.//',
      'diff --git a/x b/y',
      '',
      '-',
      '+',
      '\\',
      'Index: x',
      'GIT binary patch',
    ];
    for (let i = 0; i < 400; i++) {
      const rows = Array.from({length: int(20)}, () => Array.from({length: int(4)}, () => pick(words)).join(' '));
      const input = rows.join('\n');
      try {
        for (const file of parse(input)) {
          expect(Array.isArray(file.hunks)).toBe(true);
          for (const error of file.errors) expect(error.line).toBeGreaterThan(0);
        }
      } catch (error) {
        logSeed({i, input});
        throw error;
      }
    }
  });
});
