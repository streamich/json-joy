import * as diff from '../str';

/**
 * The fuzz and stress suites run reduced round counts and input sizes by
 * default, so that a full `yarn test` stays quick. `RUN_SLOW_TESTS=1` restores
 * the full-size run: the same shapes, the numbers they were written at.
 */
export const slow = !!process.env.RUN_SLOW_TESTS && process.env.RUN_SLOW_TESTS !== '0';

/**
 * Rounds a randomised property should run. Every round draws a fresh shape, so
 * the count buys breadth rather than depth: a third of it still walks the same
 * generators. `RUN_SLOW_TESTS=1` runs the counts these were written at.
 */
export const rounds = (full: number): number => (slow ? full : Math.ceil(full / 3));

/**
 * Checks that a string is well-formed UTF-16: every high surrogate is
 * immediately followed by a low surrogate, and there are no unpaired low
 * surrogates.
 */
export const isWellFormed = (str: string): boolean => {
  const length = str.length;
  for (let i = 0; i < length; i++) {
    const code = str.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      if (i + 1 >= length) return false;
      const next = str.charCodeAt(i + 1);
      if (next < 0xdc00 || next > 0xdfff) return false;
      i++;
    } else if (code >= 0xdc00 && code <= 0xdfff) return false;
  }
  return true;
};

export const assertPatch = (src: string, dst: string, patch: diff.Patch = diff.diff(src, dst)) => {
  // Patch is normalized: no op has empty text, no two adjacent ops share a type.
  const patchLength = patch.length;
  for (let i = 0; i < patchLength; i++) {
    const op = patch[i];
    expect(op[1].length).toBeGreaterThan(0);
    if (i > 0) expect(op[0]).not.toBe(patch[i - 1][0]);
  }
  // If both inputs are well-formed UTF-16, every op text must be well-formed.
  if (isWellFormed(src) && isWellFormed(dst)) {
    for (let i = 0; i < patchLength; i++) expect(isWellFormed(patch[i][1])).toBe(true);
  }
  const src1 = diff.src(patch);
  const dst1 = diff.dst(patch);
  let dst2 = src;
  diff.apply(
    patch,
    dst2.length,
    (pos, str) => {
      dst2 = dst2.slice(0, pos) + str + dst2.slice(pos);
    },
    (pos, len) => {
      dst2 = dst2.slice(0, pos) + dst2.slice(pos + len);
    },
  );
  const inverted = diff.invert(patch);
  const src2 = diff.dst(inverted);
  const dst3 = diff.src(inverted);
  let src3 = dst;
  diff.apply(
    inverted,
    src3.length,
    (pos, str) => {
      src3 = src3.slice(0, pos) + str + src3.slice(pos);
    },
    (pos, len) => {
      src3 = src3.slice(0, pos) + src3.slice(pos + len);
    },
  );
  expect(src1).toBe(src);
  expect(src2).toBe(src);
  expect(src3).toBe(src);
  expect(dst1).toBe(dst);
  expect(dst2).toBe(dst);
  expect(dst3).toBe(dst);
};
