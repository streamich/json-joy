import {Slice} from 'json-joy/lib/json-crdt-extensions/peritext/slice/Slice';
import {type Block, type Inline, LeafBlock, Peritext} from 'json-joy/lib/json-crdt-extensions/peritext';
import type {SlateDocument, SlateElementNode, SlateTextNode} from '../types';

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

export const toSlate = (txt: Peritext): SlateDocument => {
  const hash = txt.refresh();
  const block = txt.blocks.root;
  const node = blockToSlateNode(block);
  const content: SlateDocument = (node?.children ?? []) as SlateDocument;
  return content;
};
