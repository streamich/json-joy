import * as React from 'react';
import {drule} from 'nano-theme';
import {fonts} from '../../styles/font';
import {useStyles} from '../../styles/context';

const body = fonts.get('display', 'mid');

const blockClass = drule({
  ...body,
  d: 'block',
  minW: 0,
  fz: '14px',
  lh: '20px',
  fw: 400,
  textWrap: 'pretty',
  wordBreak: 'break-word',
  '& a': {col: 'inherit', textDecoration: 'underline', textUnderlineOffset: '2px'},
  '& p': {mar: 0},
  '& p + p': {mt: '8px'},
});

export interface CardBodyProps {
  children: React.ReactNode;
  /** Clamp the body to N lines (excerpt). */
  clamp?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const CardBody: React.FC<CardBodyProps> = ({children, clamp, className, style}) => {
  const styles = useStyles();
  const clampStyle: React.CSSProperties = clamp
    ? {display: '-webkit-box', WebkitLineClamp: clamp, WebkitBoxOrient: 'vertical', overflow: 'hidden'}
    : {};
  return (
    <div
      className={blockClass({col: styles.g(0.3)}) + (className ? ' ' + className : '')}
      style={{...clampStyle, ...style}}
    >
      {children}
    </div>
  );
};
