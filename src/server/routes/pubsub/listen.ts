import {map, switchMap} from 'rxjs';
import type {RouteDeps, Router, RouterBase} from '../types';

export const listen =
  ({t, services}: RouteDeps) =>
  <R extends RouterBase>(r: Router<R>) => {
    const Request = t.Object(
      t.prop('channel', t.str).options({
        title: 'Channel name',
        description: 'The name of the channel to subscribe to.',
      }),
    );

    const Response = t.Object(
      t.prop('message', t.any).options({
        title: 'Subscription message',
        description: 'A message received from the channel. Emitted every time a message is published to the channel.',
      }),
    );

    const Func = t.Function$(Request, Response);

    return r.prop('pubsub.listen', Func, (req) => {
      const response = req.pipe(
        switchMap((req) => services.pubsub.listen$(req.channel)),
        map((message: any) => ({message})),
      );
      return response;
    });
  };
