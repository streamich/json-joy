export type GetCursorPosition = (x: number, y: number) => null | [node: Node, offset: number];

export const getCursorPosition: GetCursorPosition =
  typeof document !== 'undefined' && (<any>document).caretPositionFromPoint
    ? (x, y) => {
        const range = (<any>document).caretPositionFromPoint(x, y);
        return range ? [range.offsetNode, range.offset] : null;
      }
    : (x, y) => {
        const range = document.caretRangeFromPoint(x, y);
        return range ? [range.startContainer, range.startOffset] : null;
      };

export const unit = (event: KeyboardEvent): '' | 'word' | 'vline' =>
  event.metaKey ? 'vline' : event.altKey || event.ctrlKey ? 'word' : '';

/**
 * Save the current browser selection, so that it can be restored later. Returns
 * a callback to restore the selection.
 *
 * @returns Callback to restore the selection.
 */
export const saveSelection = (): (() => void) | undefined => {
  const selection = window?.getSelection();
  if (!selection) return;
  const ranges: Range[] = [];
  for (let i = 0; i < selection.rangeCount; i++) ranges.push(selection.getRangeAt(i));
  return () => {
    selection.removeAllRanges();
    for (const range of ranges) selection.addRange(range);
  };
};

export const getDomain = (url: string): string | undefined =>
  url.match(/^(?:[^:\/]+:)?(?:\/{1,5})?(([^\/$ \.]+)\.([^\/$ ]+))/i)?.[1];

export const parseUrl = (url: string): URL | undefined => {
  try {
    return new URL(url);
  } catch {
    return;
  }
};
