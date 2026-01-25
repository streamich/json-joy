import * as React from 'react';
import {rule} from 'nano-theme';
import {SpinnerBars} from '@jsonjoy.com/ui/lib/2-inline-block/SpinnerBars';
import {NotchedOutline} from '@jsonjoy.com/ui/lib/2-inline-block/NotchedOutline';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {fonts} from '@jsonjoy.com/ui/lib/styles';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';

const outlineClass = rule({
  pd: '0px !important',
});

const inpClass = rule({
  ...fonts.get('ui', 'bold', 1),
  fz: '15px',
  lh: '1.4em',
  d: 'block',
  w: '100%',
  bxz: 'border-box',
  bd: 0,
  mr: 0,
  out: 0,
  pd: '8px 10px',
  bdrad: '4px',
  bg: 'transparent',
  '&:disabled': {
    bg: 'transparent',
  },
  '&::placeholder': {
    opacity: 0.7,
  },
});

const {useState, useCallback, useRef, useEffect} = React;

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
  style?: any;
  waiting?: boolean;
  right?: React.ReactNode;
  inp?: (input: HTMLInputElement | null) => void;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  onPaste?: () => void;
  onEsc?: React.KeyboardEventHandler;
  onKeyDown?: React.KeyboardEventHandler;
}

export const Input: React.FC<InputProps> = (props) => {
  const {
    disabled,
    value,
    placeholder,
    onPaste,
    onEsc,
    onKeyDown,
    onChange,
    label,
    size,
    readOnly,
    type = 'text',
    waiting,
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

  const onFocus = useCallback(() => {
    setFocus(true);
    props.onFocus?.();
  }, [props.onFocus]);
  const onBlur = useCallback(() => {
    setFocus(false);
    props.onBlur?.();
  }, [props.onBlur]);

  let rightElement: React.ReactNode = null;

  if (right) {
    rightElement = right;
  } else if (waiting) {
    rightElement = <SpinnerBars />;
  }

  const style: React.CSSProperties = {};

  if (size) {
    const factor = size < 0 ? 1 : 2;
    style.fontSize = `${16 + size * factor}px`;
    style.paddingTop = `${8 + size * factor}px`;
    style.paddingBottom = `${8 + size * factor}px`;
    if (size < 0) {
      style.fontWeight = fonts.get('ui', 'mid', 1).fw;
    }
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
    placeholder,
    type,
    readOnly,
    onFocus,
    onBlur,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (onEsc && e.key === 'Escape') onEsc(e);
      onKeyDown?.(e);
    },
    onPaste,
    onChange,
  };

  return (
    <NotchedOutline
      className={outlineClass}
      label={label}
      active={focus}
      disabled={disabled || readOnly}
      style={{background: focus ? styles.col.map('bg') : 'transparent'}}
    >
      <Split style={{alignItems: 'center'}}>
        <input {...inputAttr} />
        {rightElement}
      </Split>
    </NotchedOutline>
  );
};
