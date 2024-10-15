export interface ChangeDetail {
  ev?: Event;
}

export interface InsertDetail {
  text: string;
}

export interface DeleteDetail {
  /**
   * Specifies the direction of the deletion. If `-1`, the deletion will be
   * backwards. If `1`, the deletion will be forwards. If `0`, the deletion
   * will execute in both directions (i.e. the whole word, or line, or block).
   * 
   * Defaults to `-1`.
   */
  direction?: -1 | 0 | 1;
  unit?: TextUnit;
}

export interface CursorDetail {
  /**
   * Position in the document to move the cursor to. If `-1` or undefined, the
   * current cursor position will be used as the starting point and `len` will
   * be used to determine the new position.
   */
  at?: number;

  /**
   * Specify the length of the selection. If number, it is the length of the
   * selection in characters starting from `at`. If `'word'`, the selection
   * will be the word at `at`. If `'block'`, the selection will select the
   * whole block at `at`. If `'all'`, the selection will select the whole
   * document.
   *
   * Defaults to `0`, which means the cursor will be collapsed to a caret.
   */
  len?: number | 'word' | 'block' | 'all';

  /**
   * Specifies the unit of the movement. If `'char'`, the cursor will be
   * moved by `len` characters. If `'word'`, the cursor will be moved by
   * one word in the direction specified by `len`. If `'line'`, the cursor
   * will be moved to the beginning or end of line, in direction specified
   * by `len`.
   */
  unit?: TextUnit;

  /**
   * Specifies which edge of the selection to move. If `'focus'`, the focus
   * edge will be moved. If `'anchor'`, the anchor edge will be moved. If
   * `'both'`, the whole selection will be moved. Defaults to `'both'`.
   */
  edge?: Edge;
}

export type TextUnit = 'char' | 'word' | 'line';
export type Edge = 'focus' | 'anchor' | 'both';

export interface MarkerDetail {}

export type PeritextEventMap = {
  change: ChangeDetail;
  insert: InsertDetail;
  delete: DeleteDetail;
  cursor: CursorDetail;
  marker: MarkerDetail;
};