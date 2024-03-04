import {ArrApi, NodeApi} from '../../json-crdt/model/api/nodes';
import type {ValueMv} from './ValueMv';
import type {ExtensionApi} from '../../json-crdt';

export class ValueMvApi extends NodeApi<ValueMv> implements ExtensionApi<ValueMv> {
  public set(json: unknown): this {
    const {api, node} = this;
    const builder = api.builder;
    const rgaApi = new ArrApi(node.data, api);
    const length = rgaApi.length();
    rgaApi.del(0, length);
    rgaApi.ins(0, [builder.constOrJson(json)]);
    rgaApi.node.removeTombstones();
    return this;
  }
}
