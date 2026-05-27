import {defaultLiquid} from './presets/default';
import type {LiquidLayersOptions} from './types';

export const DEFAULT_CONFIG: LiquidLayersOptions = {...defaultLiquid};

export interface LiquidLayersPreset {
  name: string;
  /** One-line note on the intended use case. */
  hint: string;
  /** Overrides applied on top of {@link DEFAULT_CONFIG}. */
  config: LiquidLayersOptions;
}

/** The reference: depth-ramped pinks, a few sources per layer, soft shadows. */
export const pinkStack: LiquidLayersOptions = {};

/** A few large slow blobs that strongly merge, with a wet sheen. */
export const lavaLamp: LiquidLayersOptions = {
  count: 4,
  level: 0.68,
  levelStep: 0.04,
  sources: 2,
  sourceRadius: 0.52,
  spread: 0.42,
  attraction: 0.4,
  morphSpeed: 0.16,
  warp: 0.12,
  sheen: 0.32,
  shadow: 0.5,
  shadowOffset: 0.07,
};

/** Terraced topographic contours of one shared pool at rising levels. */
export const contours: LiquidLayersOptions = {
  mode: 'contours',
  count: 9,
  level: 0.45,
  levelStep: 0.13,
  sources: 4,
  spread: 0.4,
  sourceRadius: 0.42,
  warp: 0.22,
  sheen: 0,
  shadow: 0.4,
  shadowOffset: 0.035,
  attraction: 0,
};

/** Many small low-spread blobs that rarely merge (scatter bias). */
export const cells: LiquidLayersOptions = {
  count: 6,
  level: 0.95,
  levelStep: 0.02,
  sources: 6,
  sourceRadius: 0.17,
  sourceRadiusVar: 0.4,
  spread: 0.5,
  attraction: -0.25,
  warp: 0.1,
  morphSpeed: 0.35,
  shadow: 0.45,
};

/** Translucent glassy stack: low opacity, additive, high sheen, on dark. */
export const glass: LiquidLayersOptions = {
  count: 6,
  opacity: 0.45,
  additive: true,
  sheen: 0.6,
  shadow: 0.12,
  warp: 0.2,
  background: '#08060f',
  colorActive: 4,
  colorChangeSpeed: 0.6,
};

/**
 * Near-monochrome stack: one hue with only a slight depth variation, big blobs
 * that fill most of the screen, and pronounced soft shadows doing the separating.
 * Swap `colors` (and `background`) to retint; keep them close for the tonal look.
 */
export const monochrome: LiquidLayersOptions = {
  count: 6,
  level: 0.48,
  levelStep: 0.02,
  sources: 4,
  sourceRadius: 0.55,
  sourceRadiusVar: 0.18,
  spread: 0.5,
  attraction: 0,
  warp: 0.16,
  warpScale: 1.4,
  morphSpeed: 0.22,
  // Near-identical shades: the depth ramp barely varies, so the shadows separate
  // the layers. Widen the spread for more tonal depth, or use one color for flat.
  colors: ['#5965d4', '#626edb', '#6b77e1', '#7481e8'],
  colorMode: 'depth',
  colorActive: 0,
  background: '#3c4296',
  lightAngle: 2.2,
  shadow: 0.65,
  shadowOffset: 0.06,
  shadowSoftness: 0.5,
  shadowSteps: 8,
  elevation: 1.2,
  sheen: 0.1,
};

/** Everything slowed down: a calm idle drift of the blobs and color. */
export const ambient: LiquidLayersOptions = {
  morphSpeed: 0.12,
  warpSpeed: 0.05,
  colorChangeSpeed: 0.25,
  attraction: 0.1,
  reactToMouse: 'none',
  drift: [0.04, 0.03],
};

/** Calm, low band that sits quietly at the foot of a card. */
export const cardFooter: LiquidLayersOptions = {
  count: 5,
  level: 0.9,
  spread: 0.28,
  morphSpeed: 0.16,
  shadow: 0.45,
  sheen: 0.1,
  reactToMouse: 'none',
  pointerArea: 'element',
};

/** Subtle stack behind page content: transparent, gathers under the cursor. */
export const behindCard: LiquidLayersOptions = {
  background: undefined,
  opacity: 0.85,
  shadow: 0.4,
  reactToMouse: 'attract',
  mouseStrength: 80,
  pointerArea: 'element',
};

/**
 * Page scroll tightens the stack and turns the light. Not in the dropdown: it
 * only does something on a scrollable page, so it has a dedicated story.
 */
export const scrollReactive: LiquidLayersOptions = {
  reactToMouse: 'none',
  scrollBindings: [
    {source: 'window', axis: 'y', target: 'level', scale: 0.4},
    {source: 'window', axis: 'y', target: 'lightAngle', scale: 3},
  ],
};

export const PRESETS: LiquidLayersPreset[] = [
  {name: 'Default (Playground)', hint: 'The pink layered liquid', config: {}},
  {name: 'Pink stack', hint: 'The reference look', config: pinkStack},
  {name: 'Lava lamp', hint: 'Few big slow merging blobs', config: lavaLamp},
  {name: 'Contours', hint: 'Topographic stepped levels', config: contours},
  {name: 'Cells', hint: 'Many small scattering blobs', config: cells},
  {name: 'Monochrome', hint: 'Tonal, shadow-separated, fills screen', config: monochrome},
  {name: 'Glass', hint: 'Translucent additive (dark)', config: glass},
  {name: 'Ambient', hint: 'Slow idle drift', config: ambient},
  {name: 'Card footer', hint: 'Calm, no mouse', config: cardFooter},
  {name: 'Behind card', hint: 'Subtle, gathers at cursor', config: behindCard},
];

export const resolvePreset = (p: LiquidLayersOptions): LiquidLayersOptions => ({
  ...DEFAULT_CONFIG,
  ...p,
});
