import type {ObjectType, TypeSystem} from '../../json-type';
import type {ObjectValue} from '../../json-type-value/ObjectValue';
import type {TypeBuilder} from '../../json-type/type/TypeBuilder';
import type {Services} from '../services/Services';

export interface RouteDeps {
  services: Services;
  system: TypeSystem;
  t: TypeBuilder;
  router: ObjectValue<any>;
}

export type RouterBase = ObjectType<any>;
export type Router<R extends RouterBase> = ObjectValue<R>;
