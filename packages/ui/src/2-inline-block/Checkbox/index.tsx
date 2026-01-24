import * as React from 'react';
import {lightTheme as theme, rule} from 'nano-theme';

const h = React.createElement;

const blockClass = rule({
  pos: 'relative',
  cur: 'pointer',
  d: 'inline-block',
  pad: 0,
  mar: 0,
  bdrad: '20px',
  trs: 'box-shadow 0.18s',
  bxsh: 'inset 0 0 2px rgba(0,0,0,.25)',
  bd: 0,
  out: 0,
  w: '50px',
  h: '30px',
  '&:focus': {
    bxsh: `0 0 0 3px ${theme.color.sem.blue[0]}`,
  },
  '&:hover': {
    bxsh: `0 0 0 3px ${theme.color.sem.accent[0]}`,
    '& > span': {
      bg: '#f4f4f4',
      'box-shadow': '0 0 3px rgba(0,0,0,.4)',
    },
  },
  '& > span': {
    h: '24px',
    pos: 'absolute',
    top: '3px',
    d: 'inline-block',
    bdrad: '12px',
    trs: 'left 0.2s, width 0.2s',
    bg: '#fff',
  },
});

export interface CheckboxProps {
  on: boolean;
  as?: 'button' | string;
  small?: boolean;
  disabled?: boolean;
  onChange?: React.MouseEventHandler;
}

export const Checkbox: React.FC<CheckboxProps> = (props) => {
  const {on, as = 'button', small, disabled} = props;

  const [active, setActive] = React.useState(false);

  const onMouseLeave = () => setActive(false);
  const onMouseDown = () => setActive(true);
  const onMouseUp = () => setActive(false);

  const style: any = {
    background: on ? theme.color.sem.positive[0] : theme.g(0.4),
  };

  const styleSpan: any = {
    left: on ? (active ? 17 : 23) : 3,
    width: small ? (active ? 20 : 14) : active ? 30 : 24,
  };

  if (small) {
    style.width = 40;
    style.height = 20;
    styleSpan.height = 14;
  }

  if (disabled) {
    style.opacity = 0.7;
  }

  return h(
    as,
    {
      onClick: disabled ? undefined : props.onChange,
      className: blockClass,
      style,
      role: 'checkbox',
      'aria-checked': active,
      type: 'button',
      onMouseLeave,
      onMouseDown,
      onMouseUp,
    },
    h('span', {style: styleSpan}, ' '),
  );
};
