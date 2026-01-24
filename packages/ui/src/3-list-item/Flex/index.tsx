import * as React from 'react';
import {rule} from 'nano-theme';

const h = React.createElement;

const className = rule({
  d: 'flex',
  w: '100%',
});

export interface FlexProps extends React.AllHTMLAttributes<any> {
  className?: string;
  as?: string;
  children: React.ReactNode | React.ReactNode[];
}

export const Flex: React.FC<FlexProps> = ({as = 'div', children, ...rest}) => {
  rest.className = (rest.className || '') + className;

  return Array.isArray(children) ? h(as, rest, ...children) : h(as, rest, children);
};
