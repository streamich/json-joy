/**
 * @todo Unify this with {@link UiLifeCycles}, join interfaces.
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
}
