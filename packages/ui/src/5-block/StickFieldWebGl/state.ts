import type {StickFieldOptions} from './types';

const TWO_PI = Math.PI * 2;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const DEFAULT_COLORS = ['#5b6ee1', '#7c5cff', '#9b8cff'];
const MAX_OCT = 6; // shader unrolls this many shape-noise octaves
const MAXC = 16; // palette / active-slot uniform array capacity
const STRIDE = 11; // floats per instance: dir(3) rndAxis(3) rand(4) rndMag(1)

// Unit quad drawn as a triangle strip; x runs along the stick, y across it.
const CORNERS = new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5]);

// Plain scalar uniforms; array uniforms (u_palette, u_active) are looked up
// separately because they need the "[0]" suffix.
const UNIFORMS = [
  'u_time',
  'u_resolution',
  'u_center',
  'u_radiusPx',
  'u_perspective',
  'u_stickLength',
  'u_lineWidth',
  'u_zScale',
  'u_pulse',
  'u_rot',
  'u_shapeOctaves',
  'u_shapeRoughness',
  'u_shapeSharpness',
  'u_size0',
  'u_size1',
  'u_thick0',
  'u_thick1',
  'u_dist0',
  'u_dist1',
  'u_color0',
  'u_color1',
  'u_mag0',
  'u_mag1',
  'u_hideBack',
  'u_cullDepth',
  'u_rounding',
  'u_pointer',
  'u_repel',
  'u_paletteLen',
  'u_activeK',
  'u_useActive',
] as const;

// Uniforms used only by the ray pass (shares the rest with the stick program).
const RAY_UNIFORMS = [
  'u_time',
  'u_resolution',
  'u_center',
  'u_radiusPx',
  'u_perspective',
  'u_zScale',
  'u_pulse',
  'u_rot',
  'u_shapeOctaves',
  'u_shapeRoughness',
  'u_shapeSharpness',
  'u_dist0',
  'u_dist1',
  'u_color0',
  'u_color1',
  'u_hideBack',
  'u_cullDepth',
  'u_pointer',
  'u_repel',
  'u_attract',
  'u_rayWidth',
  'u_rayColor',
  'u_rayAlpha',
  'u_rayOffsets',
  'u_paletteLen',
  'u_activeK',
  'u_useActive',
] as const;

// Constants shared by both vertex programs.
const GLSL_CONSTS = `
const vec3 WD = vec3(0.4319, 0.8638, 0.2591);
const vec3 WDS0 = vec3(0.4319, 0.8638, 0.2591);
const vec3 WDS1 = vec3(-0.7035, 0.5025, 0.5025);
const vec3 WDS2 = vec3(0.3042, -0.4056, 0.8619);
const float CULL_BAND = 0.18;
`;

// Helper functions shared by both vertex programs. They read the uniforms and
// attributes declared above each #include site, so both shaders must declare the
// superset they touch (time, rotation, distance modulator, palette, etc.).
const GLSL_HELPERS = `
vec3 wds(int i) {
  if (i == 0) return WDS0;
  if (i == 1) return WDS1;
  return WDS2;
}

// Fractal breathing radius for a stick pointing in dir.
float stickRadius(vec3 dir) {
  float nz = 0.0, amp = 1.0, ampSum = 0.0, freq = u_dist0.w;
  for (int k = 0; k < ${MAX_OCT}; k++) {
    if (k >= u_shapeOctaves) break;
    vec3 wd = wds(k % 3);
    nz += amp * sin(dot(dir, wd) * freq + u_time * u_dist1.x * (1.0 + 0.35 * float(k)) + float(k) * 1.7);
    ampSum += amp;
    amp *= u_shapeRoughness;
    freq *= 2.0;
  }
  nz /= max(ampSum, 1e-6);
  if (u_shapeSharpness != 1.0) nz = sign(nz) * pow(abs(nz), u_shapeSharpness);
  return clamp(u_dist0.x + u_dist0.y * a_rand.z + u_dist0.z * nz + u_pulse, u_dist1.y, u_dist1.z);
}

vec3 colorFor(float cv) {
  int n = u_useActive == 1 ? u_activeK : u_paletteLen;
  if (n < 1) return vec3(1.0);
  float pos = cv * float(n);
  float fl = floor(pos);
  int i0 = int(fl) % n;
  int i1 = (i0 + 1) % n;
  float f = pos - fl;
  if (u_useActive == 1) return mix(u_active[i0], u_active[i1], f);
  return mix(u_palette[i0], u_palette[i1], f);
}

// Rotate body space (yaw then pitch) and apply perspective. Returns
// (screenX, screenY, depthZ, scale).
vec4 project(vec3 p) {
  float cosY = u_rot.x, sinY = u_rot.y, cosX = u_rot.z, sinX = u_rot.w;
  float x1 =  p.x * cosY + p.z * sinY;
  float z1 = -p.x * sinY + p.z * cosY;
  float y2 =  p.y * cosX - z1 * sinX;
  float z2 =  p.y * sinX + z1 * cosX;
  float s  = u_perspective / (u_perspective - z2);
  return vec4(u_center.x + x1 * s * u_radiusPx, u_center.y - y2 * s * u_radiusPx, z2, s);
}
`;

// The whole per-stick "adjustment loop" lives here. Each instance reads its
// fixed sphere direction and randoms from attributes, then derives radius, size,
// thickness, color and the two screen-space endpoints purely from u_time and the
// uniforms. The quad is expanded perpendicular to the projected axis; round caps
// come from the capsule SDF in the fragment shader.
const VERT = `#version 300 es
precision highp float;

layout(location = 0) in vec2 a_corner;
layout(location = 1) in vec3 a_dir;
layout(location = 2) in vec3 a_rndAxis;
layout(location = 3) in vec4 a_rand;   // size, thickness, distance, color
layout(location = 4) in float a_rndMag;

uniform float u_time;
uniform vec2 u_resolution;   // css px
uniform vec2 u_center;       // css px, includes follow offset
uniform float u_radiusPx;
uniform float u_perspective;
uniform float u_stickLength;
uniform float u_lineWidth;
uniform float u_zScale;      // 1 - flatten
uniform float u_pulse;
uniform vec4 u_rot;          // cosYaw, sinYaw, cosPitch, sinPitch

uniform int u_shapeOctaves;
uniform float u_shapeRoughness;
uniform float u_shapeSharpness;

// Each modulator: m0 = (base, rand, wave, freq), m1 = (speed, min, max).
uniform vec4 u_size0;  uniform vec3 u_size1;
uniform vec4 u_thick0; uniform vec3 u_thick1;
uniform vec4 u_dist0;  uniform vec3 u_dist1;
uniform vec4 u_color0; uniform vec3 u_color1;
uniform vec4 u_mag0;   uniform vec3 u_mag1;   // mag has no speed; m1.x is unused

uniform int u_hideBack;
uniform float u_cullDepth;

uniform vec2 u_pointer;   // eased pointer, container px
uniform vec2 u_repel;     // x = radius px, y = strength (0 disables)

uniform int u_fieldType;  // 0 radial, 1 dipole
uniform vec3 u_fieldAxis; // dipole moment / field axis (unit)
uniform vec2 u_twinkle;   // amount, speed

uniform vec3 u_palette[${MAXC}];
uniform int u_paletteLen;
uniform vec3 u_active[${MAXC}];
uniform int u_activeK;
uniform int u_useActive;

out vec3 v_color;
out float v_alpha;
out vec2 v_local;   // pixel position within the quad, relative to center
out vec2 v_cap;     // segment length, width (px)
${GLSL_CONSTS}${GLSL_HELPERS}
// Direction each stick aligns to (before the per-stick magnetism blend).
vec3 fieldDir(vec3 r) {
  if (u_fieldType == 1) {
    float d = dot(u_fieldAxis, r);
    vec3 f = 3.0 * d * r - u_fieldAxis;   // ideal dipole field direction
    float len = length(f);
    return len > 1e-4 ? f / len : r;
  }
  return r;                                // radial: out from center
}

void main() {
  vec3 dir = a_dir;
  float proj = dot(dir, WD);

  // Magnetism: blend the random axis toward the field direction.
  float m = u_mag0.x + u_mag0.y * a_rndMag + u_mag0.z * sin(proj * u_mag0.w);
  m = clamp(clamp(m, u_mag1.y, u_mag1.z), 0.0, 1.0);
  vec3 ax = normalize(mix(a_rndAxis, fieldDir(dir), m));

  float rad = stickRadius(dir);

  // Per-stick size (length + width) and thickness (width only).
  float size = max(0.0, clamp(u_size0.x + u_size0.y * a_rand.x + u_size0.z * sin(proj * u_size0.w + u_time * u_size1.x), u_size1.y, u_size1.z));
  float thick = max(0.0, clamp(u_thick0.x + u_thick0.y * a_rand.y + u_thick0.z * sin(proj * u_thick0.w + u_time * u_thick1.x), u_thick1.y, u_thick1.z));

  // Two endpoints in body space. The center z is flattened toward a sheet; the
  // stick offset keeps its full length.
  vec3 off = ax * (u_stickLength * size * 0.5);
  vec3 c = vec3(dir.x * rad, dir.y * rad, dir.z * rad * u_zScale);
  vec4 p1 = project(c + off);
  vec4 p2 = project(c - off);
  float depth = (p1.z + p2.z) * 0.5;

  // Soft back-cull silhouette fade.
  float cull = 1.0;
  if (u_hideBack == 1) {
    float edge = depth - u_cullDepth;
    if (edge < -CULL_BAND) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // off-screen, instance skipped
      return;
    }
    if (edge < CULL_BAND) {
      float u = (edge + CULL_BAND) / (2.0 * CULL_BAND);
      cull = u * u * (3.0 - 2.0 * u);
    }
  }

  float widthPx = u_lineWidth * size * thick * (p1.w + p2.w) * 0.5;

  vec2 d2 = p2.xy - p1.xy;
  float segLen = length(d2);
  vec2 axisDir = segLen > 1e-4 ? d2 / segLen : vec2(1.0, 0.0);
  vec2 normal = vec2(-axisDir.y, axisDir.x);
  vec2 mid = (p1.xy + p2.xy) * 0.5;

  // Local mouse repulsion: push the whole stick away from the pointer, biased
  // toward the front so it reads as a near bubble parting the cloud.
  if (u_repel.y > 0.0) {
    vec2 toStick = mid - u_pointer;
    float pd = length(toStick);
    if (pd < u_repel.x) {
      float fall = 1.0 - pd / u_repel.x;
      fall *= fall;
      float front = smoothstep(-0.5, 0.8, depth);
      vec2 dirp = pd > 1e-3 ? toStick / pd : vec2(0.0, 1.0);
      mid += dirp * (fall * front * u_repel.y * u_repel.x);
    }
  }

  float quadLen = segLen + widthPx; // extend by half-width each end for round caps
  vec2 posPx = mid + axisDir * (a_corner.x * quadLen) + normal * (a_corner.y * widthPx);

  vec2 ndc = (posPx / u_resolution) * 2.0 - 1.0;
  gl_Position = vec4(ndc.x, -ndc.y, 0.0, 1.0);

  // Per-stick twinkle: a cheap brightness flicker keyed off the stick's random.
  float tw = max(0.0, 1.0 + u_twinkle.x * sin(u_time * u_twinkle.y + a_rndMag * 6.2831853));
  v_alpha = clamp(0.2 + 0.8 * ((depth + 1.25) / 2.5), 0.15, 1.0) * cull * tw;

  float cv = clamp(u_color0.x + u_color0.y * a_rand.w + u_color0.z * sin(proj * u_color0.w + u_time * u_color1.x), u_color1.y, u_color1.z);
  v_color = colorFor(fract(cv));

  v_local = vec2(a_corner.x * quadLen, a_corner.y * widthPx);
  v_cap = vec2(segLen, widthPx);
}
`;

// Rounded-box SDF: u_rounding 1 is a capsule (full round caps), 0 is a sharp
// rectangle; fwidth-based coverage anti-aliases the edge.
const FRAG = `#version 300 es
precision highp float;

in vec3 v_color;
in float v_alpha;
in vec2 v_local;
in vec2 v_cap;   // segment length, width (px)

uniform float u_rounding;

out vec4 outColor;

void main() {
  float hw = v_cap.y * 0.5;
  float r = clamp(u_rounding, 0.0, 1.0) * hw;
  // Box core spans the quad (segLen + width along, width across) minus the
  // corner radius on each side.
  vec2 b = vec2(v_cap.x * 0.5 + hw - r, hw - r);
  vec2 q = abs(v_local) - b;
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  float aa = fwidth(d);
  float cov = aa > 0.0 ? clamp(0.5 - d / aa, 0.0, 1.0) : (d <= 0.0 ? 1.0 : 0.0);
  float a = v_alpha * cov;
  if (a <= 0.0) discard;
  outColor = vec4(v_color, a);
}
`;

// Ray pass: a thin alpha-gradient line from each stick toward the center of
// attraction. Reuses the same instance buffer and the breathing/projection
// helpers so the ray stays attached to its stick.
const RAY_VERT = `#version 300 es
precision highp float;

layout(location = 0) in vec2 a_corner;
layout(location = 1) in vec3 a_dir;
layout(location = 2) in vec3 a_rndAxis;
layout(location = 3) in vec4 a_rand;
layout(location = 4) in float a_rndMag;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_radiusPx;
uniform float u_perspective;
uniform float u_zScale;
uniform float u_pulse;
uniform vec4 u_rot;

uniform int u_shapeOctaves;
uniform float u_shapeRoughness;
uniform float u_shapeSharpness;
uniform vec4 u_dist0;  uniform vec3 u_dist1;
uniform vec4 u_color0; uniform vec3 u_color1;

uniform int u_hideBack;
uniform float u_cullDepth;
uniform vec2 u_pointer;
uniform vec2 u_repel;

uniform vec3 u_attract;    // body-space center of attraction
uniform float u_rayWidth;  // px
uniform vec4 u_rayColor;   // rgb + mode (w >= 0.5 uses this color, else per-stick)
uniform vec2 u_rayAlpha;   // alpha at the stick end, alpha at the center end
uniform vec2 u_rayOffsets; // start, end as 0 (at stick) .. 1 (at center)

uniform vec3 u_palette[${MAXC}];
uniform int u_paletteLen;
uniform vec3 u_active[${MAXC}];
uniform int u_activeK;
uniform int u_useActive;

out vec3 v_color;
out float v_alpha;
out vec2 v_acrossW;   // signed across-px, half-width px
${GLSL_CONSTS}${GLSL_HELPERS}
void main() {
  vec3 dir = a_dir;
  float proj = dot(dir, WD);
  float rad = stickRadius(dir);
  vec3 c = vec3(dir.x * rad, dir.y * rad, dir.z * rad * u_zScale);

  vec4 ps = project(mix(c, u_attract, u_rayOffsets.x));
  vec4 pe = project(mix(c, u_attract, u_rayOffsets.y));
  float depth = (ps.z + pe.z) * 0.5;

  float cull = 1.0;
  if (u_hideBack == 1) {
    float edge = depth - u_cullDepth;
    if (edge < -CULL_BAND) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      return;
    }
    if (edge < CULL_BAND) {
      float u = (edge + CULL_BAND) / (2.0 * CULL_BAND);
      cull = u * u * (3.0 - 2.0 * u);
    }
  }

  // Apply the same local repel to the stick end so rays follow their sticks.
  vec2 a = ps.xy;
  if (u_repel.y > 0.0) {
    vec2 toStick = a - u_pointer;
    float pd = length(toStick);
    if (pd < u_repel.x) {
      float fall = 1.0 - pd / u_repel.x;
      fall *= fall;
      float front = smoothstep(-0.5, 0.8, ps.z);
      vec2 dirp = pd > 1e-3 ? toStick / pd : vec2(0.0, 1.0);
      a += dirp * (fall * front * u_repel.y * u_repel.x);
    }
  }

  vec2 b = pe.xy;
  vec2 d2 = b - a;
  float segLen = length(d2);
  vec2 axisDir = segLen > 1e-4 ? d2 / segLen : vec2(1.0, 0.0);
  vec2 normal = vec2(-axisDir.y, axisDir.x);
  float tParam = a_corner.x + 0.5;          // 0 at the stick, 1 at the center
  vec2 posPx = mix(a, b, tParam) + normal * (a_corner.y * u_rayWidth);
  vec2 ndc = (posPx / u_resolution) * 2.0 - 1.0;
  gl_Position = vec4(ndc.x, -ndc.y, 0.0, 1.0);

  float cv = clamp(u_color0.x + u_color0.y * a_rand.w + u_color0.z * sin(proj * u_color0.w + u_time * u_color1.x), u_color1.y, u_color1.z);
  v_color = u_rayColor.w >= 0.5 ? u_rayColor.rgb : colorFor(fract(cv));
  v_alpha = mix(u_rayAlpha.x, u_rayAlpha.y, tParam) * cull;
  v_acrossW = vec2(a_corner.y * u_rayWidth, u_rayWidth * 0.5);
}
`;

const RAY_FRAG = `#version 300 es
precision highp float;

in vec3 v_color;
in float v_alpha;
in vec2 v_acrossW;

out vec4 outColor;

void main() {
  float d = abs(v_acrossW.x) - v_acrossW.y;
  float aa = fwidth(d);
  float cov = aa > 0.0 ? clamp(0.5 - d / aa, 0.0, 1.0) : (d <= 0.0 ? 1.0 : 0.0);
  float a = v_alpha * cov;
  if (a <= 0.0) discard;
  outColor = vec4(v_color, a);
}
`;

/**
 * WebGL2 reimplementation of StickField: a floating cloud of short, round-capped
 * sticks on a breathing sphere. The entire per-stick adjustment loop runs in the
 * vertex shader via instanced rendering, so the CPU only updates uniforms and
 * issues one draw call per frame. No dependencies and no fallback path: if
 * WebGL2 is unavailable the component renders nothing.
 *
 * All animation, DOM mutation and lifecycle live here; the React component is a
 * thin shell that forwards the root and canvas refs.
 */
export class StickFieldGlState {
  // Geometry + motion options.
  private count = 140;
  private colors = DEFAULT_COLORS;
  private stickLength = 0.085;
  private lineWidth = 1.4;
  private rounding = 1;
  private radiusFrac = 0.78;
  private perspective = 3;
  private shapeOctaves = 3;
  private shapeRoughness = 0.5;
  private shapeSharpness = 1;
  private pulseAmp = 0;
  private pulseSpeed = 0.5;
  private flatten = 0;
  private hideBack = false;
  private cullDepth = 0;
  private yawSpeed = 0.18;
  private pitchAmp = 0.18;
  private pitchSpeed = 0.35;
  private reactToMouse = false;
  private followMouse = false;
  private followStrength = 0.5;
  private followReach = 0.6;
  private tiltMax = 0.45;
  private mouseRepel = false;
  private repelRadius = 120;
  private repelStrength = 1;
  private fps = 0;

  // Field, center of attraction, rays, and cheap-win options.
  private fieldType = 0; // 0 radial, 1 dipole
  private fieldAxisX = 0;
  private fieldAxisY = 1;
  private fieldAxisZ = 0;
  private fieldWobble = 0;
  private fieldWobbleSpeed = 0.3;
  private centerDrift = 0;
  private centerDriftSpeed = 0.2;
  private rays = false;
  private rayWidth = 0.6;
  private rayColor = '';
  private rayColorRgb: [number, number, number] = [1, 1, 1];
  private rayColorMode = 0;
  private rayAlpha = 0.25;
  private rayAlphaCenter = 0;
  private rayStartOffset = 0;
  private rayEndOffset = 1;
  private glow = false;
  private twinkle = 0;
  private twinkleSpeed = 3;

  // Modulators, flattened to primitives.
  private szBase = 1;
  private szRand = 0;
  private szWave = 0;
  private szFreq = 1.2;
  private szSpeed = 0.5;
  private szMin = -Infinity;
  private szMax = Infinity;
  private thBase = 1;
  private thRand = 0;
  private thWave = 0;
  private thFreq = 1.2;
  private thSpeed = 0.5;
  private thMin = -Infinity;
  private thMax = Infinity;
  private dsBase = 1;
  private dsRand = 0;
  private dsWave = 0.06;
  private dsFreq = 1.5;
  private dsSpeed = 0.6;
  private dsMin = -Infinity;
  private dsMax = Infinity;
  private clBase = 0;
  private clRand = 0;
  private clWave = 1;
  private clFreq = 0.6;
  private clSpeed = 0.25;
  private clMin = -Infinity;
  private clMax = Infinity;
  private mgBase = 0;
  private mgRand = 0;
  private mgWave = 0;
  private mgFreq = 1;
  private mgMin = -Infinity;
  private mgMax = Infinity;
  private colorActive = 3;
  private colorChangeSpeed = 1;

  // Per-instance static data, interleaved per STRIDE and uploaded once on seed.
  private instanceData = new Float32Array(0);
  private seeded = false;

  // Color: palette plus a rotating active-colors set (all RGB in 0..1).
  private paletteRgb: number[][] = [];
  private activeK = 0;
  private useActive = 0;
  private slotR = new Float32Array(0);
  private slotG = new Float32Array(0);
  private slotB = new Float32Array(0);
  private slotTarget = new Int32Array(0);
  private slotNext = new Float32Array(0);
  private colorDirty = true;

  // DOM + GL.
  private root: HTMLDivElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private gl: WebGL2RenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private rayProgram: WebGLProgram | null = null;
  private vao: WebGLVertexArrayObject | null = null;
  private cornerBuf: WebGLBuffer | null = null;
  private instanceBuf: WebGLBuffer | null = null;
  private u: Record<string, WebGLUniformLocation | null> = {};
  private ru: Record<string, WebGLUniformLocation | null> = {};

  // Viewport.
  private w = 0;
  private h = 0;
  private cx = 0;
  private cy = 0;
  private radiusPx = 0;

  // Animation clock + eased pointer tilt/follow.
  private t = 0;
  private last = 0;
  private acc = 0;
  private mYaw = 0;
  private mPitch = 0;
  private targetYaw = 0;
  private targetPitch = 0;
  private followX = 0;
  private followY = 0;
  private targetFollowX = 0;
  private targetFollowY = 0;
  // Eased pointer position (container px) and influence amount for mouse repel.
  private ptrX = 0;
  private ptrY = 0;
  private targetPtrX = 0;
  private targetPtrY = 0;
  private ptrSeen = false;
  private repelAmt = 0;
  private targetRepelAmt = 0;

  // Lifecycle.
  private started = false;
  private rafId = 0;
  private ro: ResizeObserver | null = null;
  private io: IntersectionObserver | null = null;
  private reduce: MediaQueryList | null = null;

  constructor(opts: StickFieldOptions = {}) {
    this.setOptions(opts);
  }

  public setOptions(o: StickFieldOptions): void {
    const prevCount = this.count;
    const prevRadius = this.radiusFrac;
    const prevActive = this.colorActive;
    this.count = o.count ?? this.count;
    this.stickLength = o.stickLength ?? this.stickLength;
    this.lineWidth = o.lineWidth ?? this.lineWidth;
    this.rounding = o.rounding ?? this.rounding;
    this.radiusFrac = o.radius ?? this.radiusFrac;
    if (this.radiusFrac !== prevRadius && this.w > 0) this.radiusPx = Math.min(this.w, this.h) * 0.5 * this.radiusFrac;
    this.perspective = o.perspective ?? this.perspective;
    this.shapeOctaves = o.shapeOctaves ?? this.shapeOctaves;
    this.shapeRoughness = o.shapeRoughness ?? this.shapeRoughness;
    this.shapeSharpness = o.shapeSharpness ?? this.shapeSharpness;
    this.pulseAmp = o.pulse ?? this.pulseAmp;
    this.pulseSpeed = o.pulseSpeed ?? this.pulseSpeed;
    this.flatten = o.flatten ?? this.flatten;
    this.hideBack = o.hideBack ?? this.hideBack;
    this.cullDepth = o.cullDepth ?? this.cullDepth;
    this.yawSpeed = o.yawSpeed ?? this.yawSpeed;
    this.pitchAmp = o.pitchAmp ?? this.pitchAmp;
    this.pitchSpeed = o.pitchSpeed ?? this.pitchSpeed;
    this.reactToMouse = o.reactToMouse ?? this.reactToMouse;
    this.followMouse = o.followMouse ?? this.followMouse;
    this.followStrength = o.followStrength ?? this.followStrength;
    this.followReach = o.followReach ?? this.followReach;
    this.tiltMax = o.tiltMax ?? this.tiltMax;
    this.mouseRepel = o.mouseRepel ?? this.mouseRepel;
    this.repelRadius = o.repelRadius ?? this.repelRadius;
    this.repelStrength = o.repelStrength ?? this.repelStrength;
    this.fps = o.fps ?? this.fps;
    if (o.field === 'radial') this.fieldType = 0;
    else if (o.field === 'dipole') this.fieldType = 1;
    if (o.fieldAxis) {
      this.fieldAxisX = o.fieldAxis[0];
      this.fieldAxisY = o.fieldAxis[1];
      this.fieldAxisZ = o.fieldAxis[2];
    }
    this.fieldWobble = o.fieldWobble ?? this.fieldWobble;
    this.fieldWobbleSpeed = o.fieldWobbleSpeed ?? this.fieldWobbleSpeed;
    this.centerDrift = o.centerDrift ?? this.centerDrift;
    this.centerDriftSpeed = o.centerDriftSpeed ?? this.centerDriftSpeed;
    const prevRays = this.rays;
    this.rays = o.rays ?? this.rays;
    // Ensure the ray program receives the static palette when it first turns on.
    if (this.rays && !prevRays) this.colorDirty = true;
    this.rayWidth = o.rayWidth ?? this.rayWidth;
    if (o.rayColor !== undefined && o.rayColor !== this.rayColor) {
      this.rayColor = o.rayColor;
      const rgb = o.rayColor ? parseRgb(o.rayColor) : null;
      if (rgb) {
        this.rayColorRgb = rgb;
        this.rayColorMode = 1;
      } else this.rayColorMode = 0;
    }
    this.rayAlpha = o.rayAlpha ?? this.rayAlpha;
    this.rayAlphaCenter = o.rayAlphaCenter ?? this.rayAlphaCenter;
    this.rayStartOffset = o.rayStartOffset ?? this.rayStartOffset;
    this.rayEndOffset = o.rayEndOffset ?? this.rayEndOffset;
    this.glow = o.glow ?? this.glow;
    this.twinkle = o.twinkle ?? this.twinkle;
    this.twinkleSpeed = o.twinkleSpeed ?? this.twinkleSpeed;
    this.colorActive = o.colorActive ?? this.colorActive;
    this.colorChangeSpeed = o.colorChangeSpeed ?? this.colorChangeSpeed;
    const sz = o.size;
    if (sz) {
      this.szBase = sz.base ?? this.szBase;
      this.szRand = sz.random ?? this.szRand;
      this.szWave = sz.wave ?? this.szWave;
      this.szFreq = sz.waveFreq ?? this.szFreq;
      this.szSpeed = sz.waveSpeed ?? this.szSpeed;
      this.szMin = sz.min ?? this.szMin;
      this.szMax = sz.max ?? this.szMax;
    }
    const th = o.thickness;
    if (th) {
      this.thBase = th.base ?? this.thBase;
      this.thRand = th.random ?? this.thRand;
      this.thWave = th.wave ?? this.thWave;
      this.thFreq = th.waveFreq ?? this.thFreq;
      this.thSpeed = th.waveSpeed ?? this.thSpeed;
      this.thMin = th.min ?? this.thMin;
      this.thMax = th.max ?? this.thMax;
    }
    const ds = o.distance;
    if (ds) {
      this.dsBase = ds.base ?? this.dsBase;
      this.dsRand = ds.random ?? this.dsRand;
      this.dsWave = ds.wave ?? this.dsWave;
      this.dsFreq = ds.waveFreq ?? this.dsFreq;
      this.dsSpeed = ds.waveSpeed ?? this.dsSpeed;
      this.dsMin = ds.min ?? this.dsMin;
      this.dsMax = ds.max ?? this.dsMax;
    }
    const cl = o.color;
    if (cl) {
      this.clBase = cl.base ?? this.clBase;
      this.clRand = cl.random ?? this.clRand;
      this.clWave = cl.wave ?? this.clWave;
      this.clFreq = cl.waveFreq ?? this.clFreq;
      this.clSpeed = cl.waveSpeed ?? this.clSpeed;
      this.clMin = cl.min ?? this.clMin;
      this.clMax = cl.max ?? this.clMax;
    }
    const mg = o.magnetism;
    if (mg) {
      this.mgBase = mg.base ?? this.mgBase;
      this.mgRand = mg.random ?? this.mgRand;
      this.mgWave = mg.wave ?? this.mgWave;
      this.mgFreq = mg.waveFreq ?? this.mgFreq;
      this.mgMin = mg.min ?? this.mgMin;
      this.mgMax = mg.max ?? this.mgMax;
    }
    if (o.colors && o.colors !== this.colors) {
      this.colors = o.colors;
      this.colorDirty = true;
    }
    if (this.colorActive !== prevActive) this.colorDirty = true;
    // Magnetism is resolved live in the shader, so only count drives a reseed.
    if (this.seeded && this.count !== prevCount) this.seed();
  }

  public readonly setRoot = (el: HTMLDivElement | null): void => {
    this.root = el;
  };

  public readonly setCanvas = (el: HTMLCanvasElement | null): void => {
    this.canvas = el;
    this.gl = el
      ? el.getContext('webgl2', {
          alpha: true,
          premultipliedAlpha: false,
          antialias: false,
          depth: false,
          stencil: false,
        })
      : null;
  };

  /** Compile the program, gather uniform locations, build the VAO and buffers. */
  private initGl(): void {
    const gl = this.gl;
    if (!gl || this.program) return;
    const vs = this.compile(gl.VERTEX_SHADER, VERT);
    const fs = this.compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('StickFieldGl link:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return;
    }
    this.program = program;
    for (const name of UNIFORMS) this.u[name] = gl.getUniformLocation(program, name);
    this.u.u_palette = gl.getUniformLocation(program, 'u_palette[0]');
    this.u.u_active = gl.getUniformLocation(program, 'u_active[0]');

    // Ray program: optional second pass sharing the same VAO and instance buffer.
    const rvs = this.compile(gl.VERTEX_SHADER, RAY_VERT);
    const rfs = this.compile(gl.FRAGMENT_SHADER, RAY_FRAG);
    if (rvs && rfs) {
      const rp = gl.createProgram();
      if (rp) {
        gl.attachShader(rp, rvs);
        gl.attachShader(rp, rfs);
        gl.linkProgram(rp);
        gl.deleteShader(rvs);
        gl.deleteShader(rfs);
        if (gl.getProgramParameter(rp, gl.LINK_STATUS)) {
          this.rayProgram = rp;
          for (const name of RAY_UNIFORMS) this.ru[name] = gl.getUniformLocation(rp, name);
          this.ru.u_palette = gl.getUniformLocation(rp, 'u_palette[0]');
          this.ru.u_active = gl.getUniformLocation(rp, 'u_active[0]');
        } else {
          console.error('StickFieldGl ray link:', gl.getProgramInfoLog(rp));
          gl.deleteProgram(rp);
        }
      }
    }

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    this.cornerBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cornerBuf);
    gl.bufferData(gl.ARRAY_BUFFER, CORNERS, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    this.instanceBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuf);
    const stride = STRIDE * 4;
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 0);
    gl.vertexAttribDivisor(1, 1);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, stride, 12);
    gl.vertexAttribDivisor(2, 1);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 4, gl.FLOAT, false, stride, 24);
    gl.vertexAttribDivisor(3, 1);
    gl.enableVertexAttribArray(4);
    gl.vertexAttribPointer(4, 1, gl.FLOAT, false, stride, 40);
    gl.vertexAttribDivisor(4, 1);
    gl.bindVertexArray(null);

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    // The palette is the only sticky uniform; re-upload it for this program.
    this.colorDirty = true;
  }

  private compile(type: number, src: string): WebGLShader | null {
    const gl = this.gl!;
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error('StickFieldGl shader:', gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  /** Distribute sticks over a sphere; assign each a random axis and randoms. */
  private seed(): void {
    const n = this.count;
    const data = new Float32Array(n * STRIDE);
    const denom = n > 1 ? n - 1 : 1;
    for (let i = 0; i < n; i++) {
      const o = i * STRIDE;
      // Fibonacci sphere for an even spread.
      const y = 1 - (i / denom) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = GOLDEN * i;
      data[o] = Math.cos(theta) * r;
      data[o + 1] = y;
      data[o + 2] = Math.sin(theta) * r;
      // Random unit axis, blended toward the normal by magnetism in the shader.
      const a = Math.random() * TWO_PI;
      const u = Math.random() * 2 - 1;
      const s = Math.sqrt(Math.max(0, 1 - u * u));
      data[o + 3] = Math.cos(a) * s;
      data[o + 4] = u;
      data[o + 5] = Math.sin(a) * s;
      data[o + 6] = Math.random() * 2 - 1; // rndSize
      data[o + 7] = Math.random() * 2 - 1; // rndThick
      data[o + 8] = Math.random() * 2 - 1; // rndDist
      data[o + 9] = Math.random() * 2 - 1; // rndColor
      data[o + 10] = Math.random() * 2 - 1; // rndMag
    }
    this.instanceData = data;
    this.seeded = true;
    this.uploadInstances();
  }

  private uploadInstances(): void {
    const gl = this.gl;
    if (!gl || !this.instanceBuf) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.instanceData, gl.STATIC_DRAW);
  }

  /** Parse the palette to RGB (0..1) and init the rotating active slots. */
  private prepColors(): void {
    const colors = this.colors;
    const n = colors.length;
    const pal: number[][] = [];
    if (typeof document !== 'undefined' && document.createElement) {
      const c = document.createElement('canvas');
      c.width = 1;
      c.height = 1;
      const g = c.getContext('2d');
      if (g)
        for (let i = 0; i < n; i++) {
          g.fillStyle = colors[i];
          g.fillRect(0, 0, 1, 1);
          const d = g.getImageData(0, 0, 1, 1).data;
          pal.push([d[0] / 255, d[1] / 255, d[2] / 255]);
        }
    }
    this.paletteRgb = pal;
    const np = pal.length;
    const K = this.colorActive >= 1 && this.colorActive < n ? this.colorActive : 0;
    this.activeK = K;
    this.useActive = K > 0 && np > 0 ? 1 : 0;
    if (K && np) {
      this.slotR = new Float32Array(K);
      this.slotG = new Float32Array(K);
      this.slotB = new Float32Array(K);
      this.slotTarget = new Int32Array(K);
      this.slotNext = new Float32Array(K);
      for (let k = 0; k < K; k++) {
        const idx = (Math.random() * np) | 0;
        this.slotR[k] = pal[idx][0];
        this.slotG[k] = pal[idx][1];
        this.slotB[k] = pal[idx][2];
        this.slotTarget[k] = (Math.random() * np) | 0;
        this.slotNext[k] = this.t + (k + 1) * (2 + Math.random() * 2);
      }
    }
  }

  /** Upload the static palette ramp and the color mode flag to one program. */
  private uploadPalette(locs: Record<string, WebGLUniformLocation | null>): void {
    const gl = this.gl;
    if (!gl) return;
    const pal = this.paletteRgb;
    const n = Math.min(pal.length, MAXC);
    if (n && locs.u_palette) {
      const data = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        data[i * 3] = pal[i][0];
        data[i * 3 + 1] = pal[i][1];
        data[i * 3 + 2] = pal[i][2];
      }
      gl.uniform3fv(locs.u_palette, data);
    }
    gl.uniform1i(locs.u_paletteLen, n);
    gl.uniform1i(locs.u_useActive, this.useActive);
  }

  /** Advance the active color slots toward their targets (CPU, once per frame). */
  private advanceActive(dt: number): void {
    const K = this.activeK;
    const pal = this.paletteRgb;
    const np = pal.length;
    if (!K || !np) return;
    const lr = 1 - Math.exp(-this.colorChangeSpeed * dt);
    for (let k = 0; k < K; k++) {
      if (this.t >= this.slotNext[k]) {
        this.slotTarget[k] = (Math.random() * np) | 0;
        this.slotNext[k] = this.t + (3 + Math.random() * 4) / Math.max(0.05, this.colorChangeSpeed);
      }
      const tg = pal[this.slotTarget[k]];
      this.slotR[k] += (tg[0] - this.slotR[k]) * lr;
      this.slotG[k] += (tg[1] - this.slotG[k]) * lr;
      this.slotB[k] += (tg[2] - this.slotB[k]) * lr;
    }
  }

  /** Upload the current active-color slots to one program. */
  private uploadActive(locs: Record<string, WebGLUniformLocation | null>): void {
    const gl = this.gl;
    const K = Math.min(this.activeK, MAXC);
    if (!gl || !K) return;
    const data = new Float32Array(K * 3);
    for (let k = 0; k < K; k++) {
      data[k * 3] = this.slotR[k];
      data[k * 3 + 1] = this.slotG[k];
      data[k * 3 + 2] = this.slotB[k];
    }
    if (locs.u_active) gl.uniform3fv(locs.u_active, data);
    gl.uniform1i(locs.u_activeK, K);
  }

  private resize(): void {
    const root = this.root;
    const canvas = this.canvas;
    const gl = this.gl;
    if (!root || !canvas || !gl) return;
    const rect = root.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = rect.width;
    this.h = rect.height;
    this.cx = rect.width / 2;
    this.cy = rect.height / 2;
    this.radiusPx = Math.min(rect.width, rect.height) * 0.5 * this.radiusFrac;
    canvas.width = Math.max(1, (rect.width * dpr) | 0);
    canvas.height = Math.max(1, (rect.height * dpr) | 0);
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (this.reduce?.matches) this.draw(0);
  }

  public start(): void {
    if (this.started || !this.root || !this.canvas || !this.gl) return;
    this.started = true;
    this.initGl();
    if (!this.program) return; // shader/link failed: render nothing
    if (!this.seeded) this.seed();
    else this.uploadInstances();
    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.ro = new ResizeObserver(this.onResize);
    this.ro.observe(this.root);
    this.io = new IntersectionObserver(this.onIntersect);
    this.io.observe(this.root);
    document.addEventListener('visibilitychange', this.onVisibility);
    if (this.reactToMouse || this.followMouse || this.mouseRepel)
      window.addEventListener('pointermove', this.onPointerMove, {passive: true});
    this.resize();
    if (this.reduce.matches) this.draw(0);
    else this.play();
  }

  public dispose(): void {
    this.pause();
    this.started = false;
    this.ro?.disconnect();
    this.io?.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
    window.removeEventListener('pointermove', this.onPointerMove);
    this.ro = this.io = null;
    const gl = this.gl;
    if (gl) {
      if (this.vao) gl.deleteVertexArray(this.vao);
      if (this.cornerBuf) gl.deleteBuffer(this.cornerBuf);
      if (this.instanceBuf) gl.deleteBuffer(this.instanceBuf);
      if (this.program) gl.deleteProgram(this.program);
      if (this.rayProgram) gl.deleteProgram(this.rayProgram);
      // Note: we deliberately do not call WEBGL_lose_context.loseContext().
      // start() can run again on the same instance and canvas (React StrictMode
      // dev double-mount, HMR), and a lost context cannot be reacquired from the
      // same canvas. initGl() rebuilds these resources on the next start(); the
      // context itself is reclaimed when the canvas is garbage collected.
    }
    this.program = this.rayProgram = this.vao = this.cornerBuf = this.instanceBuf = null;
  }

  private play(): void {
    if (this.rafId || this.reduce?.matches) return;
    this.last = performance.now();
    this.rafId = requestAnimationFrame(this.frame);
  }

  private pause(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  private readonly onResize = (): void => this.resize();

  private readonly onIntersect = (entries: IntersectionObserverEntry[]): void => {
    if (entries[0]?.isIntersecting) this.play();
    else this.pause();
  };

  private readonly onVisibility = (): void => {
    if (document.hidden) this.pause();
    else this.play();
  };

  private readonly onPointerMove = (e: PointerEvent): void => {
    const root = this.root;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const halfW = rect.width / 2;
    const halfH = rect.height / 2;
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    const offX = localX - halfW;
    const offY = localY - halfH;
    if (this.reactToMouse) {
      this.targetYaw = clamp(offX / halfW, -1, 1) * this.tiltMax;
      this.targetPitch = -clamp(offY / halfH, -1, 1) * this.tiltMax;
    }
    if (this.followMouse) {
      const maxX = halfW * this.followReach;
      const maxY = halfH * this.followReach;
      this.targetFollowX = clamp(offX * this.followStrength, -maxX, maxX);
      this.targetFollowY = clamp(offY * this.followStrength, -maxY, maxY);
    }
    if (this.mouseRepel) {
      this.targetPtrX = localX;
      this.targetPtrY = localY;
      // Snap on the first sample so repulsion does not sweep in from a corner.
      if (!this.ptrSeen) {
        this.ptrX = localX;
        this.ptrY = localY;
        this.ptrSeen = true;
      }
      const inside = localX >= 0 && localX <= rect.width && localY >= 0 && localY <= rect.height;
      this.targetRepelAmt = inside ? 1 : 0;
    }
  };

  private readonly frame = (now: number): void => {
    this.rafId = requestAnimationFrame(this.frame);
    let dt = (now - this.last) / 1000;
    this.last = now;
    if (dt > 0.05) dt = 0.05;
    if (this.fps > 0) {
      const interval = 1000 / this.fps;
      this.acc += dt * 1000;
      if (this.acc < interval) return;
      this.acc %= interval;
    }
    this.t += dt;
    const kt = 1 - Math.exp(-4 * dt);
    this.mYaw += (this.targetYaw - this.mYaw) * kt;
    this.mPitch += (this.targetPitch - this.mPitch) * kt;
    const kf = 1 - Math.exp(-2.5 * dt);
    this.followX += (this.targetFollowX - this.followX) * kf;
    this.followY += (this.targetFollowY - this.followY) * kf;
    this.ptrX += (this.targetPtrX - this.ptrX) * kt;
    this.ptrY += (this.targetPtrY - this.ptrY) * kt;
    this.repelAmt += (this.targetRepelAmt - this.repelAmt) * kf;
    this.draw(dt);
  };

  private bindProgram(p: WebGLProgram): void {
    // biome-ignore lint/correctness/useHookAtTopLevel: `useProgram` is the WebGL API, not a React hook
    this.gl!.useProgram(p);
  }

  /** Uniforms both programs share (time, camera, breathing, color, pointer). */
  private setCommonUniforms(locs: Record<string, WebGLUniformLocation | null>): void {
    const gl = this.gl!;
    const t = this.t;
    const yaw = t * this.yawSpeed + this.mYaw;
    const pitch = Math.sin(t * this.pitchSpeed) * this.pitchAmp + this.mPitch;
    gl.uniform4f(locs.u_rot, Math.cos(yaw), Math.sin(yaw), Math.cos(pitch), Math.sin(pitch));
    gl.uniform1f(locs.u_time, t);
    gl.uniform2f(locs.u_resolution, this.w, this.h);
    gl.uniform2f(locs.u_center, this.cx + this.followX, this.cy + this.followY);
    gl.uniform1f(locs.u_radiusPx, this.radiusPx);
    gl.uniform1f(locs.u_perspective, this.perspective);
    gl.uniform1f(locs.u_zScale, 1 - this.flatten);
    gl.uniform1f(locs.u_pulse, this.pulseAmp * Math.sin(t * this.pulseSpeed));
    const oct = this.shapeOctaves < 1 ? 1 : Math.min(MAX_OCT, this.shapeOctaves | 0);
    gl.uniform1i(locs.u_shapeOctaves, oct);
    gl.uniform1f(locs.u_shapeRoughness, this.shapeRoughness);
    gl.uniform1f(locs.u_shapeSharpness, this.shapeSharpness);
    gl.uniform4f(locs.u_dist0, this.dsBase, this.dsRand, this.dsWave, this.dsFreq);
    gl.uniform3f(locs.u_dist1, this.dsSpeed, cap(this.dsMin), cap(this.dsMax));
    gl.uniform4f(locs.u_color0, this.clBase, this.clRand, this.clWave, this.clFreq);
    gl.uniform3f(locs.u_color1, this.clSpeed, cap(this.clMin), cap(this.clMax));
    gl.uniform1i(locs.u_hideBack, this.hideBack ? 1 : 0);
    gl.uniform1f(locs.u_cullDepth, this.cullDepth);
    gl.uniform2f(locs.u_pointer, this.ptrX, this.ptrY);
    gl.uniform2f(locs.u_repel, this.repelRadius, this.mouseRepel ? this.repelStrength * this.repelAmt : 0);
  }

  private draw(dt: number): void {
    const gl = this.gl;
    if (!gl || !this.program) return;
    const t = this.t;
    const dirty = this.colorDirty;
    if (dirty) this.prepColors();
    if (this.activeK) this.advanceActive(dt);

    // Live field axis (with optional wobble) and drifting center of attraction.
    const fl = Math.hypot(this.fieldAxisX, this.fieldAxisY, this.fieldAxisZ) || 1;
    let fax = this.fieldAxisX / fl;
    let fay = this.fieldAxisY / fl;
    let faz = this.fieldAxisZ / fl;
    if (this.fieldWobble > 0) {
      const sp = this.fieldWobbleSpeed;
      fax += Math.sin(t * sp) * this.fieldWobble;
      faz += Math.cos(t * sp * 1.1) * this.fieldWobble;
      const wl = Math.hypot(fax, fay, faz) || 1;
      fax /= wl;
      fay /= wl;
      faz /= wl;
    }
    let atX = 0;
    let atY = 0;
    let atZ = 0;
    if (this.centerDrift > 0) {
      const sp = this.centerDriftSpeed;
      const d = this.centerDrift;
      atX = d * (0.6 * Math.sin(t * sp) + 0.4 * Math.sin(t * sp * 1.7 + 1));
      atY = d * (0.6 * Math.sin(t * sp * 0.9 + 2) + 0.4 * Math.sin(t * sp * 1.3 + 0.5));
      atZ = d * (0.6 * Math.sin(t * sp * 1.1 + 4) + 0.4 * Math.sin(t * sp * 0.6 + 3));
    }

    gl.blendFunc(gl.SRC_ALPHA, this.glow ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Ray pass first so the sticks sit on top of their rays.
    if (this.rays && this.rayProgram) {
      const ru = this.ru;
      this.bindProgram(this.rayProgram);
      gl.bindVertexArray(this.vao);
      this.setCommonUniforms(ru);
      gl.uniform3f(ru.u_attract, atX, atY, atZ);
      gl.uniform1f(ru.u_rayWidth, this.rayWidth);
      gl.uniform4f(ru.u_rayColor, this.rayColorRgb[0], this.rayColorRgb[1], this.rayColorRgb[2], this.rayColorMode);
      gl.uniform2f(ru.u_rayAlpha, this.rayAlpha, this.rayAlphaCenter);
      gl.uniform2f(ru.u_rayOffsets, this.rayStartOffset, this.rayEndOffset);
      if (dirty) this.uploadPalette(ru);
      if (this.activeK) this.uploadActive(ru);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.count);
    }

    // Stick pass.
    const u = this.u;
    this.bindProgram(this.program);
    gl.bindVertexArray(this.vao);
    this.setCommonUniforms(u);
    gl.uniform1f(u.u_stickLength, this.stickLength);
    gl.uniform1f(u.u_lineWidth, this.lineWidth);
    gl.uniform1f(u.u_rounding, this.rounding);
    gl.uniform4f(u.u_size0, this.szBase, this.szRand, this.szWave, this.szFreq);
    gl.uniform3f(u.u_size1, this.szSpeed, cap(this.szMin), cap(this.szMax));
    gl.uniform4f(u.u_thick0, this.thBase, this.thRand, this.thWave, this.thFreq);
    gl.uniform3f(u.u_thick1, this.thSpeed, cap(this.thMin), cap(this.thMax));
    gl.uniform4f(u.u_mag0, this.mgBase, this.mgRand, this.mgWave, this.mgFreq);
    gl.uniform3f(u.u_mag1, 0, cap(this.mgMin), cap(this.mgMax));
    gl.uniform1i(u.u_fieldType, this.fieldType);
    gl.uniform3f(u.u_fieldAxis, fax, fay, faz);
    gl.uniform2f(u.u_twinkle, this.twinkle, this.twinkleSpeed);
    if (dirty) this.uploadPalette(u);
    if (this.activeK) this.uploadActive(u);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.count);

    this.colorDirty = false;
  }
}

const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);

// Replace +/-Infinity clamp bounds with large finite values the shader accepts.
const cap = (v: number): number => (v < -1e9 ? -1e9 : v > 1e9 ? 1e9 : v);

// Parse any CSS color to RGB in 0..1 via a throwaway 2D canvas (setup-time only).
const parseRgb = (str: string): [number, number, number] | null => {
  if (typeof document === 'undefined' || !document.createElement) return null;
  const c = document.createElement('canvas');
  c.width = 1;
  c.height = 1;
  const g = c.getContext('2d');
  if (!g) return null;
  g.fillStyle = str;
  g.fillRect(0, 0, 1, 1);
  const d = g.getImageData(0, 0, 1, 1).data;
  return [d[0] / 255, d[1] / 255, d[2] / 255];
};
