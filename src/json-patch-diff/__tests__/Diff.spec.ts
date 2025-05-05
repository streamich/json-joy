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

describe('num', () => {
  test('insert', () => {
    const src = 1;
    const dst = 2;
    assertDiff(src, dst);
  });
});

describe('obj', () => {
  test('can remove single key', () => {
    const src = {foo: 1};
    const dst = {};
    assertDiff(src, dst);
  });

  test('replace key', () => {
    const src = {foo: 1};
    const dst = {foo: 2};
    assertDiff(src, dst);
  });

  test('diff inner string', () => {
    const src = {foo: 'hello'};
    const dst = {foo: 'hello!'};
    assertDiff(src, dst);
  });

  test('can insert new key', () => {
    const src = {};
    const dst = {foo: 'hello!'};
    assertDiff(src, dst);
  });

  test('can diff nested objects', () => {
    const src = {
      id: 1,
      name: 'hello',
      nested: {
        id: 2,
        name: 'world',
        description: 'blablabla'
      },
    };
    const dst = {
      id: 3,
      name: 'hello!',
      nested: {
        id: 2,
        description: 'Please dont use "blablabla"'
      },
    };
    assertDiff(src, dst);
  });
});
