import {type Block, type Inline, LeafBlock, Peritext} from '../peritext';
import {ExtensionId} from '../constants';
import {MNEMONIC} from './constants';
import {ExtNode} from '../../json-crdt/extensions/ExtNode';
import type {StrNode} from '../../json-crdt/nodes/str/StrNode';
import type {ArrNode} from '../../json-crdt/nodes/arr/ArrNode';
import type {SlateDataNode, SlateDocument} from './types';

export class SlateNode extends ExtNode<SlateDataNode> {
  public readonly txt: Peritext<string>;

  constructor(public readonly data: SlateDataNode) {
    super(data);
    this.txt = new Peritext<string>(data.doc, this.text(), this.slices());
  }

  public text(): StrNode<string> {
    return this.data.get(0)!;
  }

  public slices(): ArrNode {
    return this.data.get(1)!;
  }

  // ------------------------------------------------------------------ ExtNode
  public readonly extId = ExtensionId.slate;

  public name(): string {
    return MNEMONIC;
  }

  private _view: SlateDocument | null = null;
  private _viewHash: number = -1;

  private toSlate(block: Block | LeafBlock): SlateDocument {
    
  }

  public view(): SlateDocument {
    const {txt} = this;
    const hash = txt.refresh();
    if (this._view && hash === this._viewHash) return this._view;
    this._viewHash = hash;
    const view = this._view = this.toSlate(txt.blocks.root);
    return view;
  }
}
