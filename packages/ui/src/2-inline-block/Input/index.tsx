import * as React from 'react';
import {rule} from 'nano-theme';
import {SpinnerBars} from '../SpinnerBars';
import {NotchedOutline} from '../NotchedOutline';
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
  pd: '4px 5px',
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
  value?: string;
  placeholder?: string;
  label?: string;
  type?: 'text' | 'password' | 'email';
  focus?: boolean;
  select?: boolean;
  readOnly?: boolean;
  size?: number;
  isInForm?: boolean;
  style?: any;
  waiting?: boolean;
  center?: boolean;
  right?: React.ReactNode;
  inp?: (input: HTMLInputElement | null) => void;
  onChange?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onPaste?: () => void;
  onEsc?: React.KeyboardEventHandler;
  onEnter?: React.KeyboardEventHandler;
}

export const Input: React.FC<InputProps> = (props) => {
  const {
    disabled,
    value = '',
    placeholder,
    onPaste,
    onEsc,
    onEnter,
    label,
    size,
    readOnly,
    type = 'text',
    waiting,
    center,
    right,
  } = props;
  const [focus, setFocus] = useState(false);
  const ref = useRef<HTMLInputElement | null>(null);
  const styles = useStyles();

  useEffect(() => {
    if (!ref.current) return;
    if (!props.focus) return;
    if (props.focus) ref.current.focus();
    if (props.select) ref.current.select();
  }, [ref.current]);

  const onFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setFocus(true);
    (props.onFocus || noop)(e);
  }, [props.onFocus]);
  const onBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setFocus(false);
    (props.onBlur || noop)(e);
  }, [props.onBlur]);
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!ref.current) return;
      if (props.isInForm && e.key === 'Enter') {
        ref.current.blur();
      } else if (e.key === 'Escape') onEsc?.(e);
      else if (e.key === 'Enter') onEnter?.(e);
    },
    [ref.current],
  );

  let rightElement: React.ReactNode = null;

  if (right) {
    rightElement = right;
  } else if (waiting) {
    rightElement = <SpinnerBars />;
  }

  const style: React.CSSProperties = {
    color: !value && !!placeholder ? styles.g(0.6) : styles.g(0.1),
  };

  const outlineStyle: React.CSSProperties = {background: focus ? styles.col.map('bg') : 'transparent'};

  if (size) {
    const factor = size < 0 ? 1 : 2;
    style.fontSize = `${16 + size * factor}px`;
    style.paddingTop = `${4 + size * factor}px`;
    style.paddingBottom = `${4 + size * factor}px`;
    if (size < 0) {
      style.fontWeight = fonts.get('ui', 'mid', 1).fw;
      style.paddingTop = style.paddingBottom = Math.max(4 + size, 1) + 'px';
      style.paddingLeft = style.paddingRight = Math.max(5 + size, 0) + 'px';
      outlineStyle.paddingLeft = outlineStyle.paddingRight = Math.max(5 + size, 0) + 'px';
    }
  }

  if (center) {
    style.textAlign = 'center';
    outlineStyle.textAlign = 'center';
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
    onKeyDown,
    onPaste,
  };

  return (
    <NotchedOutline
      label={label}
      active={focus}
      disabled={disabled || readOnly}
      style={outlineStyle}
      onClick={() => {
        if (ref.current) ref.current.focus();
      }}
    >
      <Split style={{alignItems: 'center'}}>
        <input {...inputAttr} onChange={(e) => (props.onChange || noop)(e.target.value)} />
        {rightElement}
      </Split>
    </NotchedOutline>
  );
};
