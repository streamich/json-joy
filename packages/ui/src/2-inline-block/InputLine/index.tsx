import * as React from 'react';
import {lightTheme as theme, useTheme, rule, useRule} from 'nano-theme';
import IconSvgClose from '../../icons/svg/Close';
import {SpinnerBars} from '../SpinnerBars';

const {createElement: h, useState, useCallback, useMemo, useRef, useEffect} = React;
const noop = () => {};

let idCounter = 0;

const blockClass = rule({
  pos: 'relative',
  ov: 'hidden',
  '&.disabled': {
    op: 0.7,
  },
  '&>input': {
    w: '100%',
    mar: 0,
    bd: 0,
    out: 0,
    ff: theme.font.ui3.mid.ff,
    fw: theme.font.ui3.mid.fw,
  },
  '&>label': {
    pos: 'absolute',
    left: 0,
    top: '20px',
    fz: '20px',
    ff: theme.font.sans.lite.ff,
    fw: theme.font.sans.lite.fw,
    trs: 'top 0.2s, font-size 0.2s',
    transitionDelay: '0.2s',
    pe: 'none',
  },
  '&>label.small': {
    top: '7px',
    fz: '14px',
  },
  '&>label.focus': {
    top: 0,
    fz: '12px',
    col: theme.g(0.5),
  },
  '&>label.small.focus': {
    top: '-1px',
    fz: '9px',
  },
  '&>.rightIcon': {
    pos: 'absolute',
    d: 'block',
    w: '16px',
    h: '16px',
    pad: '20px',
    top: 0,
    right: 0,
    cur: 'pointer',
  },
  '&>svg': {
    pos: 'absolute',
    top: 0,
    left: 0,
    w: '300%',
    h: '100%',
    fill: 'transparent',
    pe: 'none',
    trs: 'transform 0.8s, stroke-width 0.8s, stroke 0.8s',
  },
});

export interface IInputLineProps {
  disabled?: boolean;
  value?: string;
  label?: string;
  type?: 'text' | 'password' | 'email';
  focus?: boolean;
  select?: boolean;
  readOnly?: boolean;
  small?: boolean;
  isInForm?: boolean;
  style?: any;
  waiting?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  onPaste?: () => void;
  onCancelClick?: () => void;
}

export interface IInputLineState {
  focus?: boolean;
  hover?: boolean;
}

export const InputLine: React.FC<IInputLineProps> = (props) => {
  const {disabled, value = '', onPaste, small, label, readOnly, type = 'text', waiting} = props;
  const id = useMemo(() => 'InputLine-' + idCounter++, []);
  const [focus, setFocus] = useState(false);
  const ref = useRef<HTMLInputElement | null>(null);
  const theme = useTheme();
  const dynamicClass = useRule((theme) => ({
    '&>svg': {
      stroke: theme.g(0, 0.15),
    },
  }));

  useEffect(() => {
    if (!ref.current) return;
    if (!props.focus) return;
    if (props.focus) ref.current.focus();
    if (props.select) ref.current.select();
  }, [ref.current]);

  const onFocus = useCallback(() => {
    setFocus(true);
    (props.onFocus || noop)();
  }, [props.onFocus]);
  const onBlur = useCallback(() => {
    setFocus(false);
    (props.onBlur || noop)();
  }, [props.onBlur]);
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!ref.current) return;
      if (props.isInForm && e.key === 'Enter') {
        ref.current.blur();
      }
    },
    [ref.current],
  );
  const onCancelClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (props.onCancelClick) props.onCancelClick();
    },
    [props.onCancelClick],
  );

  const showClose = value && !!props.onCancelClick;

  let style: React.CSSProperties = {
    background: theme.bg,
    padding: small ? '10px 0 8px' : '19px 0 17px',
    fontSize: 18 * (small ? 0.9 : 1.3) + 'px',
    color: theme.g(0),
  };

  if (showClose) {
    style.paddingRight = 50;
  }

  if (props.style) {
    style = {...style, ...props.style};
  }

  let rightIcon = null;

  if (waiting) {
    rightIcon = h('a', {className: 'rightIcon'}, h(SpinnerBars));
  } else if (showClose) {
    rightIcon = h('a', {className: 'rightIcon', onClick: onCancelClick}, h(IconSvgClose));
  }

  const svgAttr: any = {
    viewBox: '0 0 1200 60',
    preserveAspectRatio: 'none',
  };

  if (focus) {
    svgAttr.style = {
      transform: 'translate3d(-66%, 0, 0)',
      stroke: theme.color.sem.positive[1],
      strokeWidth: small ? '2px' : '3px',
    };
  }

  const inputAttr: any = {
    ref,
    disabled,
    value,
    type,
    readOnly,
    style,
    onFocus,
    onBlur,
    onKeyDown,
    onPaste,
  };

  let labelElement = null;
  if (label) {
    inputAttr.id = id;
    labelElement = (
      <label
        htmlFor={id}
        className={'' + (small ? ' small' : '') + (value || focus ? ' focus' : '')}
        style={{color: theme.g(0, 0.6)}}
      >
        {label}
      </label>
    );
  }

  return (
    <div className={blockClass + dynamicClass}>
      <input {...inputAttr} onChange={(e) => (props.onChange || noop)(e.target.value)} />
      {labelElement}
      {rightIcon}
      <svg {...svgAttr}>
        <path d="M0,56.5c0,0,298.666,0,399.333,0C448.336,56.5,513.994,46,597,46c77.327,0,135,10.5,200.999,10.5c95.996,0,402.001,0,402.001,0" />
      </svg>
    </div>
  );
};
