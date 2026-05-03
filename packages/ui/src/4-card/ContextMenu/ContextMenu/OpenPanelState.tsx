import {BehaviorSubject} from 'rxjs';
import type {UiLifeCycles} from '../../../types';

export interface OpenPanelStateOpts {
  /**
   * Optional shared *selected item* state. Used in toolbar, where a single
   * open panel is shared between multiple toolbars.
   */
  selected$?: BehaviorSubject<string>;

  /**
   * Optional namespace for ids written to `selected$`. When several
   * `OpenPanelState` instances share a single `selected$`, each one passes a
   * unique prefix so the value carries ownership.
   */
  prefix?: string;

  /**
   * If `true`, hover-to-open is active immediately. If `false` (default),
   * hover events are ignored until the first `mousemove` is observed — used
   * by the root context menu so it does not auto-open a submenu wherever
   * the cursor happens to be when the menu pops up.
   */
  armed?: boolean;
}

const COOL_DOWN_TIME = 69;

export class OpenPanelState implements UiLifeCycles {
  public readonly selected$: BehaviorSubject<string>;
  public readonly prefix: string;

  protected canSelectAfter: number = 0;
  protected lastClosed: string = '';
  protected hovered: string = '';
  private focusStack: HTMLElement[] = [];
  private pendingTimer: ReturnType<typeof setTimeout> | 0 = 0;
  private armed: boolean = false;

  constructor(public readonly opts: OpenPanelStateOpts = {}) {
    const {selected$, prefix = '', armed = false} = opts;
    this.selected$ = selected$ ?? new BehaviorSubject('');
    this.prefix = prefix;
    this.armed = armed;
  }

  public isSelected(localId: string): boolean {
    if (!localId) return false;
    return this.selected$.value === this.prefix + localId;
  }

  private isOurs(raw: string): boolean {
    if (!raw) return false;
    return !this.prefix || raw.startsWith(this.prefix);
  }

  private toLocal(raw: string): string {
    return this.isOurs(raw) ? raw.slice(this.prefix.length) : '';
  }

  public readonly start = () => {
    if (this.armed) {
      return () => {
        this.clearPending();
      };
    }
    // Gate hover until the first mousemove so the menu does not auto-open a
    // submenu wherever the cursor happens to be when it pops up.
    const onMove = () => {
      this.armed = true;
      document.removeEventListener('mousemove', onMove, true);
    };
    document.addEventListener('mousemove', onMove, true);
    return () => {
      document.removeEventListener('mousemove', onMove, true);
      this.clearPending();
    };
  };

  private clearPending(): void {
    if (this.pendingTimer) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = 0;
    }
  }

  private schedulePending(id: string): void {
    this.clearPending();
    const delay = this.canSelectAfter - Date.now();
    if (delay <= 0) return;
    this.pendingTimer = setTimeout(() => {
      this.pendingTimer = 0;
      if (this.hovered === id && !this.isSelected(id)) {
        this.forceSelect(id);
      }
    }, delay);
  }

  public readonly hover = (id: string) => {
    if (!this.armed) return;
    const raw = this.selected$.value;
    const selected = this.toLocal(raw);
    if (id === this.lastClosed && selected !== id) return;
    if (!raw) {
      this.clearPending();
      this.forceSelect(id);
      return;
    }
    const now = Date.now();
    if (selected === id) {
      this.clearPending();
      this.canSelectAfter = now + COOL_DOWN_TIME;
      this.hovered = id;
      return;
    }
    if (now <= this.canSelectAfter) {
      this.canSelectAfter = now + COOL_DOWN_TIME;
      this.hovered = id;
      this.schedulePending(id);
      return;
    }
    this.clearPending();
    this.hovered = id;
    this.select(id);
  };

  public readonly select = (id: string): void => {
    const raw = this.selected$.value;
    if (id === '') {
      if (raw && this.isOurs(raw)) this.deselect();
      return;
    }
    if (this.isOurs(raw) && raw === this.prefix + id) {
      this.deselect();
      return;
    }
    const now = Date.now();
    if (now > this.canSelectAfter) {
      this.forceSelect(id, now + COOL_DOWN_TIME);
    }
  };

  public deselect(): boolean {
    const raw = this.selected$.value;
    if (!raw || !this.isOurs(raw)) return false;
    this.clearPending();
    this.lastClosed = raw.slice(this.prefix.length);
    this.hovered = '';
    this.canSelectAfter = Date.now() + COOL_DOWN_TIME;
    this.selected$.next('');
    // Restore focus to the parent item that opened this submenu.
    const prev = this.focusStack.pop();
    if (prev && typeof prev.focus === 'function') requestAnimationFrame(() => prev.focus());
    return true;
  }

  /**
   * Forcefully select an item, ignoring any pending unlock cool down.
   *
   * @param id Local id of the item to select (the prefix is added internally).
   */
  public forceSelect(id: string, canSelectAfter = Date.now() + COOL_DOWN_TIME): void {
    this.hovered = id;
    this.canSelectAfter = canSelectAfter;
    // Save the currently focused element so we can restore it on deselect.
    const focused = document.activeElement;
    if (focused instanceof HTMLElement) this.focusStack.push(focused);
    this.selected$.next(this.prefix + id);
  }

  public readonly onClick = this.select;
  public readonly onMouseMove = this.hover;
  public readonly onMouseLeave = () => {
    this.clearPending();
    this.hovered = '';
  };
}
