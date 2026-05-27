import type {CSSProperties, ReactNode} from 'react';
import type {LiquidLayersGpuState} from './state';

/** A value a {@link ScrollBinding} can drive from scroll position. */
export type ScrollTarget =
  | 'level'
  | 'warp'
  | 'lightAngle'
  | 'shadow'
  | 'sheen'
  | 'morphSpeed'
  | 'attraction'
  | 'spread';

/**
 * Drives one field value from a scroll position (normalized to `0`..`1`). The
 * contribution `scale * position` is added to the value each frame.
 */
export interface ScrollBinding {
  /** Which scroll axis to read. Default: `'y'`. */
  axis?: 'x' | 'y';
  /**
   * `'window'` reads the page scroll; `'element'` reads the component's nearest
   * scrollable ancestor (or the root itself when it scrolls). Default: `'window'`.
   */
  source?: 'window' | 'element';
  /** Which value the scroll drives. */
  target: ScrollTarget;
  /** Multiplier on the normalized scroll position (`0`..`1`). Default: `1`. */
  scale?: number;
}

/**
 * Describes how a scalar varies, as a constant baseline plus a traveling wave,
 * clamped to `[min, max]`. Shared with the sibling WebGPU fields; kept here so
 * authored configs do not depend on another component's module.
 */
export interface Modulator {
  /** Constant baseline. */
  base?: number;
  /** Random offset amount. */
  random?: number;
  /** Amplitude of the traveling wave. */
  wave?: number;
  /** Spatial frequency of the wave. */
  waveFreq?: number;
  /** Travel speed of the wave; `0` is a static pattern. */
  waveSpeed?: number;
  /** Clamp the resulting value to be at least this. */
  min?: number;
  /** Clamp the resulting value to be at most this. */
  max?: number;
}

/**
 * One liquid layer: a sum of moving metaball sources, thresholded into an
 * organic silhouette, stacked above the layer below it. Array order is the paint
 * order (index `0` is the backmost layer). Every field defaults from the global
 * {@link LiquidLayersOptions}; authored stacks override per layer.
 */
export interface LiquidLayer {
  /** Decorrelates this layer's sources and edge warp from the others. */
  seed?: number;

  /** Iso-threshold; lower makes the blob cover more area (merges sooner). */
  level?: number;
  /** Number of metaball centers in this layer (the split/merge sources). */
  sources?: number;
  /** Base kernel radius in screen-height units (blob size). */
  sourceRadius?: number;
  /** Per-source size variation, `0`..`1`. */
  sourceRadiusVar?: number;
  /** How far sources roam from the layer's home region (screen-height units). */
  spread?: number;
  /** `<0` sources repel (more splitting), `>0` clump (more merging). */
  attraction?: number;

  /** Per-layer multiplier on the global source wander rate. Default `1`. */
  morphSpeed?: number;
  /** Slow translation of the whole layer, in screen-height units. */
  drift?: [number, number];

  /** Domain-warp amount on the iso-contour; `0` is smooth, higher is swirlier. */
  warp?: number;
  /** Spatial frequency of the warp. */
  warpScale?: number;
  /** fbm octaves in the warp. */
  octaves?: number;
  /** fbm amplitude falloff per octave, `0`..`1`. */
  roughness?: number;

  /** CSS color; omit to sample the palette by depth. */
  color?: string;
  /** `<1` lets the layer below tint through. */
  opacity?: number;
  /** Apparent height above the layer below; scales the cast-shadow length. */
  elevation?: number;
  /** Strength of the shadow this layer casts, `0`..`1` (scales the global shadow). */
  shadow?: number;
  /** Softness of this layer's cast shadow, `0` hard .. `1` soft. */
  shadowSoftness?: number;
}

export interface LiquidLayersOptions {
  /** An explicit stack. When set, {@link count} and the shared defaults below are ignored for shape. */
  layers?: LiquidLayer[];
  /** Number of layers to generate when {@link layers} is unset. Default: `7`. */
  count?: number;
  /** Base iso-threshold for the backmost generated layer. Default: `0.82`. */
  level?: number;
  /** Change in `level` per layer up the stack (front layers tighter when positive). Default: `0.05`. */
  levelStep?: number;

  /**
   * `'independent'` (default) gives each layer its own sources, decorrelated by
   * seed. `'contours'` shares one source set across all layers and samples it at
   * rising levels (terraced topographic contours of a single pool).
   */
  mode?: 'independent' | 'contours';

  /** Shared per-layer default: sources (blobs) per layer. Default: `3`. */
  sources?: number;
  /** Shared per-layer default: base kernel radius (screen-height units). Default: `0.34`. */
  sourceRadius?: number;
  /** Shared per-layer default: per-source size variation. Default: `0.25`. */
  sourceRadiusVar?: number;
  /** Shared per-layer default: how far sources roam. Default: `0.34`. */
  spread?: number;
  /** Shared per-layer default: clump (`>0`) vs scatter (`<0`) bias. Default: `0.15`. */
  attraction?: number;
  /** Shared per-layer default: edge domain-warp amount. Default: `0.18`. */
  warp?: number;
  /** Shared per-layer default: warp spatial frequency. Default: `1.6`. */
  warpScale?: number;
  /** Shared per-layer default: warp fbm octaves. Default: `2`. */
  octaves?: number;
  /** Shared per-layer default: warp fbm roughness. Default: `0.6`. */
  roughness?: number;
  /** Shared per-layer default: opacity. Default: `1`. */
  opacity?: number;
  /** Apparent height of the frontmost layer; layers behind ramp down toward it. Default: `1`. */
  elevation?: number;
  /** Default per-layer drift vector (screen-height units). Default: `[0, 0]`. */
  drift?: [number, number];
  /**
   * Screen anchor for the stack center, as fractions of the container `[x, y]`.
   * `[0.5, 0.5]` is dead center (default); `[0.5, 0]` top-center, `[0, 0.5]`
   * left-center. Values outside `0`..`1` push the stack off-canvas. Default:
   * `[0.5, 0.5]`.
   */
  origin?: [number, number];

  /**
   * Layer colors. Any CSS color string. When rendered via the React component
   * and left unset, defaults to the theme `brand` palette; the bare state class
   * falls back to a depth ramp of pinks.
   */
  colors?: string[];
  /** `'depth'` ramps the palette across the stack; `'perLayer'` uses each layer's own color. Default: `'depth'`. */
  colorMode?: 'depth' | 'perLayer';
  /** How many palette colors rotate at once (`0` uses the full ramp). Default: `0`. */
  colorActive?: number;
  /** How fast rotating colors cross-fade when {@link colorActive} `> 0`. Default: `0.4`. */
  colorChangeSpeed?: number;
  /** Canvas clear tint; omit (or `'transparent'`) to composite over page content. */
  background?: string;

  /** Direction the cast shadows fall and the sheen sits, in radians. Default: `2.3`. */
  lightAngle?: number;
  /** Global cast-shadow strength, `0`..`1`. Default: `0.55`. */
  shadow?: number;
  /** Cast-shadow offset scale (multiplied by each layer's elevation). Default: `0.05`. */
  shadowOffset?: number;
  /** Global cast-shadow softness, `0` hard .. `1` soft. Default: `0.5`. */
  shadowSoftness?: number;
  /**
   * Steps marched per layer when sampling the cast shadow. More steps make the
   * shadow gradient smoother at a linear GPU cost; the default already reads as a
   * smooth falloff. Default: `6`.
   */
  shadowSteps?: number;
  /** Wet edge highlight strength on the leading edge. Default: `0.12`. */
  sheen?: number;
  /** Sheen falloff exponent. Default: `2.5`. */
  rimPower?: number;

  /** Global source wander rate (the split/merge churn). Default: `0.3`. */
  morphSpeed?: number;
  /** Edge-warp travel speed. Default: `0.12`. */
  warpSpeed?: number;
  /** Master time multiplier on every accumulated phase. Default: `1`. */
  speed?: number;
  /** Additive blending (a glowing-fluid look). Default: `false`. */
  additive?: boolean;

  /**
   * Pointer behaviour. `'attract'` leans the whole stack toward the cursor,
   * `'part'` leans it away (both a smooth global translation with a slight
   * per-layer parallax), `'ripple'` sends a radial wave across the surface from
   * the cursor, `'none'` is inert. Default: `'attract'`.
   */
  reactToMouse?: 'none' | 'part' | 'attract' | 'ripple';
  /** Lean distance (`'part'`/`'attract'`) and ripple reach scale, in CSS px. Default: `60`. */
  mouseStrength?: number;
  /** Pointer falloff radius, in CSS px. Default: `200`. */
  mouseRadius?: number;
  /** Ripple displacement amount in screen-height units (`reactToMouse: 'ripple'`). Default: `0.05`. */
  rippleAmount?: number;
  /** Ripple spatial frequency (`reactToMouse: 'ripple'`). Default: `40`. */
  rippleFreq?: number;
  /** Ripple travel speed (`reactToMouse: 'ripple'`). Default: `3`. */
  rippleSpeed?: number;
  /**
   * Where pointer reactions are sensed. `'window'` reacts anywhere on the page;
   * `'element'` only while the cursor is over this component's box and eases back
   * to rest when it leaves. Default: `'element'`.
   */
  pointerArea?: 'window' | 'element';

  /** Cap frame rate; `0` follows the display. Set `60` to halve cost on 120Hz screens. Default: `0`. */
  fps?: number;
  /**
   * Internal render scale on top of the DPR cap (this is a fragment-bound effect,
   * so this is the main performance lever). `1` renders at device resolution;
   * lower trades sharpness for speed. Floored at 1x, so it only reduces work on
   * retina/high-DPR screens. Default: `0.75`.
   */
  resolutionScale?: number;
  /** Scroll-to-value bindings (CPU-only). See {@link ScrollBinding}. */
  scrollBindings?: ScrollBinding[];
}

export interface LiquidLayersWebGpuProps {
  /** All field options as a single object. */
  config?: LiquidLayersOptions;
  /** Bring-your-own state. Constructed internally when omitted. */
  state?: LiquidLayersGpuState;
  /** Called once with the {@link LiquidLayersGpuState} instance. */
  onState?: (state: LiquidLayersGpuState) => void;
  className?: string;
  style?: CSSProperties;
  /** Rendered on top of the background. */
  children?: ReactNode;
}
