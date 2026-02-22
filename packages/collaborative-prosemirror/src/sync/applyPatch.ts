/**
 * Granular ProseMirror document patching.
 *
 * Given an old and a new ProseMirror document, this module builds a minimal
 * {@link Transaction} that transforms one into the other.
 */

import {Slice} from 'prosemirror-model';
import type {Node as PmNode} from 'prosemirror-model';
import type {Transaction} from 'prosemirror-state';

/**
 * Build minimal transaction steps that transform `oldNode` into `newNode`.
 *
 * The `offset` parameter is the absolute document position of the node's
 * opening tag. For the root `doc` node pass `-1` (default) because Prose-
 * Mirror's doc node has no wrapper positions — its content starts at 0.
 *
 * @param tr        The transaction to append steps to.
 * @param oldNode   The current (old) document / sub-tree root.
 * @param newNode   The desired (new) document / sub-tree root.
 * @param offset    Absolute position of this node's opening tag (-1 for doc).
 */
export const applyPatch = (tr: Transaction, oldNode: PmNode, newNode: PmNode, offset: number = -1): void => {
  if (oldNode === newNode) return;
  const oldContent = oldNode.content;
  const newContent = newNode.content;
  if (oldContent.eq(newContent)) {
    if (offset >= 0 && !oldNode.sameMarkup(newNode)) tr.setNodeMarkup(offset, null, newNode.attrs, newNode.marks);
    return;
  }
  if (oldNode.isTextblock) {
    const start = oldContent.findDiffStart(newContent);
    if (start !== null) {
      let {a: endA, b: endB} = oldContent.findDiffEnd(newContent)!;
      const overlap = start - Math.min(endA, endB);
      if (overlap > 0) {
        endA += overlap;
        endB += overlap;
      }
      const from = offset + 1 + start;
      const to = offset + 1 + endA;
      const slice = newContent.cut(start, endB);
      if (from !== to || slice.size > 0) tr.replace(from, to, new Slice(slice, 0, 0));
    }
    if (!oldNode.sameMarkup(newNode)) tr.setNodeMarkup(offset, null, newNode.attrs, newNode.marks);
    return;
  }
  const oldCount = oldNode.childCount;
  const newCount = newNode.childCount;
  const minCount = Math.min(oldCount, newCount);

  // Find longest common prefix. The `===` check covers cache hits; `.eq()`
  // covers structurally-equal nodes that weren't cached.
  let pfx = 0;
  while (pfx < minCount) {
    const oc = oldNode.child(pfx);
    const nc = newNode.child(pfx);
    if (oc !== nc && !oc.eq(nc)) break;
    pfx++;
  }

  // All children match and counts are equal — only markup may have changed.
  if (pfx === minCount && oldCount === newCount) {
    if (offset >= 0 && !oldNode.sameMarkup(newNode)) tr.setNodeMarkup(offset, null, newNode.attrs, newNode.marks);
    return;
  }

  // Find longest common suffix (avoid overlapping with prefix).
  let sfx = 0;
  while (sfx < minCount - pfx) {
    const oc = oldNode.child(oldCount - 1 - sfx);
    const nc = newNode.child(newCount - 1 - sfx);
    if (oc !== nc && !oc.eq(nc)) break;
    sfx++;
  }

  const oldEnd = oldCount - sfx;
  const newEnd = newCount - sfx;
  const oldChanged = oldEnd - pfx;
  const newChanged = newEnd - pfx;

  // When every child changed and we're not at the doc root, replace the whole
  // node atomically. This avoids ProseMirror auto-filling required children
  // (e.g. a list node that loses all its items via `tr.delete`).
  if (offset >= 0 && pfx === 0 && sfx === 0) {
    tr.replaceWith(offset, offset + oldNode.nodeSize, newNode);
    return;
  }

  // Compute the base offset of the first changed child.
  let childOffset = offset + 1;
  for (let i = 0; i < pfx; i++) childOffset += oldNode.child(i).nodeSize;

  const sameNumberOfChangedChildren = oldChanged === newChanged;
  if (sameNumberOfChangedChildren) {
    const offsets: number[] = new Array(oldChanged);
    let off = childOffset;
    for (let i = 0; i < oldChanged; i++) {
      offsets[i] = off;
      off += oldNode.child(pfx + i).nodeSize;
    }
    for (let i = oldChanged - 1; i >= 0; i--) {
      const oc = oldNode.child(pfx + i);
      const nc = newNode.child(pfx + i);
      if (oc === nc || oc.eq(nc)) continue;
      if (oc.type === nc.type) applyPatch(tr, oc, nc, offsets[i]);
      else tr.replaceWith(offsets[i], offsets[i] + oc.nodeSize, nc);
    }
  } else {
    let to = childOffset;
    for (let i = 0; i < oldChanged; i++) to += oldNode.child(pfx + i).nodeSize;
    const children: PmNode[] = [];
    for (let i = pfx; i < newEnd; i++) children.push(newNode.child(i));
    if (children.length) tr.replaceWith(childOffset, to, children);
    else if (childOffset !== to) tr.delete(childOffset, to);
  }

  // After children have been reconciled, update wrapper markup if needed.
  if (offset >= 0 && !oldNode.sameMarkup(newNode)) tr.setNodeMarkup(offset, null, newNode.attrs, newNode.marks);
};
