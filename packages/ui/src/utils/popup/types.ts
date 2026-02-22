/**
 * An anchor point for a popup. It specifies the position where the popup was
 * opened (x, y) and the direction of the popup popup body growth (dx, dy).
 *
 * Coordinates start from the top-left corner of the page and grow to the right
 * and down.d
 */
export interface AnchorPoint {
  x: number;
  y: number;
  dx: 1 | 0 | -1;
  dy: 1 | 0 | -1;
}

export interface AnchorPointComputeSpec {
  /**
   * Gap between the toggle head and the popup panel.
   *
   * @default 4
   */
  gap?: number;

  /**
   * Offset from the anchor point.
   *
   * @default 0
   */
  off?: number;

  /**
   * Padding between the popup panel and the edge of the screen.
   */
  pad?: number;

  /**
   * Whether the popup should be positioned to the left or right of the toggle
   * head. If `false` the popup will be positioned above or below the toggle
   * head.
   *
   * @default false
   */
  horizontal?: boolean;

  /**
   * By default the popup is align to one of the toggle head edges. If `center`
   * is set to `true`, the popup will be centered relative to the toggle head.
   *
   * @default false
   */
  center?: boolean;

  /**
   * Position the popup above the toggle head if there is enough space; if there
   * is more space then `topIf` height (even if it is more preferable to place
   * the popup below the toggle head).
   */
  topIf?: number;
}

export type RefPopupToggle = (span: HTMLElement | null) => void;
