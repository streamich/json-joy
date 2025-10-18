import {type CustomValidator, s} from '../../json-type';

export const customValidators: CustomValidator[] = [
  {
    name: 'globalId',
    fn: (id: string) => {
      if (typeof id !== 'string') throw new Error('id must be string');
      if (id.length > 10) throw new Error('id too long');
    },
  },
];

export const types = {
  ID: s.String({
    title: 'Global resource ID',
    description: 'Unique identifier for any resource in the system regardless of its type.',
    validator: 'globalId',
  }),

  User: s.Object(
    [
      s.propOpt('type', s.Const<'User'>('User')),
      s.propOpt('op', s.Const<-1>(-1)),
      s.prop('gid', s.Ref('ID')),
      s.prop('id', s.num, {
        title: 'User ID',
        description: 'Unique identifier for a user in the user table.',
      }),
      s.propOpt('name', s.str, {
        title: 'User name',
        description: 'Name of the user as entered during registration.',
      }),
      s.prop('email', s.str),
      s.prop('timeCreated', s.Number({format: 'u'})),
      s.prop('timeUpdated', s.Number({format: 'u'})),
      s.prop('scores', s.Array(s.num)),
      s.prop('isActive', s.bool),
      s.prop('null', s.nil),
      s.prop('unknown', s.any),
      s.prop('isUser', s.Const<true>(true)),
      s.prop('isPost', s.Const<false>(false)),
      s.prop('tags', s.Array(s.Or(s.str, s.num))),
      s.prop(
        'meta',
        s.Object([], {
          decodeUnknownKeys: true,
        }),
      ),
    ],
    {
      title: 'A user object',
      description:
        'Users are entities in the system that represent a human. When user is created, automatically a User entity is assigned to that user.',
    },
  ),

  CrateUserRequest: s.Object(
    [s.prop('user', s.Object([s.propOpt('id', s.num), s.propOpt('name', s.str), s.prop('email', s.str)]))],
    {title: 'The create user request'},
  ),

  CreateUserResponse: s.Object([s.prop('user', s.Ref('User'))], {
    title: 'A response to a create user request',
    description: 'The response to a create user request.',
  }),

  UpdateUserResponse: s.Object(
    [
      s.prop('user', s.Ref('User')),
      s.prop('changes', s.Number({format: 'u'}), {
        title: 'The number of fields that were changed',
        description: 'The number of fields that were changed during the update user call.',
      }),
    ],
    {
      title: 'A response to a create user request',
      description: 'The response to a create user request.',
    },
  ),

  'pubsub.channel.Channel': s.Object(
    [
      s.prop('id', s.str, {title: 'ID of the user'}),
      s.prop('payload', s.Ref('pubsub.channel.PayloadType'), {
        description: 'Yup, the payload.',
      }),
      s.prop('meta', s.Object([s.Field('description', s.str)])),
    ],
    {description: 'A channel'},
  ),

  'pubsub.channel.PayloadType': s.String({
    description: 'The type of payload that is sent to the channel.',
  }),

  'pubsub.channel.CreateChannelResponse': s.Object([
    s.prop('channel', s.Ref('pubsub.channel.Channel')),
    s.prop('project', s.Ref('util.Project')),
  ]),

  'util.Project': s.Object([s.prop('id', s.String({})), s.prop('name', s.str)]),
};
