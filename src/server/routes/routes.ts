import {util} from './util';
import {pubsub} from './pubsub';
import {presence} from './presence';
import {blocks} from './blocks';
import type {RoutesBase, TypeRouter} from '../../json-type/system/TypeRouter';
import type {RouteDeps} from './types';

// prettier-ignore
export const routes = (d: RouteDeps) => <R extends RoutesBase>(r: TypeRouter<R>) =>
  ( util(d)
  ( pubsub(d)
  ( presence(d)
  ( blocks(d)
  ( r )))));
