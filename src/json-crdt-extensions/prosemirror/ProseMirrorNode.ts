import {Block, Inline, LeafBlock, Peritext} from '../peritext';
import {ExtensionId} from '../constants';
import {MNEMONIC} from './constants';
import {ExtNode} from '../../json-crdt/extensions/ExtNode';
import {PersistedSlice} from '../peritext/slice/PersistedSlice';
import type {StrNode} from '../../json-crdt/nodes/str/StrNode';
import type {ArrNode} from '../../json-crdt/nodes/arr/ArrNode';
import type {ProseMirrorAttrs, ProseMirrorDataNode, ProseMirrorJsonMark, ProseMirrorJsonNode, ProseMirrorJsonTextNode} from './types';

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

  private toPM(block: Block | LeafBlock): ProseMirrorJsonNode {
    const content: ProseMirrorJsonNode['content'] = [];
    const node: ProseMirrorJsonNode = {
      type: block.tag() + '',
      content,
    };
    if (block instanceof LeafBlock) {
      for (let iterator = block.texts0(), inline: Inline | undefined; inline = iterator();) {
        const text = inline.text();
        if (!text) continue;
        const textNode: ProseMirrorJsonTextNode = {
          type: 'text',
          text,
        };
        const slices = inline.p1.layers;
        const length = slices.length;
        if (length > 0) {
          const marks: ProseMirrorJsonMark[] = [];
          for (let i = 0; i < length; i++) {
            const slice = slices[i];
            if (slice instanceof PersistedSlice) {
              const tag = slice.tag() + '';
              const data = slice.data();
              const mark: ProseMirrorJsonMark = {type: tag};
              if (data && typeof data == 'object' && !Array.isArray(data)) mark.attrs = data as ProseMirrorAttrs;
              marks.push(mark);
            }
          }
          textNode.marks = marks;
        }
        content.push(textNode);
      }
    } else {
      const children = block.children;
      const length = children.length;
      for (let i = 0; i < length; i++) content.push(this.toPM(children[i]));  
    }
    return node;
  }

  public view(): ProseMirrorJsonNode {
    const {txt, _view} = this;
    const hash = txt.refresh();
    if (_view && hash === this._viewHash) return _view;
    const content: ProseMirrorJsonNode[] = [];
    const node: ProseMirrorJsonNode = {type: 'doc', content};
    const block = txt.blocks.root;
    const children = block.children;
    const length = children.length;
    for (let i = 0; i < length; i++) content.push(this.toPM(children[i]));
    this._viewHash = hash;
    this._view = node;
    return node;
  }
}
