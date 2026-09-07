import {rule} from 'nano-theme';
import * as React from 'react';
import {Split} from '../../3-list-item/Split';
import {fonts} from '../../styles';
import {useStyles} from '../../styles/context';
import {Outline} from '../Outline';
import {SpinnerBars} from '../SpinnerBars';

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
});

const textareaClass = rule({
  resize: 'none',
});

const {useState, useCallback, useRef, useEffect, useLayoutEffect} = React;
const noop = () => {};

export interface InputProps {
  disabled?: boolean;
  /** Paint the outline in the error color, e.g. after a failed validation. */
  invalid?: boolean;
  type?: 'text' | 'password' | 'email' | 'number' | 'color';
  value?: string;
  placeholder?: string;
  label?: string;
  focus?: boolean;
  select?: boolean;
  readOnly?: boolean;
  size?: number;
  isInForm?: boolean;
  style?: any;
  waiting?: boolean;
  center?: boolean;
  align?: 'left' | 'center' | 'right';
  ghost?: boolean | 'hint';
  multiline?: boolean;
  /** Minimum visible rows in multiline mode. */
  rows?: number;
  /** Rows after which a multiline input stops growing and scrolls. */
  maxRows?: number;
  mono?: boolean;
  right?: React.ReactNode;
  inp?: (input: HTMLInputElement | null) => void;
  onChange?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onPaste?: () => void;
  onEsc?: React.KeyboardEventHandler;
  onEnter?: React.KeyboardEventHandler;
  onSubmit?: React.KeyboardEventHandler;
  onKeyDown?: React.KeyboardEventHandler;
}

export const Input: React.FC<InputProps> = (props) => {
  const {
    disabled,
    invalid,
    value,
    placeholder,
    onPaste,
    onEsc,
    onEnter,
    onSubmit,
    label,
    size,
    readOnly,
    type = 'text',
    waiting,
    center,
    align,
    ghost,
    right,
    multiline,
    rows,
    maxRows,
    mono,
    onChange,
    onKeyDown,
  } = props;
  const [focus, setFocus] = useState(false);
  const ref = useRef<HTMLInputElement | null>(null);
  const styles = useStyles();

  useEffect(() => {
    if (!ref.current) return;
    if (props.focus || props.select) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (ref.current) {
            if (props.focus) ref.current.focus();
            if (props.select) ref.current.select();
          }
        });
      });
    }
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
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!ref.current) return;
      if (props.isInForm && e.key === 'Enter') {
        ref.current.blur();
      } else if (e.key === 'Escape') onEsc?.(e);
      // In multiline mode plain Enter inserts a newline; Cmd/Ctrl+Enter submits.
      else if (e.key === 'Enter' && (!multiline || e.metaKey || e.ctrlKey)) (onEnter || onSubmit)?.(e);
      else onKeyDown?.(e);
    },
    [onEsc, onEnter, onSubmit, onKeyDown, props.isInForm, multiline],
  );

  // Auto-grow the textarea with content
  useLayoutEffect(() => {
    const el = ref.current;
    if (!multiline || !el) return;
    const resize = () => {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    };
    if (el.scrollHeight) resize();
    else requestAnimationFrame(() => requestAnimationFrame(resize));
  }, [multiline, value]);

  let rightElement: React.ReactNode = null;

  if (right) {
    rightElement = right;
  } else if (waiting) {
    rightElement = <SpinnerBars />;
  }

  const placeholderActive = value !== undefined && !value && !!placeholder;
  const style: React.CSSProperties = {
    color: placeholderActive ? styles.g(0.6) : styles.g(0.1),
  };

  if (mono) {
    style.fontFamily = fonts.get('mono').ff;
  }

  if (size) {
    const factor = size < 0 ? 1 : 2;
    style.fontSize = `${16 + size * factor}px`;
    if (size < 0) {
      style.fontWeight = fonts.get('ui', 'mid', 1).fw;
    }
  }

  if (align) {
    style.textAlign = align;
  } else if (center) {
    style.textAlign = 'center';
  }

  if (multiline) {
    style.minHeight = `${Math.round((rows ?? 2) * 1.4 * 10) / 10}em`;
    if (maxRows) style.maxHeight = `${Math.round(maxRows * 1.4 * 10) / 10}em`;
  }

  const inputAttr: any = {
    ref: (input: HTMLInputElement | null) => {
      ref.current = input;
      props.inp?.(input);
    },
    className: inpClass + (multiline ? textareaClass : ''),
    style,
    disabled,
    value,
    placeholder: placeholder || '',
    readOnly,
    onFocus,
    onBlur,
    onKeyDown: handleKeyDown,
    onPaste,
  };

  if (multiline) inputAttr.rows = rows ?? 2;
  else inputAttr.type = type;

  return (
    <Outline
      label={label}
      active={focus}
      invalid={invalid}
      disabled={disabled || readOnly}
      size={size}
      center={center}
      ghost={ghost}
      onClick={() => {
        if (ref.current) ref.current.focus();
      }}
    >
      <Split style={{alignItems: multiline ? 'flex-start' : 'center'}}>
        {React.createElement(multiline ? 'textarea' : 'input', {
          ...inputAttr,
          onChange: onChange ? (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value) : undefined,
        })}
        {rightElement}
      </Split>
    </Outline>
  );
};
