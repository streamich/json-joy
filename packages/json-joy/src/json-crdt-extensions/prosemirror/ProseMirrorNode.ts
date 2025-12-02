import {type Block, type Inline, LeafBlock, Peritext} from '../peritext';
import {ExtensionId} from '../constants';
import {MNEMONIC} from './constants';
import {ExtNode} from '../../json-crdt/extensions/ExtNode';
import {Slice} from '../peritext/slice/Slice';
import type {StrNode} from '../../json-crdt/nodes/str/StrNode';
import type {ArrNode} from '../../json-crdt/nodes/arr/ArrNode';
import type {PmAttrs, PmDataNode, PmJsonMark, PmJsonNode, PmJsonTextNode} from './types';

export class ProseMirrorNode extends ExtNode<PmDataNode> {
  public readonly txt: Peritext<string>;

  constructor(public readonly data: PmDataNode) {
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

  private _view: PmJsonNode | null = null;
  private _viewHash: number = -1;

  private toPM(block: Block | LeafBlock): PmJsonNode {
    const content: PmJsonNode['content'] = [];
    const node: PmJsonNode = {type: block.tag() + ''};
    if (block instanceof LeafBlock) {
      for (let iterator = block.texts0(), inline: Inline | undefined; (inline = iterator()); ) {
        const text = inline.text();
        if (!text) continue;
        const textNode: PmJsonTextNode = {
          type: 'text',
          text,
        };
        const slices = inline.p1.layers;
        const length = slices.length;
        if (length > 0) {
          const marks: PmJsonMark[] = [];
          for (let i = 0; i < length; i++) {
            const slice = slices[i];
            if (slice instanceof Slice) {
              const tag = slice.type() + '';
              const data = slice.data();
              const mark: PmJsonMark = {type: tag};
              if (data && typeof data === 'object' && !Array.isArray(data)) mark.attrs = data as PmAttrs;
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
    if (content.length) node.content = content;
    const data = block.attr();
    if (data && typeof data === 'object') {
      for (const _ in data) {
        node.attrs = data as PmAttrs;
        break;
      }
    }
    return node;
  }

  public view(): PmJsonNode {
    const {txt, _view} = this;
    const hash = txt.refresh();
    if (_view && hash === this._viewHash) return _view;
    const content: PmJsonNode[] = [];
    const node: PmJsonNode = {type: 'doc', content};
    const block = txt.blocks.root;
    const children = block.children;
    const length = children.length;
    for (let i = 0; i < length; i++) content.push(this.toPM(children[i]));
    this._viewHash = hash;
    this._view = node;
    return node;
  }
}
