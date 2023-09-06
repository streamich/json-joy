import {TypeRouter} from "../../json-type/system/TypeRouter";

export const defineUtilRoutes = (router: TypeRouter<any>) => {
  const router2 = router.extend(({t}) => ({
    'util.echo': t.Function(t.any, t.any).implement(async (req) => {
      return req;
    }),
    'util.time': t.Function(t.undef, t.num).implement(async () => Date.now()),
  }));

  return router2;
};
