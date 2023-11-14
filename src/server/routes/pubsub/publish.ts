import type {RoutesBase, TypeRouter} from '../../../json-type/system/TypeRouter';
import type {MyCtx} from '../../services/types';
import type {RouteDeps} from '../types';

export const publish =
  ({services}: RouteDeps) =>
  <R extends RoutesBase>(router: TypeRouter<R>) => {
    const t = router.t;

    const req = t.Object(
      t.prop('channel', t.str).options({
        title: 'Channel name',
        description: 'The name of the channel to publish to.',
      }),
      t.prop('message', t.any).options({
        title: 'Message',
        description: 'The message to publish to the channel. Can be any JSON/CBOR value.',
      }),
    );

    const res = t.obj.options({
      title: 'Publish response',
      description: 'An empty object.',
    });

    const func = t
      .Function(req, res)
      .options({
        title: 'Publish to channel',
        intro: 'Publish a message to a channel.',
        description:
          'This method publishes a message to a global channel with the given `channel` name. ' +
          'All subscribers to the channel will receive the message. The `message` can be any value. ' +
          'The most efficient way to publish a message is to send a primitive or a `Uint8Array` buffer.',
      })
      .implement<MyCtx>(async ({channel, message}) => {
        services.pubsub.publish(channel, message);
        return {};
      });

    return router.fn('pubsub.publish', func);
  };
