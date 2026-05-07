import * as React from 'react';
import {makeRule} from 'nano-theme';

const h = React.createElement;

const useBlockClass = makeRule((t) => ({
  h: '2px',
  pos: 'relative',
  bg: t.green(0.65),
  trs: 'width 0.3s',
  transitionTimingFunction: 'cubic-bezier(.08,.91,.26,1)',
}));

const useGlowClass = makeRule((t) => {
  const glowColor = t.color.sem.positive[0];
  return {
    pos: 'absolute',
    right: 0,
    w: '100px',
    h: '2px',
    boxShadow: `0 0 10px ${glowColor}, 0 0 5px ${glowColor}, 0 0 5px ${glowColor}`,
    transform: 'rotate(3deg) translate(0px, -4px)',
  };
});

export interface ProgressProps {
  value?: number;
  glow?: boolean;
  style?: React.CSSProperties;
}

export const Progress: React.FC<ProgressProps> = ({value = 0, glow, style}) => {
  const blockClass = useBlockClass();
  const glowClass = useGlowClass();
  return h(
    'div',
    {
      className: blockClass,
      style: {
        ...style,
        width: Math.min(1, Math.max(0, value)) * 100 + '%',
      },
    },
    !!glow && h('div', {className: glowClass}),
  );
};
