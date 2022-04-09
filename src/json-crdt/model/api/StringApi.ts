import {NodeApi} from './NodeApi';
import {StringType} from '../../types/rga-string/StringType';

export class StringApi extends NodeApi<StringType, string> {
  public ins(index: number, text: string): this {
    const {api, node} = this;
    const after = !index ? node.id : node.findId(index - 1);
    api.builder.insStr(node.id, after, text);
    return this;
  }

  public del(index: number, length: number): this {
    const {api, node} = this;
    const spans = node.findIdSpan(index, length);
    for (const ts of spans) api.builder.del(node.id, ts, ts.span);
    return this;
  }
}
