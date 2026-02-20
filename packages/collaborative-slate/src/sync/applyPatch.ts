/**
 * Given the current `editor.children` (old) and a freshly-converted Slate
 * document (dst), this module applies the minimal set of Slate `Transforms`
 * needed to bring the editor in sync with the dst document.
 */

import {Transforms, Editor} from 'slate';
import * as str from 'json-joy/lib/util/diff/str';
import {deepEqual} from '@jsonjoy.com/json-equal';
import type {SlateDescendantNode, SlateDocument, SlateElementNode, SlateTextNode} from '../types';

/**
 * Apply minimal Slate transforms to make `editor.children` match `dst`.
 */
export const applyPatch = (editor: Editor, dst: SlateDocument): void => {
  const oldDoc = editor.children as SlateDocument;
  if (oldDoc === dst) return;
  Editor.withoutNormalizing(editor, () => {
    patchChildren(editor, [], oldDoc as SlateDescendantNode[], dst as SlateDescendantNode[]);
  });
};

const patchChildren = (
  editor: Editor,
  basePath: number[],
  src: SlateDescendantNode[],
  dst: SlateDescendantNode[],
): void => {
  const srcLen = src.length;
  const dstLen = dst.length;
  const minLen = Math.min(srcLen, dstLen);
  let pfx = 0;
  while (pfx < minLen && deepEqual(src[pfx], dst[pfx])) pfx++;
  if (pfx === srcLen && pfx === dstLen) return;
  let sfx = 0;
  while (
    sfx < minLen - pfx &&
    deepEqual(src[srcLen - 1 - sfx], dst[dstLen - 1 - sfx])
  ) sfx++;
  const srcEnd = srcLen - sfx;
  const dstEnd = dstLen - sfx;
  const srcChanged = srcEnd - pfx;
  const dstChanged = dstEnd - pfx;
  const sameCount = srcChanged === dstChanged;
  if (sameCount) {
    for (let i = srcChanged - 1; i >= 0; i--) {
      const idx = pfx + i;
      const oldNode = src[idx];
      const newNode = dst[idx];
      if (deepEqual(oldNode, newNode)) continue;
      patchNode(editor, [...basePath, idx], oldNode, newNode);
    }
  } else {
    // Different counts in the changed window.
    // Delete old[pfx..oldEnd) in reverse order, then insert new[pfx..newEnd).
    for (let i = srcEnd - 1; i >= pfx; i--)
      Transforms.removeNodes(editor, {at: [...basePath, i]});
    if (dstChanged > 0) {
      const toInsert = dst.slice(pfx, dstEnd) as any[];
      Transforms.insertNodes(editor, toInsert, {at: [...basePath, pfx]});
    }
  }
};

const attrsEqual = (a: SlateElementNode, b: SlateElementNode): boolean => {
  if (a === b) return true;
  if (a.type !== b.type) return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (key === 'children') continue;
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
};

const patchNode = (
  editor: Editor,
  path: number[],
  src: SlateDescendantNode,
  dst: SlateDescendantNode,
): void => {
  const srcIsText = 'text' in src;
  const dstIsText = 'text' in dst;
  if (srcIsText && dstIsText) {
    patchTextNode(editor, path, src as any, dst as any);
    return;
  }

  // Replace whole node.
  if (srcIsText || dstIsText || (src.type !== dst.type)) {
    Transforms.removeNodes(editor, {at: path});
    Transforms.insertNodes(editor, dst as any, {at: path});
    return;
  }

  // Patch attributes and recurse on children.
  if (!attrsEqual(src, dst)) {
    const {children: _, ...newAttrs} = dst;
    Transforms.setNodes(editor, newAttrs as any, {at: path});
  }
  patchChildren(editor, path, src.children, dst.children);
};

const patchTextNode = (
  editor: Editor,
  path: number[],
  src: SlateTextNode,
  dst: SlateTextNode,
): void => {
  // Check whether non-text mark properties changed.
  const oldKeys = Object.keys(src);
  const newKeys = Object.keys(dst);
  const markChanged =
    oldKeys.length !== newKeys.length ||
    oldKeys.some((k) => k !== 'text' && !deepEqual(src[k], dst[k]));
  if (markChanged) {
    Transforms.removeNodes(editor, {at: path});
    Transforms.insertNodes(editor, dst as any, {at: path});
    return;
  }

  // Diff and apply text content changes.
  const srcTxt = src.text;
  const dstTxt = dst.text;
  if (srcTxt === dstTxt) return;
  str.apply(str.diff(srcTxt, dstTxt), srcTxt.length,
    (pos, str) => Transforms.insertText(editor, str, {at: {path, offset: pos}}),
    (pos, len) => Transforms.delete(editor, {at: {path, offset: pos}, distance: len, unit: 'character'}),
  );
};
