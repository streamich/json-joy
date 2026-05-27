import * as React from 'react';
import {rule} from 'nano-theme';
import useWindowSize from 'react-use/lib/useWindowSize';

const discClass = rule({
  pos: 'absolute',
  bdrad: '50%',
  ov: 'hidden',
  bxz: 'border-box',
  bxsh: '0 4px 8px rgba(18,26,48,.14), 1px 2px 4px rgba(18,26,48,.07)',
});

const ringClass = rule({
  pos: 'absolute',
  inset: 0,
  bdrad: '50%',
  pointerEvents: 'none',
  bxsh: 'inset 0 0 0 6px #fff, inset 0 2px 0 7px rgba(0,0,0,.07)',
});

export interface FloatingZoomProps {
  /** Diameter of the lens, in pixels. */
  size?: number;
  /** Horizontal position over the parent box, 0 = left edge, 1 = right edge. */
  x?: number;
  /** Vertical position over the parent box, 0 = top edge, 1 = bottom edge. */
  y?: number;
  /** Hide the lens when the window is at or below this width, in pixels. */
  hideBelow?: number;
  /** Draw the white lens ring and inner shadow. Defaults to `true`. */
  ring?: boolean;
  /** Backdrop behind the content, shown before/around it. Defaults to white. */
  background?: string;
  zIndex?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * A circular "zoom lens" that floats over a relative position of its parent
 * box. The lens center is placed at `(x, y)` where each coordinate is a
 * fraction in `[0..1]` of the parent's width/height, so it must be rendered
 * inside a positioned element that matches the box it magnifies. Anything can
 * go inside; the content is clipped to the circle.
 */
export const FloatingZoom: React.FC<FloatingZoomProps> = ({
  size = 360,
  x = 0.5,
  y = 0.5,
  hideBelow = 0,
  ring = true,
  background = '#fff',
  zIndex = 3,
  className,
  style,
  children,
}) => {
  const {width} = useWindowSize();
  if (hideBelow && width <= hideBelow) return null;

  return (
    <div
      className={(className ? className + ' ' : '') + discClass}
      style={{
        width: size,
        height: size,
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: 'translate(-50%, -50%)',
        background,
        zIndex,
        ...style,
      }}
    >
      {children}
      {ring && <div className={ringClass} />}
    </div>
  );
};

export default FloatingZoom;
