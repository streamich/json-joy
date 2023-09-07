import {CliContext} from '../../json-type-cli/types';
import {RoutesBase, TypeRouter} from '../../json-type/system/TypeRouter';

export const defineUtilRoutes = <Routes extends RoutesBase>(router: TypeRouter<Routes>) => {
  const router2 = router.extend(({t}) => ({
    'util.echo': t
      .Function(t.any, t.any)
      .options({
        title: 'Echo input',
        description: 'Echo the input value back to the caller',
      })
      .implement(async (req) => {
        return req;
      }),
    'util.time': t
      .Function(t.undef, t.num)
      .options({
        title: 'Get time',
        description: 'Returns the current time',
      })
      .implement(async () => Date.now()),
    'util.schema': t
      .Function(t.Object(t.prop('alias', t.str)), t.Object(t.prop('schema', t.any)))
      .options({
        title: 'Get schema',
        description: 'Returns the schema definition of a type',
      })
      .implement<CliContext>(async ({alias}, ctx) => {
        const resolved = ctx.cli.types.resolve(alias);
        return {
          schema: resolved.getType().getSchema(),
        };
      }),
  }));

  return router2;
};
