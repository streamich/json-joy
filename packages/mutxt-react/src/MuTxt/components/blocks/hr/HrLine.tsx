import * as React from 'react';
import {rule} from 'nano-theme';
import type {HrLineStyle} from '../../../types';

const SQUIGGLY_PERIOD = 8;
const SQUIGGLY_AMPLITUDE = 2.2;

const lineClass = rule({
  flex: '1 1 0%',
  minW: '0',
  d: 'block',
});

const buildSquigglyMask = (strokeWidth: number): {uri: string; height: number} => {
  const period = SQUIGGLY_PERIOD;
  const amp = SQUIGGLY_AMPLITUDE;
  const height = amp * 2 + strokeWidth + 2;
  const mid = height / 2;
  const path = `M0 ${mid} Q${period / 4} ${mid - amp}, ${period / 2} ${mid} T${period} ${mid}`;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${period}' height='${height}' viewBox='0 0 ${period} ${height}'><path d='${path}' fill='none' stroke='black' stroke-width='${strokeWidth}' stroke-linecap='round'/></svg>`;
  return {uri: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`, height};
};

const lineStyleToCssBorder = (style: HrLineStyle): React.CSSProperties['borderTopStyle'] => {
  switch (style) {
    case 'dashed':
      return 'dashed';
    case 'dotted':
      return 'dotted';
    default:
      return 'solid';
  }
};

export interface HrLineProps {
  strokeWidth: number;
  style: HrLineStyle;
}

export const HrLine: React.FC<HrLineProps> = ({strokeWidth, style}) => {
  if (style === 'squiggly') {
    if (strokeWidth <= 0) {
      return <span className={lineClass} aria-hidden="true" />;
    }
    const {uri, height} = buildSquigglyMask(strokeWidth);
    return (
      <span
        className={lineClass}
        aria-hidden="true"
        style={{
          height,
          backgroundColor: 'currentColor',
          WebkitMaskImage: uri,
          maskImage: uri,
          WebkitMaskRepeat: 'repeat-x',
          maskRepeat: 'repeat-x',
          WebkitMaskPosition: 'center center',
          maskPosition: 'center center',
          WebkitMaskSize: `${SQUIGGLY_PERIOD}px ${height}px`,
          maskSize: `${SQUIGGLY_PERIOD}px ${height}px`,
        }}
      />
    );
  }

  return (
    <span
      className={lineClass}
      aria-hidden="true"
      style={{
        borderTopWidth: strokeWidth,
        borderTopStyle: lineStyleToCssBorder(style),
        borderTopColor: 'currentColor',
        borderRadius: style === 'solid' ? Math.max(1, strokeWidth / 4) : undefined,
      }}
    />
  );
};
