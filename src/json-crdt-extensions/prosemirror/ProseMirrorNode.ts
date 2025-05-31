import {Peritext} from '../peritext';
import {ExtensionId} from '../constants';
import {MNEMONIC} from './constants';
import {ExtNode} from '../../json-crdt/extensions/ExtNode';
import type {StrNode} from '../../json-crdt/nodes/str/StrNode';
import type {ArrNode} from '../../json-crdt/nodes/arr/ArrNode';
import type {ProseMirrorDataNode, ProseMirrorJsonNode} from './types';

export class ProseMirrorNode extends ExtNode<ProseMirrorDataNode> {
  public readonly txt: Peritext<string>;

  constructor(public readonly data: ProseMirrorDataNode) {
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
  public readonly extId = ExtensionId.prosemirror;

  public name(): string {
    return MNEMONIC;
  }

  private _view: ProseMirrorJsonNode | null = null;
  private _viewHash: number = -1;

  public view(): ProseMirrorJsonNode {
    const {txt, _view} = this;
    const hash = txt.refresh();
    if (_view && hash === this._viewHash) return _view;
    const nextView: ProseMirrorJsonNode = {
      type: 'doc',
      content: [],
    };

    console.log(txt + '');
    
    this._viewHash = hash;
    this._view = nextView;
    return nextView;
  }
}
