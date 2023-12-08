import type {BlockPatch, BlockId} from '../schema';
import type {RouteDeps, Router, RouterBase} from '../../types';

export const history =
  ({t, services}: RouteDeps) =>
  <R extends RouterBase>(r: Router<R>) => {
    const Request = t.Object(
      t.prop('id', t.Ref<typeof BlockId>('BlockId')).options({
        title: 'Block ID',
        description: 'The ID of the block.',
      }),
      t.prop('max', t.num.options({format: 'u32'})).options({
        title: 'Max',
        description: 'The maximum sequence number to return.',
      }),
      t.prop('min', t.num.options({format: 'u32'})).options({
        title: 'Min',
        description: 'The minimum sequence number to return.',
      }),
    );

    const Response = t.Object(
      t.prop('patches', t.Array(t.Ref<typeof BlockPatch>('BlockPatch'))).options({
        title: 'Patches',
        description: 'The list of patches.',
      }),
    );

    const Func = t.Function(Request, Response).options({
      title: 'Block History',
      intro: 'Fetch block history.',
      description: 'Returns a list of specified change patches for a block.',
    });

    return r.prop('blocks.history', Func, async ({id, min, max}) => {
      const {patches} = await services.blocks.history(id, min, max);
      return {patches};
    });
  };
