import * as React from 'react';
import {rule, drule} from 'nano-theme';
import {Iconista} from '../../icons/Iconista';
import {useStyles} from '../../styles/context';

const h = React.createElement;

const thumbClass = rule({
  h: '24px',
  pos: 'absolute',
  top: '3px',
  d: 'inline-block',
  bdrad: '12px',
  trs: 'left 0.2s, width 0.2s',
  bg: '#fff',
});

const labelClass = rule({
  pos: 'absolute',
  top: 0,
  h: '100%',
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  pe: 'none',
  fz: '12px',
  fw: 700,
  lh: 1,
  us: 'none',
  ttf: 'uppercase',
});

const blockClass = drule({
  pos: 'relative',
  cur: 'pointer',
  d: 'inline-block',
  pad: 0,
  mar: 0,
  bdrad: '20px',
  trs: 'box-shadow 0.18s',
  bd: 0,
  out: 0,
  w: '50px',
  h: '30px',
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
  const styles = useStyles();
  const light = styles.light;

  const [active, setActive] = React.useState(false);

  const onMouseLeave = () => setActive(false);
  const onMouseDown = () => setActive(true);
  const onMouseUp = () => setActive(false);

  const cls = blockClass({
    bxsh: `inset 0 0 2px ${styles.g(light ? 0 : 1, 0.25)}`,
    '&:focus': {
      bxsh: `0 0 0 3px ${styles.col.get('link', 'solid-1')}`,
    },
    '&:hover': {
      bxsh: `0 0 0 3px ${styles.col.get('accent', 'solid-1')}`,
      [`& > .${thumbClass}`]: {
        bg: light ? '#f4f4f4' : styles.g(0.9),
        'box-shadow': `0 0 3px ${styles.g(light ? 0 : 1, 0.4)}`,
      },
    },
  });

  const style: any = {
    background: on ? styles.positive.fg.toString() : styles.g(light ? 0.4 : 0.7),
  };

  const styleSpan: any = {
    left: on ? (active ? 17 : 23) : 3,
    width: small ? (active ? 20 : 14) : active ? 30 : 24,
  };

  const styleLabelOn: any = {
    left: small ? 6 : 6,
    width: small ? 11 : 16,
    fontSize: small ? 9 : 12,
    color: 'rgba(255,255,255,.7)',
  };

  const styleLabelOff: any = {
    right: small ? 5 : 6,
    width: small ? 11 : 16,
    fontSize: small ? 9 : 12,
    color: 'rgba(255,255,255,.5)',
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
      className: cls,
      style,
      role: 'checkbox',
      'aria-checked': on,
      type: 'button',
      onMouseLeave,
      onMouseDown,
      onMouseUp,
    },
    h(
      'span',
      {className: labelClass, style: styleLabelOn, 'aria-hidden': true},
      h(Iconista, {
        color: styles.bg.fg.copy(0, 0, 0, -0.4).toString(),
        set: 'bootstrap',
        icon: 'check',
        width: small ? 12 : 14,
        height: small ? 12 : 14,
      }),
    ),
    h(
      'span',
      {className: labelClass, style: styleLabelOff, 'aria-hidden': true},
      h(Iconista, {
        color: styles.bg.fg.copy(0, 0, 0, -0.4).toString(),
        set: 'bootstrap',
        icon: 'x',
        width: small ? 12 : 14,
        height: small ? 12 : 14,
      }),
    ),
    h('span', {className: thumbClass, style: styleSpan}, ' '),
  );
};
