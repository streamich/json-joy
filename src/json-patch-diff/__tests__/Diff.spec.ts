import {Diff} from '../Diff';
import {applyPatch} from '../../json-patch';

const assertDiff = (src: unknown, dst: unknown) => {
  const srcNested = {src};
  const patch1 = new Diff().diff('/src', src, dst);
  const {doc: res} = applyPatch(srcNested, patch1, {mutate: false});
  // console.log(src);
  // console.log(dst);
  // console.log(patch1);
  // console.log(res);
  expect(res).toEqual({src: dst});
  const patch2 = new Diff().diff('/src', (res as any)['src'], dst);
  // console.log(patch2);
  expect(patch2.length).toBe(0);
};

describe('str', () => {
  test('insert', () => {
    const src = 'hello world';
    const dst = 'hello world!';
    assertDiff(src, dst);
  });

  test('delete', () => {
    const src = 'hello worldz';
    const dst = 'hello world';
    assertDiff(src, dst);
  });

  test('replace', () => {
    const src = 'hello world';
    const dst = 'Hello world';
    assertDiff(src, dst);
  });

  test('various edits', () => {
    const src = 'helloo vorldz!';
    const dst = 'Hello, world, buddy!';
    assertDiff(src, dst);
  });
});
