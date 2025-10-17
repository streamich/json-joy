import {apply} from '../apply';

test('succeeds when tests execute successfully', () => {
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

  apply(doc, [
    [
      ['==', ['$', '/foo'], 'bar'],
      ['!=', ['$', '/foo'], 'bar2'],
    ],
    [],
    [],
    [],
    [],
  ]);
});

test('throws when at least one test fails', () => {
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

  expect(() => {
    apply(doc, [
      [
        ['==', ['$', '/foo'], 'bar'],
        ['!=', ['$', '/foo'], 'bar'],
      ],
      [],
      [],
      [],
      [],
    ]);
  }).toThrowError();
});
