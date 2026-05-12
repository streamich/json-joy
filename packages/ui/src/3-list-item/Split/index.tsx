import * as React from 'react';
import {rule} from 'nano-theme';

const h = React.createElement;

const className = rule({
  d: 'flex',
  justifyContent: 'space-between',
  w: '100%',
});

const alignMap = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
} as const;

export type SplitAlign = keyof typeof alignMap;

export interface SplitProps extends React.AllHTMLAttributes<any> {
  className?: string;
  as?: string;
  align?: SplitAlign;
  children: [React.ReactNode, React.ReactNode];
}

export const Split: React.FC<SplitProps> = ({as = 'div', align, style, children, ...rest}) => {
  rest.className = (rest.className || '') + className;
  if (align) style = {alignItems: alignMap[align], ...style};
  if (style) (rest as any).style = style;

  return h(as, rest, children[0], children[1]);
};
