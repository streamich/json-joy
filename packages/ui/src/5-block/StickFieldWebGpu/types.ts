import type {CSSProperties, ReactNode} from 'react';
import type {StickFieldGpuState} from './state';

/** A value a {@link ScrollBinding} can drive from scroll position. */
export type ScrollTarget =
  | 'yaw'
  | 'pitch'
  | 'pulse'
  | 'radius'
  | 'flatten'
  | 'perspective'
  | 'glow'
  | 'spin'
  | 'twinkle'
  | 'fieldDrift'
  | 'centerDrift';

/**
 * Drives one cloud value from a scroll position (normalized to `0`..`1`). The
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
 * Describes how a single per-stick scalar varies across the cloud and over
 * time. The value is the sum of up to three contributions, so you can drive a
 * property by one mechanism or several at once:
 *
 * - {@link base} a constant baseline,
 * - {@link random} a fixed per-stick random offset (each stick differs), and
 * - {@link wave} a smooth wave that travels through space so nearby sticks share
 *   similar values.
 *
 * `value = base + random * rnd[i] + wave * sin(proj * waveFreq + t * waveSpeed)`
 *
 * where `rnd[i]` is in `[-1, 1]` and `proj` is the stick's position projected
 * onto a fixed direction (hence neighbors get similar wave values).
 */
export interface Modulator {
  /** Constant baseline. */
  base?: number;
  /** Per-stick random offset, uniform in `[-random, +random]`. */
  random?: number;
  /** Amplitude of the traveling spatial wave (neighbors share values). */
  wave?: number;
  /** Spatial frequency of the wave. */
  waveFreq?: number;
  /** Travel speed of the wave; `0` is a static spatial pattern. */
  waveSpeed?: number;
  /** Clamp the resulting value to be at least this. */
  min?: number;
  /** Clamp the resulting value to be at most this. */
  max?: number;
}

export interface StickFieldOptions {
  /** Number of sticks in the cloud. Default: `140`. */
  count?: number;
  /**
   * Stick colors. Any CSS color string. When rendered via the React component
   * and left unset, defaults to the theme `brand` palette; the bare state class
   * falls back to a blue/purple palette. Colors are sampled into a cyclic
   * gradient ramp that the {@link color} modulator indexes into.
   */
  colors?: string[];

  /**
   * Per-stick size multiplier (scales both length and thickness). Default is a
   * uniform `1`. Use `random` for varied sizes, or `wave` for a size wave that
   * flows through the cloud (neighbors similar). Default:
   * `{base: 1, waveFreq: 1.2, waveSpeed: 0.5}`.
   */
  size?: Modulator;
  /**
   * Per-stick thickness multiplier, applied to width only (on top of
   * {@link size}). Use this to make sticks wider without making them longer, or
   * `wave`/`random` for a thickness that varies across the cloud. Default:
   * `{base: 1, waveFreq: 1.2, waveSpeed: 0.5}`.
   */
  thickness?: Modulator;
  /**
   * Per-stick distance from the center, `1` being the sphere surface. The
   * default wave makes the cloud breathe so it never reads as an exact sphere.
   * Default: `{base: 1, wave: 0.06, waveFreq: 1.5, waveSpeed: 0.6}`.
   */
  distance?: Modulator;
  /**
   * Per-stick color position, wrapped into the cyclic palette ramp. The default
   * is a gradient wave flowing through the cloud; set `{random: 1, wave: 0}` for
   * random colors. Default: `{wave: 1, waveFreq: 0.6, waveSpeed: 0.25}`.
   */
  color?: Modulator;
  /**
   * How many palette colors are live at once. Showing all colors at once can be
   * too busy, so by default only a few are active and they rotate: each active
   * slot cross-fades to a new random palette color over time, while the
   * {@link color} wave keeps neighboring sticks similar. Set to `0` (or `>=` the
   * palette size) to use the full static palette ramp instead. Default: `3`.
   */
  colorActive?: number;
  /** How fast active colors cross-fade and rotate (`colorActive`). Default: `1`. */
  colorChangeSpeed?: number;
  /**
   * How strongly each stick aligns to the magnetic field (see {@link fieldMode}),
   * `0`..`1`. `0` is fully random orientation, `1` snaps to the field. Evaluated
   * in the shader so it applies live. `{base: 0.8}` is a tight field; add `random`
   * for looseness. Default: `{}` (random orientation).
   */
  magnetism?: Modulator;
  /**
   * Shape of the magnetic field the sticks align to (by {@link magnetism}):
   * `'radial'` points each stick out from the center (the default look),
   * `'line'` aligns them all parallel to {@link fieldAxis}, `'ring'` swirls them
   * tangentially around {@link fieldAxis}. Default: `'radial'`.
   */
  fieldMode?: 'radial' | 'line' | 'ring';
  /** Axis for the `'line'`/`'ring'` {@link fieldMode}. Default: `[0, 1, 0]`. */
  fieldAxis?: [number, number, number];
  /** Autonomous wander of the field axis (`'line'`/`'ring'`). `0` is fixed. Default: `0`. */
  fieldDrift?: number;

  /** Base stick length in sphere units, before {@link size}. Default: `0.085`. */
  stickLength?: number;
  /** Base stick thickness in px, before {@link size}. Default: `1.4`. */
  lineWidth?: number;
  /**
   * Cap roundness, `0`..`1`. `1` is a capsule (fully round caps, the default
   * look); `0` is a sharp rectangle; in between is a rounded rectangle. A short
   * stick at `1` reads as a dot/sphere, at `0` as a square. Default: `1`.
   */
  rounding?: number;
  /** Sphere radius as a fraction of half the smaller container side. Default: `0.78`. */
  radius?: number;
  /**
   * Screen anchor for the cloud center, as fractions of the container `[x, y]`.
   * `[0.5, 0.5]` is dead center (default); `[0.5, 1]` is bottom-center, `[0, 0.5]`
   * left-center. Values outside `0`..`1` place it off-canvas. `followMouse` drift
   * and mouse repulsion are relative to this point. Default: `[0.5, 0.5]`.
   */
  origin?: [number, number];
  /** Camera distance in sphere units; smaller = stronger perspective. Default: `3`. */
  perspective?: number;

  /**
   * Number of noise waves layered into the {@link distance} (breathing) field.
   * Each octave adds finer, faster ripples at higher frequency and lower
   * amplitude, turning the smooth bulge into irregular peaks and valleys. `1` is
   * a single smooth wave. Default: `3`.
   */
  shapeOctaves?: number;
  /** Amplitude falloff per shape octave (fractal roughness), `0`..`1`. Default: `0.5`. */
  shapeRoughness?: number;
  /**
   * Emphasizes peaks and valleys in the shape noise. `1` is the raw wave sum;
   * `> 1` sharpens into pointier peaks with flatter areas between; `< 1` rounds
   * them into broad swells. Default: `1`.
   */
  shapeSharpness?: number;
  /** Global breathing: amplitude of a uniform in/out pulse of the whole blob. Default: `0`. */
  pulse?: number;
  /** Speed of the breathing {@link pulse}. Default: `0.5`. */
  pulseSpeed?: number;
  /**
   * Flatten the sphere toward a sheet/disc along its depth axis, `0`..`1`. With
   * {@link hideBack} this makes the front read as an undulating sheet rather than
   * a ball. Default: `0`.
   */
  flatten?: number;

  /**
   * Render only the front-facing sticks and hide the back of the sphere, with a
   * soft fade at the silhouette. Opt-in. Default: `false`.
   */
  hideBack?: boolean;
  /**
   * Depth cutoff for {@link hideBack}, roughly `-1`..`1`. `0` keeps the front
   * hemisphere; higher shows less (only the very front), lower shows more than
   * half. Default: `0`.
   */
  cullDepth?: number;

  /** Auto-rotation speed around the vertical axis, rad/s. Default: `0.18`. */
  yawSpeed?: number;
  /** Amplitude of the idle vertical bob, rad. Default: `0.18`. */
  pitchAmp?: number;
  /** Speed of the idle vertical bob. Default: `0.35`. */
  pitchSpeed?: number;

  /** Tilt the cloud toward the pointer. Opt-in. Default: `false`. */
  reactToMouse?: boolean;
  /** Max pointer tilt when {@link reactToMouse} is on, rad. Default: `0.45`. */
  tiltMax?: number;
  /** Loosely drift the whole sphere toward the pointer. Opt-in. Default: `false`. */
  followMouse?: boolean;
  /** How far toward the pointer the sphere drifts (`followMouse`), `0`..`1`. Default: `0.5`. */
  followStrength?: number;
  /**
   * How far the drifting sphere may travel from center, as a fraction of half
   * the container per axis (`followMouse`). `1` lets its center reach the div
   * edges, `> 1` lets it overshoot past them. Default: `0.6`.
   */
  followReach?: number;

  /**
   * Locally repel sticks away from the pointer (a soft push, like a small
   * invisible sphere near the cursor), on top of any {@link followMouse} drift.
   * Opt-in. Default: `false`.
   */
  repelMouse?: boolean;
  /** Radius of the {@link repelMouse} push, in CSS px. Default: `140`. */
  repelRadius?: number;
  /** Max push distance at the pointer for {@link repelMouse}, in CSS px. Default: `60`. */
  repelStrength?: number;
  /**
   * Where pointer reactions ({@link reactToMouse}, {@link followMouse},
   * {@link repelMouse}) are sensed. `'window'` reacts to the cursor anywhere on
   * the page; `'element'` reacts only while the cursor is over this component's
   * box and eases back to rest when it leaves. Use `'element'` when several
   * fields share a page so each answers its own hover. Default: `'window'`.
   */
  pointerArea?: 'window' | 'element';

  /**
   * Autonomous drift of the center of attraction (the body-space point the cloud
   * is built around, the sphere center by default), in sphere units. `0` pins it
   * at the center; small values (`~0.1`..`0.3`) give a gentle idle 3D float.
   * Default: `0`.
   */
  centerDrift?: number;
  /** Speed of the {@link centerDrift} wander. Default: `0.1`. */
  centerDriftSpeed?: number;

  /**
   * Draw a thin ray from each stick toward the center of attraction (behind the
   * sticks). Opt-in. Default: `false`.
   */
  rays?: boolean;
  /** Ray thickness in CSS px. Default: `1`. */
  rayWidth?: number;
  /**
   * Where the ray starts along the stick->center line: `0` at the stick, `1` at
   * the center. Values outside `[0, 1]` overshoot - `< 0` extends past the stick
   * (away from the center). Default: `0`.
   */
  rayFrom?: number;
  /**
   * Where the ray ends along the stick->center line: `0` at the stick, `1` at the
   * center. `> 1` overshoots past the center, so the ray is longer than the
   * stick-to-center distance and crosses it. Default: `1`.
   */
  rayTo?: number;
  /** Ray alpha at the stick end. Default: `0.5`. */
  rayAlphaNear?: number;
  /** Ray alpha at the center end. Default: `0` (fades out toward the center). */
  rayAlphaFar?: number;
  /** Ray color (any CSS color). Unset uses each stick's own color. Default: unset. */
  rayColor?: string;

  /**
   * Depth fog: fade each stick's color toward {@link fogColor} with depth, so the
   * back of the cloud recedes. `0`..`1`. Default: `0`.
   */
  fog?: number;
  /** Color the {@link fog} fades toward (any CSS color). Default: a cool grey. */
  fogColor?: string;
  /**
   * Per-stick brightness flicker, keyed off the stick's own random so neighbors
   * differ. `0` is steady. Default: `0`.
   */
  twinkle?: number;
  /** Speed of the {@link twinkle} flicker. Default: `4`. */
  twinkleSpeed?: number;
  /**
   * Edge vignette: fade sticks out toward the container edges so the cloud melts
   * into the background instead of clipping. `0`..`1`. Default: `0`.
   */
  vignette?: number;
  /**
   * Spin each stick around its radial direction over time (plus a per-stick phase
   * so they desync), rad/s. Most visible on tangential/loose sticks. Default: `0`.
   */
  spin?: number;
  /**
   * Additive "core" glow: brighten the inner core of each stick for a neon look.
   * `0`..`1` (can go higher). Pairs well with {@link additive}. Default: `0`.
   */
  glow?: number;
  /**
   * Parallax: offset each stick's yaw by a per-stick amount so the cloud separates
   * into depth layers rotating at slightly different rates, rad. Default: `0`.
   */
  parallax?: number;
  /**
   * Additive blending (a nebula/bloom look) instead of normal alpha compositing.
   * Overlapping sticks accumulate brightness. Default: `false`.
   */
  additive?: boolean;
  /** Add to the yaw from page scroll position (CPU-only). Default: `0`. */
  scrollYaw?: number;
  /** Add to the breathing pulse from page scroll position (CPU-only). Default: `0`. */
  scrollPulse?: number;
  /**
   * General scroll-to-value bindings (CPU-only). Each binds an axis of the page
   * scroll or the component's local scroll to a cloud value (see
   * {@link ScrollBinding}). Opt-in; default: none. For `source: 'element'` the
   * component listens to its nearest scrollable ancestor's scroll.
   */
  scrollBindings?: ScrollBinding[];

  /** Cap frame rate; `0` follows the display. Default: `0`. */
  fps?: number;
}

export interface StickFieldWebGpuProps {
  /** All cloud options as a single object. */
  config?: StickFieldOptions;
  /** Bring-your-own state. Constructed internally when omitted. */
  state?: StickFieldGpuState;
  /** Called once with the {@link StickFieldGpuState} instance. */
  onState?: (state: StickFieldGpuState) => void;
  className?: string;
  style?: CSSProperties;
  /** Rendered on top of the background. */
  children?: ReactNode;
}
