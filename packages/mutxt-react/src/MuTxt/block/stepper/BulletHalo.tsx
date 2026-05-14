import * as React from 'react';
import {INDICATOR_SIZE, HALO_OFFSET} from './settings';
import {plainCirclePath, squigglyCirclePath} from './squiggly';
import type {LineStyle} from './types';

const SQUIGGLY_LOBES = 12;
const SQUIGGLY_AMP = 1;

export interface BulletHaloProps {
  style: LineStyle;
  color: string;
  strokeWidth: number;
}

const dashFor = (style: LineStyle, strokeWidth: number): {dash?: string; cap: 'butt' | 'round'} => {
  if (style === 'dashed')
    return {dash: `${(strokeWidth * 2.5).toFixed(2)} ${(strokeWidth * 1.8).toFixed(2)}`, cap: 'butt'};
  if (style === 'dotted') return {dash: `0 ${(strokeWidth * 2.2).toFixed(2)}`, cap: 'round'};
  return {cap: 'butt'};
};

/**
 * Decorative halo drawn around the bullet, just outside its outline.
 */
export const BulletHalo: React.FC<BulletHaloProps> = ({style, color, strokeWidth}) => {
  if (style === 'none' || strokeWidth <= 0) return null;
  const padding = Math.max(SQUIGGLY_AMP + strokeWidth, strokeWidth * 2);
  const outerSize = INDICATOR_SIZE + HALO_OFFSET * 2 + padding * 2;
  const center = outerSize / 2;
  const meanRadius = INDICATOR_SIZE / 2 + HALO_OFFSET;
  const path =
    style === 'squiggly'
      ? squigglyCirclePath(center, meanRadius, SQUIGGLY_LOBES, SQUIGGLY_AMP)
      : plainCirclePath(center, meanRadius);
  const {dash, cap} = dashFor(style, strokeWidth);

  return (
    <svg
      width={outerSize}
      height={outerSize}
      viewBox={`0 0 ${outerSize} ${outerSize}`}
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={dash} strokeLinecap={cap} />
    </svg>
  );
};
