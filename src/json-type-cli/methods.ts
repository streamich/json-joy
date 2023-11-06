import {CliContext} from './types';
import {RoutesBase, TypeRouter} from '../json-type/system/TypeRouter';

export const defineBuiltinRoutes = <Routes extends RoutesBase>(router: TypeRouter<Routes>) => {
  const router2 = router.extend(({t}) => ({
    '.echo': t
      .Function(t.any, t.any)
      .options({
        title: 'Echo input',
        description: 'Echo the input value back to the caller',
      })
      .implement(async (req) => {
        return req;
      }),
    '.type': t
      .Function(t.undef, t.any)
      .options({
        title: 'Type information',
        description: 'Returns whole type system of this CLI.',
      })
      .implement<CliContext>(async (request, ctx) => {
        return ctx.cli.types.exportTypes();
      }),
  }));

  return router2;
};
