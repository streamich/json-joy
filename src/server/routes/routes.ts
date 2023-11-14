import {util} from './util';
import {pubsub} from './pubsub';
import type {RoutesBase, TypeRouter} from '../../json-type/system/TypeRouter';
import type {RouteDeps} from './types';

// prettier-ignore
export const routes = (d: RouteDeps) => <R extends RoutesBase>(r: TypeRouter<R>) =>
  ( pubsub(d)
  ( util(d)
  ( r )));
