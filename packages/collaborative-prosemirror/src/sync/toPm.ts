import {type Block, LeafBlock, type Inline, Slice} from 'json-joy/lib/json-crdt-extensions';
import type {PmJsonNode, PmJsonTextNode, PmJsonMark, PmAttrs} from '../types';

export const toPm = (block: Block | LeafBlock): PmJsonNode => {
  const content: PmJsonNode['content'] = [];
  const tag = block.tag();
  const node: PmJsonNode = tag ? {type: tag + ''} : {type: 'paragraph'};
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
    for (let i = 0; i < length; i++) content.push(toPm(children[i]));
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
};
