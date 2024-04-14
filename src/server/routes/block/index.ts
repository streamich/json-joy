import {new_} from './methods/new';
import {get} from './methods/get';
import {upd} from './methods/upd';
import {del} from './methods/del';
import {scan} from './methods/scan';
import {listen} from './methods/listen';
import {
  Block,
  BlockPartial,
  BlockPartialReturn,
  BlockId,
  BlockPatch,
  BlockPatchPartial,
  BlockPatchPartialReturn,
  BlockSeq,
} from './schema';
import type {RouteDeps, Router, RouterBase} from '../types';

export const block =
  (d: RouteDeps) =>
  <R extends RouterBase>(r: Router<R>) => {
    const {system} = d;

    system.alias('BlockId', BlockId);
    system.alias('BlockSeq', BlockSeq);
    system.alias('Block', Block);
    system.alias('BlockPartial', BlockPartial);
    system.alias('BlockPartialReturn', BlockPartialReturn);
    system.alias('BlockPatch', BlockPatch);
    system.alias('BlockPatchPartial', BlockPatchPartial);
    system.alias('BlockPatchPartialReturn', BlockPatchPartialReturn);

    // prettier-ignore
    return (
    ( new_(d)
    ( get(d)
    ( upd(d)
    ( del(d)
    ( listen(d)
    ( scan(d)
    ( r ))))))));
  };
