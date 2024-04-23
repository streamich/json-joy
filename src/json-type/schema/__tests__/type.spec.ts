import {ObjectSchema, s} from '..';

test('can generate any type', () => {
  const address: ObjectSchema = {
    kind: 'obj',
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
    s.prop('elements', s.Map(s.str)),
  );

  expect(userType).toMatchObject({
    kind: 'obj',
    fields: [
      {
        key: 'id',
        type: {
          kind: 'num',
          format: 'i',
        },
      },
      {
        key: 'alwaysOne',
        type: {
          kind: 'const',
          value: 1,
        },
      },
      {
        key: 'name',
        type: {
          kind: 'str',
        },
      },
      {
        key: 'address',
        type: {
          kind: 'obj',
          title: 'User address',
          description: 'Various address fields for user',
          fields: [
            {
              key: 'street',
              type: {
                kind: 'str',
              },
            },
            {
              key: 'zip',
              type: {
                kind: 'str',
              },
            },
          ],
        },
      },
      {
        key: 'timeCreated',
        type: {
          kind: 'num',
        },
      },
      {
        key: 'tags',
        type: {
          kind: 'arr',
          type: {
            kind: 'or',
            types: [
              {
                kind: 'num',
              },
              {
                kind: 'str',
              },
            ],
          },
        },
      },
      {
        key: 'elements',
        type: {
          kind: 'map',
          type: {
            kind: 'str',
          },
        },
      },
    ],
  });
});
