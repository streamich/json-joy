import type {CSSProperties, ReactNode} from 'react';
import type {SheetFieldGpuState} from './state';

/** A value a {@link ScrollBinding} can drive from scroll position. */
export type ScrollTarget =
  | 'yaw'
  | 'pitch'
  | 'tilt'
  | 'twist'
  | 'fold'
  | 'pulse'
  | 'perspective'
  | 'glow'
  | 'centerDrift';

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
 * Describes how a scalar varies over a surface coordinate and time. The value is
 * the sum of a constant baseline plus a traveling wave, clamped to `[min, max]`.
 * Used here for the color gradient position.
 */
export interface Modulator {
  /** Constant baseline. */
  base?: number;
  /** Per-strip random offset (across the width). */
  random?: number;
  /** Amplitude of the traveling wave along the length. */
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

export interface SheetFieldOptions {
  /** Subdivisions along the length (twist/fold detail axis). Default: `800`. */
  segments?: number;
  /** Subdivisions across the width. Default: `300`. */
  columns?: number;
  /** Sheet length in body units (along {@link forward}). Default: `4.4`. */
  length?: number;
  /** Sheet width in body units. Default: `1.5`. */
  width?: number;
  /** Long axis of the sheet in body space. Default: `[1.5, 0, 0.5]`. */
  forward?: [number, number, number];
  /**
   * Camera rake toward edge-on, in radians (a base downward look angle). `0`
   * views the sheet fully edge-on (a thin line); larger looks down onto it so
   * its faces show. The Stripe waist look wants a low/medium value. Default:
   * `0.45`.
   */
  tilt?: number;
  /**
   * Fade the sheet out over this fraction of its size near every edge, so it
   * melts into the background instead of hard-clipping. `0` disables. Default:
   * `0.12`.
   */
  taper?: number;

  /**
   * Sheet colors. Any CSS color string. When rendered via the React component
   * and left unset, defaults to the theme `brand` palette; the bare state class
   * falls back to a blue/violet/pink/orange gradient. Sampled into a cyclic ramp
   * the color gradient indexes into.
   */
  colors?: string[];

  /** Constant twist of the whole sheet about its forward axis, in turns. Default: `0`. */
  twistBase?: number;
  /**
   * Twist accumulated along the length, in turns (the headline knob). `0` is a
   * flat sheet; `~0.5`..`1.5` spirals it so it fans, pinches to a waist, and
   * fans again. More turns = more bands. Default: `0.55`.
   */
  twistTurns?: number;
  /** Amplitude of a wave added to the twist. Default: `0.12`. */
  twistWave?: number;
  /** Spatial frequency of the twist wave. Default: `2`. */
  twistFreq?: number;
  /** Travel speed of the twist wave. Default: `0.2`. */
  twistSpeed?: number;

  /** Amplitude of the fold displacement along the surface normal. Default: `0.3`. */
  foldAmp?: number;
  /** Amplitude of the lateral (in-surface) fold ripple. Default: `0.08`. */
  foldLateral?: number;
  /** Spatial frequency of the folds. Default: `1.3`. */
  foldFreq?: number;
  /** Travel speed of the folds. Default: `0.3`. */
  foldSpeed?: number;
  /** Number of fbm octaves in the fold field. Default: `3`. */
  shapeOctaves?: number;
  /** Amplitude falloff per fold octave, `0`..`1`. Default: `0.6`. */
  shapeRoughness?: number;
  /** Scales the space the fold field is sampled in. Default: `1`. */
  flowScale?: number;

  /** Global breathing: amplitude of a uniform fold pulse. Default: `0`. */
  pulse?: number;
  /** Speed of the breathing {@link pulse}. Default: `0.5`. */
  pulseSpeed?: number;

  /**
   * `'gradient'` (default) maps the full palette as a continuous static ramp
   * across the sheet (the Stripe sweep). `'palette'` uses rotating, cross-fading
   * active color slots instead (a livelier, shifting look). Default: `'gradient'`.
   */
  colorMode?: 'gradient' | 'palette';
  /** Color gradient position controls (`base`/`wave`/`waveFreq`/`waveSpeed`/`random`). */
  color?: Modulator;
  /** Gradient sweep along the length. Default: `0.9`. */
  colorAlong?: number;
  /** Gradient sweep across the width. Default: `0.12`. */
  colorAcross?: number;
  /** How many palette colors rotate at once in `'palette'` mode. Default: `4`. */
  colorActive?: number;
  /** How fast active colors cross-fade in `'palette'` mode. Default: `1`. */
  colorChangeSpeed?: number;

  /** Show fine stripes (fibers) running along the length. Default: `true`. */
  fibers?: boolean;
  /** How many fibers across the width (more = thinner). Default: `220`. */
  fiberCount?: number;
  /** How dark the grooves between fibers get, `0`..`1`. Default: `0.35`. */
  fiberContrast?: number;
  /** Diagonal shear of the fibers along the length. Default: `0.3`. */
  fiberShear?: number;
  /** Animate the fibers drifting along time. Default: `0.03`. */
  fiberDrift?: number;
  /** Groove thinness: higher makes hair-thin grooves, `1` is fat/soft. Default: `4`. */
  fiberSharpness?: number;
  /** Randomize fiber spacing (`0` = a perfect comb, higher = irregular). Default: `0.45`. */
  fiberJitter?: number;
  /** Per-fiber brightness variation along the length, `0`..`1`. Default: `0.55`. */
  fiberVariation?: number;
  /** Make some fibers faint/absent and leave sparse low-fiber patches, `0`..`1`. Default: `0.3`. */
  fiberGaps?: number;
  /**
   * How strongly the satin specular breaks into bright fiber-aligned streaks
   * (the light catching some threads at folds), `0`..`1`. `0` keeps a smooth
   * sheen; higher scatters bright fibers. Default: `0.5`.
   */
  fiberGlint?: number;

  /**
   * How the surface is drawn. `'fill'` (default) is the solid sheet. `'lines'`
   * carves transparent gaps between parallel lines running along the length (the
   * sheet reads as a set of ribs). `'dots'` additionally dashes those lines along
   * the length (a dotted/stitched look). Lighting, color, and folds still apply
   * to whatever is drawn. Default: `'fill'`.
   */
  style?: 'fill' | 'lines' | 'dots';
  /** Number of lines across the width (`'lines'`/`'dots'`). Default: `40`. */
  lineCount?: number;
  /** Fraction of each line's slot that is opaque, `0`..`1` (thicker lines, thinner gaps). Default: `0.5`. */
  lineWidth?: number;
  /** Diagonal shear of the lines along the length (`0` is straight). Default: `0`. */
  lineShear?: number;
  /** Number of dashes along each line (`'dots'`). Default: `60`. */
  dotCount?: number;
  /** Fraction of each dash's slot that is opaque, `0`..`1` (`'dots'`). Default: `0.5`. */
  dotWidth?: number;

  /** Enable surface lighting (diffuse + satin specular + rim). Default: `true`. */
  light?: boolean;
  /** Ambient term (flat base brightness). Default: `0.58`. */
  ambient?: number;
  /** Diffuse (half-Lambert) term strength. Default: `0.6`. */
  diffuse?: number;
  /** Anisotropic (satin) specular strength. Default: `0.15`. */
  specular?: number;
  /** Specular exponent: low = broad silk sheen, high = tight glint. Default: `11`. */
  shininess?: number;
  /** Specular highlight color (any CSS color). Default: white. */
  specColor?: string;
  /** Fresnel rim strength (glowing grazing edges). Default: `0.98`. */
  rim?: number;
  /** Fresnel rim exponent. Default: `3`. */
  rimPower?: number;
  /** Light direction in view space. Default: `[0.2, 0.6, 0.7]`. */
  lightDir?: [number, number, number];
  /** Drive {@link lightDir} from the pointer so the sheen tracks the cursor. Default: `true`. */
  lightFollowsMouse?: boolean;

  /** Depth fog: fade far parts toward {@link fogColor}, `0`..`1`. Default: `0`. */
  fog?: number;
  /** Color the {@link fog} fades toward (any CSS color). Default: a cool grey. */
  fogColor?: string;
  /** Additive core glow for a bloomy look, `0`..`1` (can go higher). Default: `0`. */
  glow?: number;
  /** Edge vignette: fade the surface out toward the container edges, `0`..`1`. Default: `0.1`. */
  vignette?: number;
  /** Global opacity. Default: `1`. */
  opacity?: number;
  /** Additive blending (a glowing light-streak look), depth-write off. Default: `false`. */
  additive?: boolean;

  /** Auto-rotation speed around the vertical axis, rad/s. Default: `0`. */
  yawSpeed?: number;
  /** Amplitude of the idle vertical bob added to {@link tilt}, rad. Default: `0`. */
  pitchAmp?: number;
  /** Speed of the idle vertical bob. Default: `0.2`. */
  pitchSpeed?: number;
  /** Camera distance in body units; smaller = stronger perspective. Default: `7`. */
  perspective?: number;
  /** Layout scale as a fraction of half the smaller container side. Default: `1`. */
  radius?: number;
  /**
   * Screen anchor for the sheet center, as fractions of the container `[x, y]`.
   * `[0.5, 0.5]` is dead center (default); `[0.5, 0]` is top-center, `[0, 0.5]`
   * left-center, `[1, 1]` bottom-right. Values outside `0`..`1` place it
   * off-canvas. `followMouse` drift is relative to this point. Default:
   * `[0.5, 0.5]`.
   */
  origin?: [number, number];
  /** Autonomous drift of the sheet center, in body units. `0` pins it. Default: `0`. */
  centerDrift?: number;
  /** Speed of the {@link centerDrift} wander. Default: `0.4`. */
  centerDriftSpeed?: number;
  /** Cap frame rate; `0` follows the display. Default: `0`. */
  fps?: number;

  /** Tilt the sheet toward the pointer. Default: `true`. */
  reactToMouse?: boolean;
  /** Max pointer tilt when {@link reactToMouse} is on, rad. Default: `0.2`. */
  tiltMax?: number;
  /** Loosely drift the sheet toward the pointer. Default: `true`. */
  followMouse?: boolean;
  /** How far toward the pointer the sheet drifts (`followMouse`), `0`..`1`. Default: `0.05`. */
  followStrength?: number;
  /** How far the drifting sheet may travel from center, per axis (`followMouse`). Default: `0.4`. */
  followReach?: number;
  /** Locally push the surface away from the pointer (screen-space bend). Opt-in. Default: `false`. */
  bendMouse?: boolean;
  /** Radius of the {@link bendMouse} push, in CSS px. Default: `160`. */
  bendRadius?: number;
  /** Max push distance at the pointer for {@link bendMouse}, in CSS px. Default: `50`. */
  bendStrength?: number;
  /**
   * Where pointer reactions ({@link reactToMouse}, {@link followMouse},
   * {@link bendMouse}, {@link lightFollowsMouse}) are sensed. `'window'` reacts to
   * the cursor anywhere on the page; `'element'` reacts only while the cursor is
   * over this component's box and eases back to rest when it leaves.
   * Default: `'element'`.
   */
  pointerArea?: 'window' | 'element';

  /** Add to the yaw from page scroll position (CPU-only). Default: `0`. */
  scrollYaw?: number;
  /** Add to the breathing pulse from page scroll position (CPU-only). Default: `0`. */
  scrollPulse?: number;
  /** General scroll-to-value bindings (CPU-only). See {@link ScrollBinding}. */
  scrollBindings?: ScrollBinding[];
}

export interface SheetFieldWebGpuProps {
  /** All field options as a single object. */
  config?: SheetFieldOptions;
  /** Bring-your-own state. Constructed internally when omitted. */
  state?: SheetFieldGpuState;
  /** Called once with the {@link SheetFieldGpuState} instance. */
  onState?: (state: SheetFieldGpuState) => void;
  className?: string;
  style?: CSSProperties;
  /** Rendered on top of the background. */
  children?: ReactNode;
}
