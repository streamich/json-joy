import {rule, useTheme} from 'nano-theme';
import * as React from 'react';
import {fonts} from '../../styles';
import {useStyles} from '../../styles/context';
import {Outline} from '../Outline';

const inpClass = rule({
  ...fonts.get('ui', 'bold', 1),
  fz: '15px',
  lh: '1.4em',
  d: 'block',
  w: '100%',
  bxz: 'border-box',
  bd: 0,
  bdrad: '4px',
  mr: 0,
  pd: 0,
  out: 0,
  bg: 'transparent',
  '&:disabled': {
    bg: 'transparent',
  },
  '&::-webkit-calendar-picker-indicator': {
    cur: 'pointer',
    op: 0.5,
  },
  '&::-webkit-calendar-picker-indicator:hover': {
    op: 1,
  },
});

const {useState, useCallback, useRef, useEffect} = React;
const noop = () => {};

export interface InputDateProps {
  disabled?: boolean;
  /** Paint the outline in the error color, e.g. after a failed validation. */
  invalid?: boolean;
  /** ISO value: `YYYY-MM-DD`, or `YYYY-MM-DDTHH:mm` when `time`. Empty string when unset. */
  value?: string;
  /** Edit date and time (a `datetime-local` input) instead of a calendar date. */
  time?: boolean;
  /** Inclusive ISO bounds, same format as `value`. */
  min?: string;
  max?: string;
  label?: string;
  focus?: boolean;
  readOnly?: boolean;
  size?: number;
  ghost?: boolean | 'hint';
  inp?: (input: HTMLInputElement | null) => void;
  onChange?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onEsc?: React.KeyboardEventHandler;
  onEnter?: React.KeyboardEventHandler;
}

/**
 * Native `<input type="date">` / `datetime-local` in the standard input
 * chrome (`Outline`). Values are ISO 8601 local strings — exactly what the
 * native input speaks. Clicking the box (outside the input itself) opens the
 * native picker via `showPicker()`; typing into the segments works as usual.
 */
export const InputDate: React.FC<InputDateProps> = (props) => {
  const {disabled, invalid, value, time, min, max, label, size, readOnly, ghost, onChange, onEsc, onEnter} = props;
  const [focus, setFocus] = useState(false);
  const ref = useRef<HTMLInputElement | null>(null);
  const styles = useStyles();
  const theme = useTheme();

  useEffect(() => {
    if (!ref.current || !props.focus) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => ref.current?.focus());
    });
  }, [ref.current]);

  const onFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setFocus(true);
      (props.onFocus || noop)(e);
    },
    [props.onFocus],
  );
  const onBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setFocus(false);
      (props.onBlur || noop)(e);
    },
    [props.onBlur],
  );
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onEsc?.(e);
      else if (e.key === 'Enter') onEnter?.(e);
    },
    [onEsc, onEnter],
  );

  const style: React.CSSProperties = {
    color: value ? styles.g(0.1) : styles.g(0.6),
    // The native picker popup and indicator follow the input's color-scheme.
    colorScheme: theme.isLight ? 'light' : 'dark',
  };
  if (size) {
    const factor = size < 0 ? 1 : 2;
    style.fontSize = `${16 + size * factor}px`;
    if (size < 0) style.fontWeight = fonts.get('ui', 'mid', 1).fw;
  }

  return (
    <Outline
      label={label}
      active={focus}
      invalid={invalid}
      disabled={disabled || readOnly}
      size={size}
      ghost={ghost}
      onClick={(e) => {
        const el = ref.current;
        if (!el || disabled || readOnly) return;
        // Clicks inside the input keep native segment behavior; clicks on the
        // surrounding chrome focus it and open the native picker.
        if (e.target !== e.currentTarget) return;
        el.focus();
        try {
          el.showPicker?.();
        } catch {}
      }}
    >
      <input
        ref={(input) => {
          ref.current = input;
          props.inp?.(input);
        }}
        className={inpClass}
        style={style}
        type={time ? 'datetime-local' : 'date'}
        value={value ?? ''}
        min={min}
        max={max}
        disabled={disabled}
        readOnly={readOnly}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      />
    </Outline>
  );
};
