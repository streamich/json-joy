import type {RoutesBase, TypeRouter} from '../../../../json-type/system/TypeRouter';
import type {RouteDeps} from '../../types';
import type {BlockId} from '../schema';

export const remove =
  ({services}: RouteDeps) =>
  <R extends RoutesBase>(router: TypeRouter<R>) => {
    const t = router.t;

    const Request = t.Object(
      t.prop('id', t.Ref<typeof BlockId>('BlockId')).options({
        title: 'Block ID',
        description: 'The ID of the block to delete.',
      }),
    );

    const Response = t.obj;

    const Func = t
      .Function(Request, Response)
      .options({
        title: 'Read Block',
        intro: 'Retrieves a block by ID.',
        description: 'Fetches a block by ID.',
      })
      .implement(async ({id}) => {
        await services.blocks.remove(id);
        return {};
      });

    return router.fn('blocks.remove', Func);
  };
