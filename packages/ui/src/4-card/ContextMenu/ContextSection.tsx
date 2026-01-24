import * as React from 'react';
import {lightTheme as theme, rule} from 'nano-theme';

const blockClass = rule({
  ...theme.font.ui1.mid,
  d: 'flex',
  columnGap: '4px',
  ai: 'center',
  w: '100%',
  fz: '13px',
  pd: '8px 20px',
  bxz: 'border-box',
  col: theme.g(0.2),
});

export interface ContextSectionProps extends React.AllHTMLAttributes<any> {
  compact?: boolean;
  bg?: boolean;
}

export const ContextSection: React.FC<ContextSectionProps> = ({className, compact, bg, ...rest}) => {
  const style: React.CSSProperties = {
    ...rest.style,
    padding: compact ? '4px 8px' : void 0,
  };

  let element: React.ReactNode = <div {...rest} style={style} className={(className || '') + blockClass} />;

  if (bg) {
    element = <div style={{background: theme.g(0, 0.04)}}>{element}</div>;
  }

  return <>{element}</>;
};
