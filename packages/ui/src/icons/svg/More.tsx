import * as React from 'react';
import {rule, lightTheme as theme} from 'nano-theme';

export const moreIconClass = rule({
  d: 'block',
  fill: theme.g(0.4),
  flexShrink: 0,
  backfaceVisibility: 'hidden',
});

export interface Props {
  size?: number;
  fill?: string;
}

const IconMore: React.FC<Props> = ({size = 14, fill}) => {
  const style: React.CSSProperties = {
    width: size,
    height: size,
  };

  if (fill !== undefined) {
    style.fill = fill;
  }

  return (
    <svg viewBox="0 0 13 3" className={moreIconClass} style={style}>
      <g>
        <path d="M3,1.5A1.5,1.5,0,1,1,1.5,0,1.5,1.5,0,0,1,3,1.5Z" />
        <path d="M8,1.5A1.5,1.5,0,1,1,6.5,0,1.5,1.5,0,0,1,8,1.5Z" />
        <path d="M13,1.5A1.5,1.5,0,1,1,11.5,0,1.5,1.5,0,0,1,13,1.5Z" />
      </g>
    </svg>
  );
};

export default IconMore;
