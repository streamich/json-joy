import type {RoutesBase, TypeRouter} from "../../json-type/system/TypeRouter";
import {util} from './util';
import {pubsub} from './pubsub';

// prettier-ignore
export const routes = <R extends RoutesBase>(r: TypeRouter<R>) =>
  ( pubsub
  ( util
  ( r )));
