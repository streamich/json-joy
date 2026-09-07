import * as React from 'react';
import {rule} from 'nano-theme';
import {fonts} from '../../styles/font';
import {useStyles} from '../../styles/context';

const mono = fonts.get('mono', 'mid');

const barClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'space-between',
  gap: '12px',
  flexWrap: 'wrap',
  w: '100%',
  minW: 0,
});

const startClass = rule({
  d: 'flex',
  ai: 'center',
  flexWrap: 'wrap',
  gap: '6px',
  minW: 0,
});

const endClass = rule({
  ...mono,
  d: 'flex',
  ai: 'center',
  gap: '8px',
  flex: '0 0 auto',
  ml: 'auto',
  fz: '11px',
  lh: '15px',
  whiteSpace: 'nowrap',
});

export interface CardFooterProps {
  /** Leading meta — tags, reactions. */
  start?: React.ReactNode;
  /** Trailing meta — timestamps, counts (rendered mono). */
  end?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const CardFooter: React.FC<CardFooterProps> = ({start, end, className, style}) => {
  const styles = useStyles();
  return (
    <div className={barClass + (className ? ' ' + className : '')} style={style}>
      {!!start ? <div className={startClass}>{start}</div> : <span />}
      {!!end && (
        <div className={endClass} style={{color: styles.g(0.5)}}>
          {end}
        </div>
      )}
    </div>
  );
};
