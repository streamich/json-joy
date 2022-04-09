import {NodeApi} from './NodeApi';
import {ValueType} from '../../types/lww-value/ValueType';

export class ValueApi extends NodeApi<ValueType, unknown> {
  public set(value: unknown): this {
    const {api, node} = this;
    api.builder.setVal(node.id, value);
    return this;
  }
}
