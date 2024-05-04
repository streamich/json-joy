import {NodeApi} from '../../json-crdt/model/api/nodes';
import type {PeritextNode} from './PeritextNode';
import type {ExtensionApi, StrApi} from '../../json-crdt';

export class PeritextApi extends NodeApi<PeritextNode> implements ExtensionApi<PeritextNode> {
  public text(): StrApi {
    return this.api.wrap(this.node.text());
  }
}
