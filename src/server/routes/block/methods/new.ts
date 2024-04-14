import type {RouteDeps, Router, RouterBase} from '../../types';
import type {Block, BlockId, BlockPatchPartial, BlockPatchPartialReturn} from '../schema';

export const new_ =
  ({t, services}: RouteDeps) =>
  <R extends RouterBase>(r: Router<R>) => {
    const Request = t.Object(
      t.prop('id', t.Ref<typeof BlockId>('BlockId')).options({
        title: 'New block ID',
        description: 'The ID of the new block.',
      }),
      t.prop('patches', t.Array(t.Ref<typeof BlockPatchPartial>('BlockPatchPartial'))).options({
        title: 'Patches',
        description: 'The patches to apply to the document.',
      }),
    );

    const Response = t.Object(
      t.prop('model', t.Ref<typeof Block>('Block')),
      t.prop('patches', t.Array(t.Ref<typeof BlockPatchPartialReturn>('BlockPatchPartialReturn'))).options({
        title: 'Patches',
        description: 'The list of all patches.',
      }),
    );

    const Func = t.Function(Request, Response).options({
      title: 'Create Block',
      intro: 'Creates a new block or applies patches to it.',
      description: 'Creates a new block or applies patches to it.',
    });

    return r.prop('block.new', Func, async ({id, patches}) => {
      const res = await services.blocks.create(id, patches);
      return res;
    });
  };
