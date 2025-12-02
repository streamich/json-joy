import {NodeApi} from '../../json-crdt/model/api/nodes';
import {FromPm} from './FromPm';
import type {ProseMirrorNode} from './ProseMirrorNode';
import type {ArrApi, ArrNode, ExtApi, StrApi} from '../../json-crdt';
import type {SliceNode} from '../peritext/slice/types';
import type {PmNode} from './types';

export class ProseMirrorApi extends NodeApi<ProseMirrorNode> implements ExtApi<ProseMirrorNode> {
  public text(): StrApi {
    return this.api.wrap(this.node.text());
  }

  public slices(): ArrApi<ArrNode<SliceNode>> {
    return this.api.wrap(this.node.slices());
  }

  public mergePmNode(node: PmNode) {
    const txt = this.node.txt;
    // TODO: to speed up convert directly to .merge() internal format.
    const viewRange = FromPm.convert(node);
    txt.editor.merge(viewRange);
  }
}
