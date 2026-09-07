import * as line from '../line';

export const assertApply = (src: string[], dst: string[], patch: line.LinePatch) => {
  const res = [...src];
  line.apply(
    patch,
    (pos) => {
      res.splice(pos, 1);
    },
    (srcPos, dstPos) => {
      res.splice(srcPos + 1, 0, dst[dstPos]);
    },
    (srcPos, dstPos) => {
      res[srcPos] = dst[dstPos];
    },
  );
  expect(res).toEqual(dst);
};

export const assertDiff = (src: string[], dst: string[], diff: line.LinePatch = line.diff(src, dst)) => {
  const srcLen = src.length;
  const dstLen = dst.length;
  const res: string[] = [];
  if (diff.length) {
    let lastSrcIdx = -1; // last src index consumed by a DEL/EQL/MIX op
    let lastDstIdx = -1; // last dst index consumed by an INS/EQL/MIX op
    for (const [type, srcIdx, dstIdx] of diff) {
      if (type === line.LINE_PATCH_OP_TYPE.DEL) {
        expect(srcIdx).toBeGreaterThanOrEqual(0);
        expect(srcIdx).toBeLessThan(srcLen);
        expect(srcIdx).toBeGreaterThan(lastSrcIdx);
        lastSrcIdx = srcIdx;
      } else if (type === line.LINE_PATCH_OP_TYPE.INS) {
        expect(dstIdx).toBeGreaterThanOrEqual(0);
        expect(dstIdx).toBeLessThan(dstLen);
        expect(dstIdx).toBeGreaterThan(lastDstIdx);
        expect(srcIdx).toBeGreaterThanOrEqual(-1); // insert anchor, -1 inserts at the start
        expect(srcIdx).toBeLessThan(srcLen);
        lastDstIdx = dstIdx;
        res.push(dst[dstIdx]);
      } else if (type === line.LINE_PATCH_OP_TYPE.EQL) {
        expect(srcIdx).toBeGreaterThanOrEqual(0);
        expect(srcIdx).toBeLessThan(srcLen);
        expect(dstIdx).toBeGreaterThanOrEqual(0);
        expect(dstIdx).toBeLessThan(dstLen);
        expect(srcIdx).toBeGreaterThan(lastSrcIdx);
        expect(dstIdx).toBeGreaterThan(lastDstIdx);
        expect(src[srcIdx]).toBe(dst[dstIdx]);
        lastSrcIdx = srcIdx;
        lastDstIdx = dstIdx;
        res.push(src[srcIdx]);
      } else if (type === line.LINE_PATCH_OP_TYPE.MIX) {
        expect(srcIdx).toBeGreaterThanOrEqual(0);
        expect(srcIdx).toBeLessThan(srcLen);
        expect(dstIdx).toBeGreaterThanOrEqual(0);
        expect(dstIdx).toBeLessThan(dstLen);
        expect(srcIdx).toBeGreaterThan(lastSrcIdx);
        expect(dstIdx).toBeGreaterThan(lastDstIdx);
        lastSrcIdx = srcIdx;
        lastDstIdx = dstIdx;
        res.push(dst[dstIdx]);
      }
    }
  } else {
    res.push(...src);
  }
  expect(res).toEqual(dst);
  assertApply(src, dst, diff);
};
