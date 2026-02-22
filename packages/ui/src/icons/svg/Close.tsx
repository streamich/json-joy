import * as React from 'react';

const IconSvgClose: React.FC<{size?: number}> = ({size = 16}) => (
  <span
    style={{
      width: size,
      height: size,
      display: 'inline-block',
      textAlign: 'center',
    }}
  >
    <svg width={(size * 12) / 16} height={size} viewBox="0 0 12 16">
      <path d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48z" />
    </svg>
  </span>
);

export default IconSvgClose;
