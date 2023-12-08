import {publish} from './publish';
import {listen} from './listen';
import type {RouteDeps, Router, RouterBase} from '../types';

// prettier-ignore
export const pubsub = (d: RouteDeps) => <R extends RouterBase>(r: Router<R>) =>
  ( publish(d)
  ( listen(d)
  ( r )));
