import * as React from 'react';
import type {HrLineStyle} from '../../types';

export type BorderStyleIconStyle = HrLineStyle | 'none';

export interface BorderStyleIconProps {
  style: BorderStyleIconStyle;
  /** Outer size of the (square) icon in pixels. */
  size?: number;
  /** Stroke thickness in pixels. */
  strokeWidth?: number;
  /** Padding from each long edge of the icon, in pixels. */
  padding?: number;
  /** Stroke orientation. Defaults to `'horizontal'`. */
  orientation?: 'horizontal' | 'vertical';
}

const SQUIGGLY_PERIOD = 6;
const SQUIGGLY_AMP = 1.5;

const svgStyle: React.CSSProperties = {display: 'block', overflow: 'visible'};
const wrapStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  verticalAlign: 'middle',
};

/**
 * Build a closed wavy line from `start` to `end` along the segment axis,
 * with the perpendicular axis fixed at `mid`. Used by both orientations.
 */
const squigglyPath = (start: number, end: number, mid: number, axis: 'horizontal' | 'vertical'): string => {
  const len = end - start;
  if (len <= 0) return '';
  // Even number of half-waves so the line ends on the baseline.
  const halfWaves = Math.max(2, Math.round(len / (SQUIGGLY_PERIOD / 2)) & ~1);
  const seg = len / halfWaves;
  let d = axis === 'horizontal' ? `M ${start} ${mid}` : `M ${mid} ${start}`;
  let side: 1 | -1 = 1;
  for (let i = 0; i < halfWaves; i++) {
    const tCtrl = start + seg * (i + 0.5);
    const tEnd = start + seg * (i + 1);
    const offset = SQUIGGLY_AMP * side;
    if (axis === 'horizontal') {
      d += ` Q ${tCtrl.toFixed(2)} ${(mid - offset).toFixed(2)} ${tEnd.toFixed(2)} ${mid}`;
    } else {
      d += ` Q ${(mid - offset).toFixed(2)} ${tCtrl.toFixed(2)} ${mid} ${tEnd.toFixed(2)}`;
    }
    side = -side as 1 | -1;
  }
  return d;
};

/**
 * Small icon that previews a stroke style as a horizontal (or vertical) line
 * through the middle of a square hit-box. All styles render via inline SVG
 * so the stroke is precisely centered regardless of orientation.
 */
export const BorderStyleIcon: React.FC<BorderStyleIconProps> = ({
  style,
  size = 16,
  strokeWidth = 2,
  padding = 2,
  orientation = 'horizontal',
}) => {
  if (style === 'none') {
    // Render an empty hit-box so the icon column still aligns, but draw
    // nothing — the option is "no line".
    return <span style={{...wrapStyle, width: size, height: size}} aria-hidden="true" />;
  }

  const vertical = orientation === 'vertical';
  const start = padding;
  const end = size - padding;
  const mid = size / 2;

  let body: React.ReactNode;
  if (style === 'squiggly') {
    body = (
      <path
        d={squigglyPath(start, end, mid, orientation)}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  } else {
    let dashArray: string | undefined;
    let linecap: 'butt' | 'round' = 'butt';
    if (style === 'dashed') {
      dashArray = `${strokeWidth * 1.6} ${strokeWidth * 1.2}`;
    } else if (style === 'dotted') {
      dashArray = `0 ${strokeWidth * 1.5}`;
      linecap = 'round';
    } else {
      linecap = 'round';
    }
    body = (
      <line
        x1={vertical ? mid : start}
        y1={vertical ? start : mid}
        x2={vertical ? mid : end}
        y2={vertical ? end : mid}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        strokeLinecap={linecap}
      />
    );
  }

  return (
    <span style={wrapStyle} aria-hidden="true">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={svgStyle}>
        {body}
      </svg>
    </span>
  );
};
