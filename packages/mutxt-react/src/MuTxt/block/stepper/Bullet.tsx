import * as React from 'react';
import {rule} from 'nano-theme';
import {BulletGlyph} from './BulletGlyph';
import {BulletHalo} from './BulletHalo';
import {BulletSquigglyRing} from './BulletSquigglyRing';
import {INDICATOR_SIZE} from './settings';
import type {LineStyle, StepIndicator, StepState} from './types';

export const bulletClassName = 'mutxt-step-bullet';

const bulletClass = rule({
  pos: 'relative',
  w: `${INDICATOR_SIZE}px`,
  h: `${INDICATOR_SIZE}px`,
  bdrad: '50%',
  d: 'flex',
  ai: 'center',
  jc: 'center',
  bxz: 'border-box',
  fz: '13px',
  fw: 600,
  lh: '1',
  us: 'none',
  flexShrink: 0,
  trs: 'background-color .08s ease, border-color .08s ease, color .08s ease, box-shadow .08s ease, transform .08s ease',
  overflow: 'hidden',
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  '&:hover': {
    bxsh: '0 0 0 4px rgba(127,127,127,0.14)',
    transform: 'scale(1.04)',
  },
  '&:active': {
    transform: 'scale(0.97)',
  },
});

const glyphWrapClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'center',
  w: '100%',
  h: '100%',
  lh: '1',
  ['textBoxTrim' as any]: 'trim-both',
  ['textBoxEdge' as any]: 'cap alphabetic',
});

export interface BulletProps {
  state: StepState;
  indicator: StepIndicator;
  chars: string;
  index: number;
  bg: string;
  glyphColor: string;
  ring: LineStyle;
  ringColor: string;
  ringWidth: number;
  halo: LineStyle;
  haloColor: string;
  haloWidth: number;
}

const cssBorderStyleFor = (style: LineStyle): React.CSSProperties => {
  switch (style) {
    case 'none':
    case 'squiggly':
      return {borderStyle: 'none', borderWidth: 0};
    case 'solid':
    case 'dashed':
    case 'dotted':
      return {borderStyle: style};
  }
};

/**
 * Single step's visual disc. Combines the inner glyph, the bullet ring (CSS
 * border for plain styles or SVG for `squiggly`), and an optional outer halo.
 * State governs the default colors of all three parts, props let the caller
 * override any of them.
 */
export const Bullet: React.FC<BulletProps> = ({
  state,
  indicator,
  chars,
  index,
  bg,
  glyphColor,
  ring,
  ringColor,
  ringWidth,
  halo,
  haloColor,
  haloWidth,
}) => {
  const isSquigglyRing = ring === 'squiggly' && ringWidth > 0;
  const showCssBorder = ring !== 'none' && ring !== 'squiggly' && ringWidth > 0;
  const borderStyles = cssBorderStyleFor(showCssBorder ? ring : 'none');

  return (
    <>
      <span
        className={`${bulletClass} ${bulletClassName}`}
        style={{
          background: isSquigglyRing ? 'transparent' : bg,
          color: glyphColor,
          ...borderStyles,
          ...(showCssBorder ? {borderWidth: ringWidth, borderColor: ringColor} : null),
          ...(isSquigglyRing ? {overflow: 'visible'} : null),
        }}
      >
        {isSquigglyRing && <BulletSquigglyRing strokeColor={ringColor} strokeWidth={ringWidth} />}
        <span className={glyphWrapClass}>
          <BulletGlyph state={state} indicator={indicator} chars={chars} index={index} color={glyphColor} />
        </span>
      </span>
      <BulletHalo style={halo} color={haloColor} strokeWidth={haloWidth} />
    </>
  );
};
