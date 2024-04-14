import {switchMap, tap} from 'rxjs';
import type {RouteDeps, Router, RouterBase} from '../../types';
import type {BlockId, BlockPatch, Block} from '../schema';

export const listen =
  ({t, services}: RouteDeps) =>
  <R extends RouterBase>(r: Router<R>) => {
    const PatchType = t.Ref<typeof BlockPatch>('BlockPatch');

    const Request = t.Object(
      t.prop('id', t.Ref<typeof BlockId>('BlockId')).options({
        title: 'Block ID',
        description: 'The ID of the block to subscribe to.',
      }),
    );

    // TODO: Use TLV encoding.
    const Response = t.Object(
      t.propOpt('deleted', t.Boolean()).options({
        title: 'Deleted',
        description: 'Emitted only when the block is deleted.',
      }),
      t.propOpt('model', t.Ref<typeof Block>('Block')).options({
        title: 'Block',
        description: 'The whole block object, emitted only when the block is created.',
      }),
      t.propOpt('patches', t.Array(t.Ref<typeof BlockPatch>('BlockPatch'))).options({
        title: 'Latest Patches',
        description: 'Patches that have been applied to the block.',
      }),
    );

    const Func = t.Function$(Request, Response).options({
      title: 'Listen for block changes',
      description: 'Subscribe to a block to receive updates when it changes.',
    });

    return r.prop('block.listen', Func, (req$) => {
      return req$.pipe(switchMap(({id}) => services.pubsub.listen$(`__block:${id}`))) as any;
    });
  };
