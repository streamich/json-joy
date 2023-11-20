import type {RoutesBase, TypeRouter} from '../../../../json-type/system/TypeRouter';
import type {RouteDeps} from '../../types';
import type {Block, BlockId, BlockPatch} from '../schema';

export const get =
  ({services}: RouteDeps) =>
  <R extends RoutesBase>(router: TypeRouter<R>) => {
    const t = router.t;

    const Request = t.Object(
      t.prop('id', t.Ref<typeof BlockId>('BlockId')).options({
        title: 'Block ID',
        description: 'The ID of the block to retrieve.',
      }),
    );

    const Response = t.Object(
      t.prop('block', t.Ref<typeof Block>('Block').options({})),
      t.prop('patches', t.Array(t.Ref<typeof BlockPatch>('BlockPatch'))).options({
        title: 'Patches',
        description: 'The list of all patches.',
      }),
    );

    const Func = t
      .Function(Request, Response)
      .options({
        title: 'Read Block',
        intro: 'Retrieves a block by ID.',
        description: 'Fetches a block by ID.',
      })
      .implement(async ({id}) => {
        const {block, patches} = await services.blocks.get(id);
        return {
          block,
          patches,
        };
      });

    return router.fn('blocks.get', Func);
  };
