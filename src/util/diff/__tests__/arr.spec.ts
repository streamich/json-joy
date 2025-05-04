import * as arr from '../arr';

test('insert into empty list', () => {
  const patch = arr.diff('', '1');
  expect(patch).toEqual([arr.ARR_PATCH_OP_TYPE.INSERT, 1]);
});

test('both empty', () => {
  const patch = arr.diff('', '');
  expect(patch).toEqual([]);
});

test('keep one', () => {
  const patch = arr.diff('1', '1');
  expect(patch).toEqual([arr.ARR_PATCH_OP_TYPE.EQUAL, 1]);
});

test('keep two', () => {
  const patch = arr.diff('1\n1', '1\n1');
  expect(patch).toEqual([
    arr.ARR_PATCH_OP_TYPE.EQUAL, 2,
  ]);
});

test('keep three', () => {
  const patch = arr.diff('1\n1\n2', '1\n1\n2');
  expect(patch).toEqual([
    arr.ARR_PATCH_OP_TYPE.EQUAL, 3,
  ]);
});

test('keep two, delete one', () => {
  const patch = arr.diff('1\n1\n2', '1\n1');
  expect(patch).toEqual([
    arr.ARR_PATCH_OP_TYPE.EQUAL, 2,
    arr.ARR_PATCH_OP_TYPE.DELETE, 1,
  ]);
});

test('keep two, delete in the middle', () => {
  const patch = arr.diff('1\n2\n3', '1\n3');
  expect(patch).toEqual([
    arr.ARR_PATCH_OP_TYPE.EQUAL, 1,
    arr.ARR_PATCH_OP_TYPE.DELETE, 1,
    arr.ARR_PATCH_OP_TYPE.EQUAL, 1,
  ]);
});

test('keep two, delete the first one', () => {
  const patch = arr.diff('1\n2\n3', '2\n3');
  expect(patch).toEqual([
    arr.ARR_PATCH_OP_TYPE.DELETE, 1,
    arr.ARR_PATCH_OP_TYPE.EQUAL, 2,
  ]);
});

describe('delete', () => {
  test('delete the only element', () => {
    const patch = arr.diff('1', '');
    expect(patch).toEqual([arr.ARR_PATCH_OP_TYPE.DELETE, 1]);
  });

  test('delete the only two element', () => {
    const patch = arr.diff('1\n{}', '');
    expect(patch).toEqual([arr.ARR_PATCH_OP_TYPE.DELETE, 2]);
  });

  test('delete two and three in a row', () => {
    const patch = arr.diff('1\n2\n3\n4\n5\n6', '3');
    expect(patch).toEqual([
      arr.ARR_PATCH_OP_TYPE.DELETE, 2,
      arr.ARR_PATCH_OP_TYPE.EQUAL, 1,
      arr.ARR_PATCH_OP_TYPE.DELETE, 3,
    ]);
  });

  test('delete the first one', () => {
    const patch = arr.diff('1\n2\n3', '2\n3');
    expect(patch).toEqual([
      arr.ARR_PATCH_OP_TYPE.DELETE, 1,
      arr.ARR_PATCH_OP_TYPE.EQUAL, 2,
    ]);
  });

  test('delete the middle element', () => {
    const patch = arr.diff('1\n2\n3', '1\n3');
    expect(patch).toEqual([
      arr.ARR_PATCH_OP_TYPE.EQUAL, 1,
      arr.ARR_PATCH_OP_TYPE.DELETE, 1,
      arr.ARR_PATCH_OP_TYPE.EQUAL, 1,
    ]);
  });

  test('delete the last element', () => {
    const patch = arr.diff('1\n2\n3', '1\n2');
    expect(patch).toEqual([
      arr.ARR_PATCH_OP_TYPE.EQUAL, 2,
      arr.ARR_PATCH_OP_TYPE.DELETE, 1,
    ]);
  });

  test('delete two first elements', () => {
    const patch = arr.diff('1\n2\n3\n4', '3\n4');
    expect(patch).toEqual([
      arr.ARR_PATCH_OP_TYPE.DELETE, 2,
      arr.ARR_PATCH_OP_TYPE.EQUAL, 2,
    ]);
  });

  test('preserve one and delete one', () => {
    const patch = arr.diff('1\n2', '1');
    expect(patch).toEqual([
      arr.ARR_PATCH_OP_TYPE.EQUAL, 1,
      arr.ARR_PATCH_OP_TYPE.DELETE, 1,
    ]);
  });
  
  test('preserve one and delete one (reverse)', () => {
    const patch = arr.diff('1\n2', '2');
    expect(patch).toEqual([
      arr.ARR_PATCH_OP_TYPE.DELETE, 1,
      arr.ARR_PATCH_OP_TYPE.EQUAL, 1,
    ]);
  });
  
  test('various deletes and inserts', () => {
    const patch = arr.diff('1\n2\n[3]\n3\n5\n{a:4}\n5\n"6"', '1\n2\n[3]\n5\n{a:4}\n5\n"6"\n6');
    expect(patch).toEqual([
      arr.ARR_PATCH_OP_TYPE.EQUAL, 3,
      arr.ARR_PATCH_OP_TYPE.DELETE, 1,
      arr.ARR_PATCH_OP_TYPE.EQUAL, 4,
      arr.ARR_PATCH_OP_TYPE.INSERT, 1,
    ]);
  });
});

describe('diff', () => {
  test('diffs partially matching single element', () => {
    const patch = arr.diff('[]', '[1]');
    expect(patch).toEqual([arr.ARR_PATCH_OP_TYPE.DIFF, 1]);
  });

  test('diffs second element', () => {
    const patch = arr.diff('1\n[]', '1\n[1]');
    expect(patch).toEqual([
      arr.ARR_PATCH_OP_TYPE.EQUAL, 1,
      arr.ARR_PATCH_OP_TYPE.DIFF, 1,
    ]);
  });

  test('diffs middle element', () => {
    const patch = arr.diff('1\n2\n3', '1\n[2]\n3');
    expect(patch).toEqual([
      arr.ARR_PATCH_OP_TYPE.EQUAL, 1,
      arr.ARR_PATCH_OP_TYPE.DIFF, 1,
      arr.ARR_PATCH_OP_TYPE.EQUAL, 1,
    ]);
  });

  test('diffs middle element - 2', () => {
    const patch = arr.diff('1\n[1,2,3,4]\n3', '1\n[1,3,455]\n3');
    expect(patch).toEqual([
      arr.ARR_PATCH_OP_TYPE.EQUAL, 1,
      arr.ARR_PATCH_OP_TYPE.DIFF, 1,
      arr.ARR_PATCH_OP_TYPE.EQUAL, 1,
    ]);
  });
});
