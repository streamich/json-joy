import * as React from 'react';
import {rule, drule, keyframes} from 'nano-theme';

const ON = 'floaterOn';

const floatKf = keyframes({
  '0%, 100%': {transform: 'translateY(0)'},
  '50%': {transform: 'translateY(calc(var(--fl-dist, 10px) * -1))'},
});

const bobClass = rule({
  display: 'inline-block',
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none !important',
  },
});

const sharp = {
  filter: 'none',
  opacity: 1,
};

const fxHoverClass = drule({
  '&:hover': sharp,
  '&:hover *': {animationPlayState: 'paused'},
  [`&.${ON}`]: sharp,
  [`&.${ON} *`]: {animationPlayState: 'paused'},
});

const fxClass = drule({
  [`&.${ON}`]: sharp,
  [`&.${ON} *`]: {animationPlayState: 'paused'},
});

export interface FloaterProps {
  /** Slow vertical drift. Default `true`. */
  float?: boolean;
  /** Drift travel in px. Default `10`. */
  distance?: number;
  /** Drift period in seconds. Default `9`. */
  duration?: number;
  /** Drift delay in seconds (use negative to desync instances). Default `0`. */
  delay?: number;
  /** Gaussian blur in px. Default `0`. */
  blur?: number;
  /** Opacity 0..1. Default `1`. */
  opacity?: number;
  /** Rotation in degrees. Default `0`. */
  rotate?: number;
  /** Positional offset in px. */
  shiftX?: number;
  shiftY?: number;
  /** Optional 3D tilt (needs a perspective to be visible). */
  tiltX?: number;
  tiltY?: number;
  tz?: number;
  /** Perspective in px applied to the tilt. Default `900`. */
  perspective?: number;
  /** On hover: drop blur/opacity, flatten tilt, pause the drift. */
  sharpenOnHover?: boolean;
  /** Force the sharpened state without hover (programmatic spotlight). */
  active?: boolean;
  /** Transition duration in ms for the sharpen/melt. Default `450`. */
  transition?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const Floater: React.FC<FloaterProps> = ({
  float = true,
  distance = 10,
  duration = 9,
  delay = 0,
  blur = 0,
  opacity = 1,
  rotate = 0,
  shiftX = 0,
  shiftY = 0,
  tiltX = 0,
  tiltY = 0,
  tz = 0,
  perspective = 900,
  sharpenOnHover,
  active,
  transition = 450,
  className,
  style,
  children,
}) => {
  const has3d = !!(tiltX || tiltY || tz);

  const outerStyle: React.CSSProperties = {
    display: 'inline-block',
    transform:
      (has3d ? `perspective(${perspective}px) ` : '') + `translate(${shiftX}px, ${shiftY}px) rotate(${rotate}deg)`,
  };

  const fxBase = sharpenOnHover ? fxHoverClass : fxClass;
  const fxCls =
    fxBase({
      display: 'inline-block',
      filter: blur ? `blur(${blur}px)` : 'none',
      opacity,
      transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(${tz}px)`,
      trs: `filter ${transition}ms ease, opacity ${transition}ms ease`,
    }) + (active ? ' ' + ON : '');

  return (
    <span className={className} style={{...outerStyle, ...style}}>
      <span className={fxCls}>
        <span
          className={bobClass}
          style={
            float
              ? ({
                  animation: `${floatKf} ${duration}s ease-in-out ${delay}s infinite`,
                  ['--fl-dist' as any]: `${distance}px`,
                } as React.CSSProperties)
              : undefined
          }
        >
          {children}
        </span>
      </span>
    </span>
  );
};

export default Floater;
