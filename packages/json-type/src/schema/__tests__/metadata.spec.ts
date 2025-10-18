import {s} from '..';

describe('metadata', () => {
  test('can add custom metadata', () => {
    expect(s.String({meta: {regex: true}})).toEqual({
      kind: 'str',
      meta: {regex: true},
    });
  });
});

describe('deprecations', () => {
  test('can deprecate a type', () => {
    const schema = s.String({
      deprecated: {},
    });
    expect(schema).toEqual({
      kind: 'str',
      deprecated: {},
    });
  });

  test('can deprecate a type with a message', () => {
    const schema = s.String({
      deprecated: {
        info: 'Use the new type',
      },
    });
    expect(schema).toEqual({
      kind: 'str',
      deprecated: {
        info: 'Use the new type',
      },
    });
  });
});
