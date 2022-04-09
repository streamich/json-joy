import {BinaryType} from '../../types/rga-binary/BinaryType';
import {NodeApi} from './NodeApi';

export class BinaryApi extends NodeApi<BinaryType, Uint8Array> {
  public ins(index: number, data: Uint8Array): this {
    const {api, node} = this;
    const after = !index ? node.id : node.findId(index - 1);
    api.builder.insBin(node.id, after, data);
    return this;
  }

  public del(index: number, length: number): this {
    const {api, node} = this;
    const spans = node.findIdSpan(index, length);
    for (const ts of spans) api.builder.del(node.id, ts, ts.span);
    return this;
  }
}
