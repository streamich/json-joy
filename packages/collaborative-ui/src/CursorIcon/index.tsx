import * as React from 'react';

export interface CursorIconProps {
  width?: number;
  color?: string;
}

const filterId = 'cursorFilter' + Date.now();

export const CursorIcon: React.FC<CursorIconProps> = ({width = 26, color = '#000'}) => {
  const height = (width * 38) / 26;

  return (
    <svg width={width} height={height} viewBox="0 0 26 38" fill="none">
      <g filter={`url(#${filterId})`}>
        <path d="M3 18.015V2L14.591 13.619H7.55L7.399 13.743L3 18.015Z" fill="white" />
        <path d="M4 4.4071V15.5951L6.969 12.7291L7.129 12.5901H12.165L4 4.4071Z" fill={color} />
      </g>
      <defs>
        <filter id={filterId} x="0.4" y="0.4" width="25.2" height="37.2" filterUnits="userSpaceOnUse">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="1.3" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.32 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_7766_1567" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_7766_1567" result="shape" />
        </filter>
      </defs>
    </svg>
  );
};
