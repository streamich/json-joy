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
    );

    const Response = t.Object(
      // TODO: Rename this field to `model` or `state`.
      t.prop('block', t.Ref<typeof Block>('Block')),
      t.prop('patches', t.Array(t.Ref<typeof BlockPatch>('BlockPatch'))).options({
        title: 'Patches',
        description: 'The list of all patches.',
      }),
    );

    const Func = t.Function(Request, Response).options({
      title: 'Read Block',
      intro: 'Retrieves a block by ID.',
      description: 'Fetches a block by ID.',
    });

    return r.prop('blocks.get', Func, async ({id}) => {
      const {block, patches} = await services.blocks.get(id);
      return {
        block,
        patches,
      };
    });
  };
