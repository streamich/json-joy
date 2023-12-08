import {ObjectType} from '../../json-type';
import {CliContext} from '../../json-type-cli/types';
import {ObjectValue} from '../../json-type-value/ObjectValue';

export const defineUtilRoutes = <Routes extends ObjectType<any>>(r: ObjectValue<Routes>) =>
  r.extend((t, prop) => [
    prop(
      'util.time',
      t.Function(t.undef, t.num).options({
        title: 'Get time',
        description: 'Returns the current time',
      }),
      async () => 132,
    ),

    prop(
      'util.throw',
      t.Function(t.undef, t.undef).options({
        title: 'Throw an error',
        description: 'This method always throws an error.',
      }),
      async (req, ctx) => {
        throw new Error(`${(ctx as CliContext).cli.argv![0]} always throws an error.`);
      },
    ),

    prop(
      'util.schema',
      t.Function(t.Object(t.prop('alias', t.str)), t.Object(t.prop('schema', t.any))).options({
        title: 'Get schema',
        description: 'Returns the schema definition of a type',
      }),
      async ({alias}, ctx) => {
        const resolved = (ctx as CliContext).cli.types.resolve(alias);
        return {
          schema: resolved.getType().getSchema(),
        };
      },
    ),
  ]);
