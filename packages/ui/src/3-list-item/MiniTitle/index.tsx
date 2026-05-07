import * as React from 'react';
import {makeRule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const useBlockClass = makeRule((t) => ({
  ...t.font.sans.bold,
  fz: '10px',
  textTransform: 'uppercase',
  col: t.g(0.5),
  pad: 0,
  mar: 0,
}));

export interface Props {
  component?: string;
  contrast?: boolean;
  literal?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler;
}

export const MiniTitle: React.FC<Props> = ({component = 'span', contrast, literal, style = {}, onClick, children}) => {
  const styles = useStyles();
  const blockClass = useBlockClass();

  if (literal) {
    style.textTransform = 'none';
    style.fontSize = '11px';
  }
  if (contrast) {
    style.color = styles.g(0.16);
  }
  return React.createElement(component, {className: blockClass, style, onClick, children});
};
