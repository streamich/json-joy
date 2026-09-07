export type TEasing = (time: number) => number;

const linear = ((t) => t) as TEasing;

const clamp = (value: number, min: number = 0, max: number = 1): number => {
  return Math.min(Math.max(value, min), max);
};

const map = (x: number, y0: number, y1: number, x0: number = 0, x1: number = 1, easing: TEasing = linear): number => {
  const t = (x - x0) / (x1 - x0);
  const y = y0 + (y1 - y0) * easing(t);
  return y;
};

const mapping =
  (y0: number, y1: number, x0: number = 0, x1: number = 1, easing: TEasing = linear): ((x: number) => number) =>
  (x: number) =>
    map(x, y0, y1, x0, x1, easing);

export const easing = {
  linear,

  /** Saturating ease-out for *unbounded* inputs:
   * rises quickly, then levels off, approaching — but never reaching — `1`.
   * Multiply its output by a maximum to size something that should grow with an
   * input yet stay capped (e.g. avatar initials vs. avatar size). */
  saturate: ((t) => (t <= 0 ? 0 : 1 - Math.exp(-t))) as TEasing,

  /** Standard entrance (fades, standard slides) */
  outCubic: ((t) => --t * t * t + 1) as TEasing,

  /** Dramatic entrance (modals, bottom sheets, large dialogs) */
  outExpo: ((t) => -Math.pow(2, -10 * t) + 1) as TEasing,

  /** Standard movement for elements already visible on screen */
  inOutCubic: ((t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1)) as TEasing,

  /** Standard exit (collapsing menus, simple fades) */
  inCubic: ((t) => t * t * t) as TEasing,

  /** Fast, dramatic exit (dismissing large overlays) */
  inExpo: ((t) => Math.pow(2, 10 * (t - 1))) as TEasing,

  /** Slight overshoot and return (toggle switches, checkboxes) */
  cubic: ((t) => t * (4 * t * t - 9 * t + 6)) as TEasing,

  /** Bouncy overshoot (error states, success badges, playful UI) */
  elastic: ((t) => t * (33 * t * t * t * t - 106 * t * t * t + 126 * t * t - 67 * t + 15)) as TEasing,

  clamp,
  map,
  mapping,
};
