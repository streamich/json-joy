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

export const getDomain = (url: string): string | undefined =>
  url.match(/^(?:[^:/]+:)?(?:\/{1,5})?(([^/$ .]+)\.([^/$ ]+))/i)?.[1];

export const parseUrl = (url: string): URL | undefined => {
  try {
    return new URL(url);
  } catch {
    return;
  }
};
