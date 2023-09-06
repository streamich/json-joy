import {RoutesBase, TypeRouter} from '../../json-type/system/TypeRouter';

export const defineUtilRoutes = <Routes extends RoutesBase>(router: TypeRouter<Routes>) => {
  const router2 = router.extend(({t}) => ({
    'util.echo': t.Function(t.any, t.any)
      .options({
        title: 'Echo input',
        description: 'Echo the input value back to the caller',
      })
      .implement(async (req) => {
        return req;
      }),
    'util.time': t.Function(t.undef, t.num)
      .options({
        title: 'Get time',
        description: 'Returns the current time',
      })
      .implement(async () => Date.now()),
  }));

  return router2;
};
