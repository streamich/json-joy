import type {Point} from '../../../../../json-crdt-extensions/peritext/rga/Point';
import type {ITimestampStruct} from '../../../../../json-crdt-patch';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * API which a rendering surface (UI) must implement to be used by the event
 * system.
 */
export interface PeritextUiApi {
  /**
   * Focuses the rendering surface, so that it can receive keyboard input.
   */
  focus?(): void;

  /**
   * Blurs the rendering surface, so that it cannot receive keyboard input.
   */
  blur?(): void;

  /**
   * Finds the position on the screen of a specific character.
   *
   * @param char The index of the character in the text, or a the ID
   *     {@link ITimestampStruct} of the character.
   * @returns The bounding rectangle of the character at the given index.
   */
  getCharRect?(char: number | ITimestampStruct): Rect | undefined;

  /**
   * Returns `true` if text at the given position has right-to-left direction.
   */
  isRTL?(pos: number | Point<string>): boolean;
}

export type UiLineEdge = [point: Point, rect: Rect];

export type UiLineInfo = [left: UiLineEdge, right: UiLineEdge];
