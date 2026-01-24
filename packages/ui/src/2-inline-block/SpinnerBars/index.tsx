import * as React from 'react';
import {lightTheme as theme, rule, useRule} from 'nano-theme';

const h = React.createElement;

function r(delay: string) {
  return {
    '-webkit-animation-delay': delay,
    'animation-delay': delay,
  };
}

const blockClass = rule({
  w: '20px',
  minW: '20px',
  h: '20px',
  ta: 'center',
  fs: '10px',
  d: 'inline-block',
  bxz: 'border-box',
  pe: 'none',
  '&>span': {
    bg: theme.g(0.8),
    h: '100%',
    w: '4px',
    d: 'inline-block',
    mar: '0',
    an: 'spinner-bars 1.2s infinite ease-in-out',
  },
  '&>.r2': r('-1.1s'),
  '&>.r3': r('-1.0s'),
  '&>.r4': r('-0.9s'),
  '&>.r5': r('-0.8s'),
  '@keyframes spinner-bars': {
    '0%, 40%, 100%': {
      tr: 'scaleY(0.4)',
    },
    '20%': {
      tr: 'scaleY(1.0)',
    },
  },
});

export interface Props {
  color?: string;
}

export const SpinnerBars: React.FC<Props> = ({color}) => {
  const dynamicBlockClass = useRule((theme) => ({
    '&>span': {
      bg: theme.g(0.8),
    },
  }));

  const style: React.CSSProperties = {};

  if (color) {
    style.background = typeof color === 'string' ? color : theme.color.sem.blue[1];
  }

  return h(
    'span',
    {className: blockClass + dynamicBlockClass},
    h('span', {className: 'r1', style}, ' '),
    h('span', {className: 'r2', style}, ' '),
    h('span', {className: 'r3', style}, ' '),
    h('span', {className: 'r4', style}, ' '),
    h('span', {className: 'r5', style}, ' '),
  );
};
