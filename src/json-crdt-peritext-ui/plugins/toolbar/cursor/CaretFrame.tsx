import * as React from 'react';
import {rule} from 'nano-theme';

const height = 1.8;

const blockClass = rule({
  pos: 'relative',
  w: '0px',
  h: '100%',
  va: 'bottom',
});

const overClass = rule({
  pos: 'absolute',
  b: `${height}em`,
  l: 0,
  isolation: 'isolate',
  us: 'none',
  transform: 'translateX(calc(-50% + 0px))',
});

const underClass = rule({
  pos: 'absolute',
  t: `${height}em`,
  l: 0,
  isolation: 'isolate',
  us: 'none',
  transform: 'translateX(calc(-50% + 0px))',
});

export interface CaretFrameProps {
  over?: React.ReactNode;
  under?: React.ReactNode;
  children: React.ReactNode;
}

export const CaretFrame: React.FC<CaretFrameProps> = ({over, under, children}) => {
  return (
    <span className={blockClass}>
      {children}
      {!!over && (
        <span className={overClass} contentEditable={false}>
          {over}
        </span>
      )}
      {!!under && (
        <span className={underClass} contentEditable={false}>
          {under}
        </span>
      )}
    </span>
  );
};
