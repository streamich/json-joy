import {create} from './methods/create';
import {get} from './methods/get';
import {remove} from './methods/remove';
import {edit} from './methods/edit';
import {listen} from './methods/listen';
import {Block, BlockId, BlockPatch, BlockSeq} from './schema';
import {history} from './methods/history';
import type {RouteDeps, Router, RouterBase} from '../types';

export const blocks = (d: RouteDeps) => <R extends RouterBase>(r: Router<R>) => {
  const {system} = d;

  system.alias('BlockId', BlockId);
  system.alias('BlockSeq', BlockSeq);
  system.alias('Block', Block);
  system.alias('BlockPatch', BlockPatch);

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
