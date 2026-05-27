/**
 * Doodles are decorative ribbons built from the same two tiles as the json-joy
 * logo on a 23px grid: a 23x34 rectangle (straight run) and a 23x23 rounded
 * triangle (a quarter-turn; two back-to-back make a 180 deg hairpin cap).
 *
 * `c` is a brand color index 0..5 mapping to `styles.brand1..6`
 * (red, purple, pink, orange, green, blue) - same order as the logo.
 */
export type Shape = {t: 'r'; x: number; y: number; w: number; h: number; c: number} | {t: 'p'; d: string; c: number};

export interface Box {
  w: number;
  h: number;
}

export type DoodleDir = 'horizontal' | 'vertical' | 'diagonal';

const U = 23;

export const UNIT: Box = {w: 69, h: 68};

const STEP_X = 2 * U; // 46

const WAVE_UNIT: Shape[] = [
  {t: 'p', c: 0, d: 'M46 34L23 34L23 11C35.7026 11 46 21.2975 46 34Z'},
  {t: 'p', c: 1, d: 'M0 34L23 34L23 11C10.2975 11 0 21.2974 0 34Z'},
  {t: 'r', c: 2, x: 0, y: 34, w: 23, h: 34},
  {t: 'p', c: 3, d: 'M23 34H46V57C33.2975 57 23 46.7025 23 34Z'},
  {t: 'p', c: 4, d: 'M69 34H46V57C58.7025 57 69 46.7025 69 34Z'},
  {t: 'r', c: 5, x: 46, y: 0, w: 23, h: 34},
];

const CAP_UNIT: Shape[] = [
  {t: 'p', c: 0, d: 'M46 34L23 34L23 11C35.7026 11 46 21.2975 46 34Z'},
  {t: 'p', c: 1, d: 'M0 34L23 34L23 11C10.2975 11 0 21.2974 0 34Z'},
  {t: 'p', c: 3, d: 'M23 34H46V57C33.2975 57 23 46.7025 23 34Z'},
  {t: 'p', c: 4, d: 'M69 34H46V57C58.7025 57 69 46.7025 69 34Z'},
];

export interface Generated {
  groups: {tx: number; ty: number; flip?: boolean; shapes: Shape[]}[];
  vx?: number;
  vy?: number;
  vb: Box;
}

export const buildWave = (dir: DoodleDir, n: number): Generated => {
  const count = Math.max(1, Math.floor(n));
  const groups: Generated['groups'] = [];
  let vb: Box;
  if (dir === 'vertical') {
    vb = {w: UNIT.w, h: UNIT.h * count};
    for (let i = 0; i < count; i++) groups.push({tx: 0, ty: i * UNIT.h, flip: i % 2 === 1, shapes: WAVE_UNIT});
  } else if (dir === 'diagonal') {
    vb = {w: UNIT.w + STEP_X * (count - 1), h: UNIT.h * count};
    for (let i = 0; i < count; i++) groups.push({tx: i * STEP_X, ty: (count - 1 - i) * UNIT.h, shapes: WAVE_UNIT});
  } else {
    vb = {w: UNIT.w + STEP_X * (count - 1), h: UNIT.h};
    for (let i = 0; i < count; i++) groups.push({tx: i * STEP_X, ty: 0, shapes: WAVE_UNIT});
  }
  return {groups, vb};
};

export const buildScallop = (n: number): Generated => {
  const count = Math.max(1, Math.floor(n));
  const groups: Generated['groups'] = [];
  for (let i = 0; i < count; i++) groups.push({tx: i * STEP_X, ty: 0, shapes: CAP_UNIT});
  return {groups, vx: 0, vy: 11, vb: {w: UNIT.w + STEP_X * (count - 1), h: 46}};
};

export type DoodlePreset = 'mini' | 'arch';

interface Preset {
  vb: Box;
  shapes: Shape[];
}

const MINI: Preset = {
  vb: {w: 69, h: 57},
  shapes: [
    {t: 'p', c: 3, d: 'M0 34H23V57C10.2975 57 0 46.7027 0 34Z'},
    {t: 'p', c: 4, d: 'M46 34H23V57C35.7025 57 46 46.7027 46 34Z'},
    {t: 'r', c: 5, x: 23, y: 0, w: 23, h: 34},
    {t: 'r', c: 2, x: 46, y: 0, w: 23, h: 34},
  ],
};

const ARCH: Preset = {
  vb: {w: 230, h: 159},
  shapes: [
    {t: 'p', c: 0, d: 'M46 125L23 125L23 102C35.7026 102 46 112.298 46 125Z'},
    {t: 'p', c: 1, d: 'M0 125L23 125L23 102C10.2975 102 0 112.298 0 125Z'},
    {t: 'r', c: 2, x: 0, y: 125, w: 23, h: 34},
    {t: 'p', c: 3, d: 'M23 125H46V148C33.2975 148 23 137.703 23 125Z'},
    {t: 'p', c: 4, d: 'M69 125H46V148C58.7025 148 69 137.703 69 125Z'},
    {t: 'r', c: 5, x: 46, y: 91, w: 23, h: 34},
    {t: 'p', c: 0, d: 'M92 57.0001L69 57.0001L69 34.0001C81.7026 34.0001 92 44.2976 92 57.0001Z'},
    {t: 'p', c: 1, d: 'M46 57.0001L69 57.0001L69 34.0001C56.2975 34.0001 46 44.2976 46 57.0001Z'},
    {t: 'r', c: 2, x: 46, y: 57, w: 23, h: 34},
    {t: 'p', c: 3, d: 'M69 57.0001H92V80.0001C79.2975 80.0001 69 69.7027 69 57.0001Z'},
    {t: 'p', c: 4, d: 'M115 57.0001H92V80.0001C104.703 80.0001 115 69.7027 115 57.0001Z'},
    {t: 'r', c: 5, x: 92, y: 23, w: 23, h: 34},
    {t: 'p', c: 0, d: 'M184 91L207 91L207 68C194.297 68 184 78.2975 184 91Z'},
    {t: 'p', c: 1, d: 'M230 91L207 91L207 68C219.703 68 230 78.2974 230 91Z'},
    {t: 'r', c: 2, x: 207, y: 91, w: 23, h: 34},
    {t: 'p', c: 3, d: 'M207 91H184V114C196.703 114 207 103.703 207 91Z'},
    {t: 'p', c: 4, d: 'M161 91H184V114C171.297 114 161 103.703 161 91Z'},
    {t: 'p', c: 0, d: 'M138 57.0001L161 57.0001L161 34.0001C148.297 34.0001 138 44.2976 138 57.0001Z'},
    {t: 'p', c: 1, d: 'M184 57.0001L161 57.0001L161 34.0001C173.703 34.0001 184 44.2976 184 57.0001Z'},
    {t: 'r', c: 2, x: 161, y: 57, w: 23, h: 34},
    {t: 'p', c: 3, d: 'M161 57.0001H138V80.0001C150.703 80.0001 161 69.7027 161 57.0001Z'},
    {t: 'p', c: 4, d: 'M115 57.0001H138V80.0001C125.297 80.0001 115 69.7027 115 57.0001Z'},
    {t: 'r', c: 5, x: 115, y: 23, w: 23, h: 34},
    {t: 'p', c: 0, d: 'M92 23L115 23L115 0C102.297 0 92 10.2975 92 23Z'},
    {t: 'p', c: 1, d: 'M138 23L115 23L115 0C127.703 0 138 10.2975 138 23Z'},
  ],
};

export const PRESETS: Record<DoodlePreset, Preset> = {mini: MINI, arch: ARCH};

export const BEND_UNIT = U;
export const BEND_PATH = `M0 0H${U}V${U}C10.2975 ${U} 0 12.7025 0 0Z`;
export const BEND_ROTATION = {tr: 0, br: 90, bl: 180, tl: 270} as const;
export type BendOrientation = keyof typeof BEND_ROTATION;

export const SQUARE = U;

export const BEND_BL = BEND_PATH; // rounds bottom-left
export const BEND_BR = 'M23 0H0V23C12.7025 23 23 12.7025 23 0Z'; // rounds bottom-right
export const BEND_TL = 'M0 23H23V0C10.2975 0 0 10.2974 0 23Z'; // rounds top-left
export const BEND_TR = 'M23 23H0V0C12.7026 0 23 10.2975 23 23Z'; // rounds top-right
