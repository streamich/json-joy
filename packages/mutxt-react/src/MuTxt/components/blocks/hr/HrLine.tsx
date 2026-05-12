import * as React from 'react';
import {rule} from 'nano-theme';
import type {HrLineStyle} from '../../../types';

const SQUIGGLY_PERIOD = 8;
const SQUIGGLY_AMPLITUDE = 2.2;

const horizontalLineClass = rule({
  flex: '1 1 0%',
  minW: '0',
  d: 'block',
});

const verticalLineClass = rule({
  flex: '1 1 0%',
  minH: '0',
  d: 'block',
  alignSelf: 'stretch',
});

export type HrLineOrientation = 'horizontal' | 'vertical';

const buildSquigglyMask = (
  strokeWidth: number,
  orientation: HrLineOrientation,
): {uri: string; thickness: number} => {
  const period = SQUIGGLY_PERIOD;
  const amp = SQUIGGLY_AMPLITUDE;
  const thickness = amp * 2 + strokeWidth + 2;
  const mid = thickness / 2;
  let svgWidth: number;
  let svgHeight: number;
  let path: string;
  if (orientation === 'vertical') {
    svgWidth = thickness;
    svgHeight = period;
    path = `M${mid} 0 Q${mid - amp} ${period / 4}, ${mid} ${period / 2} T${mid} ${period}`;
  } else {
    svgWidth = period;
    svgHeight = thickness;
    path = `M0 ${mid} Q${period / 4} ${mid - amp}, ${period / 2} ${mid} T${period} ${mid}`;
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${svgWidth}' height='${svgHeight}' viewBox='0 0 ${svgWidth} ${svgHeight}'><path d='${path}' fill='none' stroke='black' stroke-width='${strokeWidth}' stroke-linecap='round'/></svg>`;
  return {uri: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`, thickness};
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
  orientation?: HrLineOrientation;
}

export const HrLine: React.FC<HrLineProps> = ({strokeWidth, style, orientation = 'horizontal'}) => {
  const isVertical = orientation === 'vertical';
  const lineClass = isVertical ? verticalLineClass : horizontalLineClass;

  if (style === 'squiggly') {
    if (strokeWidth <= 0) {
      return <span className={lineClass} aria-hidden="true" />;
    }
    const {uri, thickness} = buildSquigglyMask(strokeWidth, orientation);
    return (
      <span
        className={lineClass}
        aria-hidden="true"
        style={{
          [isVertical ? 'width' : 'height']: thickness,
          backgroundColor: 'currentColor',
          WebkitMaskImage: uri,
          maskImage: uri,
          WebkitMaskRepeat: isVertical ? 'repeat-y' : 'repeat-x',
          maskRepeat: isVertical ? 'repeat-y' : 'repeat-x',
          WebkitMaskPosition: 'center center',
          maskPosition: 'center center',
          WebkitMaskSize: isVertical
            ? `${thickness}px ${SQUIGGLY_PERIOD}px`
            : `${SQUIGGLY_PERIOD}px ${thickness}px`,
          maskSize: isVertical
            ? `${thickness}px ${SQUIGGLY_PERIOD}px`
            : `${SQUIGGLY_PERIOD}px ${thickness}px`,
        }}
      />
    );
  }

  if (isVertical) {
    return (
      <span
        className={lineClass}
        aria-hidden="true"
        style={{
          borderLeftWidth: strokeWidth,
          borderLeftStyle: lineStyleToCssBorder(style),
          borderLeftColor: 'currentColor',
          borderRadius: style === 'solid' ? Math.max(1, strokeWidth / 4) : undefined,
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
