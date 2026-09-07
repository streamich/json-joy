/**
 * SVG path generators for "squiggly" (wavy) and plain lines and circles. These
 * are pure string builders with no React/DOM dependency, so they can drive an
 * `<svg>` `<path>`, a CSS `background-image`, or a canvas stroke.
 *
 * The line generators are the canonical home for the fancy connector lines used
 * by the file `Tree` (indent guides) and the MuTxt rich-text editor (originally
 * `MuTxt/block/stepper/squiggly.ts`, which can re-import from here to dedupe).
 */

export interface SquigglyLineOpts {
  /** Distance between successive wave peaks along the line, in px. Default 6. */
  wavelength?: number;
  /** Peak deviation from the straight baseline, in px. Default 1.5. */
  amplitude?: number;
  /** Samples taken per wavelength — higher is smoother. Default 8. */
  resolution?: number;
  /** Phase offset of the wave, in radians. Default 0. */
  phase?: number;
}

/**
 * Build an open SVG path tracing a wavy line from `(x1, y1)` to `(x2, y2)`. The
 * wave is applied perpendicular to the segment, so it works at any angle
 * (vertical indent guides, horizontal elbows, diagonals).
 */
export const squigglyLinePath = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  opts: SquigglyLineOpts = {},
): string => {
  const {wavelength = 6, amplitude = 1.5, resolution = 8, phase = 0} = opts;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  // Unit vector along the segment and its perpendicular.
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const steps = Math.max(2, Math.ceil((len / wavelength) * resolution));
  let path = '';
  for (let i = 0; i <= steps; i++) {
    const along = (i / steps) * len;
    const off = amplitude * Math.sin((along / wavelength) * Math.PI * 2 + phase);
    const x = x1 + ux * along + px * off;
    const y = y1 + uy * along + py * off;
    path += i === 0 ? `M${x.toFixed(2)} ${y.toFixed(2)}` : ` L${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return path;
};

/** SVG path tracing a straight line from `(x1, y1)` to `(x2, y2)`. */
export const linePath = (x1: number, y1: number, x2: number, y2: number): string => `M${x1} ${y1} L${x2} ${y2}`;

const STEPS = 240;

/**
 * Build a closed SVG path tracing a wavy circle centered at `(center, center)`
 * with the given `meanRadius`. `lobes` controls how many bumps go around the
 * loop, `amplitude` controls how far the path deviates from the mean radius.
 */
export const squigglyCirclePath = (center: number, meanRadius: number, lobes: number, amplitude: number): string => {
  let path = '';
  for (let i = 0; i <= STEPS; i++) {
    const t = (i / STEPS) * Math.PI * 2;
    const r = meanRadius + amplitude * Math.sin(lobes * t);
    const x = center + r * Math.cos(t);
    const y = center + r * Math.sin(t);
    path += i === 0 ? `M${x.toFixed(2)} ${y.toFixed(2)}` : ` L${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return path + ' Z';
};

/**
 * SVG path tracing a plain (non-squiggly) circle centered at `(center, center)`.
 * Used for ring/halo strokes when the style is `solid`, `dashed`, or `dotted`.
 */
export const plainCirclePath = (center: number, radius: number): string =>
  `M ${center} ${center - radius} ` +
  `A ${radius} ${radius} 0 1 1 ${center} ${center + radius} ` +
  `A ${radius} ${radius} 0 1 1 ${center} ${center - radius} Z`;
