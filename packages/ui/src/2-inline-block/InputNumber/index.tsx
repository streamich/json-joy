import * as React from 'react';
import {rule} from 'nano-theme';
import {Iconista} from '../../icons/Iconista';
import {Input, type InputProps} from '../Input';
import {BasicButton, type BasicButtonProps} from '../BasicButton';

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
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
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
  min,
  max,
  step = 1,
  disabled,
  className,
  style,
  inputProps,
  buttonProps,
}) => {
  const decimals = decimalsOf(step);
  const numeric = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  const [text, setText] = React.useState<string>(value === undefined ? '' : String(numeric));
  const lastEmittedRef = React.useRef<number | undefined>(value);

  React.useEffect(() => {
    if (value === lastEmittedRef.current) return;
    lastEmittedRef.current = value;
    setText(value === undefined ? '' : String(value));
  }, [value]);

  const emit = (next: number) => {
    const clamped = round(clamp(next, min, max), decimals);
    lastEmittedRef.current = clamped;
    setText(String(clamped));
    onChange?.(clamped);
  };

  const dec = () => emit(numeric - step);
  const inc = () => emit(numeric + step);

  const handleChange = (raw: string) => {
    setText(raw);
    if (raw === '' || raw === '-' || raw === '.') return;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    const clamped = round(clamp(parsed, min, max), decimals);
    lastEmittedRef.current = clamped;
    onChange?.(clamped);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (text === '' || !Number.isFinite(Number(text))) {
      const fallback = clamp(numeric, min, max);
      setText(String(fallback));
    } else {
      const clamped = round(clamp(Number(text), min, max), decimals);
      setText(String(clamped));
    }
    inputProps?.onBlur?.(e);
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

  return (
    <span className={blockClass + (className ? ' ' + className : '')} style={style}>
      <BasicButton
        {...buttonProps}
        disabled={disabled || atMin}
        title="Decrease"
        onClick={dec}
      >
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
          onKeyDown={handleKeyDown}
        />
      </span>
      <BasicButton
        {...buttonProps}
        disabled={disabled || atMax}
        title="Increase"
        onClick={inc}
      >
        <Iconista set="tabler" icon="plus" width={16} height={16} />
      </BasicButton>
    </span>
  );
};
