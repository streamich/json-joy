import * as line from '../line';

export const assertDiff = (src: string[], dst: string[]) => {
  // console.log('src', src);
  // console.log('dst', dst);
  const diff = line.diff(src, dst);
  // console.log(diff);
  const res: string[] = [];
  if (diff.length) {
    for (let [type, srcIdx, dstIdx, patch] of diff) {
      if (type === line.LINE_PATCH_OP_TYPE.DEL) {
      } else if (type === line.LINE_PATCH_OP_TYPE.INS) {
        res.push(dst[dstIdx]);
      } else if (type === line.LINE_PATCH_OP_TYPE.EQL) {
        res.push(src[srcIdx]);
      } else if (type === line.LINE_PATCH_OP_TYPE.MIX) {
        res.push(dst[dstIdx]);
      }
    }
  } else {
    res.push(...src);
  }
  expect(res).toEqual(dst);
};
