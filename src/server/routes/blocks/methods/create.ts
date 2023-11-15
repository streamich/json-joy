import type {RoutesBase, TypeRouter} from '../../../../json-type/system/TypeRouter';
import type {RouteDeps} from '../../types';
import type {BlockId, BlockPatch} from '../schema';

export const create =
  ({services}: RouteDeps) =>
  <R extends RoutesBase>(router: TypeRouter<R>) => {
    const t = router.t;

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
      })
      .implement(async ({id, patches}) => {
        const {block} = await services.blocks.create(id, patches);
        return {};
      });

    return router.fn('blocks.create', Func);
  };
