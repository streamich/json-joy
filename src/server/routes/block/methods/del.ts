import type {RouteDeps, Router, RouterBase} from '../../types';
import type {BlockId} from '../schema';

export const del =
  ({t, services}: RouteDeps) =>
  <R extends RouterBase>(r: Router<R>) => {
    const Request = t.Object(
      t.prop('id', t.Ref<typeof BlockId>('BlockId')).options({
        title: 'Block ID',
        description: 'The ID of the block to delete.',
      }),
    );

    const Response = t.obj;

    const Func = t.Function(Request, Response).options({
      title: 'Read Block',
      intro: 'Retrieves a block by ID.',
      description: 'Fetches a block by ID.',
    });

    return r.prop('block.del', Func, async ({id}) => {
      await services.blocks.remove(id);
      return {};
    });
  };
