import {publish} from './publish';
import {subscribe} from './subscribe';
import type {RoutesBase, TypeRouter} from '../../../json-type/system/TypeRouter';
import type {RouteDeps} from '../types';

// prettier-ignore
export const pubsub = (d: RouteDeps) => <R extends RoutesBase>(r: TypeRouter<R>) =>
  ( publish(d)
  ( subscribe(d)
  ( r )));
