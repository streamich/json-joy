import type {CSSProperties, ReactNode} from 'react';
import type {StickFieldGlState} from './state';

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
   * How strongly each stick aligns to the {@link field}, `0`..`1`. `{base: 0.8}`
   * is a tight field; add `random` for looseness. Default: `{}` (random
   * orientation, i.e. no alignment).
   */
  magnetism?: Modulator;
  /**
   * Shape of the field sticks align to (scaled by {@link magnetism}):
   * - `radial` points outward from the center (sea-urchin), the default;
   * - `dipole` follows curved bar-magnet field lines around {@link fieldAxis}.
   * Default: `radial`.
   */
  field?: 'radial' | 'dipole';
  /** Field/dipole axis as a 3-tuple (need not be unit). Default: `[0, 1, 0]`. */
  fieldAxis?: [number, number, number];
  /** How much the field axis wobbles over time, ~`0`..`1`. Default: `0`. */
  fieldWobble?: number;
  /** Speed of the {@link fieldWobble}. Default: `0.3`. */
  fieldWobbleSpeed?: number;

  /**
   * Center of attraction (the convergence point for {@link rays}), as a fraction
   * of the sphere radius it may wander from the true center. `0` pins it to the
   * center; higher lets it drift around. Default: `0`.
   */
  centerDrift?: number;
  /** Speed of the {@link centerDrift} wander. Default: `0.2`. */
  centerDriftSpeed?: number;

  /** Draw a thin ray from each stick toward the center of attraction. Default: `false`. */
  rays?: boolean;
  /** Ray width in px. Default: `0.6`. */
  rayWidth?: number;
  /** Ray color (any CSS color). Empty uses each stick's own color. Default: `''`. */
  rayColor?: string;
  /** Ray alpha at the stick end. Default: `0.25`. */
  rayAlpha?: number;
  /** Ray alpha at the center end (a gradient toward the center). Default: `0`. */
  rayAlphaCenter?: number;
  /** Where the ray starts, `0` at the stick to `1` at the center. Default: `0`. */
  rayStartOffset?: number;
  /** Where the ray ends, `0` at the stick to `1` at the center. Default: `1`. */
  rayEndOffset?: number;

  /** Additive blending for a bright, glowing nebula look. Default: `false`. */
  glow?: boolean;
  /** Per-stick brightness flicker amplitude, ~`0`..`1`. Default: `0`. */
  twinkle?: number;
  /** Speed of the {@link twinkle} flicker. Default: `3`. */
  twinkleSpeed?: number;

  /** Base stick length in sphere units, before {@link size}. Default: `0.085`. */
  stickLength?: number;
  /** Base stick thickness in px, before {@link size}. Default: `1.4`. */
  lineWidth?: number;
  /**
   * Cap rounding, `0`..`1`. `1` gives fully round caps (a capsule, or a circle
   * when length equals thickness); `0` gives square corners (a rectangle, or a
   * square when length equals thickness). Values in between bevel the corners.
   * Default: `1`.
   */
  rounding?: number;
  /** Sphere radius as a fraction of half the smaller container side. Default: `0.78`. */
  radius?: number;
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
   * Locally push sticks away from the pointer, as if a small invisible sphere
   * near the viewer parts the cloud under the cursor. Independent of
   * {@link followMouse} (which drifts the whole sphere). Opt-in. Default: `false`.
   */
  mouseRepel?: boolean;
  /** Radius of the {@link mouseRepel} influence, in px. Default: `120`. */
  repelRadius?: number;
  /**
   * Strength of {@link mouseRepel}. `1` clears a hole roughly one
   * {@link repelRadius} wide right under the cursor; lower nudges more gently.
   * Default: `1`.
   */
  repelStrength?: number;

  /** Cap frame rate; `0` follows the display. Default: `0`. */
  fps?: number;
}

export interface StickFieldProps {
  /** All stick-field options as a single object. */
  config?: StickFieldOptions;
  /** Bring-your-own state. Constructed internally when omitted. */
  state?: StickFieldGlState;
  /** Called once with the {@link StickFieldGlState} instance. */
  onState?: (state: StickFieldGlState) => void;
  className?: string;
  style?: CSSProperties;
  /** Rendered on top of the background. */
  children?: ReactNode;
}
