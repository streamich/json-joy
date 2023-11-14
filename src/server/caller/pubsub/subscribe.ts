import type {RoutesBase, TypeRouter} from "../../../json-type/system/TypeRouter";
import type {MyCtx} from "../../context/types";

export const subscribe = <R extends RoutesBase>(router: TypeRouter<R>) => {
  const t = router.t;

  const req = t.Object(
    t.prop('channel', t.str),
  );

  const res = t.Object(
    t.prop('data', t.any),
  );

  const func = t.Function(req, res).implement<MyCtx>(async ({channel}) => {
    return {
      data: {},
    };
  });

  return router.route('pubsub.subscribe', func);
};
