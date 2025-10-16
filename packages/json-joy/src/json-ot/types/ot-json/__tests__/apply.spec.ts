import {apply} from '../apply';

test('applies an operation to a document', () => {
  const doc = {
    foo: 'bar',
    a: {
      a: '123',
      b: {
        c: 1,
        d: 2,
      },
    },
    arr: [1, 2, 3],
  };

  const result = apply(doc, [
    [],
    [
      [0, ['a', 'b', 'c']],
      [1, ['a', 'b']],
      [2, ['arr', 1]],
    ],
    [[3, [0.5, 1.0, 3.5]]],
    [
      [1, ['a', 'b']],
      [0, ['a', 'b', 'e']],
      [2, ['arr', 2]],
      [3, ['vec3']],
    ],
    [],
  ]);

  expect(result).toStrictEqual({
    foo: 'bar',
    a: {a: '123', b: {d: 2, e: 1}},
    arr: [1, 3, 2],
    vec3: [0.5, 1, 3.5],
  });
});

test('can specify picks in any order', () => {
  const doc1 = {
    foo: {
      bar: 123,
    },
  };
  const doc2 = {
    foo: {
      bar: 123,
    },
  };
  const result1 = apply(doc1, [
    [],
    [
      [0, ['foo', 'bar']],
      [1, ['foo']],
    ],
    [[2, 'g']],
    [
      [1, ['baz']],
      [2, ['baz', 'gg']],
    ],
    [],
  ]);
  const result2 = apply(doc2, [
    [],
    [
      [1, ['foo']],
      [0, ['foo', 'bar']],
    ],
    [[2, 'g']],
    [
      [1, ['baz']],
      [2, ['baz', 'gg']],
    ],
    [],
  ]);
  expect(result1).toStrictEqual({
    baz: {
      gg: 'g',
    },
  });
  expect(result2).toStrictEqual({
    baz: {
      gg: 'g',
    },
  });
});

test('can set root value', () => {
  const doc = {foo: 'bar'};
  const result = apply(doc, [[], [], [[0, 123]], [[0, []]], []]);
  expect(result).toStrictEqual(123);
});

test('can insert into an array', () => {
  const doc = {arr: [1, 3]};
  const result = apply(doc, [[], [], [[0, 2]], [[0, ['arr', 1]]], []]);
  expect(result).toStrictEqual({arr: [1, 2, 3]});
});

test('can insert at the end of array', () => {
  const doc = {arr: [1, 3]};
  const result = apply(doc, [[], [], [[0, 'x']], [[0, ['arr', 2]]], []]);
  expect(result).toStrictEqual({arr: [1, 3, 'x']});
});

test('can insert at the beginning of array', () => {
  const doc = {arr: [1, 3]};
  const result = apply(doc, [[], [], [[0, 'x']], [[0, ['arr', 0]]], []]);
  expect(result).toStrictEqual({arr: ['x', 1, 3]});
});

test('can push to end of array', () => {
  const doc = {arr: [1, 3]};
  const result = apply(doc, [[], [], [[0, 'x']], [[0, ['arr', -1]]], []]);
  expect(result).toStrictEqual({arr: [1, 3, 'x']});
});

test('can replace document root', () => {
  const doc = {foo: 'bar'};
  const result = apply(doc, [[], [], [[0, {baz: 'qux'}]], [[0, []]], []]);
  expect(result).toStrictEqual({baz: 'qux'});
});

test('can move values from array to object', () => {
  const doc = {
    arr: [1, 2, 3],
    obj: {},
  };
  const result = apply(doc, [
    [],
    [
      [1, ['arr', 0]],
      [0, ['arr', 2]],
    ],
    [],
    [
      [1, ['obj', 'b']],
      [0, ['obj', 'a']],
    ],
    [],
  ]);
  expect(result).toStrictEqual({
    arr: [2],
    obj: {
      a: 3,
      b: 1,
    },
  });
});

test('can move values from array to array', () => {
  const doc = {
    arr1: [1, 2, 3],
    arr2: ['a', 'b'],
  };
  const result = apply(doc, [
    [],
    [
      [1, ['arr1', 0]],
      [0, ['arr1', 2]],
    ],
    [],
    [
      [0, ['arr2', 3]],
      [1, ['arr2', 1]],
    ],
    [],
  ]);
  expect(result).toStrictEqual({
    arr1: [2],
    arr2: ['a', 1, 'b', 3],
  });
});
