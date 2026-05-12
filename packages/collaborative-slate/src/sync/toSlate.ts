import {Slice} from 'json-joy/lib/json-crdt-extensions/peritext/slice/Slice';
import {SliceStacking} from 'json-joy/lib/json-crdt-extensions/peritext/slice/constants';
import {type Block, type Inline, LeafBlock, type Peritext} from 'json-joy/lib/json-crdt-extensions/peritext';
import type {SlateDescendantNode, SlateDocument, SlateElementNode, SlateTextNode} from '../types';

const isText = (node: SlateDescendantNode): node is SlateTextNode =>
  typeof (node as SlateTextNode).text === 'string';

const blockToSlateNode = (block: Block | LeafBlock): SlateElementNode => {
  if (block instanceof LeafBlock) {
    const children: SlateDescendantNode[] = [];
    for (let iterator = block.texts0(), inline: Inline | undefined; (inline = iterator()); ) {
      const text = inline.text();
      const attr = inline.attr();
      const attrKeys = Object.keys(attr);

      let atomicSlice: Slice | undefined;
      let atomicTag: string | undefined;
      for (const tag of attrKeys) {
        const stack = attr[tag];
        if (!stack || stack.length <= 0) continue;
        const slice = stack[0].slice;
        if (!(slice instanceof Slice)) continue;
        if (slice.stacking === SliceStacking.Atomic) {
          atomicSlice = slice;
          atomicTag = tag;
          break;
        }
      }
      if (atomicSlice && atomicTag !== undefined) {
        const data = atomicSlice.data();
        const inlineEl: SlateElementNode = {
          type: atomicTag,
          children: [{text: ''}],
        };
        if (data && typeof data === 'object' && !Array.isArray(data)) Object.assign(inlineEl, data);
        children.push(inlineEl);
        continue;
      }

      if (!text && attrKeys.length === 0) continue;
      const textNode: SlateTextNode = {text: text || ''};
      const length = attrKeys.length;
      ATTRS: for (let i = 0; i < length; i++) {
        const tag = attrKeys[i];
        const stack = attr[tag];
        if (!stack || stack.length <= 0) continue ATTRS;
        const slice = stack[0].slice;
        if (!(slice instanceof Slice)) continue ATTRS;
        if (slice.stacking === SliceStacking.Atomic) continue ATTRS;
        const data = slice.data();
        if (data && typeof data === 'object' && !Array.isArray(data)) Object.assign(textNode, {[tag]: data});
        else textNode[tag] = data !== undefined ? data : true;
      }
      children.push(textNode);
    }

    // Slate requires text nodes around inline elements; bracket the run
    // with empty text nodes when needed.
    if (children.length === 0) {
      children.push({text: ''});
    } else {
      if (!isText(children[0])) children.unshift({text: ''});
      if (!isText(children[children.length - 1])) children.push({text: ''});
      for (let i = 1; i < children.length; i++) {
        if (!isText(children[i]) && !isText(children[i - 1])) {
          children.splice(i, 0, {text: ''});
          i++;
        }
      }
    }
    const node: SlateElementNode = {
      type: block.tag() + '',
      children: children as any,
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
  txt.refresh();
  const block = txt.blocks.root;
  const node = blockToSlateNode(block);
  const content: SlateDocument = (node?.children ?? []) as SlateDocument;
  return content;
};
