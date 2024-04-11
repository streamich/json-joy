import type {BlockPatch, BlockId} from '../schema';
import type {RouteDeps, Router, RouterBase} from '../../types';

export const scan =
  ({t, services}: RouteDeps) =>
  <R extends RouterBase>(r: Router<R>) => {
    const Request = t.Object(
      t.prop('id', t.Ref<typeof BlockId>('BlockId')).options({
        title: 'Block ID',
        description: 'The ID of the block.',
      }),
      t.prop('seq', t.num.options({format: 'u32'})).options({
        title: 'Starting Sequence Number',
        description: 'The sequence number to start from. Defaults to the latest sequence number.',
      }),
      t.prop('len', t.num.options({format: 'u32'})).options({
        title: 'Number of Patches',
        description: 'The minimum number of patches to return. Defaults to 10. ' +
        'When positive, returns the patches ahead of the starting sequence number. ' +
        'When negative, returns the patches behind the starting sequence number.',
      }),
      t.prop('model', t.bool)
        .options({
          title: 'With Model',
          description: 'Whether to include the model in the response. ' +
            'Defaults to `false`, when `len` is positive; and, defaults to `true`, when `len` is negative.',
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

    return r.prop('block.scan', Func, async ({id, seq, len, model}) => {
      // const {patches} = await services.blocks.history(id, min, max);
      // return {patches};
      throw new Error('Not implemented');
    });
  };
