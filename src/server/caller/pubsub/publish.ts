import type {RoutesBase, TypeRouter} from "../../../json-type/system/TypeRouter";

export const publish = <R extends RoutesBase>(router: TypeRouter<R>) => {
  const t = router.t;

  const req = t.Object(
    t.prop('channel', t.str),
    t.prop('data', t.any),
  );

  const res = t.obj;

  const func = t.Function(req, res).implement(async ({channel, data}) => {
    return {};
  });

  return router.route('pubsub.publish', func);
};
