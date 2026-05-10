import * as React from 'react';
import {lightTheme, drule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const blockClass = drule({
  ...lightTheme.font.sans.bold,
  fz: '10px',
  textTransform: 'uppercase',
  pad: 0,
  mar: 0,
});

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

  if (literal) {
    style.textTransform = 'none';
    style.fontSize = '11px';
  }
  if (contrast) {
    style.color = styles.g(0.16);
  }
  return React.createElement(component, {
    className: blockClass({col: styles.g(0.5)}),
    style,
    onClick,
    children,
  });
};
