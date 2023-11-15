import type {RoutesBase, TypeRouter} from '../../../../json-type/system/TypeRouter';
import type {RouteDeps} from '../../types';
import type {StoreBlock, StorePatch} from '../schema';

export const apply =
  ({services}: RouteDeps) =>
  <R extends RoutesBase>(router: TypeRouter<R>) => {
    const t = router.t;

    const Request = t.Object(
      t.prop('id', t.str).options({
        title: 'Document ID',
        description: 'The ID of the document to apply the patch to.',
      }),
      t.prop('patches', t.Array(t.Ref<typeof StorePatch>('StorePatch'))).options({
        title: 'Patches',
        description: 'The patches to apply to the document.',
      }),
    );

    const Response = t.Object(t.prop('block', t.Ref<typeof StoreBlock>('StoreBlock')));

    const Func = t
      .Function(Request, Response)
      .options({
        title: 'Apply Patches',
        intro: 'Applies patches to an existing document or creates a new document if it does not exist.',
        description: 'Applies patches to an existing document or creates a new document if it does not exist.',
      })
      .implement(async ({id, patches}) => {
        const {block} = await services.store.apply(id, patches);
        return {block};
      });

    return router.fn('store.apply', Func);
  };
