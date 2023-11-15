import {edit} from './methods/edit';
import {create} from './methods/create';
import {get} from './methods/get';
import {Block, BlockId, BlockPatch, BlockSeq} from './schema';
import type {RoutesBase, TypeRouter} from '../../../json-type/system/TypeRouter';
import type {RouteDeps} from '../types';

export const blocks =
  (d: RouteDeps) =>
  <R extends RoutesBase>(r: TypeRouter<R>) => {
    r.system.alias('BlockId', BlockId);
    r.system.alias('BlockSeq', BlockSeq);
    r.system.alias('Block', Block);
    r.system.alias('BlockPatch', BlockPatch);

    // prettier-ignore
    return (
      ( create(d)
      ( get(d)
      ( edit(d)
      ( r )))));
  };
