import {ObjectSchema, s} from '..';

test('can generate a type', () => {
  const address: ObjectSchema = {
    __t: 'obj',
    title: 'User address',
    description: 'Various address fields for user',
    fields: [...s.Object(s.prop('street', s.String()), s.prop('zip', s.String())).fields],
  };
  const userType = s.Object(
    s.prop('id', s.Number({format: 'i'})),
    s.prop('alwaysOne', s.Const<1>(1)),
    s.prop('name', s.String()),
    s.prop('address', address),
    s.prop('timeCreated', s.Number()),
    s.prop('tags', s.Array(s.Or(s.Number(), s.String()))),
  );

  expect(userType).toMatchObject({
    __t: 'obj',
    fields: [
      {
        key: 'id',
        type: {
          __t: 'num',
          format: 'i',
        },
      },
      {
        key: 'alwaysOne',
        type: {
          __t: 'const',
          value: 1,
        },
      },
      {
        key: 'name',
        type: {
          __t: 'str',
        },
      },
      {
        key: 'address',
        type: {
          __t: 'obj',
          title: 'User address',
          description: 'Various address fields for user',
          fields: [
            {
              key: 'street',
              type: {
                __t: 'str',
              },
            },
            {
              key: 'zip',
              type: {
                __t: 'str',
              },
            },
          ],
        },
      },
      {
        key: 'timeCreated',
        type: {
          __t: 'num',
        },
      },
      {
        key: 'tags',
        type: {
          __t: 'arr',
          type: {
            __t: 'or',
            types: [
              {
                __t: 'num',
              },
              {
                __t: 'str',
              },
            ],
          },
        },
      },
    ],
  });
});
