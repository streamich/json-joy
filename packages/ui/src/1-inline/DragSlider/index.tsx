import * as React from 'react';
import {createPortal} from 'react-dom';
import {rule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {DragSliderContext} from './context';

export {DragSliderContext, useDragSliderState} from './context';
export type {DragSliderContextValue} from './context';

const wrapperClass = rule({
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  ts: 'none',
  us: 'none',
  '-webkit-touch-callout': 'none',
  touchAction: 'none',
});

const overlayClass = rule({
  pos: 'fixed',
  top: 0,
  left: 0,
  w: '100vw',
  h: '100vh',
  pe: 'none',
  z: 2147483647,
});

const svgClass = rule({
  pos: 'absolute',
  top: 0,
  left: 0,
  w: '100%',
  h: '100%',
  ov: 'visible',
});

const tooltipClass = rule({
  pos: 'absolute',
  pd: '3px 8px',
  bdrad: '4px',
  fz: '12px',
  lh: '1',
  ff: '"SF Mono", ui-monospace, Menlo, Consolas, monospace',
  whiteSpace: 'nowrap',
  fw: 600,
  bxsh: '0 2px 8px rgba(0,0,0,.18)',
  transform: 'translate(-50%, -100%)',
});

export type DragAxis = 'x' | 'y' | 'both';

/**
 * Visual line direction in the overlay.
 *
 * - `'free'` (default): line follows the real pointer position (diagonal).
 * - `'x'`: line is fixed horizontal — only the X delta is drawn.
 * - `'y'`: line is fixed vertical — only the Y delta is drawn.
 */
export type DragLineAxis = 'x' | 'y' | 'free';

export interface DragSliderProps {
  /** Current numeric value. */
  value: number;
  /** Called continuously with the next value during a drag. */
  onChange: (value: number) => void;
  /** Called once when a drag begins. */
  onStart?: (value: number) => void;
  /** Called once when a drag ends (release or ESC). `cancelled` is true when ESC was used. */
  onEnd?: (value: number, cancelled: boolean) => void;

  /** Optional inclusive lower bound for `value`. */
  min?: number;
  /** Optional inclusive upper bound for `value`. */
  max?: number;
  /** Snap the value to this step. `0` means no snapping. */
  step?: number;
  /** Units of value change per drag pixel. Default `1`. */
  sensitivity?: number;
  /** Which axis drives the value. Default `'x'` (right = increase, left = decrease). */
  axis?: DragAxis;
  /** Constrain the overlay line direction. Defaults to follow `axis`. */
  lineAxis?: DragLineAxis;
  /** Format the value shown in the floating tooltip. */
  format?: (value: number) => string;
  /** Hide the floating tooltip. */
  hideTooltip?: boolean;
  /** Hide the small dot drawn at the drag start position. */
  hideStartDot?: boolean;
  /** Diameter of the drag-start dot in pixels. Default `7`. */
  startDotSize?: number;

  /** Cursor shown over the handle. Defaults based on `axis`. */
  cursor?: React.CSSProperties['cursor'];
  /** Disable the drag interaction. */
  disabled?: boolean;

  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const defaultFormat = (value: number): string => {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2);
};

const snap = (v: number, step: number): number => Math.round(v / step) * step;

interface DragOverlayProps {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  lineAxis: DragLineAxis;
  label?: string;
  showStartDot?: boolean;
  startDotSize?: number;
}

const DragOverlay: React.FC<DragOverlayProps> = ({
  startX,
  startY,
  currentX,
  currentY,
  lineAxis,
  label,
  showStartDot = true,
  startDotSize = 7,
}) => {
  const styles = useStyles();
  const accent = styles.col.get('accent', 'solid-1');
  const tooltipFg = styles.light ? '#fff' : styles.g(0.04);

  const tipX = lineAxis === 'y' ? startX : currentX;
  const tipY = lineAxis === 'x' ? startY : currentY;

  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 0;
  const tooltipX = Math.min(Math.max(tipX, 36), Math.max(36, viewportW - 36));
  const tooltipY = Math.max(tipY - 14, 22);

  return (
    <div className={overlayClass}>
      <svg className={svgClass}>
        <defs>
          <marker
            id="json-joy-dragslider-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={accent} />
          </marker>
        </defs>
        <line
          x1={startX}
          y1={startY}
          x2={tipX}
          y2={tipY}
          stroke={accent}
          strokeWidth={1.5}
          strokeDasharray="3 4"
          markerEnd="url(#json-joy-dragslider-arrow)"
        />
        {showStartDot && startDotSize > 0 && (
          <circle cx={startX} cy={startY} r={startDotSize / 2} fill={accent} />
        )}
      </svg>
      {label !== undefined && !!label && (
        <div className={tooltipClass} style={{left: tooltipX, top: tooltipY, background: accent, color: tooltipFg}}>
          {label}
        </div>
      )}
    </div>
  );
};

const resolveLineAxis = (axis: DragAxis, lineAxis?: DragLineAxis): DragLineAxis => {
  if (lineAxis) return lineAxis;
  if (axis === 'x') return 'x';
  if (axis === 'y') return 'y';
  return 'free';
};

export const DragSlider: React.FC<DragSliderProps> = (props) => {
  const {
    value,
    onChange,
    onStart,
    onEnd,
    min,
    max,
    step = 0,
    sensitivity = 1,
    axis = 'x',
    lineAxis,
    format = defaultFormat,
    hideTooltip,
    hideStartDot,
    startDotSize,
    cursor,
    disabled,
    className,
    style,
    children,
  } = props;

  const ref = React.useRef<HTMLSpanElement | null>(null);
  const [drag, setDrag] = React.useState<{
    startX: number;
    startY: number;
    x: number;
    y: number;
    value: number;
  } | null>(null);

  const propsRef = React.useRef({
    onChange,
    onStart,
    onEnd,
    format,
    min,
    max,
    step,
    sensitivity,
    axis,
    lineAxis,
    value,
  });
  propsRef.current = {
    onChange,
    onStart,
    onEnd,
    format,
    min,
    max,
    step,
    sensitivity,
    axis,
    lineAxis,
    value,
  };

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      if (disabled || e.button !== 0) return;
      const el = ref.current;
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();

      const rect = el.getBoundingClientRect();
      const startX = rect.left + rect.width / 2;
      const startY = rect.top + rect.height / 2;
      const startValue = propsRef.current.value;

      let currentValue = startValue;

      try {
        el.setPointerCapture(e.pointerId);
      } catch {}

      propsRef.current.onStart?.(startValue);
      setDrag({startX, startY, x: e.clientX, y: e.clientY, value: startValue});

      const apply = (clientX: number, clientY: number): void => {
        const p = propsRef.current;
        const dx = clientX - startX;
        const dy = clientY - startY;
        const delta = p.axis === 'y' ? -dy : dx;
        let next = startValue + delta * p.sensitivity;
        if (p.step > 0) next = snap(next, p.step);
        if (typeof p.min === 'number') next = Math.max(p.min, next);
        if (typeof p.max === 'number') next = Math.min(p.max, next);
        if (next !== currentValue) {
          currentValue = next;
          p.onChange(next);
        }
        setDrag((prev) => (prev ? {...prev, x: clientX, y: clientY, value: next} : prev));
      };

      const handleMove = (ev: PointerEvent): void => {
        apply(ev.clientX, ev.clientY);
      };

      const cleanup = (): void => {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
        window.removeEventListener('pointercancel', handleUp);
        window.removeEventListener('keydown', handleKey);
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {}
        setDrag(null);
      };

      const handleUp = (): void => {
        propsRef.current.onEnd?.(currentValue, false);
        cleanup();
      };

      const handleKey = (ev: KeyboardEvent): void => {
        if (ev.key === 'Escape') {
          ev.preventDefault();
          ev.stopPropagation();
          propsRef.current.onChange(startValue);
          propsRef.current.onEnd?.(startValue, true);
          cleanup();
        }
      };

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
      window.addEventListener('pointercancel', handleUp);
      window.addEventListener('keydown', handleKey);
    },
    [disabled],
  );

  const resolvedCursor =
    disabled ? 'default' : cursor ?? (axis === 'y' ? 'ns-resize' : axis === 'both' ? 'move' : 'ew-resize');

  const isDragging = !!drag;
  const contextValue = React.useMemo<{dragging: boolean}>(() => ({dragging: isDragging}), [isDragging]);

  return (
    <>
      <span
        ref={ref}
        className={wrapperClass + (className ? ` ${className}` : '')}
        style={{cursor: resolvedCursor, ...style}}
        onPointerDown={handlePointerDown}
      >
        <DragSliderContext.Provider value={contextValue}>{children}</DragSliderContext.Provider>
      </span>
      {drag &&
        typeof document !== 'undefined' &&
        createPortal(
          <DragOverlay
            startX={drag.startX}
            startY={drag.startY}
            currentX={drag.x}
            currentY={drag.y}
            lineAxis={resolveLineAxis(axis, lineAxis)}
            label={hideTooltip ? undefined : format(drag.value)}
            showStartDot={!hideStartDot}
            startDotSize={startDotSize}
          />,
          document.body,
        )}
    </>
  );
};
