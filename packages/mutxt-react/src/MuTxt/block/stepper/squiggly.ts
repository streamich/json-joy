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
