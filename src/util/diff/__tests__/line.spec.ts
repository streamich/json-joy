import {diff} from '../line';

describe('diff', () => {
  test('normalize line beginnings', () => {
    const src = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ].join('\n');
    const dst = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ].join('\n');
    const patch = diff(src, dst);
    expect(patch).toEqual([
      [ [ 0, '{"id": "xxx-xxxxxxx", "name": "Hello, world"}\n' ] ],
      [ [ -1, '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}\n' ] ],
      [ [ -1, '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}\n' ] ],
      [ [ 0, '{"id": "abc", "name": "Merry Jane"}' ] ]
    ]);
  });

  test('normalize line endings', () => {
    const src = [
      '{"id": "xxx-xxxxxxx", "name": "hello world!"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ].join('\n');
    const dst = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "abc", "name": "Merry Jane!"}',
    ].join('\n');
    const patch = diff(src, dst);
    expect(patch).toEqual([
      [
        [ 0, '{"id": "xxx-xxxxxxx", "name": "' ],
        [ -1, 'h' ],
        [ 1, 'H' ],
        [ 0, 'ello' ],
        [ 1, ',' ],
        [ 0, ' world' ],
        [ -1, '!' ],
        [ 0, '"}\n' ]
      ],
      [ [ -1, '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}\n' ] ],
      [ [ -1, '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}\n' ] ],
      [
        [ 0, '{"id": "abc", "name": "Merry Jane' ],
        [ 1, '!' ],
        [ 0, '"}' ]
      ]
    ]);
  });
});
