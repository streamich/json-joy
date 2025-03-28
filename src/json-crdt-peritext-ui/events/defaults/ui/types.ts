import type {Point} from '../../../../json-crdt-extensions/peritext/rga/Point';
import type {Rect} from '../../../dom/types';

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
   * Finds the position of the character at the given position (between
   * characters). The first position has index of 0.
   *
   * @param pos The index of the character in the text.
   * @param fwd Whether to find the location of the next character after the
   *     given {@link Point} or before, defaults to `true`.
   * @returns The bounding rectangle of the character at the given index.
   */
  getCharRect?(pos: number | Point<string>, fwd?: boolean): Rect | undefined;

  /**
   * Returns `true` if text at the given position has right-to-left direction.
   */
  isRTL?(pos: number | Point<string>): boolean;
}
