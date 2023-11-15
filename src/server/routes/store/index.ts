import {apply} from './methods/apply';
import {StoreBlock, StorePatch} from './schema';
import type {RoutesBase, TypeRouter} from '../../../json-type/system/TypeRouter';
import type {RouteDeps} from '../types';

export const store = (d: RouteDeps) => <R extends RoutesBase>(r: TypeRouter<R>) => {
  r.system.alias('StoreBlock', StoreBlock);
  r.system.alias('StorePatch', StorePatch);

  // prettier-ignore
  return (
    apply(d)
    ( r ));
};
