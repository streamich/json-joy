import {map, switchMap} from 'rxjs';
import type {RoutesBase, TypeRouter} from '../../../json-type/system/TypeRouter';
import type {RouteDeps} from '../types';

export const listen =
  ({services}: RouteDeps) =>
  <R extends RoutesBase>(router: TypeRouter<R>) => {
    const t = router.t;

    const req = t.Object(
      t.prop('channel', t.str).options({
        title: 'Channel name',
        description: 'The name of the channel to subscribe to.'
      }),
    );

    const res = t.Object(
      t.prop('message', t.any).options({
        title: 'Subscription message',
        description: 'A message received from the channel. Emitted every time a message is published to the channel.'
      }),
    );

    const func = t.Function$(req, res).implement((req) => {
      const response = req.pipe(
        switchMap((req) => services.pubsub.listen$(req.channel)),
        map((message: any) => ({message})),
      );
      return response;
    });

    return router.fn$('pubsub.listen', func);
  };
