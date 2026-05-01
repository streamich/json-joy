import * as rsync from '../../utils/rsync';

/**
 * State container for the {@link Sizer} component. Holds the current container
 * width and a flag for whether a divider is being dragged. The container width
 * atom is intended to be read by other components that need to react to the
 * available space inside the sizer (e.g. for laying out chrome or measuring
 * embedded content).
 */
export class SizerState {
  /** Container width in pixels. */
  public readonly width = rsync.val(0);

  /** Container element box (position + size). */
  public readonly box = new rsync.ElBox<HTMLDivElement>();

  /** Whether one of the dividers is currently being dragged. */
  public readonly dragging = rsync.val(false);

  private readonly _unsub: () => void;

  constructor() {
    this._unsub = this.box.subscribe(() => {
      const w = this.box.value[2];
      if (w !== this.width.value) this.width.next(w);
    });
  }

  public dispose(): void {
    this._unsub();
    this.box.dispose();
  }
}
