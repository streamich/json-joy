import type {RouteDeps, Router, RouterBase} from '../types';

export const publish =
  ({t, services}: RouteDeps) =>
  <R extends RouterBase>(r: Router<R>) => {
    const Request = t.Object(
      t.prop('channel', t.str).options({
        title: 'Channel name',
        description: 'The name of the channel to publish to.',
      }),
      t.prop('message', t.any).options({
        title: 'Message',
        description: 'The message to publish to the channel. Can be any JSON/CBOR value.',
      }),
    );

    const Response = t.obj.options({
      title: 'Publish response',
      description: 'An empty object.',
    });

    const Func = t.Function(Request, Response).options({
      title: 'Publish to channel',
      intro: 'Publish a message to a channel.',
      description:
        'This method publishes a message to a global channel with the given `channel` name. ' +
        'All subscribers to the channel will receive the message. The `message` can be any value. ' +
        'The most efficient way to publish a message is to send a primitive or a `Uint8Array` buffer.',
    });

    return r.prop('pubsub.publish', Func, async ({channel, message}) => {
      services.pubsub.publish(channel, message);
      return {};
    });
  };
