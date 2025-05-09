import {RandomJson} from '@jsonjoy.com/util/lib/json-random';
import * as line from '../line';

const assertDiff = (src: string[], dst: string[]) => {
  const diff = line.diff(src, dst);
  const res: string[] = [];
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
  expect(res).toEqual(dst);
};

const iterations = 1000;
const minElements = 2;
const maxElements = 6;

test('produces valid patch', () => {
  for (let i = 0; i < iterations; i++) {
    const elements = minElements + Math.ceil(Math.random() * (maxElements - minElements));
    const src: string[] = [];
    const dst: string[] = [];
    for (let i = 0; i < elements; i++) {
      const json = RandomJson.generate({nodeCount: 5});
      if (Math.random() > 0.5) {
        src.push(JSON.stringify(json));
      }
      if (Math.random() > 0.5) {
        dst.push(JSON.stringify(json));
      }
    }
    try {
      assertDiff(src, dst);
    } catch (error) {
      console.log('SRC', src);
      console.log('DST', dst);
      throw error;
    }
  }
});
