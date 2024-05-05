import {NodeApi} from '../../json-crdt/model/api/nodes';
import type {PeritextNode} from './PeritextNode';
import type {ExtApi, StrApi, ArrApi, ArrNode} from '../../json-crdt';
import type {SliceNode} from './slice/types';

export class PeritextApi extends NodeApi<PeritextNode> implements ExtApi<PeritextNode> {
  public text(): StrApi {
    return this.api.wrap(this.node.text());
  }

  public slices(): ArrApi<ArrNode<SliceNode>> {
    return this.api.wrap(this.node.slices());
  }
}
