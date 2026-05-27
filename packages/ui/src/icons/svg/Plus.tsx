import * as React from 'react';

export interface PlusProps {
  size?: number;
  thickness?: number;
  color?: string;
}

export const Plus: React.FC<PlusProps> = ({size = 9, thickness = 1, color = 'currentColor'}) => {
  const offset = Math.floor((size - thickness) / 2);
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      style={{display: 'block'}}
    >
      <rect x={0} y={offset} width={size} height={thickness} fill={color} />
      <rect x={offset} y={0} width={thickness} height={size} fill={color} />
    </svg>
  );
};

export default Plus;
