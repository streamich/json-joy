import {align} from '../optimize';
import {diff, dst as getDst, src as getSrc, PATCH_OP_TYPE, type Patch} from '../str';
import {int, logSeed, pick} from './rnd';

const isWellFormed = (str: string): boolean => {
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = str.charCodeAt(i + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return false;
      i++;
    } else if (code >= 0xdc00 && code <= 0xdfff) return false;
  }
  return true;
};

describe('align()', () => {
  test('slides an insertion onto word boundaries', () => {
    const patch: Patch = [
      [PATCH_OP_TYPE.EQL, 'The c'],
      [PATCH_OP_TYPE.INS, 'ow and the c'],
      [PATCH_OP_TYPE.EQL, 'at.'],
    ];
    expect(align(patch)).toEqual([
      [PATCH_OP_TYPE.EQL, 'The '],
      [PATCH_OP_TYPE.INS, 'cow and the '],
      [PATCH_OP_TYPE.EQL, 'cat.'],
    ]);
  });

  test('slides a deletion onto word boundaries', () => {
    const patch: Patch = [
      [PATCH_OP_TYPE.EQL, 'The c'],
      [PATCH_OP_TYPE.DEL, 'ow and the c'],
      [PATCH_OP_TYPE.EQL, 'at.'],
    ];
    expect(align(patch)).toEqual([
      [PATCH_OP_TYPE.EQL, 'The '],
      [PATCH_OP_TYPE.DEL, 'cow and the '],
      [PATCH_OP_TYPE.EQL, 'cat.'],
    ]);
  });

  test('prefers blank lines over other boundaries', () => {
    const patch: Patch = [
      [PATCH_OP_TYPE.EQL, 'AAA\r\n\r\nBBB'],
      [PATCH_OP_TYPE.INS, '\r\nDDD\r\n\r\nBBB'],
      [PATCH_OP_TYPE.EQL, '\r\nEEE'],
    ];
    expect(align(patch)).toEqual([
      [PATCH_OP_TYPE.EQL, 'AAA\r\n\r\n'],
      [PATCH_OP_TYPE.INS, 'BBB\r\nDDD\r\n\r\n'],
      [PATCH_OP_TYPE.EQL, 'BBB\r\nEEE'],
    ]);
  });

  test('prefers line breaks over interior positions', () => {
    const patch: Patch = [
      [PATCH_OP_TYPE.EQL, 'AAA\r\nBBB'],
      [PATCH_OP_TYPE.INS, ' DDD\r\nBBB'],
      [PATCH_OP_TYPE.EQL, ' EEE'],
    ];
    expect(align(patch)).toEqual([
      [PATCH_OP_TYPE.EQL, 'AAA\r\n'],
      [PATCH_OP_TYPE.INS, 'BBB DDD\r\n'],
      [PATCH_OP_TYPE.EQL, 'BBB EEE'],
    ]);
  });

  test('does not slide substitutions (DEL+INS pairs)', () => {
    const patch: Patch = [
      [PATCH_OP_TYPE.EQL, 'ab '],
      [PATCH_OP_TYPE.DEL, 'cd'],
      [PATCH_OP_TYPE.INS, 'xy'],
      [PATCH_OP_TYPE.EQL, ' ef'],
    ];
    expect(align(patch)).toEqual(patch);
  });

  test('end to end: reconstructs and lands on a word boundary', () => {
    const src = 'The cat.';
    const dst = 'The cow and the cat.';
    const patch = align(diff(src, dst));
    expect(getSrc(patch)).toBe(src);
    expect(getDst(patch)).toBe(dst);
    // The inserted hunk is whole words, not a mid-word fragment.
    expect(patch).toEqual([
      [PATCH_OP_TYPE.EQL, 'The '],
      [PATCH_OP_TYPE.INS, 'cow and the '],
      [PATCH_OP_TYPE.EQL, 'cat.'],
    ]);
  });

  test('does not mutate the input patch', () => {
    const patch: Patch = [
      [PATCH_OP_TYPE.EQL, 'The c'],
      [PATCH_OP_TYPE.INS, 'ow and the c'],
      [PATCH_OP_TYPE.EQL, 'at.'],
    ];
    const before = JSON.parse(JSON.stringify(patch));
    align(patch);
    expect(patch).toEqual(before);
  });

  test('passes through empty and single-op patches', () => {
    expect(align([])).toEqual([]);
    expect(align([[PATCH_OP_TYPE.EQL, 'abc']])).toEqual([[PATCH_OP_TYPE.EQL, 'abc']]);
    expect(align([[PATCH_OP_TYPE.INS, 'abc']])).toEqual([[PATCH_OP_TYPE.INS, 'abc']]);
  });

  test('slides an edit onto the leading edge, emptying the left equality', () => {
    const patch: Patch = [
      [PATCH_OP_TYPE.EQL, 'ab'],
      [PATCH_OP_TYPE.INS, 'ab'],
      [PATCH_OP_TYPE.EQL, 'cd'],
    ];
    const out = align(patch);
    expect(out).toEqual([
      [PATCH_OP_TYPE.INS, 'ab'],
      [PATCH_OP_TYPE.EQL, 'abcd'],
    ]);
    expect(getSrc(out)).toBe('abcd');
    expect(getDst(out)).toBe('ababcd');
  });

  test('slides an edit onto the trailing edge, emptying the right equality', () => {
    const patch: Patch = [
      [PATCH_OP_TYPE.EQL, 'cd'],
      [PATCH_OP_TYPE.INS, 'ab'],
      [PATCH_OP_TYPE.EQL, 'ab'],
    ];
    const out = align(patch);
    expect(out).toEqual([
      [PATCH_OP_TYPE.EQL, 'cdab'],
      [PATCH_OP_TYPE.INS, 'ab'],
    ]);
    expect(getSrc(out)).toBe('cdab');
    expect(getDst(out)).toBe('cdabab');
  });

  test('slides across a surrogate pair without splitting it', () => {
    const patch: Patch = [
      [PATCH_OP_TYPE.EQL, 'x'],
      [PATCH_OP_TYPE.INS, '😀y'],
      [PATCH_OP_TYPE.EQL, '😀z'],
    ];
    const out = align(patch);
    expect(getSrc(out)).toBe('x😀z');
    expect(getDst(out)).toBe('x😀y😀z');
    for (const [, txt] of out) expect(isWellFormed(txt)).toBe(true);
  });

  /**
   * The four inputs the fuzz below used to fail on, captured by sweeping
   * `DIFF_SEED` (67, 79, 83 and 253 of the first 300). All four are the same
   * defect: a slide that consumes a whole equality merges two edits behind the
   * pointer, which a single left-to-right pass never revisits. Three came out
   * `INS` before `DEL` - `normalize` merges same-type neighbours but does not
   * reorder - and the fourth was a second pass changing the answer.
   */
  describe('regressions from the fuzz', () => {
    const cases: [name: string, a: string, b: string][] = [
      ['seed 67', 'aword. cat \u{1f642}\r\n\u00e9the  \u4e2d\u00e9word', '\u4e2dthe   '],
      ['seed 79', '.  cat the  \u00e9the ', ' \r\n\r\nword \u00e9\n\u{1f642}the    the '],
      [
        'seed 83',
        'a\n\r\n\u{1f642}\u00e9\ncat . \r\ncat . \n\u{1f642}',
        '\u00e9cat . . \nthe \u{1f642}\u{1f600}. \r\n',
      ],
      ['seed 253', 'b\u{1f600}\u4e2dwordthe . \u{1f642}', 'the wordcat \r\n . . \u{1f642}word\u{1f642}\n. cat '],
    ];

    for (const [name, a, b] of cases)
      test(name, () => {
        const out = align(diff(a, b));
        expect(getSrc(out)).toBe(a);
        expect(getDst(out)).toBe(b);
        for (let j = 0; j < out.length; j++) {
          expect(out[j][1]).not.toBe('');
          expect(isWellFormed(out[j][1])).toBe(true);
          if (j > 0) {
            expect(out[j][0]).not.toBe(out[j - 1][0]);
            if (out[j - 1][0] === PATCH_OP_TYPE.INS) expect(out[j][0]).not.toBe(PATCH_OP_TYPE.DEL);
          }
        }
        expect(align(out)).toEqual(out);
      });
  });

  test('fuzz: reconstruction, well-formed, normalized, canonical, idempotent', () => {
    const pool = ['a', 'b', ' ', '\n', '\r\n', '. ', 'the ', 'cat ', 'word', '😀', '🙂', 'é', '中'];
    for (let i = 0; i < 300; i++) {
      let a = '';
      let b = '';
      const la = int(15);
      const lb = int(15);
      for (let j = 0; j < la; j++) a += pick(pool);
      for (let j = 0; j < lb; j++) b += pick(pool);
      const patch = diff(a, b);
      try {
        const out = align(patch);
        expect(getSrc(out)).toBe(a);
        expect(getDst(out)).toBe(b);
        for (let j = 0; j < out.length; j++) {
          expect(out[j][1]).not.toBe('');
          expect(isWellFormed(out[j][1])).toBe(true);
          if (j > 0) {
            expect(out[j][0]).not.toBe(out[j - 1][0]);
            if (out[j - 1][0] === PATCH_OP_TYPE.INS) expect(out[j][0]).not.toBe(PATCH_OP_TYPE.DEL);
          }
        }
        expect(align(out)).toEqual(out);
      } catch (error) {
        logSeed({a, b});
        throw error;
      }
    }
  });
});
