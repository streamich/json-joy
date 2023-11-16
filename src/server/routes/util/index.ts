import type {RoutesBase, TypeRouter} from '../../../json-type/system/TypeRouter';
import type {MyCtx} from '../../services/types';
import type {RouteDeps} from '../types';

export const ping =
  (deps: RouteDeps) =>
  <R extends RoutesBase>(router: TypeRouter<R>) => {
    const t = router.t;
    const req = t.any;
    const res = t.Const(<const>'pong');
    const func = t.Function(req, res).implement<MyCtx>(async () => {
      return 'pong';
    });
    return router.fn('util.ping', func);
  };

export const echo =
  (deps: RouteDeps) =>
  <R extends RoutesBase>(router: TypeRouter<R>) => {
    const t = router.t;
    const req = t.any;
    const res = t.any;
    const func = t.Function(req, res).implement<MyCtx>(async (msg) => msg);
    return router.fn('util.echo', func);
  };

export const info =
  ({services}: RouteDeps) =>
  <R extends RoutesBase>(router: TypeRouter<R>) => {
    const t = router.t;
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
    const Func = t.Function(Request, Response).implement<MyCtx>(async () => {
      return {
        now: Date.now(),
        stats: {
          pubsub: services.pubsub.stats(),
          presence: services.presence.stats(),
          blocks: services.blocks.stats(),
        },
      };
    });
    return router.fn('util.info', Func);
  };

export const schema =
  (deps: RouteDeps) =>
  <R extends RoutesBase>(router: TypeRouter<R>) => {
    const t = router.t;
    const Request = t.any;
    const Response = t.Object(
      t.prop('typescript', t.str),
    );
    const Func = t.Function(Request, Response).implement<MyCtx>(async () => {
      return {
        typescript: deps.router.toString(),
      };
    });
    return router.fn('util.schema', Func);
  };

// prettier-ignore
export const util = (deps: RouteDeps) => <R extends RoutesBase>(r: TypeRouter<R>) =>
  ( ping(deps)
  ( echo(deps)
  ( info(deps)
  ( schema(deps)
  ( r )))));
