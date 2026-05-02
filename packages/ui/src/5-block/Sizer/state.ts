import * as rsync from '../../utils/rsync';

/**
 * State container for the {@link Sizer} component. Holds the desired content
 * width, the measured container width, and a flag for whether a divider is
 * being dragged. Construct one externally and pass it to {@link Sizer} via
 * the `state` prop to read/write content width or container width from the
 * outside.
 */
export class SizerState {
  /** Container width in pixels. */
  public readonly width = rsync.val(0);

  /** Desired content width in pixels. Updated as the user drags. */
  public readonly content: rsync.ReactValue<number>;

  /** Container element box (position + size). */
  public readonly box = new rsync.ElBox<HTMLDivElement>();

  /** Whether one of the dividers is currently being dragged. */
  public readonly dragging = rsync.val(false);

  private readonly _unsub: () => void;

  constructor(initialContent: number = 800) {
    this.content = rsync.val(initialContent);
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
