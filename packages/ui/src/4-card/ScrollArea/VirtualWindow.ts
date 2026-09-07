import * as React from 'react';
import * as sync from 'thingies/lib/sync';
import {useSyncStore} from '../../hooks/useSyncStore';
import type {UiLifeCycles} from '../../types';
import type {ScrollState} from './state';

export type VirtualAlign = 'start' | 'center' | 'end' | 'nearest';

export interface VirtualOpts {
  /** Total number of items in the list. */
  count: number;
  /**
   * Height of a single row, which selects the mode:
   *
   * - **`number`** — uniform fixed-height fast path (O(1), no prefix sums).
   * - **`(index) => height`** — static variable-height mode (prefix sums +
   *   binary search); memoize it, as a new function identity rebuilds the window.
   * - **omitted** — dynamic measured mode: heights are unknown upfront, seeded
   *   from {@link estimateHeight} and corrected by a `ResizeObserver` as rows
   *   render (with scroll anchoring so above-viewport corrections don't jump).
   *   The consumer must call {@link VirtualWindow.measure} / `unmeasure` per row.
   */
  rowHeight?: number | ((index: number) => number);
  /** Extra rows rendered above and below the visible window. Default: 8. */
  overscan?: number;
  /** Measured mode: per-row height guess used until a row is measured. Default: 32. */
  estimateHeight?: number;
}

/** Inclusive rendered window, with overscan applied. */
class VirtualRange {
  constructor(
    public start: number,
    public end: number,
  ) {}
}

/**
 * Headless windowing core for native-scroll virtualization. Given a
 * {@link ScrollState} (which owns a native `overflow: scroll` element) and item
 * metrics, it reactively computes which slice of items to render plus the canvas
 * geometry needed to keep the browser's native `scrollHeight` accurate.
 *
 * The consumer renders a single canvas `<div>` sized to {@link totalHeight$} as
 * the scroll element's `firstElementChild` (so `ScrollState`'s `ResizeObserver`
 * tracks it), and offsets the rendered slice by {@link offsetTop$}.
 */
export class VirtualWindow implements UiLifeCycles {
  /** Inclusive `[start, end]` slice to render, with overscan. */
  public readonly range$ = sync.val<VirtualRange>(new VirtualRange(0, -1));
  /** Canvas height in px — the total height of all items. */
  public readonly totalHeight$ = sync.val<number>(0);
  /** Pixel offset of the first rendered row inside the canvas. */
  public readonly offsetTop$ = sync.val<number>(0);
  /** First row intersecting the viewport, sans overscan (sticky ancestors). */
  public readonly firstVisible$ = sync.val<number>(0);

  private readonly scroll: ScrollState;
  private _count: number;
  private readonly _overscan: number;
  /** Uniform fixed-height fast path (O(1)). */
  private readonly _uniform: boolean;
  /** Dynamic measured mode (heights discovered via {@link measure}). */
  private readonly _measured: boolean;
  private _h = 0;
  private _fn: ((index: number) => number) | null = null;
  private _prefix: number[] | null = null;
  /** Measured mode: per-position height (estimate until measured). */
  private _heights: Float64Array | null = null;
  /** Measured mode: per-row guess used until a row is measured. */
  private readonly _estimate: number;
  /** Measured mode: single observer shared across all rendered rows. */
  private _ro: ResizeObserver | null = null;
  /** Measured mode: observed element → its item index. */
  private readonly _elIndex = new WeakMap<Element, number>();
  /** Measured mode: in-flight `scrollToIndex` awaiting the target's measurement. */
  private _pending: {index: number; align: VirtualAlign; tries: number} | null = null;

  constructor(scroll: ScrollState, opts: VirtualOpts) {
    this.scroll = scroll;
    this._count = opts.count;
    this._overscan = opts.overscan ?? 8;
    this._estimate = opts.estimateHeight ?? 32;
    const rowHeight = opts.rowHeight;
    if (typeof rowHeight === 'number') {
      this._uniform = true;
      this._measured = false;
      this._h = rowHeight;
    } else if (typeof rowHeight === 'function') {
      this._uniform = false;
      this._measured = false;
      this._fn = rowHeight;
    } else {
      this._uniform = false;
      this._measured = true;
    }
    this._rebuild();
  }

  /** Total height of all items. */
  private _total(): number {
    if (this._uniform) return this._count * this._h;
    return this._prefix ? this._prefix[this._count] : 0;
  }

  /** Offset of row `index` from the top of the content. */
  private _offsetOf(index: number): number {
    if (this._uniform) return index * this._h;
    return this._prefix ? this._prefix[index] : 0;
  }

  /** Height of row `index`. */
  private _rowH(index: number): number {
    if (this._uniform) return this._h;
    const prefix = this._prefix;
    return prefix ? prefix[index + 1] - prefix[index] : 0;
  }

  /** Index of the row whose box contains content-offset `y`, clamped to range. */
  private _rowAt(y: number): number {
    const count = this._count;
    if (this._uniform) {
      const i = Math.floor(y / this._h);
      return i < 0 ? 0 : i > count - 1 ? count - 1 : i;
    }
    const prefix = this._prefix!;
    if (y <= 0) return 0;
    if (y >= prefix[count]) return count - 1;
    let lo = 0;
    let hi = count - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (prefix[mid] <= y) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  }

  /** Rebuild prefix sums (variable/measured mode) and total height, then recompute. */
  private _rebuild(): void {
    if (this._measured) {
      const count = this._count;
      const old = this._heights;
      const estimate = this._estimate;
      const heights = new Float64Array(count);
      // Preserve already-measured heights across count changes; seed the rest.
      for (let i = 0; i < count; i++) heights[i] = old && i < old.length ? old[i] : estimate;
      this._heights = heights;
      this._prefix = null;
      this._buildPrefixFromHeights(0);
    } else if (!this._uniform) {
      const fn = this._fn!;
      const count = this._count;
      const prefix = new Array<number>(count + 1);
      prefix[0] = 0;
      for (let i = 0; i < count; i++) prefix[i + 1] = prefix[i] + fn(i);
      this._prefix = prefix;
    }
    this.totalHeight$.next(this._total());
    this._recompute();
  }

  /** Measured mode: (re)compute the prefix-sum tail from `from` over `_heights`. */
  private _buildPrefixFromHeights(from: number): void {
    const count = this._count;
    const heights = this._heights!;
    let prefix = this._prefix;
    if (!prefix || prefix.length !== count + 1) {
      prefix = new Array<number>(count + 1);
      prefix[0] = 0;
      from = 0;
    }
    if (from < 0) from = 0;
    for (let i = from; i < count; i++) prefix[i + 1] = prefix[i] + heights[i];
    this._prefix = prefix;
  }

  /** Recompute the rendered window from the current scroll geometry. */
  private readonly _recompute = (): void => {
    const count = this._count;
    if (count <= 0) {
      this._emit(0, -1, 0, 0);
      return;
    }
    const scroll = this.scroll;
    // Content-relative scroll offset: the canvas sits below the header padding.
    const s = scroll.scrollTop$.value - scroll.headerHeight$.value;
    const clientHeight = scroll.clientHeight$.value;
    const overscan = this._overscan;
    const firstVisible = this._rowAt(s);
    // Last row whose top is strictly above the viewport's bottom edge (the row
    // containing the last visible pixel), so a row flush with the bottom edge is
    // not counted as visible.
    const bottom = s + clientHeight;
    let lastVisible = this._rowAt(bottom > 0 ? bottom - 1 : 0);
    if (lastVisible < firstVisible) lastVisible = firstVisible;
    let start = firstVisible - overscan;
    if (start < 0) start = 0;
    let end = lastVisible + overscan;
    if (end > count - 1) end = count - 1;
    this._emit(start, end, this._offsetOf(start), firstVisible);
  };

  /** Push window outputs, deduping the range object so React skips no-op shifts. */
  private _emit(start: number, end: number, offsetTop: number, firstVisible: number): void {
    const range = this.range$.value;
    if (range.start !== start || range.end !== end) this.range$.next(new VirtualRange(start, end));
    this.offsetTop$.next(offsetTop);
    this.firstVisible$.next(firstVisible);
  }

  /**
   * Scroll so that row `index` is positioned according to `align`. Uses the
   * native scroll element via {@link ScrollState.scrollTo} (clamped to the
   * scrollable range), so momentum/anchoring stay native. `align`:
   *
   * - `start` — row top at the top of the content area (default).
   * - `end` — row bottom at the bottom of the content area.
   * - `center` — row centered in the content area.
   * - `nearest` — no-op if already fully visible; else aligns to the closer edge.
   *
   * In measured mode the target's offset may be an estimate until it renders;
   * the scroll then settles once the target is measured (see {@link _settleScroll}).
   */
  public readonly scrollToIndex = (index: number, align: VirtualAlign = 'start'): void => {
    const count = this._count;
    if (count <= 0) return;
    if (index < 0) index = 0;
    else if (index > count - 1) index = count - 1;
    this._scrollToIndexOnce(index, align);
    this._pending = this._measured ? {index, align, tries: 0} : null;
  };

  /** Single, immediate scroll to `index` from the current (possibly estimated) offsets. */
  private _scrollToIndexOnce(index: number, align: VirtualAlign): void {
    const scroll = this.scroll;
    const off = this._offsetOf(index);
    const rowH = this._rowH(index);
    // Visible content area excludes the header/footer overlays; header padding
    // cancels out of the `start` target, leaving `off` directly.
    const visH = Math.max(0, scroll.clientHeight$.value - scroll.headerHeight$.value - scroll.footerHeight$.value);
    let top: number;
    if (align === 'center') top = off + rowH / 2 - visH / 2;
    else if (align === 'end') top = off + rowH - visH;
    else if (align === 'nearest') {
      const curTop = scroll.scrollTop$.value;
      if (off < curTop) top = off;
      else if (off + rowH > curTop + visH) top = off + rowH - visH;
      else return;
    } else top = off;
    scroll.scrollTo(top);
  }

  /**
   * Measured mode: once the pending `scrollToIndex` target has rendered (and so
   * been measured), re-issue the scroll to its now-exact offset, then stop.
   * Bounded so it never fights the user if the target never reaches the window.
   */
  private _settleScroll(): void {
    const pending = this._pending;
    if (!pending) return;
    if (pending.tries++ > 8) {
      this._pending = null;
      return;
    }
    const range = this.range$.value;
    if (pending.index >= range.start && pending.index <= range.end) {
      this._scrollToIndexOnce(pending.index, pending.align);
      this._pending = null;
    }
  }

  /**
   * Measured mode: start observing a rendered row's element so its real height is
   * captured. Call once per rendered row (a ref callback / layout effect); pair
   * with {@link unmeasure} on unmount. No-op outside measured mode.
   */
  public measure(index: number, el: HTMLElement): void {
    if (!this._measured) return;
    let ro = this._ro;
    if (!ro) {
      if (typeof ResizeObserver === 'undefined') return;
      ro = this._ro = new ResizeObserver(this._onMeasure);
    }
    this._elIndex.set(el, index);
    ro.observe(el);
  }

  /** Measured mode: stop observing a row's element (on unmount). */
  public unmeasure(el: HTMLElement): void {
    this._elIndex.delete(el);
    this._ro?.unobserve(el);
  }

  /** ResizeObserver callback: collect (index, borderBoxHeight) pairs and ingest. */
  private readonly _onMeasure = (entries: ResizeObserverEntry[]): void => {
    const elIndex = this._elIndex;
    const measurements: [number, number][] = [];
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const index = elIndex.get(entry.target);
      if (index === undefined) continue;
      const box = entry.borderBoxSize && entry.borderBoxSize[0];
      // Border box is what occupies scroll space; content box would under-report.
      const h = box ? box.blockSize : (entry.target as HTMLElement).offsetHeight;
      measurements.push([index, h]);
    }
    if (measurements.length) this._ingest(measurements);
  };

  /**
   * Apply a batch of measurements: update heights, patch the prefix-sum tail, and
   * — for rows above the first visible row — compensate `scrollTop` by the height
   * delta so the visible content does not jump (scroll anchoring). Runs inside the
   * `ResizeObserver` callback (after layout, before paint), which is what makes
   * the anchoring jump-free.
   */
  private _ingest(measurements: readonly (readonly [number, number])[]): void {
    const heights = this._heights;
    if (!heights) return;
    const count = this._count;
    const anchor = this.firstVisible$.value;
    let deltaAbove = 0;
    let dirtyFrom = count;
    let changed = false;
    for (let i = 0; i < measurements.length; i++) {
      const index = measurements[i][0];
      const newH = measurements[i][1];
      if (index < 0 || index >= count || newH <= 0) continue;
      const oldH = heights[index];
      if (newH === oldH) continue;
      heights[index] = newH;
      if (index < dirtyFrom) dirtyFrom = index;
      if (index < anchor) deltaAbove += newH - oldH;
      changed = true;
    }
    if (!changed) return;
    this._buildPrefixFromHeights(dirtyFrom);
    this.totalHeight$.next(this._total());
    if (deltaAbove !== 0) {
      this.scroll.scrollBy(deltaAbove);
      const el = this.scroll.viewportEl;
      if (el) this.scroll.scrollTop$.next(el.scrollTop);
    }
    this._recompute();
    if (this._pending) this._settleScroll();
  }

  /** Update the item count after a list mutation (insert/remove/reorder). */
  public setCount(count: number): void {
    if (count === this._count) return;
    this._count = count;
    this._rebuild();
  }

  /** Subscribe to scroll/resize and compute the window. Returns a disposer. */
  public start(): () => void {
    const recompute = this._recompute;
    const scroll = this.scroll;
    const unsubs = [
      scroll.scrollTop$.subscribe(recompute),
      scroll.clientHeight$.subscribe(recompute),
      scroll.headerHeight$.subscribe(recompute),
    ];
    recompute();
    return () => {
      for (const unsub of unsubs) unsub();
      this._ro?.disconnect();
      this._ro = null;
      this._pending = null;
    };
  }
}

export interface UseVirtual {
  /** Inclusive `[start, end]` slice to render. */
  range: VirtualRange;
  /** Pixel offset of the first rendered row inside the canvas. */
  offsetTop: number;
  /** Canvas height in px. */
  totalHeight: number;
  /** First row intersecting the viewport, sans overscan. */
  firstVisible: number;
  /** Imperatively scroll a row into view. */
  scrollToIndex: (index: number, align?: VirtualAlign) => void;
  /** The underlying window instance (for advanced/imperative use). */
  window: VirtualWindow;
}

/**
 * React hook over {@link VirtualWindow}. Creates and starts a window bound to
 * `scroll`, and returns the current reactive window plus `scrollToIndex`.
 *
 * The window is recreated when `scroll`, `rowHeight`, `overscan`, or
 * `estimateHeight` change; `count` is synced in place via `setCount` so list
 * growth/shrink does not reset scroll position or re-subscribe.
 */
export const useVirtual = (scroll: ScrollState, opts: VirtualOpts): UseVirtual => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: count is synced via setCount below; the window is recreated only on scroll/rowHeight/overscan/estimateHeight changes.
  const window = React.useMemo(
    () => new VirtualWindow(scroll, opts),
    [scroll, opts.rowHeight, opts.overscan, opts.estimateHeight],
  );
  React.useLayoutEffect(() => {
    window.setCount(opts.count);
  }, [window, opts.count]);
  React.useLayoutEffect(() => window.start(), [window]);
  const range = useSyncStore(window.range$);
  const offsetTop = useSyncStore(window.offsetTop$);
  const totalHeight = useSyncStore(window.totalHeight$);
  const firstVisible = useSyncStore(window.firstVisible$);
  return {range, offsetTop, totalHeight, firstVisible, scrollToIndex: window.scrollToIndex, window};
};
