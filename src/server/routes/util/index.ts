import type {RouteDeps, Router, RouterBase} from '../types';

export const ping =
  ({t}: RouteDeps) =>
  <R extends RouterBase>(r: Router<R>) => {
    const Request = t.any;
    const Response = t.Const(<const>'pong');
    const Func = t.Function(Request, Response);
    return r.prop('util.ping', Func, async () => {
      return 'pong';
    });
  };

export const echo =
  ({t}: RouteDeps) =>
  <R extends RouterBase>(r: Router<R>) => {
    const Request = t.any;
    const Response = t.any;
    const Func = t.Function(Request, Response);
    return r.prop('util.echo', Func, async (msg) => msg);
  };

export const info =
  ({t, services}: RouteDeps) =>
  <R extends RouterBase>(r: Router<R>) => {
    const Request = t.any;
    const Response = t.Object(
      t.prop('now', t.num),
      t.prop(
        'stats',
        t.Object(
          t.prop('pubsub', t.Object(t.prop('channels', t.num), t.prop('observers', t.num))),
          t.prop('presence', t.Object(t.prop('rooms', t.num), t.prop('entries', t.num), t.prop('observers', t.num))),
          t.prop('blocks', t.Object(t.prop('blocks', t.num), t.prop('patches', t.num))),
        ),
      ),
    );
    const Func = t.Function(Request, Response);
    return r.prop('util.info', Func, async () => {
      return {
        now: Date.now(),
        stats: {
          pubsub: services.pubsub.stats(),
          presence: services.presence.stats(),
          blocks: services.blocks.stats(),
        },
      };
    });
  };

export const schema =
  ({t, router}: RouteDeps) =>
  <R extends RouterBase>(r: Router<R>) => {
    const Request = t.any;
    const Response = t.Object(t.prop('typescript', t.str));
    const Func = t.Function(Request, Response);
    return r.prop('util.schema', Func, async () => {
      return {
        typescript: router.toTypeScript(),
      };
    });
  };

// prettier-ignore
export const util = (d: RouteDeps) => <R extends RouterBase>(r: Router<R>) =>
  ( ping(d)
  ( echo(d)
  ( info(d)
  ( schema(d)
  ( r )))));
