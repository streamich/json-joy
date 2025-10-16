import {applyPatch} from '../applyPatch';

describe('Second order predicates', () => {
  test('succeeds when two AND predicates succeed', () => {
    applyPatch(
      {
        foo: 1,
        bar: 2,
      },
      [
        {
          op: 'and',
          path: '',
          apply: [
            {op: 'test', path: '/foo', value: 1},
            {op: 'test', path: '/bar', value: 2},
          ],
        },
      ],
      {mutate: true},
    );
  });

  test('throws when onw of two AND predicates fails', () => {
    expect(() =>
      applyPatch(
        {
          foo: 2,
          bar: 2,
        },
        [
          {
            op: 'and',
            path: '',
            apply: [
              {op: 'test', path: '/foo', value: 1},
              {op: 'test', path: '/bar', value: 2},
            ],
          },
        ],
        {mutate: true},
      ),
    ).toThrow();
  });

  test('succeeds when one of OR operations succeeds', () => {
    applyPatch(
      {
        foo: 2,
        bar: 2,
      },
      [
        {
          op: 'or',
          path: '',
          apply: [
            {op: 'test', path: '/foo', value: 1},
            {op: 'test', path: '/bar', value: 2},
          ],
        },
      ],
      {mutate: true},
    );
  });

  test('throws when one of NOT operations succeeds', () => {
    expect(() =>
      applyPatch(
        {
          foo: 2,
          bar: 2,
        },
        [
          {
            op: 'not',
            path: '',
            apply: [
              {op: 'test', path: '/foo', value: 1},
              {op: 'test', path: '/bar', value: 2},
            ],
          },
        ],
        {mutate: true},
      ),
    ).toThrow();
  });

  test('succeeds when both NOT operations fail', () => {
    applyPatch(
      {
        foo: 2,
        bar: 2,
      },
      [
        {
          op: 'not',
          path: '',
          apply: [
            {op: 'test', path: '/foo', value: 1},
            {op: 'test', path: '/bar', value: 3},
          ],
        },
      ],
      {mutate: true},
    );
  });
});
