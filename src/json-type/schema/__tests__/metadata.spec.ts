import {s} from '..';

describe('metadata', () => {
  test('can add custom metadata', () => {
    expect(s.String('validator', {meta: {regex: true}})).toEqual({
      kind: 'str',
      id: 'validator',
      meta: {regex: true},
    });
  });
});

describe('deprecations', () => {
  test('can deprecate a type', () => {
    const schema = s.String('validator', {
      deprecated: {},
    });
    expect(schema).toEqual({
      kind: 'str',
      id: 'validator',
      deprecated: {},
    });
  });

  test('can deprecate a type with a message', () => {
    const schema = s.String('validator', {
      deprecated: {
        description: 'Use the new type',
      },
    });
    expect(schema).toEqual({
      kind: 'str',
      id: 'validator',
      deprecated: {
        description: 'Use the new type',
      },
    });
  });
});
