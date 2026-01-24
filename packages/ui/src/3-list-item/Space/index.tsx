import * as React from 'react';

export interface SpaceProps {
  size?: number;
  horizontal?: boolean;
}

export const Space: React.FC<SpaceProps> = ({size = 0, horizontal}) => {
  const style: React.CSSProperties = {};
  if (horizontal) {
    style.display = 'inline-block';
    style.width = 12 + size * 4;
  } else {
    style.display = 'block';
    style.height = 12 + size * 4;
  }
  return <span style={style} />;
};
