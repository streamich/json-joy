import {Diff} from '../Diff';
import {applyPatch} from '../../json-patch';

export const assertDiff = (src: unknown, dst: unknown) => {
  const srcNested = {src};
  const patch1 = new Diff().diff('/src', src, dst);
  console.log(src);
  console.log(patch1);
  console.log(dst);
  const {doc: res} = applyPatch(srcNested, patch1, {mutate: false});
  console.log(res);
  expect(res).toEqual({src: dst});
  const patch2 = new Diff().diff('/src', (res as any)['src'], dst);
  // console.log(patch2);
  expect(patch2.length).toBe(0);
};

export const randomArray = () => {
  const len = Math.floor(Math.random() * 10);
  const arr: unknown[] = [];
  for (let i = 0; i < len; i++) {
    arr.push(Math.ceil(Math.random() * 13));
  }
  return arr;
};
