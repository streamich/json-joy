import * as React from 'react';
import {rule} from 'nano-theme';
import {SpinnerBars} from '../SpinnerBars';
import {Outline} from '../Outline';
import {Split} from '../../3-list-item/Split';
import {fonts} from '../../styles';
import {useStyles} from '../../styles/context';

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

const {useState, useCallback, useRef, useEffect} = React;
const noop = () => {};

export interface InputProps {
  disabled?: boolean;
  type?: 'text' | 'password' | 'email' | 'number';
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
  multiline?: boolean;
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
    right,
    multiline,
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
      else if (e.key === 'Enter') (onEnter || onSubmit)?.(e);
      else onKeyDown?.(e);
    },
    [onEsc, onEnter, onSubmit, onKeyDown, props.isInForm],
  );

  let rightElement: React.ReactNode = null;

  if (right) {
    rightElement = right;
  } else if (waiting) {
    rightElement = <SpinnerBars />;
  }

  const style: React.CSSProperties = {
    color: value !== undefined && !value && !!placeholder ? styles.g(0.6) : styles.g(0.1),
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

  if (center) {
    style.textAlign = 'center';
  }

  const inputAttr: any = {
    ref: (input: HTMLInputElement | null) => {
      ref.current = input;
      props.inp?.(input);
    },
    className: inpClass,
    style,
    disabled,
    value,
    placeholder: placeholder || '',
    type,
    readOnly,
    onFocus,
    onBlur,
    onKeyDown: handleKeyDown,
    onPaste,
  };

  return (
    <Outline
      label={label}
      active={focus}
      disabled={disabled || readOnly}
      size={size}
      center={center}
      onClick={() => {
        if (ref.current) ref.current.focus();
      }}
    >
      <Split style={{alignItems: 'center'}}>
        {React.createElement(multiline ? 'textarea' : 'input', {
          ...inputAttr,
          onChange: onChange ? (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value) : undefined,
        })}
        {rightElement}
      </Split>
    </Outline>
  );
};
