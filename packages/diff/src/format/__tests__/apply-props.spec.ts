// The apply properties. Two of them are the milestone:
//
//   1. `apply(parse(write(diff(a, b))), a)` is `b`, in every style - contract
//      claim 1, end to end through both halves of `format`.
//   2. **wherever a hunk landed, every line it changes matched the file
//      exactly**. Fuzz relaxes context and nothing else; a fuzz level that
//      reaches an inner line applies a hunk to text it was not written for and
//      corrupts the file with no diagnostic at all. `cores()` below asserts it
//      after every apply in this file, including the ones fed corrupted
//      patches, which is the only place the distinction can be observed.
//
// The corpus-wide version of (1), the drift corpus and the differential against
// the host `patch` are a probe (`.docs/onp4/diff-patch/probes/apply.mjs`).
import {int, logSeed, pick, random} from '../../__tests__/rnd';
import {type ApplyResult, apply} from '../apply';
import {contextHunks} from '../context';
import {edHunks} from '../ed';
import {hunks} from '../hunks';
import {normalHunks} from '../normal';
import {parse} from '../parse';
import {type FilePatch, HUNK_OP_TYPE} from '../types';
import {unifiedHunks} from '../unified';
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

/** Terminated on both sides, for the properties that count lines from the end. */
const terminated = (): [string, string] => {
  const [a, b] = pair();
  return [a.endsWith('\n') ? a : a + '\n', b.endsWith('\n') ? b : b + '\n'];
};

const labels = {oldName: 'a/one', newName: 'b/one'};

const build = (a: string, b: string, context: number) => {
  const {src, dst, patch, opts} = diff(a, b);
  return {src, dst, grouped: hunks(src, dst, patch, {...opts, context})};
};

/** The text of a patch in one style, or `''` when the pair does not differ. */
const write = (a: string, b: string, style: number, context: number): string => {
  const {grouped} = build(a, b, style < 2 ? context : 0);
  if (!grouped.length) return '';
  return [
    () => text(unifiedHunks(grouped, labels)),
    () => text(contextHunks(grouped, labels)),
    () => text(normalHunks(grouped)),
    () => text(edHunks(grouped)),
  ][style]();
};

const lines = (content: string): string[] =>
  content === '' ? [] : (content.endsWith('\n') ? content.slice(0, -1) : content).split('\n');

/**
 * Property 2: every applied hunk found its changed lines verbatim, from the
 * first one to the last, at the position it landed on. A blind delete carries
 * no old-side text and is the one shape this cannot see.
 */
const cores = (src: string, result: ApplyResult): void => {
  const list = lines(src);
  for (const entry of result.applied) {
    const hunk = entry.hunk;
    const body = hunk.lines;
    const length = body.length;
    let from = 0;
    while (from < length && body[from].op === HUNK_OP_TYPE.EQL) from++;
    let to = length;
    while (to > from && body[to - 1].op === HUNK_OP_TYPE.EQL) to--;
    const core: string[] = [];
    for (let i = from; i < to; i++) if (body[i].op !== HUNK_OP_TYPE.INS) core.push(body[i].text);
    if (from + core.length + (length - to) < hunk.oldCount) continue;
    const at = (hunk.oldCount ? hunk.oldStart - 1 : hunk.oldStart) + entry.offset + from;
    expect(list.slice(at, at + core.length)).toEqual(core);
  }
};

const read = (patch: string): FilePatch => parse(patch)[0];

describe('apply(diff(a, b), a) is b', () => {
  test('unified, at every context width', () => {
    for (let i = 0; i < 200; i++) {
      const [a, b] = pair();
      for (const context of [0, 1, 3, 10]) {
        const patch = write(a, b, 0, context);
        if (!patch) continue;
        try {
          const result = apply(a, read(patch));
          expect(result.rejected).toEqual([]);
          expect(result.text).toBe(b);
          cores(a, result);
        } catch (error) {
          logSeed({i, context, a, b});
          throw error;
        }
      }
    }
  });

  test('context format, at every context width', () => {
    for (let i = 0; i < 200; i++) {
      const [a, b] = pair();
      for (const context of [0, 1, 3, 10]) {
        const patch = write(a, b, 1, context);
        if (!patch) continue;
        try {
          const result = apply(a, read(patch));
          expect(result.rejected).toEqual([]);
          expect(result.text).toBe(b);
          cores(a, result);
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
      const patch = write(a, b, 2, 0);
      if (!patch) continue;
      try {
        const result = apply(a, read(patch));
        expect(result.rejected).toEqual([]);
        expect(result.text).toBe(b);
        cores(a, result);
      } catch (error) {
        logSeed({i, a, b});
        throw error;
      }
    }
  });

  test('ed, whose deletions are blind and whose final newline is not there', () => {
    // The one style whose hunks carry no old-side text at all: nothing is
    // matched, `oldCount` lines go wherever the address says. Plain arrays,
    // never `diffKeys`, and both sides terminated - see `format.diffKeys`.
    let blind = 0;
    for (let i = 0; i < 200; i++) {
      const [a, b] = terminated();
      const patch = write(a, b, 3, 0);
      if (!patch) continue;
      try {
        const parsed = read(patch);
        const result = apply(a, parsed);
        expect(result.rejected).toEqual([]);
        expect(result.text).toBe(b);
        for (const hunk of parsed.hunks) if (hunk.oldCount) blind++;
      } catch (error) {
        logSeed({i, a, b});
        throw error;
      }
    }
    expect(blind).toBeGreaterThan(0); // blind deletions were actually exercised
  });
});

describe('drift', () => {
  // Both of these skip a run whose drift took a file boundary away from a hunk
  // pinned to it — that is the boundary rule working, not the property failing.
  // The floors are what stop the rule from quietly emptying the property.
  test('lines inserted above move every hunk by that much', () => {
    let checked = 0;
    for (let i = 0; i < 200; i++) {
      const [a, b] = terminated();
      const patch = write(a, b, 0, 3);
      if (!patch) continue;
      const above = Array.from({length: 1 + int(6)}, () => 'inserted ' + int(1000)).join('\n') + '\n';
      try {
        const result = apply(above + a, read(patch));
        cores(above + a, result);
        if (result.rejected.length) continue; // a hunk the drift landed on top of
        checked++;
        expect(result.text).toBe(above + b);
        for (const entry of result.applied) expect(entry.offset).toBe(lines(above).length);
      } catch (error) {
        logSeed({i, a, b, above});
        throw error;
      }
    }
    expect(checked).toBeGreaterThan(50);
  });

  test('lines appended below leave the hunks where they were', () => {
    let checked = 0;
    for (let i = 0; i < 200; i++) {
      const [a, b] = terminated();
      const patch = write(a, b, 0, 3);
      if (!patch) continue;
      const below = Array.from({length: 1 + int(6)}, () => 'appended ' + int(1000)).join('\n') + '\n';
      try {
        const result = apply(a + below, read(patch));
        cores(a + below, result);
        if (result.rejected.length) continue;
        checked++;
        expect(result.text).toBe(b + below);
        for (const entry of result.applied) expect(entry.offset).toBe(0);
      } catch (error) {
        logSeed({i, a, b, below});
        throw error;
      }
    }
    expect(checked).toBeGreaterThan(50);
  });

  test('a line the hunk changes, changed under it, costs the hunk and not the file', () => {
    // The other half of property 2: the hunk is rejected, or it lands somewhere
    // its core does match. Never a partial application, never a splice into
    // text that does not hold what the hunk deletes.
    let rejected = 0;
    for (let i = 0; i < 300; i++) {
      const [a, b] = terminated();
      const patch = write(a, b, 0, 3);
      if (!patch) continue;
      const parsed = read(patch);
      const hunk = pick(parsed.hunks);
      const del = hunk.lines.filter((line) => line.op === HUNK_OP_TYPE.DEL);
      if (!del.length) continue;
      const target = pick(del).text;
      const list = lines(a);
      const at = list.indexOf(target);
      if (at < 0) continue;
      list[at] = 'CORRUPTED ' + int(1000);
      const drifted = list.join('\n') + '\n';
      try {
        const result = apply(drifted, parsed);
        cores(drifted, result);
        if (result.rejected.length) rejected++;
      } catch (error) {
        logSeed({i, a, b, at});
        throw error;
      }
    }
    expect(rejected).toBeGreaterThan(0);
  });

  test('a patch nothing of which applies leaves the file alone', () => {
    for (let i = 0; i < 200; i++) {
      const [a, b] = terminated();
      const patch = write(a, b, 0, 3);
      if (!patch) continue;
      const other = file(1 + int(30)) + '\n';
      try {
        const result = apply(other, read(patch));
        cores(other, result);
        if (result.applied.length) continue;
        expect(result.text).toBe(other);
      } catch (error) {
        logSeed({i, a, b, other});
        throw error;
      }
    }
  });
});

describe('reverse', () => {
  test('what applied forwards comes back', () => {
    for (let i = 0; i < 200; i++) {
      const [a, b] = pair();
      const patch = write(a, b, 0, 3);
      if (!patch) continue;
      const parsed = read(patch);
      try {
        const forward = apply(a, parsed);
        expect(forward.rejected).toEqual([]);
        const back = apply(forward.text, parsed, {reverse: true});
        expect(back.rejected).toEqual([]);
        expect(back.text).toBe(a);
      } catch (error) {
        logSeed({i, a, b});
        throw error;
      }
    }
  });

  /** Whether `needle` occurs as a run of consecutive lines in `hay`. */
  const occurs = (hay: string[], needle: string[]): boolean => {
    if (!needle.length) return true;
    for (let i = 0; i + needle.length <= hay.length; i++) {
      let k = 0;
      while (k < needle.length && hay[i + k] === needle[k]) k++;
      if (k === needle.length) return true;
    }
    return false;
  };

  // No `continue` on `!alreadyApplied`. That opt-out is what let the engine
  // re-apply a patch to its own output for a whole milestone: a fuzz level
  // placed the hunk before the reverse probe was ever reached, the property
  // skipped every run where that happened, and `detected > 0` stayed green on
  // the runs where it did not. The claim is about the file, so assert on the
  // file.
  //
  // The one honest exclusion is decided from the INPUT, never from the result:
  // a hunk that inserts a copy of a line already there leaves its own old side
  // sitting in `b`, so re-applying it is not a mistake, it is what the text
  // says. Host `patch` re-applies those too, byte for byte — measured on
  // `"  return 1;"` duplicated, where both produce three lines. Every other
  // patch must leave its own output alone.
  test('an applied patch applied again is detected rather than applied', () => {
    let detected = 0;
    let checked = 0;
    let ambiguous = 0;
    for (let i = 0; i < 200; i++) {
      const [a, b] = terminated();
      const patch = write(a, b, 0, 3);
      if (!patch) continue;
      const parsed = read(patch);
      const list = lines(b);
      const stillThere = parsed.hunks.some((hunk) =>
        occurs(
          list,
          hunk.lines.filter((line) => line.op !== HUNK_OP_TYPE.INS).map((line) => line.text),
        ),
      );
      const result = apply(b, parsed);
      cores(b, result);
      if (stillThere) {
        ambiguous++;
        continue;
      }
      checked++;
      try {
        expect(result.text).toBe(b);
        expect(result.applied).toEqual([]);
        expect(result.alreadyApplied).toBe(true);
      } catch (error) {
        logSeed({i, a, b});
        throw error;
      }
      detected++;
    }
    expect(checked).toBeGreaterThan(30);
    expect(detected).toBe(checked);
    expect(ambiguous).toBeLessThan(checked);
  });
});

describe('fuzz', () => {
  /** One arbitrary edit to a patch file, of the kind a mail client or a hand makes. */
  const corrupt = (patch: string): string => {
    const list = patch.split('\n');
    const at = int(list.length);
    switch (int(8)) {
      case 0:
        list.splice(at, 1);
        break;
      case 1:
        list.splice(at, 0, list[at] ?? '');
        break;
      case 2:
        list.length = at;
        break;
      case 3:
        list.splice(at, 0, pick(['', 'junk', '-- ', '> quoted', '\\ No newline at end of file', '@@ @@']));
        break;
      case 4: {
        const other = int(list.length);
        const line = list[at];
        list[at] = list[other];
        list[other] = line;
        break;
      }
      case 5:
        list[at] = (list[at] ?? '').slice(int(4));
        break;
      case 6:
        list[at] = (list[at] ?? '').replace(/\d+/, String(int(1000)));
        break;
      default:
        list[at] = String.fromCharCode(33 + int(90)) + (list[at] ?? '').slice(1);
    }
    return list.join('\n');
  };

  test('a corrupted patch applies partly, wrongly or not at all - never unstructured', () => {
    for (let i = 0; i < 400; i++) {
      const [a, b] = pair();
      const style = int(4);
      let broken = write(a, b, style, pick([0, 1, 3]));
      if (!broken) continue;
      for (let k = 0; k <= int(3); k++) broken = corrupt(broken);
      const target = random() < 0.5 ? a : file(1 + int(30)) + '\n';
      try {
        for (const parsed of parse(broken)) {
          const result = apply(target, parsed, {maxFuzz: int(4)});
          expect(typeof result.text).toBe('string');
          expect(result.applied.length + result.rejected.length).toBe(parsed.hunks.length);
          cores(target, result);
        }
      } catch (error) {
        logSeed({i, style, broken});
        throw error;
      }
    }
  });

  test('arbitrary text that parsed as a patch applies to arbitrary text', () => {
    const words = ['@@', '---', '+++', '***************', '1a2', '3,4c5', '.', 's/.//', '', '-', '+', '\\', 'Index: x'];
    for (let i = 0; i < 400; i++) {
      const input = Array.from({length: int(20)}, () => Array.from({length: int(4)}, () => pick(words)).join(' ')).join(
        '\n',
      );
      const target = file(int(20)) + (random() < 0.5 ? '\n' : '');
      try {
        for (const parsed of parse(input)) {
          const result = apply(target, parsed, {reverse: random() < 0.5, fuzz: int(3), maxFuzz: int(4)});
          expect(typeof result.text).toBe('string');
          cores(target, result);
        }
      } catch (error) {
        logSeed({i, input, target});
        throw error;
      }
    }
  });
});
