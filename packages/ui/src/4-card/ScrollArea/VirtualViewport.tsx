import {rule} from 'nano-theme';
import * as React from 'react';
import {useSyncStore} from '../../hooks/useSyncStore';
import {useScrollArea} from './context';
import type {VirtualWindow} from './VirtualWindow';
import {useVirtual} from './VirtualWindow';

const wrapClass = rule({
  fl: '1',
  pos: 'relative',
  ov: 'hidden',
});

const viewportClass = rule({
  w: '100%',
  h: '100%',
  bxz: 'border-box',
  ovy: 'scroll',
  scrollbarWidth: 'none',
  MsOverflowStyle: 'none',
  '&::-webkit-scrollbar': {
    d: 'none',
  },
});

// The canvas is the scroll element's `firstElementChild`; its `height` drives
// the native `scrollHeight`, which `ScrollState`'s `ResizeObserver` tracks.
const canvasClass = rule({
  pos: 'relative',
  w: '100%',
});

const addCssLength = (base: number, inset: React.CSSProperties['paddingTop']): React.CSSProperties['paddingTop'] => {
  if (inset === undefined) return base || undefined;
  if (typeof inset === 'number') return base + inset;
  if (!base) return inset;
  return `calc(${base}px + ${inset})`;
};

export interface VirtualViewportProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Number of items to virtualize. Index-based by design: there is no `items`
   * array to materialize, so a virtual list of millions costs no up-front
   * allocation. Consumers that already hold an array simply close over it in
   * {@link children}.
   */
  count: number;
  /**
   * Row height, which selects the mode:
   *
   * - **`number`** — uniform fixed-height fast path.
   * - **`(index) => height`** — static variable heights (memoize it).
   * - **omitted** — dynamic measured mode: each rendered row is wrapped in a
   *   measured container and its real height is discovered via `ResizeObserver`,
   *   seeded from {@link estimateHeight}. Rows should use padding (not margin) so
   *   their measured box is accurate.
   */
  rowHeight?: number | ((index: number) => number);
  /** Extra rows rendered above and below the visible window. Default: 8. */
  overscan?: number;
  /** Measured mode: per-row height guess used until a row is measured. Default: 32. */
  estimateHeight?: number;
  /** Render one item by index. Provide a stable `key` for reconciliation. */
  children: (index: number) => React.ReactNode;
  /** Receive the underlying window for imperative control (e.g. `scrollToIndex`). */
  windowRef?: (window: VirtualWindow) => void;
}

/**
 * Measured-mode row wrapper: observes its element so the window learns the row's
 * real height, and stops observing on unmount. Keyed by index, so React mounts/
 * unmounts exactly the rows entering/leaving the window.
 */
const RowMeasure: React.FC<{index: number; window: VirtualWindow; children: React.ReactNode}> = ({
  index,
  window: win,
  children,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    win.measure(index, el);
    return () => win.unmeasure(el);
  }, [index, win]);
  return <div ref={ref}>{children}</div>;
};

/**
 * Convenience render-prop component built on {@link useVirtual}. Renders the
 * native scroll element with a single canvas `<div>` sized to the total content
 * height as its `firstElementChild` (so `ScrollState` reports an accurate
 * `scrollHeight`), and renders only the windowed slice, offset into place with a
 * GPU-cheap `translateY`.
 *
 * Pass a numeric/function `rowHeight` for known heights, or omit it for dynamic
 * measured heights (see {@link VirtualViewportProps.rowHeight}).
 */
export const VirtualViewport: React.FC<VirtualViewportProps> = ({
  count,
  rowHeight,
  overscan,
  estimateHeight,
  children,
  windowRef,
  className,
  style,
  ...rest
}) => {
  const state = useScrollArea();
  const headerHeight = useSyncStore(state.headerHeight$);
  const footerHeight = useSyncStore(state.footerHeight$);
  const v = useVirtual(state, {count, rowHeight, overscan, estimateHeight});
  const {start, end} = v.range;

  const win = v.window;
  React.useLayoutEffect(() => {
    windowRef?.(win);
  }, [win, windowRef]);

  const measured = rowHeight === undefined;
  const rendered: React.ReactNode[] = [];
  for (let i = start; i <= end; i++) {
    rendered.push(
      measured ? (
        <RowMeasure key={i} index={i} window={win}>
          {children(i)}
        </RowMeasure>
      ) : (
        children(i)
      ),
    );
  }

  const {paddingTop, paddingBottom, ...restStyle} = style ?? {};

  return (
    <div className={wrapClass}>
      <div
        {...rest}
        ref={state.setViewport}
        className={viewportClass + (className ? ' ' + className : '')}
        style={{
          paddingTop: addCssLength(headerHeight, paddingTop),
          paddingBottom: addCssLength(footerHeight, paddingBottom),
          // Let the window own scroll anchoring during measured remeasures.
          overflowAnchor: measured ? 'none' : undefined,
          ...restStyle,
        }}
      >
        <div className={canvasClass} style={{height: v.totalHeight}}>
          <div style={{transform: `translateY(${v.offsetTop}px)`}}>{rendered}</div>
        </div>
      </div>
    </div>
  );
};
