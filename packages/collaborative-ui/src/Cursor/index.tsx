import * as React from 'react';
import {rule} from 'nano-theme';
import {CursorIcon} from '../CursorIcon';
import {useInterpolation} from '../hooks/useInterpolation';

const blockClass = rule({
  d: 'block',
  pos: 'fixed',
  top: 0,
  left: 0,
  lh: '1px',
  z: 1e6,
});

export interface CursorProps {
  point: [x: number, y: number];
  rel?: 'page' | 'element';
  icon?: React.ReactNode;
  offset?: [x: number, y: number];
}

export const Cursor: React.FC<CursorProps> = ({point, rel, icon, offset = [3, 4]}) => {
  const interpolatedPoint = useInterpolation(point);

  const styles: React.CSSProperties = {
    left: interpolatedPoint[0] - offset[0],
    top: interpolatedPoint[1] - offset[1],
  };

  if (rel === 'element') {
    styles.position = 'absolute';
  }

  return (
    <div className={blockClass} style={styles}>
      {icon || <CursorIcon />}
    </div>
  );
};
