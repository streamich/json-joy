import {map, switchMap} from 'rxjs';
import type {PresenceEntry, TPresenceEntry} from '../schema';
import type {RouteDeps, Router, RouterBase} from '../../types';

export const listen =
  ({t, services}: RouteDeps) =>
  <R extends RouterBase>(r: Router<R>) => {
    const Request = t.Object(
      t.prop('room', t.str).options({
        title: 'Room ID',
        description: 'The ID of the room to subscribe to.',
      }),
    );

    const Response = t.Object(
      t.prop('entries', t.Array(t.Ref<typeof PresenceEntry>('PresenceEntry'))),
      t.prop('time', t.num).options({
        title: 'Current time',
        description: 'The current server time in milliseconds since the UNIX epoch.',
      }),
    );

    const Func = t.Function$(Request, Response).options({
      title: 'Subscribe to a room.',
      intro: 'Subscribes to presence updates in a room.',
      description:
        'This method subscribes to presence updates in a room. ' +
        'It returns an array of all current presence entries in the room, and then emits an update whenever ' +
        'a presence entry is updated or deleted. ',
    });

    return r.prop('presence.listen', Func, (req$) => {
      return req$.pipe(
        switchMap((req) => services.presence.listen$(req.room)),
        map((entries: TPresenceEntry[]) => ({
          entries,
          time: Date.now(),
        })),
      );
    });
  };
