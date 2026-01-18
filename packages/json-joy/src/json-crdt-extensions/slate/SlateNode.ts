import {type Block, type Inline, LeafBlock, Peritext} from '../peritext';
import {ExtensionId} from '../constants';
import {MNEMONIC} from './constants';
import {ExtNode} from '../../json-crdt/extensions/ExtNode';
import {Slice} from '../peritext/slice/Slice';
import type {StrNode} from '../../json-crdt/nodes/str/StrNode';
import type {ArrNode} from '../../json-crdt/nodes/arr/ArrNode';
import type {SlateDataNode, SlateDocument, SlateElementNode, SlateTextNode} from './types';

const blockToSlateNode = (block: Block | LeafBlock): SlateElementNode => {
  if (block instanceof LeafBlock) {
    const textChildren: SlateTextNode[] = [];
    for (let iterator = block.texts0(), inline: Inline | undefined; (inline = iterator()); ) {
      const text = inline.text();
      const attr = inline.attr();
      const attrKeys = Object.keys(attr);
      // Skip only if there's no text AND no decorations
      if (!text && attrKeys.length === 0) continue;
      const textNode: SlateTextNode = {text: text || ''};
      const length = attrKeys.length;
      ATTRS: for (let i = 0; i < length; i++) {
        const tag = attrKeys[i];
        const stack = attr[tag];
        if (!stack || stack.length <= 0) continue ATTRS;
        const slice = stack[0].slice;
        if (!(slice instanceof Slice)) continue ATTRS;
        const data = slice.data();
        if (data && typeof data === 'object' && !Array.isArray(data)) Object.assign(textNode, {[tag]: data});
        else textNode[tag] = data !== undefined ? data : true;
      }
      textChildren.push(textNode);
    }
    const node: SlateElementNode = {
      type: block.tag() + '',
      children: textChildren.length ? textChildren : [{text: ''}],
    };
    const attr = block.attr();
    if (typeof attr === 'object') Object.assign(node, attr);
    return node;
  } else {
    const children: SlateElementNode[] = [];
    const blockChildren = block.children;
    const length = blockChildren.length;
    for (let i = 0; i < length; i++) children.push(blockToSlateNode(blockChildren[i]));
    const attr = block.attr();
    const node: SlateElementNode = {
      ...(attr && typeof attr === 'object' ? attr : {}),
      type: block.tag() + '',
      children: children.length ? children : [{text: ''}],
    };
    return node;
  }
};

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

  public view(): SlateDocument {
    const {txt} = this;
    const hash = txt.refresh();
    if (this._view && hash === this._viewHash) return this._view;
    const block = txt.blocks.root;
    const node = blockToSlateNode(block);
    const content: SlateDocument = (node?.children ?? []) as SlateDocument;
    // console.log(JSON.stringify(content, null, 2));
    this._viewHash = hash;
    this._view = content;
    return content;
  }
}
