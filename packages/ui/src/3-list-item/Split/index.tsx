import * as React from 'react';
import {rule} from 'nano-theme';

const h = React.createElement;

const className = rule({
  d: 'flex',
  justifyContent: 'space-between',
  w: '100%',
});

export interface SplitProps extends React.AllHTMLAttributes<any> {
  className?: string;
  as?: string;
  children: [React.ReactNode, React.ReactNode];
}

export const Split: React.FC<SplitProps> = ({as = 'div', children, ...rest}) => {
  rest.className = (rest.className || '') + className;

  return h(as, rest, children[0], children[1]);
};
