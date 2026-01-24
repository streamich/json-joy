import * as React from 'react';
import {rule, theme} from 'nano-theme';

const h = React.createElement;
const glowColor = theme.color.sem.positive[0];

const blockClass = rule({
  h: '2px',
  pos: 'relative',
  bg: theme.green(0.65),
  trs: 'width 0.3s',
  transitionTimingFunction: 'cubic-bezier(.08,.91,.26,1)',
});

const glowClass = rule({
  pos: 'absolute',
  right: 0,
  w: '100px',
  h: '2px',
  boxShadow: `0 0 10px ${glowColor}, 0 0 5px ${glowColor}, 0 0 5px ${glowColor}`,
  transform: 'rotate(3deg) translate(0px, -4px)',
});

export interface ProgressProps {
  value?: number;
  glow?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({value = 0, glow}) =>
  h(
    'div',
    {
      className: blockClass,
      style: {
        width: Math.min(1, Math.max(0, value)) * 100 + '%',
      },
    },
    !!glow && h('div', {className: glowClass}),
  );
