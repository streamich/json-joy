import {NodeApi} from '../../json-crdt/model/api/nodes';
import type {ProseMirrorNode} from './ProseMirrorNode';
import type {ArrApi, ArrNode, ExtApi, StrApi} from '../../json-crdt';
import type {SliceNode} from '../peritext/slice/types';

export class ProseMirrorApi extends NodeApi<ProseMirrorNode> implements ExtApi<ProseMirrorNode> {
  public text(): StrApi {
    return this.api.wrap(this.node.text());
  }

  public slices(): ArrApi<ArrNode<SliceNode>> {
    return this.api.wrap(this.node.slices());
  }
}
