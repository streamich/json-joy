import * as React from 'react';
import {rule} from 'nano-theme';
import {Iconista} from '../../icons/Iconista';
import {Input, type InputProps} from '../Input';
import {BasicButton, type BasicButtonProps} from '../BasicButton';
import {DragSlider, type DragAxis} from '../../1-inline/DragSlider';
import {DragSliderHandle} from '../../1-inline/DragSlider/DragSliderHandle';

const blockClass = rule({
  d: 'inline-flex',
  ai: 'center',
  gap: '4px',
  vAlign: 'middle',
});

const inputWrapClass = rule({
  flex: '1 1 auto',
  minWidth: 0,
  'input[type=number]': {
    '-moz-appearance': 'textfield',
  },
  'input[type=number]::-webkit-inner-spin-button': {
    '-webkit-appearance': 'none',
    mar: 0,
  },
  'input[type=number]::-webkit-outer-spin-button': {
    '-webkit-appearance': 'none',
    mar: 0,
  },
});

const clamp = (n: number, min: number | undefined, max: number | undefined): number => {
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
};

const decimalsOf = (step: number): number => {
  if (!Number.isFinite(step)) return 0;
  const s = String(step);
  const dot = s.indexOf('.');
  return dot < 0 ? 0 : s.length - dot - 1;
};

const round = (n: number, decimals: number): number => {
  if (decimals <= 0) return Math.round(n);
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
};

export interface InputNumberProps {
  value?: number;
  /**
   * Fires for every value change — typing, clicking the +/- buttons, AND
   * during a drag scrub (one event per drag move). Use this when the
   * consumer wants real-time updates.
   */
  onChange?: (value: number) => void;
  /**
   * Fires only when a value change is "committed" — i.e. the drag handle is
   * released, the +/- buttons are clicked, or the input is blurred after
   * typing. Subscribe to this (and not to `onChange`) when you want to
   * persist values without receiving every intermediate scrub update.
   * Not fired when a drag is cancelled with ESC.
   */
  onChangeEnd?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Round committed values to this many decimal places. */
  decimals?: number;
  disabled?: boolean;
  /** Show a small drag handle inside the input frame for scrub-to-edit. */
  drag?: boolean;
  /** Drag axis that drives the value. Default `'x'`. Use `'y'` for vertical scrub. */
  dragAxis?: DragAxis;
  /** Units of value change per pixel of drag. */
  dragSensitivity?: number;
  /**
   * Custom drag handle node. Defaults to a small `DragSliderHandle` bar.
   * Pass a `SliderHandle` (or any node) to swap the visual.
   */
  dragHandle?: React.ReactNode;
  /** Hide the small dot drawn at the drag start position. */
  dragHideStartDot?: boolean;
  /** Diameter of the drag-start dot in pixels. Default `7`. */
  dragStartDotSize?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Props forwarded to the inner `<Input>`. */
  inputProps?: Omit<InputProps, 'value' | 'onChange' | 'type' | 'disabled'>;
  /** Props forwarded to both minus and plus `<BasicButton>`s. */
  buttonProps?: Omit<BasicButtonProps, 'onClick' | 'disabled' | 'children'>;
}

export const InputNumber: React.FC<InputNumberProps> = ({
  value,
  onChange,
  onChangeEnd,
  min,
  max,
  step = 1,
  decimals: decimalsProp,
  disabled,
  drag,
  dragAxis,
  dragSensitivity,
  dragHandle,
  dragHideStartDot,
  dragStartDotSize,
  className,
  style,
  inputProps,
  buttonProps,
}) => {
  const decimals = decimalsProp ?? decimalsOf(step);
  const numeric = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  const [text, setText] = React.useState<string>(value === undefined ? '' : String(numeric));
  const lastEmittedRef = React.useRef<number | undefined>(value);

  React.useEffect(() => {
    if (value === lastEmittedRef.current) return;
    lastEmittedRef.current = value;
    setText(value === undefined ? '' : String(value));
  }, [value]);

  const emit = (next: number): number => {
    const clamped = round(clamp(next, min, max), decimals);
    lastEmittedRef.current = clamped;
    setText(String(clamped));
    onChange?.(clamped);
    return clamped;
  };

  const commit = (next: number): number => {
    const clamped = emit(next);
    onChangeEnd?.(clamped);
    return clamped;
  };

  const dec = () => commit(numeric - step);
  const inc = () => commit(numeric + step);

  const handleChange = (raw: string) => {
    setText(raw);
    if (raw === '' || raw === '-' || raw === '.') return;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    const clamped = round(clamp(parsed, min, max), decimals);
    lastEmittedRef.current = clamped;
    onChange?.(clamped);
  };

  const commitText = () => {
    const parsed = text === '' || !Number.isFinite(Number(text)) ? numeric : Number(text);
    const final = round(clamp(parsed, min, max), decimals);
    setText(String(final));
    lastEmittedRef.current = final;
    onChangeEnd?.(final);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    commitText();
    inputProps?.onBlur?.(e);
  };

  const handleEnter = (e: React.KeyboardEvent) => {
    commitText();
    inputProps?.onEnter?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      inc();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      dec();
    } else {
      inputProps?.onKeyDown?.(e);
    }
  };

  const atMin = min !== undefined && numeric <= min;
  const atMax = max !== undefined && numeric >= max;

  const defaultSensitivity =
    typeof min === 'number' && typeof max === 'number' ? Math.max(step, (max - min) / 200) : step;
  const sensitivity = dragSensitivity ?? defaultSensitivity;

  const formatDrag = React.useCallback(
    (v: number) => {
      const clamped = round(clamp(v, min, max), decimals);
      return decimals > 0 ? clamped.toFixed(decimals) : String(clamped);
    },
    [min, max, decimals],
  );

  // Start a new drag from whatever the input currently shows — handles the
  // case where the consumer subscribed only to `onChangeEnd` (so `value` is
  // still stale from the previous commit) but the input already displays a
  // newer typed/dragged value.
  const numericLive = React.useMemo(() => {
    const parsed = Number(text);
    return Number.isFinite(parsed) ? parsed : numeric;
  }, [text, numeric]);

  const handleDragEnd = React.useCallback(
    (final: number, cancelled: boolean) => {
      if (cancelled) {
        // Restore the display to the consumer's committed value.
        const restore = round(clamp(numeric, min, max), decimals);
        setText(String(restore));
        lastEmittedRef.current = restore;
        onChange?.(restore);
      } else {
        const rounded = round(clamp(final, min, max), decimals);
        setText(String(rounded));
        lastEmittedRef.current = rounded;
        onChangeEnd?.(rounded);
      }
    },
    [numeric, min, max, decimals, onChange, onChangeEnd],
  );

  const dragRight = drag ? (
    <DragSlider
      value={numericLive}
      onChange={emit}
      onEnd={handleDragEnd}
      min={min}
      max={max}
      step={step}
      sensitivity={sensitivity}
      axis={dragAxis}
      format={formatDrag}
      disabled={disabled}
      hideStartDot={dragHideStartDot}
      startDotSize={dragStartDotSize}
      style={{marginRight: -4}}
    >
      {dragHandle ?? <DragSliderHandle disabled={disabled} />}
    </DragSlider>
  ) : (
    inputProps?.right
  );

  return (
    <span className={blockClass + (className ? ' ' + className : '')} style={style}>
      <BasicButton {...buttonProps} disabled={disabled || atMin} title="Decrease" onClick={dec}>
        <Iconista set="tabler" icon="minus" width={16} height={16} />
      </BasicButton>
      <span className={inputWrapClass}>
        <Input
          align="center"
          {...inputProps}
          type="number"
          value={text}
          disabled={disabled}
          onChange={handleChange}
          onBlur={handleBlur}
          onEnter={handleEnter}
          onKeyDown={handleKeyDown}
          right={dragRight}
        />
      </span>
      <BasicButton {...buttonProps} disabled={disabled || atMax} title="Increase" onClick={inc}>
        <Iconista set="tabler" icon="plus" width={16} height={16} />
      </BasicButton>
    </span>
  );
};
