import * as line from '../line';

describe('diff', () => {
  test('delete all lines', () => {
    const src = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const dst: string[] = [];
    const patch = line.diffLines(src, dst);
    expect(patch).toEqual([
      [ [ -1, '{"id": "xxx-xxxxxxx", "name": "Hello, world"}' ] ],
      [ [ -1, '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}' ] ],
      [ [ -1, '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}' ] ],
      [ [ -1, '{"id": "abc", "name": "Merry Jane"}' ] ]
    ]);
  });

  test('delete all but first line', () => {
    const src = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const dst = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
    ];
    const patch = line.diffLines(src, dst);
    expect(patch).toEqual([
      [ [ 0, '{"id": "xxx-xxxxxxx", "name": "Hello, world"}' ] ],
      [ [ -1, '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}' ] ],
      [ [ -1, '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}' ] ],
      [ [ -1, '{"id": "abc", "name": "Merry Jane"}' ] ]
    ]);
  });

  test('delete all but middle lines line', () => {
    const src = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const dst = [
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
    ];
    const patch = line.diffLines(src, dst);
    expect(patch).toEqual([
      [ [ -1, '{"id": "xxx-xxxxxxx", "name": "Hello, world"}' ] ],
      [ [ 0, '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}' ] ],
      [ [ 0, '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}' ] ],
      [ [ -1, '{"id": "abc", "name": "Merry Jane"}' ] ]
    ]);
  });

  test('delete all but the last line', () => {
    const src = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const dst = [
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const patch = line.diffLines(src, dst);
    expect(patch).toEqual([
      [ [ -1, '{"id": "xxx-xxxxxxx", "name": "Hello, world"}' ] ],
      [ [ -1, '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}' ] ],
      [ [ -1, '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}' ] ],
      [ [ 0, '{"id": "abc", "name": "Merry Jane"}' ] ]
    ]);
  });

  test('normalize line beginnings', () => {
    const src = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const dst = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const patch = line.diffLines(src, dst);
    expect(patch).toEqual([
      [ [ 0, '{"id": "xxx-xxxxxxx", "name": "Hello, world"}' ] ],
      [ [ -1, '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}' ] ],
      [ [ -1, '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}' ] ],
      [ [ 0, '{"id": "abc", "name": "Merry Jane"}' ] ]
    ]);
  });

  test('normalize line endings', () => {
    const src = [
      '{"id": "xxx-xxxxxxx", "name": "hello world!"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const dst = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "abc", "name": "Merry Jane!"}',
    ];
    const patch = line.diffLines(src, dst);
    expect(patch).toEqual([
      [
        [ 0, '{"id": "xxx-xxxxxxx", "name": "' ],
        [ -1, 'h' ],
        [ 1, 'H' ],
        [ 0, 'ello' ],
        [ 1, ',' ],
        [ 0, ' world' ],
        [ -1, '!' ],
        [ 0, '"}' ]
      ],
      [ [ -1, '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}' ] ],
      [ [ -1, '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}' ] ],
      [
        [ 0, '{"id": "abc", "name": "Merry Jane' ],
        [ 1, '!' ],
        [ 0, '"}' ]
      ]
    ]);
  });

  test('move first line to the end', () => {
    const src = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const dst = [
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
    ];
    const patch = line.diffLines(src, dst);
    expect(patch).toEqual([
      [ [ -1, '{"id": "xxx-xxxxxxx", "name": "Hello, world"}' ] ],
      [ [ 0, '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}' ] ],
      [ [ 0, '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}' ] ],
      [ [ 0, '{"id": "abc", "name": "Merry Jane"}' ] ],
      [ [ 1, '{"id": "xxx-xxxxxxx", "name": "Hello, world"}' ] ],
    ]);
  });

  test('move second line to the end', () => {
    const src = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const dst = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
    ];
    const patch = line.diffLines(src, dst);
    expect(patch).toEqual([
      [ [ 0, '{"id": "xxx-xxxxxxx", "name": "Hello, world"}' ] ],
      [ [ -1, '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}' ] ],
      [ [ 0, '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}' ] ],
      [ [ 0, '{"id": "abc", "name": "Merry Jane"}' ] ],
      [ [ 1, '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}' ] ],
    ]);
  });

  test('swap third and fourth lines', () => {
    const src = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const dst = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "abc", "name": "Merry Jane"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
    ];
    const patch = line.diffLines(src, dst);
    expect(patch).toEqual([
      [ [ 0, '{"id": "xxx-xxxxxxx", "name": "Hello, world"}' ] ],
      [ [ 0, '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}' ] ],
      [ [ 1, '{"id": "abc", "name": "Merry Jane"}' ] ],
      [ [ 0, '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}' ] ],
      [ [ -1, '{"id": "abc", "name": "Merry Jane"}' ] ],
    ]);
  });

  test('move last line to the beginning', () => {
    const src = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const dst = [
      '{"id": "abc", "name": "Merry Jane"}',
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
    ];
    const patch = line.diffLines(src, dst);
    expect(patch).toEqual([
      [ [ 1, '{"id": "abc", "name": "Merry Jane"}' ] ],
      [ [ 0, '{"id": "xxx-xxxxxxx", "name": "Hello, world"}' ] ],
      [ [ 0, '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}' ] ],
      [ [ 0, '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}' ] ],
      [ [ -1, '{"id": "abc", "name": "Merry Jane"}' ] ],
    ]);
  });

  test('move second to last line to the beginning', () => {
    const src = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const dst = [
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const patch = line.diffLines(src, dst);
    expect(patch).toEqual([
      [ [ 1, '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}' ] ],
      [ [ 0, '{"id": "xxx-xxxxxxx", "name": "Hello, world"}' ] ],
      [ [ 0, '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}' ] ],
      [ [ -1, '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}' ] ],
      [ [ 0, '{"id": "abc", "name": "Merry Jane"}' ] ],
    ]);
  });

  test('swap first and second lines', () => {
    const src = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world!!!!!!!!!!!!!!!!!!!!!!!!!"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const dst = [
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "xxx-xxxxxxx", "name": "Hello, world!!!!!!!!!!!!!!!!!!!!!!!!!"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const patch = line.diffLines(src, dst);
    expect(patch).toEqual([
      [ [ 1, '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}' ] ],
      [ [ 0, '{"id": "xxx-xxxxxxx", "name": "Hello, world!!!!!!!!!!!!!!!!!!!!!!!!!"}' ] ],
      [ [ -1, '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}' ] ],
      [ [ 0, '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}' ] ],
      [ [ 0, '{"id": "abc", "name": "Merry Jane"}' ] ],
    ]);
  });
});
