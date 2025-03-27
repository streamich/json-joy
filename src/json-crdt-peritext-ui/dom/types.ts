import type {Point} from "../../json-crdt-extensions/peritext/rga/Point";

/**
 * @todo Unify this with {@link UiLifeCycles}, join interfaces.
 * @todo Rename this to something like "disposable", as it does not have to be
 *     a UI component.
 */
export interface UiLifeCycles {
  /** Called when UI component is mounted. */
  start(): void;
  /** Called when UI component is remove from the screen. */
  stop(): void;
}

export interface UiLifeCyclesRender {
  /**
   * Called when UI component is mounted. Returns a function to be called when
   * the component is removed from the screen.
   */
  start(): () => void;
}

export type Rect = Pick<DOMRect, 'x' | 'y' | 'width' | 'height'>;

export interface PeritextRenderingSurfaceApi {
  /**
   * Focuses the rendering surface, so that it can receive keyboard input.
   */
  focus(): void;

  // /**
  //  * Returns the bounding rectangle of the rendering surface.
  //  */
  // getBoundingClientRect(): Rect;

  // // /**
  // //  * Returns the bounding rectangle of the line at a given position.
  // //  */
  // // getLineRect(line: number): Rect;

  /**
   * Finds the position of the character at the given position (between
   * characters). The first position has index of 0.
   *
   * @param pos The index of the character in the text.
   * @param right Whether to find the location of character after the given
   *     {@link Point} or before, defaults to `true`.
   * @returns The bounding rectangle of the character at the given index.
   */
  getCharRect(pos: number | Point<string>, right?: boolean): Rect | undefined;
  
  getLineEnd(pos: number | Point<string>, right?: boolean): [point: Point, rect: Rect] | undefined;
    
  // TODO: Need to be able to detect text direction of the current character.
}
