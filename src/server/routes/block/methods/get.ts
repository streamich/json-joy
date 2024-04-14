import {ResolveType} from '../../../../json-type';
import type {RouteDeps, Router, RouterBase} from '../../types';
import type {Block, BlockId, BlockPatch} from '../schema';

export const get =
  ({t, services}: RouteDeps) =>
  <R extends RouterBase>(r: Router<R>) => {
    const Request = t.Object(
      t.prop('id', t.Ref<typeof BlockId>('BlockId')).options({
        title: 'Block ID',
        description: 'The ID of the block to retrieve.',
      }),
      t.propOpt('history', t.bool).options({
        title: 'With History',
        description: 'Whether to include the full history of patches in the response. Defaults to `false`.',
      }),
    );

    const Response = t.Object(
      t.prop('model', t.Ref<typeof Block>('Block')),
      t.propOpt('patches', t.Array(t.Ref<typeof BlockPatch>('BlockPatch'))).options({
        title: 'Patches',
        description: 'The list of all patches.',
      }),
    );

    const Func = t.Function(Request, Response).options({
      title: 'Read Block',
      intro: 'Retrieves a block by ID.',
      description: 'Fetches a block by ID.',
    });

    return r.prop('block.get', Func, async ({id, history}) => {
      const {model} = await services.blocks.get(id);
      const response: ResolveType<typeof Response> = {model};
      if (history) {
        const {patches} = await services.blocks.scan(id, 0, model.seq);
        response.patches = patches;
      }
      return response;
    });
  };
