import {CliContext} from '../../json-type-cli/types';
import {RoutesBase, TypeRouter} from '../../json-type/system/TypeRouter';

export const defineUtilRoutes = <Routes extends RoutesBase>(router: TypeRouter<Routes>) => {
  const router2 = router.extend(({t}) => ({
    'util.time': t
      .Function(t.undef, t.num)
      .options({
        title: 'Get time',
        description: 'Returns the current time',
      })
      .implement(async () => Date.now()),
    'util.throw': t
      .Function(t.undef, t.undef)
      .options({
        title: 'Throw an error',
        description: 'This method always throws an error.',
      })
      .implement<CliContext>(async (req, ctx) => {
        throw new Error(`${ctx.run.argv![0]} always throws an error.`);
      }),
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
