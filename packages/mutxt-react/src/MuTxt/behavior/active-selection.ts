/**
 * @module *Active Selection* is when some range was selected, and a popup is
 * open to configure it, say add a link formatting, the editor looses focus,
 * so we highlight the selection with a decorator to give user feedback on what
 * text the popup is acting on.
 */

import {Path, Range, Text, type BaseRange, type NodeEntry} from 'slate';

export interface ActiveSelectionDecoration extends BaseRange {
  activeSelection: true;
}

/**
 * Returns a clipped decoration range for the supplied text-node entry when it
 * intersects the link popup's selection snapshot. Slate's `Text.decorations`
 * uses only a range's offsets — not its path — so cross-node ranges must be
 * clipped to the bounds of the current text node before being returned.
 */
export const decorActiveSelection = (entry: NodeEntry, range: Range): ActiveSelectionDecoration | null => {
  const [node, path] = entry;
  if (!Text.isText(node)) return null;
  const textLen = node.text.length;
  const [start, end] = Range.edges(range);
  if (Path.compare(path, end.path) > 0) return null;
  if (Path.compare(path, start.path) < 0) return null;
  const clipStart = Path.equals(path, start.path) ? start.offset : 0;
  const clipEnd = Path.equals(path, end.path) ? end.offset : textLen;
  if (clipStart >= clipEnd) return null;
  return {
    anchor: {path, offset: clipStart},
    focus: {path, offset: clipEnd},
    activeSelection: true,
  };
};
