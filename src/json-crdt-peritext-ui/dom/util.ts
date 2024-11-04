export type GetCursorPosition = (x: number, y: number) => null | [node: Node, offset: number];

export const getCursorPosition: GetCursorPosition = (<any>document).caretPositionFromPoint
  ? (x, y) => {
      const range = (<any>document).caretPositionFromPoint(x, y);
      return range ? [range.offsetNode, range.offset] : null;
    }
  : (x, y) => {
      const range = document.caretRangeFromPoint(x, y);
      return range ? [range.startContainer, range.startOffset] : null;
    };

export const unit = (event: KeyboardEvent): '' | 'word' | 'line' =>
  event.metaKey ? 'line' : event.altKey || event.ctrlKey ? 'word' : '';
