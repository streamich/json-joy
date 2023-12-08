import {Value as V} from '../../../json-type-value/Value';
import type {Type} from '../../../json-type';

/**
 * @deprecated Use `Value` directly.
 */
export class RpcValue<V = unknown> extends V<any> {
  constructor(public data: V, public type: Type | undefined) {
    super(type, data);
  }
}
