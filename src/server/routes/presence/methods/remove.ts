import type {RoutesBase, TypeRouter} from '../../../../json-type/system/TypeRouter';
import type {RouteDeps} from '../../types';

export const remove =
  ({services}: RouteDeps) =>
  <R extends RoutesBase>(router: TypeRouter<R>) => {
    const t = router.t;

    const Request = t.Object(
      t.prop('room', t.str).options({
        title: 'Room ID',
        description: 'The ID of the room from which to remove the entry.',
      }),
      t.prop('id', t.str).options({
        title: 'ID of the entry',
        description: 'The ID of the entry to remove.',
      }),
    );

    const Response = t.obj;

    const Func = t
      .Function(Request, Response)
      .options({
        title: 'Remove a presence entry.',
        intro: 'Removes a presence entry from a room and notifies all listeners.',
        description:
          'This method removes a presence entry from a room and notifies all listeners. '
      })
      .implement(async ({room, id}) => {
        await services.presence.remove(room, id);
        return {};
      });

    return router.fn('presence.remove', Func);
  };
