import {t} from '..';

describe('string', () => {
  test('can create a string type', () => {
    expect(t.String()).toEqual({__t: 'str'});
  });

  test('can create a named a string type', () => {
    expect(t.String('UserName')).toEqual({
      __t: 'str',
      id: 'UserName',
    });
  });
});

describe('object', () => {
  test('can create an empty object using shorthand', () => {
    expect(t.obj).toEqual({__t: 'obj', fields: []});
  });

  test('can create an empty object using default syntax', () => {
    expect(t.Object({fields: []})).toEqual({__t: 'obj', fields: []});
  });

  test('can create an empty object using fields-first syntax', () => {
    expect(t.Object([])).toEqual({__t: 'obj', fields: []});
  });

  test('can create a named empty object using fields-first syntax', () => {
    expect(t.Object('Test', [])).toEqual({__t: 'obj', id: 'Test', fields: []});
  });

  test('can create a named empty object using default syntax', () => {
    expect(t.Object('Test', {fields: []})).toEqual({__t: 'obj', id: 'Test', fields: []});
  });

  test('can specify types', () => {
    const type = t.Object('User', [t.Field('id', t.String('UserId')), t.Field('name', t.str)]);
    expect(type).toEqual({
      __t: 'obj',
      id: 'User',
      fields: [
        {
          key: 'id',
          type: {
            __t: 'str',
            id: 'UserId',
          },
        },
        {
          key: 'name',
          type: {
            __t: 'str',
          },
        },
      ],
    });
  });
});

describe('or', () => {
  test('can create an "or" type', () => {
    const type = t.Or([t.str, t.num]);
    expect(type).toEqual({
      __t: 'or',
      types: [{__t: 'str'}, {__t: 'num'}],
    });
  });
});
