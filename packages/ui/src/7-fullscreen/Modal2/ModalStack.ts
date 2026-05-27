export interface ModalLayer {
  /** Handle an Esc press. Returns true if this layer consumed it. */
  handleEsc(): boolean;
  /** Whether this layer wants the page scroll locked while it is open. */
  lockScroll: boolean;
  /** Whether this layer wants the background made inert (typically `lockFocus`). */
  inert: boolean;
  /** The modal's overlay element, excluded from the background inert pass. */
  root: HTMLElement | null;
}

/**
 * Tracks the stack of open modals. Routes Esc to the top-most layer, locks the
 * page scroll while any scroll-locking modal is open, and makes the rest of the
 * page inert while a modal is open. Plain DOM/JS so the React layer only
 * registers and unregisters layers.
 */
class ModalStack {
  private readonly layers: ModalLayer[] = [];
  private scrollLocks = 0;
  private prevOverflow = '';
  private prevPaddingRight = '';
  // Elements made inert by the background pass, mapped to their prior `inert`.
  private readonly inerted = new Map<HTMLElement, boolean>();
  private inertActive = false;

  /** Add a layer to the top of the stack. Returns its depth (0-based). */
  public push(layer: ModalLayer): number {
    const depth = this.layers.length;
    this.layers.push(layer);
    if (depth === 0) document.addEventListener('keydown', this.onKeyDown, true);
    if (layer.lockScroll && this.scrollLocks++ === 0) this.lock();
    if (layer.inert && !this.inertActive) this.applyInert();
    return depth;
  }

  public remove(layer: ModalLayer): void {
    const index = this.layers.indexOf(layer);
    if (index < 0) return;
    this.layers.splice(index, 1);
    if (layer.lockScroll && --this.scrollLocks === 0) this.unlock();
    if (this.inertActive && !this.layers.some((l) => l.inert)) this.clearInert();
    if (!this.layers.length) document.removeEventListener('keydown', this.onKeyDown, true);
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape' && event.keyCode !== 27) return;
    const top = this.layers[this.layers.length - 1];
    if (!top || !top.handleEsc()) return;
    event.preventDefault();
    event.stopPropagation();
  };

  private lock(): void {
    const style = document.body.style;
    this.prevOverflow = style.overflow;
    this.prevPaddingRight = style.paddingRight;
    // Compensate for the disappearing scrollbar to avoid a layout shift.
    const gap = window.innerWidth - document.documentElement.clientWidth;
    style.overflow = 'hidden';
    if (gap > 0) style.paddingRight = (parseFloat(this.prevPaddingRight) || 0) + gap + 'px';
  }

  private unlock(): void {
    const style = document.body.style;
    style.overflow = this.prevOverflow;
    style.paddingRight = this.prevPaddingRight;
  }

  /**
   * Make every top-level element behind the modal inert (removed from the tab
   * order and the accessibility tree, pointer-events disabled), leaving the
   * modal overlays and anything they contain interactive. Snapshotted once when
   * the first modal opens, so portals opened later from within the modal (e.g.
   * popups) are not affected.
   */
  private applyInert(): void {
    this.inertActive = true;
    const roots = this.layers.map((l) => l.root).filter(Boolean) as HTMLElement[];
    for (const child of Array.from(document.body.children) as HTMLElement[]) {
      if (roots.some((root) => child === root || child.contains(root))) continue;
      this.inerted.set(child, child.inert);
      child.inert = true;
    }
  }

  private clearInert(): void {
    this.inertActive = false;
    for (const [el, prev] of this.inerted) el.inert = prev;
    this.inerted.clear();
  }
}

export const modalStack = new ModalStack();
