import {t} from '../../json-type';
import type {CustomValidator} from '../../json-type-validator';

export const customValidators: CustomValidator[] = [
  {
    name: 'globalId',
    types: ['string'],
    fn: (id: string) => {
      if (typeof id !== 'string') throw new Error('id must be string');
      if (id.length > 10) throw new Error('id too long');
    },
  },
];

export const types = {
  ID: t.String({
    title: 'Global resource ID',
    description: 'Unique identifier for any resource in the system regardless of its type.',
    validator: 'globalId',
  }),

  User: t.Object(
    [
      t.Field('gid', t.Ref('ID')),
      t.Field('id', t.num, {
        title: 'User ID',
        description: 'Unique identifier for a user in the user table.',
      }),
      t.Field('name', t.str, {
        isOptional: true,
        title: 'User name',
        description: 'Name of the user as entered during registration.',
      }),
      t.Field('email', t.str),
      t.Field('timeCreated', t.Number({format: 'u'})),
      t.Field('timeUpdated', t.Number({format: 'u'})),
    ],
    {
      title: 'A user object',
      description: 'Users are entities in the system that represent a human.',
    },
  ),

  CrateUserRequest: t.Object([
    t.Field(
      'user',
      t.Object([
        t.Field('id', t.num, {isOptional: true}),
        t.Field('name', t.str, {isOptional: true}),
        t.Field('email', t.str),
      ]),
    ),
  ]),

  CreateUserResponse: t.Object([t.Field('user', t.Ref('User'))], {
    title: 'A response to a create user request',
    description: 'The response to a create user request.',
  }),

  UpdateUserResponse: t.Object(
    [
      t.Field('user', t.Ref('User')),
      t.Field('changes', t.Number({format: 'u'}), {
        title: 'The number of fields that were changed',
        description: 'The number of fields that were changed during the update user call.',
      }),
    ],
    {
      title: 'A response to a create user request',
      description: 'The response to a create user request.',
    },
  ),

  'pubsub.channel.Channel': t.Object([
    t.Field('id', t.str),
    t.Field('payload', t.Enum(['json', 'text', 'blob'])),
  ]),
};
