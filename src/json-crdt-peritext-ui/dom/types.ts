export interface UiLifeCycles {
  /** Called when UI component is mounted. */
  start(): void;
  /** Called when UI component is remove from the screen. */
  stop(): void;
}

export type Rect = Pick<DOMRect, 'x' | 'y' | 'width' | 'height'>;
