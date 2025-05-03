import * as diff from "../str";

export const assertPatch = (src: string, dst: string, patch: diff.Patch = diff.diff(src, dst)) => {
  const src1 = diff.src(patch);
  const dst1 = diff.dst(patch);
  let dst2 = src;
  diff.apply(patch, (pos, str) => {
    dst2 = dst2.slice(0, pos) + str + dst2.slice(pos);
  }, (pos, len) => {
    dst2 = dst2.slice(0, pos) + dst2.slice(pos + len);
  });
  const inverted = diff.invert(patch);
  const src2 = diff.dst(inverted);
  const dst3 = diff.src(inverted);
  let src3 = dst;
  diff.apply(inverted, (pos, str) => {
    src3 = src3.slice(0, pos) + str + src3.slice(pos);
  }, (pos, len) => {
    src3 = src3.slice(0, pos) + src3.slice(pos + len);
  });
  expect(src1).toBe(src);
  expect(src2).toBe(src);
  expect(src3).toBe(src);
  expect(dst1).toBe(dst);
  expect(dst2).toBe(dst);
  expect(dst3).toBe(dst);
};
