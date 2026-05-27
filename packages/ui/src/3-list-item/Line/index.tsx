import * as React from 'react';
import {rule} from 'nano-theme';

export type HrLineStyle = 'solid' | 'dashed' | 'dotted' | 'squiggly';

const SQUIGGLY_PERIOD = 8;
const SQUIGGLY_AMPLITUDE = 2.2;

// Center-to-center spacing of dots, as a multiple of the dot size.
const DOTTED_PERIOD_RATIO = 4;
// Corner radius of a dot, as a fraction of its size. 0.5 = circle, lower = squarer.
const DOTTED_CORNER_RATIO = 0.34;

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

const buildSquigglyMask = (strokeWidth: number, orientation: HrLineOrientation): {uri: string; thickness: number} => {
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

const buildDottedMask = (
  strokeWidth: number,
  orientation: HrLineOrientation,
): {uri: string; thickness: number; period: number} => {
  const thickness = strokeWidth;
  const size = strokeWidth;
  const radius = size * DOTTED_CORNER_RATIO;
  const period = strokeWidth * DOTTED_PERIOD_RATIO;
  let svgWidth: number;
  let svgHeight: number;
  let x: number;
  let y: number;
  if (orientation === 'vertical') {
    svgWidth = thickness;
    svgHeight = period;
    x = 0;
    y = period / 2 - size / 2;
  } else {
    svgWidth = period;
    svgHeight = thickness;
    x = period / 2 - size / 2;
    y = 0;
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${svgWidth}' height='${svgHeight}' viewBox='0 0 ${svgWidth} ${svgHeight}'><rect x='${x}' y='${y}' width='${size}' height='${size}' rx='${radius}' ry='${radius}' fill='black'/></svg>`;
  return {uri: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`, thickness, period};
};

const maskedLineStyle = (
  uri: string,
  thickness: number,
  period: number,
  isVertical: boolean,
  color?: string,
): React.CSSProperties => ({
  [isVertical ? 'width' : 'height']: thickness,
  backgroundColor: color ?? 'currentColor',
  WebkitMaskImage: uri,
  maskImage: uri,
  WebkitMaskRepeat: isVertical ? 'repeat-y' : 'repeat-x',
  maskRepeat: isVertical ? 'repeat-y' : 'repeat-x',
  WebkitMaskPosition: 'center center',
  maskPosition: 'center center',
  WebkitMaskSize: isVertical ? `${thickness}px ${period}px` : `${period}px ${thickness}px`,
  maskSize: isVertical ? `${thickness}px ${period}px` : `${period}px ${thickness}px`,
});

const lineStyleToCssBorder = (style: HrLineStyle): React.CSSProperties['borderTopStyle'] => {
  switch (style) {
    case 'dashed':
      return 'dashed';
    default:
      return 'solid';
  }
};

export interface LineProps {
  strokeWidth: number;
  style: HrLineStyle;
  color?: string;
  orientation?: HrLineOrientation;
}

export const Line: React.FC<LineProps> = ({strokeWidth, style, color, orientation = 'horizontal'}) => {
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
        style={maskedLineStyle(uri, thickness, SQUIGGLY_PERIOD, isVertical, color)}
      />
    );
  }

  if (style === 'dotted') {
    if (strokeWidth <= 0) {
      return <span className={lineClass} aria-hidden="true" />;
    }
    const {uri, thickness, period} = buildDottedMask(strokeWidth, orientation);
    return (
      <span
        className={lineClass}
        aria-hidden="true"
        style={maskedLineStyle(uri, thickness, period, isVertical, color)}
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
          borderLeftColor: color ?? 'currentColor',
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
        borderTopColor: color ?? 'currentColor',
        borderRadius: style === 'solid' ? Math.max(1, strokeWidth / 4) : undefined,
      }}
    />
  );
};
