import * as React from 'react';
import {makeRule, useTheme} from 'nano-theme';

const useBlockClass = makeRule((t) => ({
  ...t.font.ui1.mid,
  d: 'flex',
  columnGap: '4px',
  ai: 'center',
  w: '100%',
  minW: 0,
  fz: '13px',
  pd: '8px 20px',
  bxz: 'border-box',
  col: t.g(0.2),
  bd: 'none',
  mr: 0,
}));

export interface ContextSectionProps extends React.AllHTMLAttributes<any> {
  compact?: boolean;
  bg?: boolean;
}

export const ContextSection: React.FC<ContextSectionProps> = ({className, compact, bg, ...rest}) => {
  const theme = useTheme();
  const blockClass = useBlockClass();
  const style: React.CSSProperties = {
    ...rest.style,
    padding: compact ? '4px 8px' : void 0,
  };

  let element: React.ReactNode = <fieldset {...rest} style={style} className={(className || '') + blockClass} />;

  if (bg) {
    element = <div style={{background: theme.g(0, 0.04)}}>{element}</div>;
  }

  return <>{element}</>;
};
