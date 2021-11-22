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
