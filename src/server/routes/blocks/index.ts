import {edit} from './methods/edit';
import {Block, BlockPatch} from './schema';
import type {RoutesBase, TypeRouter} from '../../../json-type/system/TypeRouter';
import type {RouteDeps} from '../types';

export const blocks =
  (d: RouteDeps) =>
  <R extends RoutesBase>(r: TypeRouter<R>) => {
    r.system.alias('StoreBlock', Block);
    r.system.alias('StorePatch', BlockPatch);

    // prettier-ignore
    return (
    edit(d)
    ( r ));
  };
