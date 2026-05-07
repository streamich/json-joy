import {createElement as h} from 'react';
import {makeRule} from 'nano-theme';

const useBlockClass = makeRule((t) => ({
  d: 'inline-block',
  bdrad: '50%',
  animation: 'spinner-circle .3s infinite linear',
  w: '16px',
  h: '16px',
  bd: `1px solid ${t.g(0, 0.25)}`,
  bdl: '1px solid transparent',
  '@keyframes spinner-circle': {
    to: {
      transform: 'rotate(359.9deg)',
    },
  },
}));

export interface ISpinnerCircleProps {
  color?: string;
  size?: number;
}

export const SpinnerCircle: React.FC<ISpinnerCircleProps> = ({size = 0, color}) => {
  const blockClass = useBlockClass();
  const style: React.CSSProperties = {};

  if (color) {
    const bd = Math.min(3, Math.max(1, size));

    style.border = `${bd}px solid ${color}`;
    style.borderLeft = `${bd}px solid transparent`;
  }

  if (size) {
    style.width = `${16 + size * 8}px`;
    style.height = `${16 + size * 8}px`;
  }

  return h('div', {
    className: blockClass,
    style,
  });
};
