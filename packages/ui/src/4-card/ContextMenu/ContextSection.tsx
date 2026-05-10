import * as React from 'react';
import {lightTheme, drule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const blockClass = drule({
  ...lightTheme.font.ui1.mid,
  d: 'flex',
  columnGap: '4px',
  ai: 'center',
  w: '100%',
  minW: 0,
  fz: '13px',
  pd: '8px 20px',
  bxz: 'border-box',
  bd: 'none',
  mr: 0,
});

export interface ContextSectionProps extends React.AllHTMLAttributes<any> {
  compact?: boolean;
  bg?: boolean;
}

export const ContextSection: React.FC<ContextSectionProps> = ({className, compact, bg, ...rest}) => {
  const styles = useStyles();
  const style: React.CSSProperties = {
    ...rest.style,
    padding: compact ? '4px 8px' : void 0,
  };

  let element: React.ReactNode = (
    <fieldset {...rest} style={style} className={(className || '') + blockClass({col: styles.g(0.2)})} />
  );

  if (bg) {
    element = <div style={{background: styles.g(0, 0.04)}}>{element}</div>;
  }

  return <>{element}</>;
};
