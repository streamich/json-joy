import * as React from 'react';
import {theme, rule} from 'nano-theme';

const blockClass = rule({
  ...theme.font.sans.bold,
  fz: '10px',
  textTransform: 'uppercase',
  col: theme.g(0.5),
  pad: 0,
  mar: 0,
});

export interface Props {
  component?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler;
}

export const MiniTitle: React.FC<Props> = ({component = 'span', style, onClick, children}) => {
  return React.createElement(component, {className: blockClass, style, onClick, children});
};
