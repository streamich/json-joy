import * as React from 'react';
import {rule, drule, type Scale} from 'nano-theme';
import {Link} from '../../1-inline/Link';
import {Ripple} from '../../misc/Ripple';
import {SpinnerCircle} from '../SpinnerCircle';
import {useStyles} from '../../styles/context';
import {fonts} from '../../styles';
import type {ColorScaleStep, ColorScaleStepMnemonic, ColorSpecifier} from '../../styles/color/types';

const defaultHeight = 36;
const defaultFontSize = 16;

const h = React.createElement;

const buttonClass = drule({
  ...fonts.get('ui', 'mid', 2),
  d: 'inline-flex',
  w: 'auto',
  fz: defaultFontSize + 'px',
  h: defaultHeight + 'px',
  td: 'none',
  boxSizing: 'border-box',
  justifyContent: 'center',
  alignItems: 'center',
  letterSpacing: '0.6px',
  lh: '24px',
  trs: 'background .2s, box-shadow .2s, color .2s',
  mar: 0,
  bd: 0,
  pd: '0px 15px',
  minWidth: '50px',
  whiteSpace: 'nowrap',
  us: 'none',
});

const iconClass = rule({
  alignItems: 'center',
  d: 'flex',
});

export interface ButtonProps {
  block?: boolean;
  color?: string | ColorSpecifier[0];
  colorStep?: ColorScaleStep | ColorScaleStepMnemonic;
  disabled?: boolean;
  ghost?: boolean;
  href?: string;
  icon?: React.ReactElement<any>;
  iconRight?: boolean;
  lite?: boolean;
  loading?: boolean;
  size?: Scale;
  small?: boolean;
  outline?: boolean;
  primary?: boolean;
  submit?: boolean;
  radius?: number;
  className?: string;
  style?: React.CSSProperties;
  pointer?: boolean;
  compact?: boolean;
  children?: React.ReactNode;
  dashed?: boolean;
  onClick?: React.MouseEventHandler<any>;
}

export const Button: React.FC<ButtonProps> = (props) => {
  /* eslint-disable */
  let {
    block,
    children,
    color = 'neutral',
    primary,
    colorStep = primary ? 6 : 2,
    disabled,
    icon,
    iconRight,
    ghost,
    href,
    lite,
    loading,
    outline,
    size = 0,
    radius = 0,
    compact,
    onClick,
    submit,
  } = props;
  /* eslint-enable */

  const theme = useStyles();

  let tag = 'button';

  if (loading) {
    disabled = true;
    icon = <SpinnerCircle />;
  }

  if (ghost) {
    outline = true;
    lite = true;
  }

  const colorStepNum = theme.col.stepNum(colorStep);
  const bg: string = color
    ? color[0] === '#'
      ? color
      : theme.col.get(color as ColorSpecifier[0], colorStepNum, 0)
    : theme.col.get('neutral', colorStepNum, 0);
  const bgHover: string = outline
    ? bg
    : color
      ? color[0] === '#'
        ? color
        : theme.col.get(color as ColorSpecifier[0], ((colorStepNum + 1) % 12) as any, 0)
      : theme.col.get('neutral', ((colorStepNum + 1) % 12) as any, 0);
  const col: string = colorStepNum > 3 ? theme.g(0.98, 0.96) : theme.col.get('neutral', 'txt-1') + '';

  const buttonStyle: React.CSSProperties = {
    height: `${size * 4 + defaultHeight}px`,
    fontSize: defaultFontSize + size * (size < 0 ? 0.5 : 2) + 'px',
    border: `1px solid ${lite || outline ? bg : 'transparent'}`,
    borderRadius: radius < 0 ? 0 : !radius ? 4 : 8,
  };

  const buttonProps: any = {
    className:
      (props.className || '') +
      buttonClass({
        bg: lite || outline ? 'transparent' : bg,
        col: outline ? (colorStepNum > 4 ? bg : theme.col.get('neutral', 'txt-1')) : !lite ? col : theme.g(0.08),
        '&:hover': {
          col: outline || lite ? (outline && colorStepNum > 4 ? theme.g(0.98, 0.96) : theme.g(0.08)) : col,
          bg: bgHover,
          // boxShadow: disabled ? '0' : `0 0 0 3px ${theme.g(0, .1)}`,
        },
      }),
    onClick,
    style: buttonStyle,
  };

  if (disabled) {
    buttonProps.disabled = true;
    buttonStyle.opacity = 0.7;
    buttonStyle.cursor = 'not-allowed';
  }

  if (href) {
    tag = Link as any;
    buttonProps.to = href;
    buttonProps.a = true;
  } else {
    if (submit) {
      buttonProps.type = 'submit';
    }
  }

  if (block) {
    buttonStyle.width = '100%';
  }

  if (props.pointer) {
    buttonStyle.cursor = 'pointer';
  }

  if (props.dashed) {
    buttonStyle.borderStyle = 'dashed';
  }

  if (props.compact) {
    buttonStyle.padding = '0px 8px';
  }

  let left: React.ReactNode = null;
  let right: React.ReactNode = null;
  if (icon) {
    if (iconRight) {
      right = h('span', {className: iconClass, style: {paddingLeft: 8}}, icon);
    } else {
      left = h('span', {className: iconClass, style: {paddingRight: 8}}, icon);
    }
  }
  let buttonElement: React.ReactNode = h(tag, buttonProps, left, children, right);

  Object.assign(buttonStyle, props.style);

  if (typeof tag !== 'string') {
    buttonElement = h('div', {}, buttonElement);
  }

  return h(Ripple, {
    ms: block ? 400 : 1000,
    color: disabled ? 'transparent' : lite || outline ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.85)',
    children: buttonElement,
  });
};
