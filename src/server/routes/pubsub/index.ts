import {publish} from './publish';
import {listen} from './listen';
import type {RoutesBase, TypeRouter} from '../../../json-type/system/TypeRouter';
import type {RouteDeps} from '../types';

// prettier-ignore
export const pubsub = (d: RouteDeps) => <R extends RoutesBase>(r: TypeRouter<R>) =>
  ( publish(d)
  ( listen(d)
  ( r )));
