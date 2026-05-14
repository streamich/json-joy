import * as React from 'react';
import {INDICATOR_SIZE} from './settings';
import {squigglyCirclePath} from './squiggly';

const SQUIGGLY_LOBES = 12;
const SQUIGGLY_AMP = 1.2;

export interface BulletSquigglyRingProps {
  strokeColor: string;
  strokeWidth: number;
}

/**
 * Squiggly outline of the bullet disc. Drawn as an SVG so the wavy ring sits
 * flush around the bullet's natural box and lobes don't get clipped.
 */
export const BulletSquigglyRing: React.FC<BulletSquigglyRingProps> = ({strokeColor, strokeWidth}) => {
  const padding = SQUIGGLY_AMP + strokeWidth;
  const outerSize = INDICATOR_SIZE + padding * 2;
  const center = outerSize / 2;
  const meanRadius = INDICATOR_SIZE / 2 - strokeWidth / 2;
  const path = squigglyCirclePath(center, meanRadius, SQUIGGLY_LOBES, SQUIGGLY_AMP);
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
      <path d={path} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
    </svg>
  );
};
