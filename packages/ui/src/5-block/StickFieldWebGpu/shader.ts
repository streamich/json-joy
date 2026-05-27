// WGSL for the StickField cloud. One instanced draw: the vertex shader runs the
// entire per-stick "adjustment loop" (magnetism axis, fbm breathing radius,
// size/thickness/color waves, rotation + perspective, quad expansion, back-cull,
// center-of-attraction offset, local mouse repulsion), the fragment shader cuts
// each quad into a rounded box (rounding 1 = capsule, 0 = sharp rectangle).
//
// Uniforms are packed as vec4f slots (predictable 16-byte stride, no std140
// array-stride surprises); the layout here mirrors writeUniforms() in state.ts:
//
//   v0 time, dpr, radiusPx, perspective
//   v1 resX, resY, centerX, centerY
//   v2 stickLength, lineWidth, zScale, pulse
//   v3 yaw, pitch, hideBack, cullDepth
//   v4 shapeOctaves, shapeRoughness, shapeSharpness, colorCount
//   v5 rounding, attractX, attractY, attractZ
//   v6 pointerX, pointerY, repelRadius, repelStrength
//   sz/th/ds/cl: (base, rand, wave, freq) | (speed, min, max, _)
//   mg: (base, rand, wave, freq) | (min, max, _, _)
//   fld0 fieldAxisX, fieldAxisY, fieldAxisZ, fieldMode (0 radial, 1 line, 2 ring)
//   ray0 rayWidth, rayFrom, rayTo, raysEnabled
//   ray1 rayAlphaNear, rayAlphaFar, rayUseStickColor, _
//   ray2 rayColorR, rayColorG, rayColorB, _
//   cw0  fog, fogR, fogG, fogB
//   cw1  twinkle, twinkleSpeed, _, vignette
//   cw2  spin, parallax, glow, _
export const WGSL = /* wgsl */ `
const WD  = vec3f(0.4319, 0.8638, 0.2591);
const WD1 = vec3f(-0.7035, 0.5025, 0.5025);
const WD2 = vec3f(0.3042, -0.4056, 0.8619);
const CULL_BAND = 0.18;

fn wdFor(k: i32) -> vec3f {
  let m = k % 3;
  if (m == 0) { return WD; }
  if (m == 1) { return WD1; }
  return WD2;
}

struct U {
  v0: vec4f, v1: vec4f, v2: vec4f, v3: vec4f, v4: vec4f, v5: vec4f, v6: vec4f,
  sz0: vec4f, sz1: vec4f,
  th0: vec4f, th1: vec4f,
  ds0: vec4f, ds1: vec4f,
  cl0: vec4f, cl1: vec4f,
  mg0: vec4f, mg1: vec4f,
  fld0: vec4f,
  ray0: vec4f, ray1: vec4f, ray2: vec4f,
  cw0: vec4f, cw1: vec4f, cw2: vec4f,
}

@group(0) @binding(0) var<uniform> u: U;
@group(0) @binding(1) var<storage, read> palette: array<vec4f>;

// One modulator: value = clamp(base + rand*r + wave*sin(proj*freq + t*speed), lo, hi).
struct Mod { base: f32, rnd: f32, wave: f32, freq: f32, speed: f32, lo: f32, hi: f32 }
fn mod7(a: vec4f, b: vec4f) -> Mod { return Mod(a.x, a.y, a.z, a.w, b.x, b.y, b.z); }
fn waveMod(m: Mod, r: f32, proj: f32, t: f32) -> f32 {
  return clamp(m.base + m.rnd * r + m.wave * sin(proj * m.freq + t * m.speed), m.lo, m.hi);
}

// Cyclic interpolation over n palette entries; cv is wrapped into [0, 1).
fn colorFor(cv: f32, n: i32) -> vec3f {
  if (n <= 1) { return palette[0].rgb; }
  let pos = fract(cv) * f32(n);
  let i0 = i32(floor(pos)) % n;
  let i1 = (i0 + 1) % n;
  return mix(palette[i0].rgb, palette[i1].rgb, fract(pos));
}

// Rotate body-space point (yaw then pitch), perspective-project to screen px.
// Returns (screenX, screenY, depth, scale).
fn project(p: vec3f, cy: f32, sy: f32, cx: f32, sx: f32) -> vec4f {
  let x1 =  p.x * cy + p.z * sy;
  let z1 = -p.x * sy + p.z * cy;
  let y2 =  p.y * cx - z1 * sx;
  let z2 =  p.y * sx + z1 * cx;
  let s  = u.v0.w / (u.v0.w - z2);
  return vec4f(u.v1.z + x1 * s * u.v0.z, u.v1.w - y2 * s * u.v0.z, z2, s);
}

// The field direction a stick aligns toward (magnetism blends its random axis
// toward this). fld0.w selects: 0 = radial (out from center), 1 = line (a common
// axis, all parallel), 2 = ring (tangential swirl around the axis).
fn fieldDir(dir: vec3f) -> vec3f {
  let mode = u.fld0.w;
  if (mode < 0.5) { return dir; }
  let axis = normalize(u.fld0.xyz);
  if (mode < 1.5) { return axis; }
  let tang = cross(axis, dir);
  let l = length(tang);
  if (l < 1e-4) { return dir; }
  return tang / l;
}

// Depth -> alpha fade shared by sticks and rays (back of the cloud is fainter).
fn depthAlpha(depth: f32) -> f32 {
  return clamp(0.2 + 0.8 * ((depth + 1.25) / 2.5), 0.15, 1.0);
}

// Rotate v around a unit axis by ang (Rodrigues), used for per-stick spin.
fn rotAround(v: vec3f, axis: vec3f, ang: f32) -> vec3f {
  let c = cos(ang); let s = sin(ang);
  return v * c + cross(axis, v) * s + axis * dot(axis, v) * (1.0 - c);
}

// Per-stick brightness flicker keyed off the stick's own random (cw1 = twinkle,
// twinkleSpeed). 1.0 when twinkle is off.
fn twinkleFactor(r: f32) -> f32 {
  return 1.0 + u.cw1.x * sin(u.v0.x * u.cw1.y + r * 6.2831853);
}

// Everything a stick needs that is shared between the stick draw and the ray
// draw: its body-space center, axis, size/thickness multipliers, color value.
struct Stick { c: vec3f, ax: vec3f, size: f32, thick: f32, cv: f32 }
fn computeStick(dir: vec3f, rndAxis: vec3f, rnd: vec4f, rndMag: f32) -> Stick {
  let t = u.v0.x;
  let proj = dot(dir, WD);

  // Magnetism axis: blend the seeded random axis toward the field direction.
  var m = clamp(u.mg0.x + u.mg0.y * rndMag + u.mg0.z * sin(proj * u.mg0.w), u.mg1.x, u.mg1.y);
  m = clamp(m, 0.0, 1.0);
  var ax = normalize(mix(rndAxis, fieldDir(dir), m));
  // Per-stick spin around the radial direction (cw2.x = spin), desynced by rndMag.
  if (u.cw2.x != 0.0) { ax = rotAround(ax, dir, t * u.cw2.x + rndMag * 6.2831853); }

  // Distance / breathing: fractal sum of octaves plus the global pulse.
  let oct = max(1, i32(u.v4.x));
  let rough = u.v4.y;
  let sharp = u.v4.z;
  var nz = 0.0; var amp = 1.0; var ampSum = 0.0; var freq = u.ds0.w;
  for (var k: i32 = 0; k < oct; k = k + 1) {
    let wd = wdFor(k);
    nz = nz + amp * sin(dot(dir, wd) * freq + t * u.ds1.x * (1.0 + 0.35 * f32(k)) + f32(k) * 1.7);
    ampSum = ampSum + amp;
    amp = amp * rough;
    freq = freq * 2.0;
  }
  nz = nz / max(ampSum, 1e-6);
  if (sharp != 1.0) { nz = sign(nz) * pow(abs(nz), sharp); }
  let rad = clamp(u.ds0.x + u.ds0.y * rnd.z + u.ds0.z * nz + u.v2.w, u.ds1.y, u.ds1.z);

  let size  = max(0.0, waveMod(mod7(u.sz0, u.sz1), rnd.x, proj, t));
  let thick = max(0.0, waveMod(mod7(u.th0, u.th1), rnd.y, proj, t));
  let cv = waveMod(mod7(u.cl0, u.cl1), rnd.w, proj, t);
  // Position around the (possibly drifting) center of attraction; only the depth
  // component of the radial offset is flattened, the attraction point is not.
  let c = u.v5.yzw + vec3f(dir.x * rad, dir.y * rad, dir.z * rad * u.v2.z);
  return Stick(c, ax, size, thick, cv);
}

// Smooth 0..1 pointer falloff (1 at the cursor, 0 at/after the radius), used by
// mouse repulsion. v6 = (px, py, radius, strength).
fn mouseFall(p: vec2f) -> f32 {
  let radius = u.v6.z;
  if (radius <= 0.0) { return 0.0; }
  let d = length(p - u.v6.xy);
  if (d >= radius) { return 0.0; }
  let f = 1.0 - d / radius;
  return f * f;
}

// Push a screen-px point away from the pointer by the repel strength.
fn repel(p: vec2f) -> vec2f {
  if (u.v6.w <= 0.0) { return p; }
  let away = p - u.v6.xy;
  let d = length(away);
  let f = mouseFall(p);
  if (f <= 0.0 || d <= 1e-3) { return p; }
  return p + (away / d) * (u.v6.w * f);
}

// ---- Sticks ---------------------------------------------------------------

struct VOut {
  @builtin(position) pos: vec4f,
  @location(0) color: vec3f,
  @location(1) alpha: f32,
  @location(2) uv: vec2f,
  @location(3) shape: vec4f, // segLen, widthPx, rounding, glow
}

@vertex
fn vs(
  @location(0) corner: vec2f,
  @location(1) dir: vec3f,
  @location(2) rndAxis: vec3f,
  @location(3) rnd: vec4f,
  @location(4) rndMag: f32,
) -> VOut {
  var out: VOut;
  out.color = vec3f(0.0);
  out.alpha = 0.0;
  out.uv = corner;
  out.shape = vec4f(0.0);
  out.pos = vec4f(0.0, 0.0, 0.0, 1.0);

  let s = computeStick(dir, rndAxis, rnd, rndMag);
  let off = s.ax * (u.v2.x * s.size * 0.5);

  // Parallax: per-stick yaw offset so the cloud separates into depth layers.
  let yaw = u.v3.x + u.cw2.y * rndMag;
  let cy = cos(yaw); let sy = sin(yaw);
  let cx = cos(u.v3.y); let sx = sin(u.v3.y);
  let p1 = project(s.c + off, cy, sy, cx, sx);
  let p2 = project(s.c - off, cy, sy, cx, sx);
  let depth = (p1.z + p2.z) * 0.5;

  var cull = 1.0;
  if (u.v3.z > 0.5) {
    let edge = depth - u.v3.w;
    if (edge < -CULL_BAND) { out.pos = vec4f(2.0, 2.0, 2.0, 1.0); return out; }
    if (edge < CULL_BAND) { let uu = (edge + CULL_BAND) / (2.0 * CULL_BAND); cull = uu * uu * (3.0 - 2.0 * uu); }
  }

  // Expand the unit quad in screen space around the stick segment. The quad is
  // grown by the cap radius on each end so a rounding=1 stick has room for its
  // round caps (matches the 2D lineCap: 'round' look); the fragment rounds the
  // corners by the rounding amount. corner.x runs along the axis, corner.y across.
  let widthPx = u.v2.y * s.size * s.thick * (p1.w + p2.w) * 0.5;
  let segLen = length(p1.xy - p2.xy);
  let mid = repel((p1.xy + p2.xy) * 0.5);

  let r = widthPx * 0.5;
  let halfLen = segLen * 0.5 + r;
  var axisDir = vec2f(1.0, 0.0);
  if (segLen > 1e-5) { axisDir = (p2.xy - p1.xy) / segLen; }
  let normal = vec2f(-axisDir.y, axisDir.x);
  let posPx = mid + axisDir * (corner.x * 2.0 * halfLen) + normal * (corner.y * widthPx);
  var clip = (posPx / u.v1.xy) * 2.0 - vec2f(1.0, 1.0);
  clip.y = -clip.y;
  out.pos = vec4f(clip, 0.0, 1.0);

  // Color with depth fog (cw0 = amount, rgb), then per-stick twinkle and vignette.
  var col = colorFor(s.cv, i32(u.v4.w));
  let fogT = clamp(1.0 - (depth + 1.25) / 2.5, 0.0, 1.0);
  col = mix(col, u.cw0.yzw, u.cw0.x * fogT);
  out.color = col;
  var a = depthAlpha(depth) * cull * twinkleFactor(rnd.w);
  if (u.cw1.w != 0.0) {
    let half = max(min(u.v1.x, u.v1.y) * 0.5, 1.0);
    let dc = length(mid - u.v1.zw) / half;
    a = a * (1.0 - u.cw1.w * smoothstep(0.7, 1.05, dc));
  }
  out.alpha = clamp(a, 0.0, 1.0);
  out.uv = corner;
  out.shape = vec4f(segLen, widthPx, u.v5.x, u.cw2.z);
  return out;
}

@fragment
fn fs(in: VOut) -> @location(0) vec4f {
  // Rounded-box SDF in the stick's local px frame. Half-extents match the quad:
  // half along = segLen/2 + r (cap room), half across = r. Corner radius scales
  // with rounding: 1 -> capsule, 0 -> sharp rectangle.
  let w = in.shape.y;
  let r = w * 0.5;
  let b = vec2f(in.shape.x * 0.5 + r, r);
  let cr = clamp(in.shape.z, 0.0, 1.0) * min(b.x, b.y);
  let p = vec2f(in.uv.x * 2.0 * b.x, in.uv.y * w);
  let q = abs(p) - b + vec2f(cr, cr);
  let dist = min(max(q.x, q.y), 0.0) + length(max(q, vec2f(0.0, 0.0))) - cr;
  let aa = max(fwidth(dist), 1e-4);
  let mask = clamp(0.5 - dist / aa, 0.0, 1.0);
  // Core glow (shape.w): brighten toward the stick's center for a neon look.
  var rgb = in.color;
  let glow = in.shape.w;
  if (glow > 0.0) {
    let core = clamp(-dist / max(r, 1e-4), 0.0, 1.0);
    rgb = rgb + core * core * glow;
  }
  let a = in.alpha * mask;
  if (a <= 0.0) { discard; }
  return vec4f(rgb * a, a); // premultiplied
}

struct ROut {
  @builtin(position) pos: vec4f,
  @location(0) color: vec3f,
  @location(1) alpha: f32,
  @location(2) edge: f32, // across-quad coord in [-1, 1] for soft edges
}

@vertex
fn vsRay(
  @location(0) corner: vec2f,
  @location(1) dir: vec3f,
  @location(2) rndAxis: vec3f,
  @location(3) rnd: vec4f,
  @location(4) rndMag: f32,
) -> ROut {
  var out: ROut;
  out.color = vec3f(0.0);
  out.alpha = 0.0;
  out.edge = corner.y * 2.0;
  out.pos = vec4f(0.0, 0.0, 0.0, 1.0);

  let s = computeStick(dir, rndAxis, rnd, rndMag);
  let yaw = u.v3.x + u.cw2.y * rndMag; // match the sticks' parallax
  let cy = cos(yaw); let sy = sin(yaw);
  let cx = cos(u.v3.y); let sx = sin(u.v3.y);
  let pStick = project(s.c, cy, sy, cx, sx);
  let pCenter = project(u.v5.yzw, cy, sy, cx, sx);
  let a = repel(pStick.xy);
  let bpt = pCenter.xy;

  // The ray spans from the stick end (rayFrom) to the center end (rayTo).
  let p0 = mix(a, bpt, u.ray0.y);
  let p1 = mix(a, bpt, u.ray0.z);
  let segLen = length(p1 - p0);
  let mid = (p0 + p1) * 0.5;
  var axisDir = vec2f(1.0, 0.0);
  if (segLen > 1e-5) { axisDir = (p1 - p0) / segLen; }
  let normal = vec2f(-axisDir.y, axisDir.x);
  let posPx = mid + axisDir * (corner.x * segLen) + normal * (corner.y * u.ray0.x);
  var clip = (posPx / u.v1.xy) * 2.0 - vec2f(1.0, 1.0);
  clip.y = -clip.y;
  out.pos = vec4f(clip, 0.0, 1.0);

  // Alpha gradient along the ray: near the stick (corner.x = -0.5) to the center
  // (corner.x = +0.5), faded overall by the stick's depth.
  let f = corner.x + 0.5;
  let grad = mix(u.ray1.x, u.ray1.y, f);
  out.alpha = grad * depthAlpha(pStick.z) * twinkleFactor(rnd.w);
  let stickColor = colorFor(s.cv, i32(u.v4.w));
  out.color = select(u.ray2.rgb, stickColor, u.ray1.z > 0.5);
  return out;
}

@fragment
fn fsRay(in: ROut) -> @location(0) vec4f {
  // Soft 1px feather across the ray width.
  let aa = max(fwidth(in.edge), 1e-4);
  let mask = clamp((1.0 - abs(in.edge)) / aa + 0.5, 0.0, 1.0);
  let a = in.alpha * mask;
  if (a <= 0.0) { discard; }
  return vec4f(in.color * a, a); // premultiplied
}
`;
