import type {ResolveType} from '../../../../json-type';
import type {PresenceEntry} from '../schema';
import type {RoutesBase, TypeRouter} from '../../../../json-type/system/TypeRouter';
import type {RouteDeps} from '../../types';

/** Entry TLL in seconds. */
const ttl = 30;

export const update =
  ({services}: RouteDeps) =>
  <R extends RoutesBase>(router: TypeRouter<R>) => {
    const t = router.t;

    const Request = t.Object(
      t.prop('room', t.str).options({
        title: 'Room ID',
        description: 'The ID of the room to update.'
      }),
      t.prop('id', t.str).options({
        title: 'ID of the entry',
        description: 'The ID of the entry to update.'
      }),
      t.prop('data', t.obj).options({
        title: 'Entry data',
        description: 'A map of key-value pairs to update. The object is merged with the existing entry data, if any.'
      })
    ).options({
      examples: [
        {
          title: 'Update user entry',
          description: 'The data section of the entry is merged with the existing data. ' +
            'It can contain any key-value pairs. For example, the `cursor` property is used to store the ' +
            'current cursor position of the user in the room.',
          value: {
            room: 'my-room',
            id: 'user-1',
            data: {
              name: 'John Doe',
              cursor: [123, 456],
            },
          },
        },
      ],
    });

    const Response = t.Object(
      t.prop('entry', t.Ref<typeof PresenceEntry>('PresenceEntry')),
      t.prop('time', t.num).options({
        title: 'Current time',
        description: 'The current server time in milliseconds since the UNIX epoch.',
      }),
    ).options({
      title: 'Presence update response',
    });

    const Func = t.Function(Request, Response)
      .options({
        title: 'Update presence entry',
        intro: 'Update a presence entry in a room.',
        description: 'This method updates a presence entry in a room. ' +
          `The entry is automatically removed after ${ttl} seconds. ` +
          `Every time the entry is updated, the TTL is reset to ${ttl} seconds.`,
      })
      .implement(async ({room, id, data}) => {
        const entry = await services.presence.update(room, id, ttl * 1000, data) as ResolveType<typeof PresenceEntry>;
        return {
          entry,
          time: Date.now(),
        };
      });

    return router.fn('presence.update', Func);
  };
