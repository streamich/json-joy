import {Diff} from '../Diff';
import {applyPatch} from '../../json-patch';

const assertDiff = (src: unknown, dst: unknown) => {
  const srcNested = {src};
  const patch1 = new Diff().diff('/src', src, dst);
  // console.log(src);
  // console.log(patch1);
  // console.log(dst);
  const {doc: res} = applyPatch(srcNested, patch1, {mutate: false});
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

  test('can change all primitive types', () => {
    const src = {
      obj: {
        nil: null,
        bool: true,
        num: 1,
        str: 'hello',
      },
    };
    const dst = {
      obj: {
        nil: 1,
        bool: false,
        num: null,
        num2: 2,
        str: 'hello!',
      },
    };
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

describe('arr', () => {
  test('can add element to an empty array', () => {
    const src: unknown[] = [];
    const dst: unknown[] = [1];
    assertDiff(src, dst);
  });

  test('can add two elements to an empty array', () => {
    const src: unknown[] = [];
    const dst: unknown[] = [0, 1];
    assertDiff(src, dst);
  });

  test('can add three elements to an empty array', () => {
    const src: unknown[] = [];
    const dst: unknown[] = [0, 1, 2];
    assertDiff(src, dst);
  });

  test('can add multiple elements to an empty array', () => {
    const src: unknown[] = [];
    const dst: unknown[] = [0, 1, 2, 3, 4, 5];
    assertDiff(src, dst);
  });

  test('can remove and add element', () => {
    const src: unknown[] = [0];
    const dst: unknown[] = [1];
    assertDiff(src, dst);
  });

  test('can remove and add two elements', () => {
    const src: unknown[] = [0];
    const dst: unknown[] = [1, 2];
    assertDiff(src, dst);
  });

  test('can overwrite the only element', () => {
    const src: unknown[] = [0];
    const dst: unknown[] = [2];
    assertDiff(src, dst);
  });

  test('can overwrite second element', () => {
    const src: unknown[] = [1, 0];
    const dst: unknown[] = [1, 2];
    assertDiff(src, dst);
  });

  test('can overwrite two elements', () => {
    const src: unknown[] = [1, 2, 3, 4];
    const dst: unknown[] = [1, 'x', 'x', 4];
    assertDiff(src, dst);
  });

  test('can overwrite three elements, and add two more', () => {
    const src: unknown[] = [1, 2, 3, 4];
    const dst: unknown[] = ['x', 'x', 'x', 4, true, false];
    assertDiff(src, dst);
  });

  test('delete last element', () => {
    const src: unknown[] = [1, 2, 3, 4];
    const dst: unknown[] = [1, 2, 3];
    assertDiff(src, dst);
  });

  test('delete first element', () => {
    const src: unknown[] = [1, 2, 3, 4];
    const dst: unknown[] = [2, 3, 4];
    assertDiff(src, dst);
  });

  test('delete first two element', () => {
    const src: unknown[] = [1, 2, 3, 4];
    const dst: unknown[] = [3, 4];
    assertDiff(src, dst);
  });
});

test('array of objects diff', () => {
  const src = [
    {
      id: 'xxxx',
      name: 'Programming',
      description: 'I love programming',
    },
    {
      id: '123',
      name: 'Cookies',
      description: 'I love cookies',
    },
    {
      id: 'xxxx',
      name: 'Music',
      description: 'I love music',
    }
  ];
  const dst = [
    {
      id: '123',
      name: 'Cookies',
      description: 'I love cookies',
    },
    {
      id: 'yyyy',
      name: 'Music',
      description: 'I love music',
    },
  ];
  assertDiff(src, dst);
});

test('complex case', () => {
  const src = {
    id: 'xxxx-xxxxxx-xxxx-xxxx',
    name: 'Ivan',
    tags: ['tag1', 'tag2'],
    age: 30,
    approved: true,
    interests: [
      {
        id: 'xxxx',
        name: 'Programming',
        description: 'I love programming',
      },
      {
        id: '123',
        name: 'Cookies',
        description: 'I love cookies',
      },
      {
        id: 'xxxx',
        name: 'Music',
        description: 'I love music',
      }
    ],
    address: {
      city: 'New York',
      state: 'NY',
      zip: '10001',
      location: {
        lat: 40.7128,
        lng: -74.0060,
      }
    },
  };
  const dst = {
    id: 'yyyy-yyyyyy-yyyy-yyyy',
    name: 'Ivans',
    tags: ['tag2', 'tag3', 'tag4'],
    age: 31,
    approved: false,
    interests: [
      {
        id: '123',
        name: 'Cookies',
        description: 'I love cookies',
      },
      {
        id: 'yyyy',
        name: 'Music',
        description: 'I love music',
      },
    ],
    address: {
      city: 'New York City',
      state: 'NY',
      zip: '10002',
      location: {
        lat: 40.7128,
        lng: 123.4567,
      }
    },
  };
  assertDiff(src, dst);
});
