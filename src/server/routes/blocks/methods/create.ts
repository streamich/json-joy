import type {RouteDeps, Router, RouterBase} from '../../types';
import type {BlockId, BlockPatch} from '../schema';

export const create = ({t, services}: RouteDeps) => <R extends RouterBase>(r: Router<R>) => {
  const Request = t.Object(
    t.prop('id', t.Ref<typeof BlockId>('BlockId')).options({
      title: 'New block ID',
      description: 'The ID of the new block.',
    }),
    t.prop('patches', t.Array(t.Ref<typeof BlockPatch>('BlockPatch'))).options({
      title: 'Patches',
      description: 'The patches to apply to the document.',
    }),
  );

  const Response = t.obj;

  const Func = t
    .Function(Request, Response)
    .options({
      title: 'Create Block',
      intro: 'Creates a new block or applies patches to it.',
      description: 'Creates a new block or applies patches to it.',
    });

  return r.prop('blocks.create', Func, async ({id, patches}) => {
    const {block} = await services.blocks.create(id, patches);
    return {};
  });
};
