import * as React from 'react';
import {rule, useRule} from 'nano-theme';

const keyframes = {
  '0%': {
    ransform: 'perspective(120px) rotateX(0deg) rotateY(0deg)',
  },
  '50%': {
    transform: 'perspective(120px) rotateX(-180.1deg) rotateY(0deg)',
  },
  '100%': {
    transform: 'perspective(120px) rotateX(-180deg) rotateY(-179.9deg)',
  },
};

const blockClass = rule({
  w: '40px',
  h: '40px',
  mar: '40px auto',
  animation: 'spinner-rotate-plane 1.2s infinite ease-in-out',
  '@keyframes spinner-rotate-plane': keyframes,
});

export const SpinnerSquare: React.FC<React.AllHTMLAttributes<any>> = (props) => {
  const dynamicClass = useRule((theme) => ({
    bg: theme.g(0.5, 0.25),
  }));

  return React.createElement('div', {...props, className: (props.className || '') + blockClass + dynamicClass});
};

export default SpinnerSquare;
