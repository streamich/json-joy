import * as React from 'react';
import {useStyles} from '../../styles/context';
import {linePath, squigglyLinePath} from './squiggly';

export * from './squiggly';

export interface SquigglyProps
  extends Omit<React.SVGProps<SVGSVGElement>, 'from' | 'to' | 'width' | 'height' | 'color'> {
  /** Width of the SVG box, in px. */
  width: number;
  /** Height of the SVG box, in px. */
  height: number;
  /** Start point `[x, y]` of the line. Default `[0, 0]`. */
  from?: readonly [number, number];
  /** End point `[x, y]` of the line. Default `[width, height]`. */
  to?: readonly [number, number];
  /** Render a plain straight line instead of a wavy one. */
  straight?: boolean;
  /** Stroke color. Defaults to a faint themed grey. */
  color?: string;
  /** Stroke width, in px. Default 1. */
  thickness?: number;
  /** Dash pattern, e.g. `'2 2'` for dotted. */
  dash?: string;
  /** Distance between successive wave peaks along the line, in px. Default 6. */
  wavelength?: number;
  /** Peak deviation from the straight baseline, in px. Default 1.5. */
  amplitude?: number;
  /** Samples taken per wavelength. Default 8. */
  resolution?: number;
  /** Phase offset of the wave, in radians. Default 0. */
  phase?: number;
}

/**
 * A single wavy ("squiggly") or straight line drawn as an inline SVG. Endpoints
 * default to the box diagonal but can be set to draw vertical indent guides,
 * horizontal elbows, or any segment. Used by the file `Tree`'s fancy connector
 * lines and available standalone for decorative underlines/dividers.
 */
export const Squiggly: React.FC<SquigglyProps> = ({
  width,
  height,
  from,
  to,
  straight,
  color,
  thickness = 1,
  dash,
  wavelength,
  amplitude,
  resolution,
  phase,
  style,
  ...rest
}) => {
  const styles = useStyles();
  const [x1, y1] = from ?? [0, 0];
  const [x2, y2] = to ?? [width, height];
  const stroke = color ?? styles.g(0, 0.24);
  const d = straight
    ? linePath(x1, y1, x2, y2)
    : squigglyLinePath(x1, y1, x2, y2, {wavelength, amplitude, resolution, phase});
  return (
    <svg
      {...rest}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{display: 'block', overflow: 'visible', ...style}}
    >
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={thickness}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dash}
      />
    </svg>
  );
};

export default Squiggly;
