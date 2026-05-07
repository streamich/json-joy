import * as React from 'react';
import {makeRule} from 'nano-theme';

const useBlockClass = makeRule((t) => ({
  ...t.font.sans.bold,
  fz: '11px',
  lh: '16px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  pd: '4px 0',
  mr: 0,
  col: t.g(0.35),
}));

export interface TwoColFormTitleProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const TwoColFormTitle: React.FC<TwoColFormTitleProps> = ({children, style}) => {
  const blockClass = useBlockClass();

  return (
    <div className={blockClass} style={style}>
      {children}
    </div>
  );
};
