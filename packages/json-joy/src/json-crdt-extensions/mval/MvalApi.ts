import {ArrApi, NodeApi} from '../../json-crdt/model/api/nodes';
import type {MvalNode} from './MvalNode';
import type {ExtApi} from '../../json-crdt';

export class MvalApi extends NodeApi<MvalNode> implements ExtApi<MvalNode> {
  public set(json: unknown): this {
    const {api, node} = this;
    const builder = api.builder;
    const rgaApi = new ArrApi(node.data, api);
    const length = rgaApi.length();
    rgaApi.del(0, length);
    rgaApi.ins(0, [builder.json(json)]);
    rgaApi.node.rmTombstones();
    return this;
  }
}
