import {Editor, Node, Path, Range, Text, Transforms} from 'slate';
import type {CustomText, LinkAttributes} from '../types';

const isText = (node: unknown): node is CustomText => Text.isText(node);

export const getLinkAttributes = (node: Partial<CustomText> | null | undefined): LinkAttributes | null => {
  const value = node?.a;
  if (!value || typeof value !== 'object') return null;
  const href = typeof value.href === 'string' ? value.href.trim() : '';
  if (!href) return null;
  const title = typeof value.title === 'string' ? value.title.trim() : undefined;
  return title ? {href, title} : {href};
};

const getTextEntries = (editor: Editor, at?: Range): [CustomText, Path][] =>
  Array.from(
    Editor.nodes(editor, {
      at: at ?? [],
      match: (node) => isText(node),
    }),
  ) as [CustomText, Path][];

const getEntryIndex = (entries: [CustomText, Path][], path: Path): number =>
  entries.findIndex(([, entryPath]) => Path.equals(entryPath, path));

const getExpandedLinkRange = (editor: Editor, entries: [CustomText, Path][], index: number, href: string): Range => {
  let left = index;
  let right = index;
  while (left > 0) {
    const link = getLinkAttributes(entries[left - 1][0]);
    if (!link || link.href !== href) break;
    left--;
  }
  while (right < entries.length - 1) {
    const link = getLinkAttributes(entries[right + 1][0]);
    if (!link || link.href !== href) break;
    right++;
  }
  return {
    anchor: Editor.start(editor, entries[left][1]),
    focus: Editor.end(editor, entries[right][1]),
  };
};

export interface ActiveLink {
  href: string;
  title?: string;
  range: Range;
  text: string;
}

export const hasRangeSelection = (editor: Editor): boolean => {
  const {selection} = editor;
  return !!selection && !Range.isCollapsed(selection);
};

export const normalizeLinkHref = (href: string): string => {
  const value = href.trim();
  if (!value) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith('/') || value.startsWith('#') || value.startsWith('?')) {
    return value;
  }
  return `https://${value}`;
};

export const getActiveLink = (editor: Editor): ActiveLink | null => {
  const {selection} = editor;
  if (!selection) return null;
  if (Range.isCollapsed(selection)) {
    const entries = getTextEntries(editor);
    const index = getEntryIndex(entries, selection.anchor.path);
    if (index < 0) return null;
    const link = getLinkAttributes(entries[index][0]);
    if (!link) return null;
    const range = getExpandedLinkRange(editor, entries, index, link.href);
    return {
      href: link.href,
      title: link.title,
      range,
      text: Editor.string(editor, range),
    };
  }
  const selectionRange = Editor.unhangRange(editor, selection);
  const selectedEntries = getTextEntries(editor, selectionRange);
  if (!selectedEntries.length) return null;
  let link: LinkAttributes | null = null;
  for (const [node] of selectedEntries) {
    const currentLink = getLinkAttributes(node);
    if (!currentLink) return null;
    if (!link) {
      link = currentLink;
      continue;
    }
    if (link.href !== currentLink.href) return null;
  }
  if (!link) return null;
  const entries = getTextEntries(editor);
  const index = getEntryIndex(entries, selectedEntries[0][1]);
  if (index < 0) return null;
  const range = getExpandedLinkRange(editor, entries, index, link.href);
  return {
    href: link.href,
    title: link.title,
    range,
    text: Editor.string(editor, range),
  };
};

export const isLinkActive = (editor: Editor): boolean => !!getActiveLink(editor);

export const upsertLink = (editor: Editor, href: string): ActiveLink | null => {
  const nextHref = normalizeLinkHref(href);
  if (!nextHref) return null;
  const activeLink = getActiveLink(editor);
  const targetRange =
    activeLink?.range ?? (hasRangeSelection(editor) ? Editor.unhangRange(editor, editor.selection!) : null);
  if (!targetRange) return null;
  const link: LinkAttributes = activeLink?.title ? {href: nextHref, title: activeLink.title} : {href: nextHref};
  Transforms.setNodes(editor, {a: link} as Partial<CustomText>, {
    at: targetRange,
    match: (node) => isText(node),
    split: true,
  });
  if (editor.selection && Range.isCollapsed(editor.selection)) Editor.addMark(editor, 'a', link);
  return getActiveLink(editor);
};

export const isRangeInEditor = (editor: Editor, range: Range): boolean => {
  for (const point of [Range.start(range), Range.end(range)]) {
    const {path, offset} = point;
    if (!Node.has(editor, path)) return false;
    const node = Node.get(editor, path);
    if (!Text.isText(node) || offset > node.text.length) return false;
  }
  return true;
};

export const removeLink = (editor: Editor): boolean => {
  const activeLink = getActiveLink(editor);
  if (activeLink) {
    Transforms.unsetNodes(editor, 'a', {
      at: activeLink.range,
      match: (node) => isText(node),
      split: true,
    });
    if (editor.selection && Range.isCollapsed(editor.selection)) Editor.removeMark(editor, 'a');
    return true;
  }
  if (!hasRangeSelection(editor)) return false;
  Editor.removeMark(editor, 'a');
  return true;
};
