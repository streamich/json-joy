import {ArrayType} from '../../types/rga-array/ArrayType';
import {ITimestamp} from '../../../json-crdt-patch/clock';
import {NodeApi} from './NodeApi';

export class ArrayApi extends NodeApi<ArrayType, unknown[]> {
  public ins(index: number, values: unknown[]): this {
    const {api, node} = this;
    const {builder} = api;
    const after = !index ? node.id : node.findId(index - 1);
    const valueIds: ITimestamp[] = [];
    for (let i = 0; i < values.length; i++) valueIds.push(builder.json(values[i]));
    builder.insArr(node.id, after, valueIds);
    return this;
  }

  public del(index: number, length: number): this {
    const {api, node} = this;
    const {builder} = api;
    const spans = node.findIdSpans(index, length);
    for (const ts of spans) builder.del(node.id, ts, ts.span);
    return this;
  }
}
