import {switchMap} from 'rxjs';
import type {RoutesBase, TypeRouter} from '../../../../json-type/system/TypeRouter';
import type {RouteDeps} from '../../types';
import type {BlockId, BlockPatch, Block} from '../schema';

export const listen =
  ({services}: RouteDeps) =>
  <R extends RoutesBase>(router: TypeRouter<R>) => {
    const t = router.t;
    const PatchType = t.Ref<typeof BlockPatch>('BlockPatch');

    const Request = t.Object(
      t.prop('id', t.Ref<typeof BlockId>('BlockId')).options({
        title: 'Block ID',
        description: 'The ID of the block to subscribe to.',
      }),
    );

    const Response = t.Object(
      t.propOpt('deleted', t.Boolean()).options({
        title: 'Deleted',
        description: 'Emitted only when the block is deleted.',
      }),
      t.propOpt('block', t.Ref<typeof Block>('Block')).options({
        title: 'Block',
        description: 'The whole block object, emitted only when the block is created.',
      }),
      t.propOpt('patches', t.Array(PatchType)).options({
        title: 'Latest patches',
        description: 'Patches that have been applied to the block.',
      }),
    );

    const Func = t
      .Function$(Request, Response)
      .options({
        title: 'Listen for block changes',
        description: 'Subscribe to a block to receive updates when it changes.',
      })
      .implement((req$) => {
        return req$.pipe(
          switchMap(({id}) => services.pubsub.listen$(`__block:${id}`)),
        ) as any;
      });

    return router.fn$('blocks.listen', Func);
  };
