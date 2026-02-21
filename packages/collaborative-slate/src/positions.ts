import type {Block, LeafBlock, Peritext} from 'json-joy/lib/json-crdt-extensions';
import type {Point} from 'json-joy/lib/json-crdt-extensions/peritext/rga/Point';
import type {Editor} from 'slate';
import type {SlatePoint} from './types';

/**
 * Convert a Slate point (path + offset) to a Peritext gap position (the integer
 * coordinate system used by `Peritext.insAt` / `Peritext.delAt`). Returns `-1`
 * if the position cannot be resolved (e.g. structural mismatch).
 */
export const slatePointToGap = (txt: Peritext, editor: Editor, point: SlatePoint): number => {
  try {
    const {path, offset} = point;
    const depth = path.length;
    if (depth < 2) return -1;

    // Navigate block tree to the leaf block.
    let block: Block<string> | LeafBlock<string> = txt.blocks.root;
    for (let d = 0; d < depth - 1; d++) {
      const children = block.children;
      const idx = path[d];
      if (idx >= children.length) return -1;
      block = children[idx];
    }

    // Sum text lengths of all text nodes before the target text node, then add offset.
    const textNodeIndex = path[depth - 1];
    let textOffset = 0;
    let node: any = editor;
    for (let d = 0; d < depth - 1; d++) node = node.children[path[d]];
    const children = node.children;
    for (let i = 0; i < textNodeIndex && i < children.length; i++) {
      const text = children[i].text;
      if (typeof text === 'string') textOffset += text.length;
    }
    textOffset += offset;

    const hasMarker = !!(block as LeafBlock<string>).marker;
    return hasMarker ? block.start.viewPos() + 1 + textOffset : textOffset;
  } catch {
    return -1;
  }
};

/** Convert a Slate point to a Peritext {@link Point} in CRDT-space. */
export const slatePointToPoint = (txt: Peritext, editor: Editor, slatePoint: SlatePoint): Point<string> => {
  const gap = slatePointToGap(txt, editor, slatePoint);
  if (gap < 0) return txt.pointStart() ?? txt.pointAbsStart();
  return txt.pointIn(gap);
};

/**
 * Convert a Peritext {@link Point} to a Slate point (path + offset). Walks the
 * Peritext block tree to find the leaf block containing the point, then maps
 * back to the corresponding Slate path + offset.
 */
export const pointToSlatePoint = (
  block: Block<string> | LeafBlock<string>,
  point: Point<string>,
  editor: Editor,
): SlatePoint => {
  const viewPos = point.viewPos();
  const path: number[] = [];

  // Walk through non-leaf blocks to find the leaf containing viewPos.
  while (!block.isLeaf()) {
    const children = block.children;
    const len = children.length;
    let found = false;
    for (let i = 0; i < len; i++) {
      const child = children[i];
      const childEndView = child.end.viewPos();
      if (viewPos <= childEndView) {
        path.push(i);
        block = child;
        found = true;
        break;
      }
    }
    if (!found) {
      const lastIdx = len - 1;
      path.push(lastIdx);
      block = children[lastIdx];
    }
  }

  // Compute text offset within the leaf block.
  const hasMarker = !!(block as LeafBlock<string>).marker;
  const textOffset = hasMarker ? viewPos - (block.start.viewPos() + 1) : viewPos;
  const clampedOffset = Math.max(0, textOffset);

  // Walk Slate text nodes at the computed path to find the right text node + offset.
  let slateNode: any = editor;
  for (const idx of path) slateNode = slateNode.children[idx];
  const textChildren = slateNode?.children;
  if (!textChildren) return {path: [...path, 0], offset: 0};

  let remaining = clampedOffset;
  for (let i = 0; i < textChildren.length; i++) {
    const text = textChildren[i].text;
    if (typeof text !== 'string') continue;
    if (remaining <= text.length) {
      return {path: [...path, i], offset: remaining};
    }
    remaining -= text.length;
  }

  // Past the end — clamp to last text node.
  const lastIdx = textChildren.length - 1;
  const lastText = textChildren[lastIdx]?.text ?? '';
  return {path: [...path, lastIdx], offset: lastText.length};
};
