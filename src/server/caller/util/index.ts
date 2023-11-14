import type {RoutesBase, TypeRouter} from "../../../json-type/system/TypeRouter";

export const ping = <R extends RoutesBase>(router: TypeRouter<R>) => {
  const t = router.t;
  const req = t.any;
  const res = t.Const(<const>'pong');
  const func = t.Function(req, res).implement(async () => {
    return 'pong';
  });
  return router.route('util.ping', func);
};

export const echo = <R extends RoutesBase>(router: TypeRouter<R>) => {
  const t = router.t;
  const req = t.any;
  const res = t.any;
  const func = t.Function(req, res).implement(async (msg) => msg);
  return router.route('util.echo', func);
};

// prettier-ignore
export const util = <R extends RoutesBase>(r: TypeRouter<R>) =>
  ( ping
  ( echo
  ( r )));
