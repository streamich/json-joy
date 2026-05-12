import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {SliderHandle} from '../../1-inline/SliderHandle';

const {useState, useCallback, useRef} = React;

const blockClass = rule({
  pos: 'relative',
  d: 'inline-flex',
  ai: 'center',
  us: 'none',
  w: '100%',
});

const railClass = rule({
  pos: 'relative',
  flex: 1,
  h: '7px',
  bdrad: '7px',
  // cur: 'pointer',
  cur: 'text',
});

const railHitAreaClass = rule({
  pos: 'absolute',
  top: '-10px',
  right: 0,
  bottom: '-10px',
  left: 0,
  bg: 'transparent',
});

const rangeClass = rule({
  pos: 'absolute',
  h: '7px',
  bdrad: '7px',
  top: 0,
  left: 0,
  pe: 'none',
  trs: 'background-color 100ms',
});

const handleButtonClass = rule({
  pos: 'absolute',
  top: '50%',
  bd: 0,
  pad: 0,
  bg: 'transparent',
  out: 'none',
  cur: 'ew-resize',
  transform: 'translate(-50%, -50%)',
  zIndex: 2,
  '&:active': {
    cur: 'grabbing',
  },
});

const valueClass = rule({
  fz: '12px',
  fw: 500,
  minWidth: '32px',
  ta: 'end',
  us: 'none',
  marginInlineStart: '10px',
});

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const snap = (value: number, min: number, step: number): number => {
  const steps = Math.round((value - min) / step);
  return min + steps * step;
};

const formatValue = (value: number, step: number): string => {
  if (step >= 1) return String(Math.round(value));
  const decimals = String(step).split('.')[1]?.length ?? 0;
  return value.toFixed(decimals);
};

export interface SliderProps {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showValue?: boolean;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  style?: React.CSSProperties;
}

export const Slider: React.FC<SliderProps> = (props) => {
  const {value = 0, min = 0, max = 100, step = 1, disabled, showValue, onChange, onChangeEnd, style} = props;
  const styles = useStyles();
  const railRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState(false);
  const callbackRef = useRef({onChange, onChangeEnd});
  callbackRef.current = {onChange, onChangeEnd};

  const ratio = max > min ? clamp((value - min) / (max - min), 0, 1) : 0;
  const pct = ratio * 100;

  const resolve = useCallback(
    (clientX: number): number => {
      const el = railRef.current;
      if (!el) return value;
      const rect = el.getBoundingClientRect();
      const raw = (clientX - rect.left) / rect.width;
      const clamped = clamp(raw, 0, 1);
      const mapped = min + clamped * (max - min);
      return snap(mapped, min, step);
    },
    [min, max, step, value],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setDragging(true);
      const v = resolve(e.clientX);
      callbackRef.current.onChange?.(v);
    },
    [disabled, resolve],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const v = resolve(e.clientX);
      callbackRef.current.onChange?.(v);
    },
    [dragging, resolve],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      setDragging(false);
      const v = resolve(e.clientX);
      callbackRef.current.onChangeEnd?.(v);
    },
    [dragging, resolve],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      let next: number | undefined;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          next = clamp(value + step, min, max);
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          next = clamp(value - step, min, max);
          break;
        case 'Home':
          next = min;
          break;
        case 'End':
          next = max;
          break;
        default:
          return;
      }
      e.preventDefault();
      onChange?.(next);
      onChangeEnd?.(next);
    },
    [disabled, value, step, min, max, onChange, onChangeEnd],
  );

  const active = hover || dragging;
  const light = styles.light;
  const railBg = light ? '#c0c0c0' : '#565656';
  const railShadow = 'inset 0 0 4px rgba(0,0,0,0.9)';
  const rangeBg = active ? styles.col.get('accent', 'solid-1') : styles.col.get('link', 'solid-1');
  const rangeShadow = `inset 0 0 4px ${light ? 'rgba(0,85,151,0.5)' : 'rgba(0,85,151,0.8)'}, inset 0 0 2px rgba(0,0,0,0.5)`;

  const railStyle: React.CSSProperties = {
    background: railBg,
    boxShadow: `0 1px 0 rgba(255,255,255,0.25), ${railShadow}`,
    opacity: disabled ? 0.5 : 1,
  };

  const rangeStyle: React.CSSProperties = {
    width: pct + '%',
    background: rangeBg,
    boxShadow: rangeShadow,
  };

  const handleButtonStyle: React.CSSProperties = {
    left: pct + '%',
  };

  return (
    <div className={blockClass} style={style}>
      <div
        ref={railRef}
        className={railClass}
        style={railStyle}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className={railHitAreaClass} aria-hidden="true" />
        <div className={rangeClass} style={rangeStyle} />
        <button
          type="button"
          className={handleButtonClass}
          style={handleButtonStyle}
          onKeyDown={onKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-disabled={disabled || undefined}
        >
          <SliderHandle dragging={dragging} disabled={disabled} />
        </button>
      </div>
      {showValue && (
        <span className={valueClass} style={{color: styles.g(0.3)}}>
          {formatValue(value, step)}
        </span>
      )}
    </div>
  );
};
