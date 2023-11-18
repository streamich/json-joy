import {create} from './methods/create';
import {get} from './methods/get';
import {remove} from './methods/remove';
import {edit} from './methods/edit';
import {listen} from './methods/listen';
import {Block, BlockId, BlockPatch, BlockSeq} from './schema';
import {history} from './methods/history';
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
      ( remove(d)
      ( edit(d)
      ( listen(d)
      ( history(d)
      ( r ))))))));
  };
