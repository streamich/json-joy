import * as React from 'react';

const path = (
  <path d="M22.316,12.234c0,1.461,0,7.985,0,7.985h-5.85v9.766h5.85V59h12.021V29.985H42.4 c0,0,0.754-4.684,1.121-9.803c-1.051,0-9.141,0-9.141,0s0-5.682,0-6.677c0-0.997,1.309-2.34,2.605-2.34c1.292,0,4.021,0,6.547,0 c0-1.33,0-5.924,0-10.166c-3.372,0-7.21,0-8.9,0C22.02,1,22.316,10.774,22.316,12.234z" />
);

export interface Props {
  color?: string;
  size?: number;
}

export const Facebook: React.FC<Props> = ({color = '#47639E', size = 32}) => (
  <svg width={size} height={size} fill={color} viewBox="0 0 60 60">
    {path}
  </svg>
);
