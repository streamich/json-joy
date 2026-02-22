import type {Block, LeafBlock} from 'json-joy/lib/json-crdt-extensions';
import type {Peritext} from 'json-joy/lib/json-crdt-extensions';
import type {Point} from 'json-joy/lib/json-crdt-extensions/peritext/rga/Point';
import type * as pmm from 'prosemirror-model';
import type {PmJsonTextNode, PmJsonNode} from './types';

export const fromJSON = (
  schema: pmm.Schema,
  json: PmJsonNode | PmJsonTextNode,
  createFragment: (nodes?: pmm.Node[]) => pmm.Fragment,
): pmm.Node => {
  const {type, attrs, content, marks, text} = json as PmJsonNode & PmJsonTextNode;
  const _marks: pmm.Mark[] | undefined = Array.isArray(marks)
    ? marks.map((mark) => schema.mark(mark.type, mark.attrs))
    : void 0;
  return type === 'text'
    ? schema.text(typeof text === 'string' ? text : '', _marks)
    : (schema as any)
        .nodeType(type)
        .create(
          attrs,
          Array.isArray(content)
            ? createFragment(content.map((val) => fromJSON(schema, val, createFragment)))
            : createFragment(),
          _marks,
        );
};

/**
 * Convert a flat ProseMirror position to a Peritext gap position (the integer
 * coordinate system used by `Peritext.insAt` / `Peritext.delAt`).
 *
 * Returns `-1` if the position cannot be resolved (e.g. structural mismatch).
 */
export const pmPosToGap = (txt: Peritext, doc: pmm.Node, pmPos: number): number => {
  try {
    const resolved = doc.resolve(pmPos);
    const leafDepth = resolved.depth;
    let block: Block<string> | LeafBlock<string> = txt.blocks.root;
    for (let d = 0; d < leafDepth && block; d++) block = block.children[resolved.index(d)];
    if (!block) return -1;
    const textOffset = resolved.parentOffset;
    const hasMarker = !!(block as LeafBlock<string>).marker;
    return hasMarker ? block.start.viewPos() + 1 + textOffset : textOffset;
  } catch {
    return -1;
  }
};

export const pmPosToPoint = (txt: Peritext, resolved: pmm.ResolvedPos): Point<string> => {
  const leafDepth = resolved.depth;
  let block: Block<string> | LeafBlock<string> = txt.blocks.root;
  for (let d = 0; d < leafDepth && block; d++) block = block.children[resolved.index(d)];
  if (!block) return txt.pointStart() ?? txt.pointAbsStart();
  const textOffset = resolved.parentOffset;
  const hasMarker = !!(block as LeafBlock<string>).marker;
  const peritextGap = hasMarker ? block.start.viewPos() + 1 + textOffset : textOffset;
  return txt.pointIn(peritextGap);
};

export const pointToPmPos = (block: Block<string> | LeafBlock<string>, point: Point<string>, doc: pmm.Node): number => {
  const viewPos = point.viewPos();
  let pmNode: pmm.Node = doc;
  let pmPos = 0;
  while (!block.isLeaf()) {
    const children = block.children;
    const len = children.length;
    let found = false;
    for (let i = 0; i < len; i++) {
      const child = children[i];
      const childEndView = child.end.viewPos();
      if (viewPos <= childEndView) {
        for (let j = 0; j < i; j++) pmPos += pmNode.child(j).nodeSize;
        pmPos += 1; // open tag
        block = child;
        pmNode = pmNode.child(i);
        found = true;
        break;
      }
    }
    if (!found) {
      const lastIdx = len - 1;
      for (let j = 0; j < lastIdx; j++) pmPos += pmNode.child(j).nodeSize;
      pmPos += 1; // open tag
      block = children[lastIdx];
      pmNode = pmNode.child(lastIdx);
    }
  }
  const hasMarker = !!(block as LeafBlock<string>).marker;
  const textOffset = hasMarker ? viewPos - (block.start.viewPos() + 1) : viewPos;
  return pmPos + Math.max(0, textOffset);
};
