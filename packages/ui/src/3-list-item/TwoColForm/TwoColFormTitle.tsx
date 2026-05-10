import * as React from 'react';
import {lightTheme, drule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const blockClass = drule({
  ...lightTheme.font.sans.bold,
  fz: '11px',
  lh: '16px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  pd: '4px 0',
  mr: 0,
});

export interface TwoColFormTitleProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const TwoColFormTitle: React.FC<TwoColFormTitleProps> = ({children, style}) => {
  const styles = useStyles();

  return (
    <div className={blockClass({col: styles.g(0.35)})} style={style}>
      {children}
    </div>
  );
};
