import {s} from '..';

describe('string', () => {
  test('can create a string type', () => {
    expect(s.String()).toEqual({__t: 'str'});
  });

  test('can create a named a string type', () => {
    expect(s.String('UserName')).toEqual({
      __t: 'str',
      id: 'UserName',
    });
  });
});

describe('object', () => {
  test('can create an empty object using shorthand', () => {
    expect(s.obj).toEqual({__t: 'obj', fields: []});
  });

  test('can create an empty object using default syntax', () => {
    expect(s.Object()).toEqual({__t: 'obj', fields: []});
  });

  test('can create an empty object using fields-first syntax', () => {
    expect(s.Object()).toEqual({__t: 'obj', fields: []});
  });

  test('can create a named empty object using fields-first syntax', () => {
    expect(s.Object([])).toEqual({__t: 'obj', fields: []});
  });

  test('can create a named empty object using default syntax', () => {
    expect(s.Object({fields: []})).toEqual({__t: 'obj', fields: []});
  });

  test('can specify types', () => {
    const type = s.Object([s.prop('id', s.String('UserId')), s.prop('name', s.str)]);
    expect(type).toEqual({
      __t: 'obj',
      fields: [
        {
          __t: 'field',
          key: 'id',
          type: {
            __t: 'str',
            id: 'UserId',
          },
        },
        {
          __t: 'field',
          key: 'name',
          type: {
            __t: 'str',
          },
        },
      ],
    });
  });
});

describe('map', () => {
  test('can create an simple object using shorthand', () => {
    expect(s.map).toEqual({__t: 'map', type: {__t: 'any'}});
  });

  test('can define a map', () => {
    expect(s.Map(s.Boolean())).toEqual({__t: 'map', type: {__t: 'bool'}});
  });
});

describe('or', () => {
  test('can create an "or" type', () => {
    const type = s.Or(s.str, s.num);
    expect(type).toEqual({
      __t: 'or',
      types: [{__t: 'str'}, {__t: 'num'}],
      discriminator: ['num', -1],
    });
  });
});
