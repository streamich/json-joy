import * as React from 'react';
import {theme, rule, useRule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const blockClass = rule({
  ...theme.font.sans.bold,
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

  const dynamicClass = useRule(() => ({
    col: styles.g(0.5),
  }));

  return (
    <div className={blockClass + dynamicClass} style={style}>
      {children}
    </div>
  );
};
