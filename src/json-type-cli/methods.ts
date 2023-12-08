import type {CliContext} from './types';
import type {ObjectType} from '../json-type/type';
import type {ObjectValue} from '../json-type-value/ObjectValue';

export const defineBuiltinRoutes = <Routes extends ObjectType<any>>(r: ObjectValue<Routes>) => {
  return r.extend((t, r) => [
    r(
      '.echo',
      t.Function(t.any, t.any).options({
        title: 'Echo input',
        description: 'Echo the input value back to the caller',
      }),
      async (req) => req,
    ),

    r(
      '.type',
      t.Function(t.undef, t.any).options({
        title: 'Type information',
        description: 'Returns whole type system of this CLI.',
      }),
      async (request, ctx) => {
        return (ctx as CliContext).cli.types.exportTypes();
      },
    ),
  ]);
};
