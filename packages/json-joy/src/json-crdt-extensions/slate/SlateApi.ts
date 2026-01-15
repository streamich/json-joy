import {NodeApi} from '../../json-crdt/model/api/nodes';
import {FromSlate} from './FromSlate';
import type {SlateNode} from './SlateNode';
import type {ArrApi, ArrNode, ExtApi, StrApi} from '../../json-crdt';
import type {SliceNode} from '../peritext/slice/types';
import type {SlateDocument} from './types';

export class SlateApi extends NodeApi<SlateNode> implements ExtApi<SlateNode> {
  public text(): StrApi {
    return this.api.wrap(this.node.text());
  }

  public slices(): ArrApi<ArrNode<SliceNode>> {
    return this.api.wrap(this.node.slices());
  }

  public mergeSlateDoc(doc: SlateDocument) {
    const txt = this.node.txt;
    const viewRange = FromSlate.convert(doc);
    txt.editor.merge(viewRange);
  }
}
