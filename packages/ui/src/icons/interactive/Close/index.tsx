import * as React from 'react';
import {rule, useRule} from 'nano-theme';

const h = React.createElement;

const className = rule(
  {
    pos: 'relative',
    d: 'flex',
    w: '32px',
    h: '32px',
    bdrad: '3px',
    cur: 'pointer',
    trs: 'all .3s',
    justifyContent: 'center',
    alignItems: 'center',
    userSelect: 'none',
    svg: {
      w: '32px',
      h: '32px',
      trs: 'transform .3s',
    },
    '&:hover': {
      bdrad: '0px',
      '.line-2': {
        'stroke-dashoffset': 0,
      },
    },
    '&:active': {
      '.line-1': {
        stroke: 'transparent',
      },
      '.line-2': {
        transform: 'rotate(90deg)',
        trs: 'all 0.3s',
      },
      svg: {
        transform: 'scale(.7)',
      },
    },
    '.close-icon': {
      w: '28px',
      h: '28px',
    },
    '.line-1': {
      fill: 'none',
      'stroke-width': '2px',
    },
    '.line-2': {
      fill: 'none',
      strokeWidth: '2px',
      strokeDasharray: 25,
      strokeDashoffset: 25,
      trs: 'all 0.2s',
      transformOrigin: '50% 50%',
    },
  },
  'IconIntClose',
);

export interface Props extends React.HtmlHTMLAttributes<any> {}

export const Close: React.FC<Props> = (props) => {
  const dynamicClass = useRule(({g}) => ({
    '.line-1': {
      stroke: g(0.6),
    },
    '.line-2': {
      stroke: g(0.6),
    },
    '&:active': {
      '.line-2': {
        stroke: g(0.4),
      },
    },
  }));

  return h(
    'span',
    {...props, className: (props.className || '') + className + dynamicClass},
    h(
      'svg',
      null,
      h('path', {className: 'line-1', d: 'M12 12 L20 20 M20 12 L12 20'}),
      h('path', {className: 'line-2', d: 'M12 12 L20 20 M20 12 L12 20'}),
    ),
  );
};
