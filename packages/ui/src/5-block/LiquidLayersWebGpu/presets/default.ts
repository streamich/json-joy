import type {LiquidLayersOptions} from '../types';

/**
 * The reference look: a near-monochrome stack of depth-ramped pinks whose depth
 * comes entirely from soft crescent shadows, with blobs that split and merge as
 * they drift. This is the {@link DEFAULT_CONFIG}; named presets override it.
 */
export const defaultLiquid: LiquidLayersOptions = {
  count: 7,
  level: 0.72,
  levelStep: 0.035,
  mode: 'independent',
  sources: 3,
  sourceRadius: 0.38,
  sourceRadiusVar: 0.25,
  spread: 0.36,
  attraction: 0.15,
  warp: 0.18,
  warpScale: 1.6,
  octaves: 2,
  roughness: 0.6,
  opacity: 1,
  elevation: 1,
  drift: [0, 0],
  colorMode: 'depth',
  colorActive: 0,
  colorChangeSpeed: 0.4,
  background: '#2a0a1e',
  lightAngle: 2.3,
  shadow: 0.55,
  shadowOffset: 0.05,
  shadowSoftness: 0.5,
  sheen: 0.12,
  rimPower: 2.5,
  morphSpeed: 0.3,
  warpSpeed: 0.12,
  speed: 1,
  additive: false,
  reactToMouse: 'attract',
  mouseStrength: 60,
  mouseRadius: 200,
  rippleAmount: 0.05,
  rippleFreq: 40,
  rippleSpeed: 3,
  pointerArea: 'element',
  fps: 0,
};
