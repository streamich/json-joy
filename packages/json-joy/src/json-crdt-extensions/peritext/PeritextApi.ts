import {Peritext} from './Peritext';
import {printTree} from 'tree-dump/lib/printTree';
import {ExtensionApi} from '../../json-crdt/extensions/ExtensionApi';
import type {Editor} from './editor/Editor';
import type {PeritextNode} from './PeritextNode';
import type {StrApi, ArrApi, ArrNode, ModelApi} from '../../json-crdt';
import type {SliceNode} from './slice/types';

export class PeritextApi extends ExtensionApi<PeritextNode> {
  public readonly txt: Peritext;
  public readonly editor: Editor;

  constructor(
    public node: PeritextNode,
    public readonly api: ModelApi<any>,
  ) {
    super(node, api);
    this.txt = new Peritext(api.model, node.text(), node.slices());
    this.editor = this.txt.editor;
  }

  public text(): StrApi {
    return this.api.wrap(this.node.text());
  }

  public slices(): ArrApi<ArrNode<SliceNode>> {
    return this.api.wrap(this.node.slices());
  }

  public toString(tab?: string): string {
    return (
      'PeritextApi' + printTree(tab, [(tab) => this.node.toString(tab), () => '', (tab) => this.txt.toString(tab)])
    );
  }
}
