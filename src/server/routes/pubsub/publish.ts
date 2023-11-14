import type {RoutesBase, TypeRouter} from '../../../json-type/system/TypeRouter';
import type {MyCtx} from '../../services/types';
import type {RouteDeps} from '../types';

export const publish =
  ({services}: RouteDeps) =>
  <R extends RoutesBase>(router: TypeRouter<R>) => {
    const t = router.t;

    const req = t.Object(t.prop('channel', t.str), t.prop('message', t.any));

    const res = t.obj;

    const func = t.Function(req, res).implement<MyCtx>(async ({channel, message}) => {
      services.pubsub.publish(channel, message);
      return {};
    });

    return router.fn('pubsub.publish', func);
  };
