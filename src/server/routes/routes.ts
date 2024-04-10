import {util} from './util';
import {pubsub} from './pubsub';
import {presence} from './presence';
import {blocks} from './blocks';
import type {RouteDeps} from './types';
import type {ObjectValue} from '../../json-type-value/ObjectValue';
import type {ObjectType} from '../../json-type';

// prettier-ignore
export const routes = (d: RouteDeps) => <R extends ObjectType<any>>(r: ObjectValue<R>) =>
  ( util(d)
  ( pubsub(d)
  ( presence(d)
  // TODO: rename "blocks" to "block", in all methods.
  ( blocks(d)
  ( r )))));
