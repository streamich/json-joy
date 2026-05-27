// WGSL for the SheetField: one large draped sheet (a "blanket"). A single
// subdivided plane is twisted about its forward axis (the slide twist) and
// displaced by a fold field, then viewed by a camera tilted toward edge-on, so
// where the twist turns the sheet face-on it reads as a wide band and where it
// turns edge-on it pinches to a waist: the Stripe-style ribbon fan, but as one
// continuous surface (so color, folds, and sheen flow without gaps).
//
// One indexed draw of a procedural grid (s along the length, v across the
// width). Every vertex is a pure function of (s, v, time): no compute pass.
//
// `project`, `rotateYP`, `rotAround`, `colorFor`, the Modulator helpers, and the
// WD/WD1/WD2 octave dirs are lifted from the StickField/ribbon shaders. Uniforms
// are vec4f slots mirroring writeUniforms() in state.ts:
//
//   v0  time, dpr, scale, segments
//   v1  resX, resY, centerX, centerY
//   v2  yaw, pitch, perspective, depthRange
//   v3  forward.xyz, length
//   v4  right0.xyz, width
//   v5  up0.xyz, columns
//   v6  center.xyz, taper
//   v7  foldAmp, foldLateral, foldFreq, foldPhase
//   v8  shapeOctaves, shapeRoughness, flowScale, _
//   v9  twistBase, twistTurns, twistWave, twistFreq
//   v10 twistPhase, _, _, _
//   col0 colBase, colAlong, colAcross, colRandom
//   col1 colWave, colFreq, colPhase, colorCount
//   col2 colMin, colMax, _, _
//   fib0 fiberOn, fiberCount, fiberContrast, fiberShear
//   fib1 fiberPhase, fiberSharpness, fiberJitter, _
//   fib2 fiberGlint, fiberVariation, fiberGaps, fiberGaps
//   lit0 lightDir.xyz, ambient
//   lit1 diffuse, specular, shininess, rim
//   lit2 specColor.xyz, rimPower
//   fx0  fog, fogColor.xyz
//   fx1  glow, vignette, opacity, lightOn
//   pt0  pointerX, pointerY, bendRadius, bendStrength
//   sp1  style (0 fill, 1 lines, 2 dots), lineCount, lineWidth, lineShear
//   sp2  dotCount, dotWidth, _, _
export const WGSL = /* wgsl */ `
const TAU = 6.2831853071795864;
const WD  = vec3f(0.4319, 0.8638, 0.2591);
const WD1 = vec3f(-0.7035, 0.5025, 0.5025);
const WD2 = vec3f(0.3042, -0.4056, 0.8619);

struct U {
  v0: vec4f, v1: vec4f, v2: vec4f, v3: vec4f, v4: vec4f, v5: vec4f, v6: vec4f,
  v7: vec4f, v8: vec4f, v9: vec4f, v10: vec4f,
  col0: vec4f, col1: vec4f, col2: vec4f,
  fib0: vec4f, fib1: vec4f,
  lit0: vec4f, lit1: vec4f, lit2: vec4f,
  fx0: vec4f, fx1: vec4f,
  pt0: vec4f,
  fib2: vec4f,
  sp1: vec4f, sp2: vec4f, sp3: vec4f, sp4: vec4f,
  sp5: vec4f, sp6: vec4f, sp7: vec4f, sp8: vec4f, sp9: vec4f,
}

@group(0) @binding(0) var<uniform> u: U;
@group(0) @binding(1) var<storage, read> palette: array<vec4f>;

// Cyclic interpolation over n palette entries; cv is wrapped into [0, 1).
fn colorFor(cv: f32, n: i32) -> vec3f {
  if (n <= 1) { return palette[0].rgb; }
  let pos = fract(cv) * f32(n);
  let i0 = i32(floor(pos)) % n;
  let i1 = (i0 + 1) % n;
  return mix(palette[i0].rgb, palette[i1].rgb, fract(pos));
}

// Rotate a body-space point by yaw then pitch (no translation).
fn rotateYP(p: vec3f, cy: f32, sy: f32, cx: f32, sx: f32) -> vec3f {
  let x1 =  p.x * cy + p.z * sy;
  let z1 = -p.x * sy + p.z * cy;
  let y2 =  p.y * cx - z1 * sx;
  let z2 =  p.y * sx + z1 * cx;
  return vec3f(x1, y2, z2);
}

// Rotate (yaw, pitch) then perspective-project to screen px.
// Returns (screenX, screenY, viewZ, scale). Larger viewZ is nearer the camera.
fn project(p: vec3f, cy: f32, sy: f32, cx: f32, sx: f32) -> vec4f {
  let r = rotateYP(p, cy, sy, cx, sx);
  let persp = u.v2.z;
  let s = persp / (persp - r.z);
  let scale = u.v0.z;
  return vec4f(u.v1.z + r.x * s * scale, u.v1.w - r.y * s * scale, r.z, s);
}

// Rotate v around a unit axis by ang (Rodrigues), used for the slide twist.
fn rotAround(v: vec3f, axis: vec3f, ang: f32) -> vec3f {
  let c = cos(ang); let s = sin(ang);
  return v * c + cross(axis, v) * s + axis * dot(axis, v) * (1.0 - c);
}

// Fold field: a small fbm of crossed sinusoids over (s, v, phase) that ripples the
// sheet so it drapes like fabric rather than reading as a clean twisted ribbon.
// phase is the accumulated fold phase (CPU-integrated foldSpeed*dt), so changing
// foldSpeed at runtime never jumps; per octave it is scaled by (1 + 0.3*k).
fn foldField(s: f32, v: f32, phase: f32) -> f32 {
  let ps = s * u.v8.z; let pv = v * u.v8.z;     // flowScale
  var n = 0.0; var amp = 1.0; var ampSum = 0.0; var f = u.v7.z;  // foldFreq
  let oct = max(1, i32(u.v8.x));
  for (var k: i32 = 0; k < oct; k = k + 1) {
    let ph = phase * (1.0 + 0.3 * f32(k)) + f32(k) * 1.7;
    n = n + amp * sin(ps * f * TAU + ph) * sin(pv * f * 0.6 * TAU + ph * 1.3 + 1.7);
    ampSum = ampSum + amp; amp = amp * u.v8.y; f = f * 1.9;       // shapeRoughness
  }
  return n / max(ampSum, 1e-6);
}

// The draped surface point: flat plane along (forward, right0), twisted about
// forward as a function of s, displaced by the fold field along the twisted
// normal (and a little laterally).
fn sheetPoint(s: f32, v: f32) -> vec3f {
  let along = u.v3.xyz * ((s - 0.5) * u.v3.w);            // forward * length
  let acrossAmt = (v - 0.5) * u.v4.w;                     // width
  let tw = u.v9.x + u.v9.y * (s - 0.5) + u.v9.z * sin(s * u.v9.w + u.v10.x);  // v10.x = twistPhase
  let ang = tw * TAU;
  let R = rotAround(u.v4.xyz, u.v3.xyz, ang);             // twisted across dir
  let Up = rotAround(u.v5.xyz, u.v3.xyz, ang);            // twisted normal
  let foldN = u.v7.x * foldField(s, v, u.v7.w);           // v7.w = foldPhase
  let foldR = u.v7.y * foldField(v, s, u.v7.w + 11.0);    // constant offset decorrelates
  return u.v6.xyz + along + R * (acrossAmt + foldR) + Up * foldN;
}

// Gradient position into the palette ramp: along + across + per-strip wave.
fn colorValue(s: f32, v: f32) -> f32 {
  return clamp(
      u.col0.x
    + u.col0.y * s
    + u.col0.z * v
    + u.col0.w * (v - 0.5)
    + u.col1.x * sin(s * u.col1.y + u.col1.z),   // col1.z = colorPhase
    u.col2.x, u.col2.y);
}

// Smooth 0..1 pointer falloff (1 at the cursor, 0 at/after the radius).
fn mouseFall(p: vec2f) -> f32 {
  let radius = u.pt0.z;
  if (radius <= 0.0) { return 0.0; }
  let d = length(p - u.pt0.xy);
  if (d >= radius) { return 0.0; }
  let f = 1.0 - d / radius;
  return f * f;
}

// Push a screen-px point away from the pointer (local bend).
fn bend(p: vec2f) -> vec2f {
  if (u.pt0.w <= 0.0) { return p; }
  let away = p - u.pt0.xy;
  let d = length(away);
  let f = mouseFall(p);
  if (f <= 0.0 || d <= 1e-3) { return p; }
  return p + (away / d) * (u.pt0.w * f);
}

struct VOut {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
  @location(1) normal: vec3f,
  @location(2) tangent: vec3f,
  @location(3) colorV: f32,
  @location(4) depth: f32,
  @location(5) screen: vec2f,
}

@vertex
fn vs(@location(0) sv: vec2f) -> VOut {
  var out: VOut;
  let s = sv.x;
  let v = sv.y;
  let ds = 1.0 / max(1.0, u.v0.w);   // 1 / segments
  let dv = 1.0 / max(1.0, u.v5.w);   // 1 / columns

  // Surface point + tangents (central differences) -> normal.
  let P  = sheetPoint(s, v);
  let Ps = sheetPoint(s + ds, v) - sheetPoint(s - ds, v);
  let Pv = sheetPoint(s, v + dv) - sheetPoint(s, v - dv);
  var T = Ps;
  let tl = length(T);
  if (tl > 1e-6) { T = T / tl; } else { T = vec3f(1.0, 0.0, 0.0); }
  var N = cross(Ps, Pv);
  let nl = length(N);
  if (nl > 1e-6) { N = N / nl; } else { N = vec3f(0.0, 0.0, 1.0); }

  let cy = cos(u.v2.x); let sy = sin(u.v2.x);
  let cx = cos(u.v2.y); let sx = sin(u.v2.y);
  let p = project(P, cy, sy, cx, sx);
  var nv = rotateYP(N, cy, sy, cx, sx);
  if (nv.z < 0.0) { nv = -nv; }            // face the lit side toward the camera
  let tv = rotateYP(T, cy, sy, cx, sx);

  let screen = bend(p.xy);
  let D = u.v2.w;
  let depth01 = clamp((D - p.z) / (2.0 * D), 0.0, 1.0);
  var clip = (screen / u.v1.xy) * 2.0 - vec2f(1.0, 1.0);
  clip.y = -clip.y;
  out.pos = vec4f(clip, depth01, 1.0);

  out.uv = vec2f(s, v);
  out.normal = nv;
  out.tangent = tv;
  out.colorV = colorValue(s, v);
  out.depth = p.z;
  out.screen = screen;
  return out;
}

fn hash11(p: f32) -> f32 { return fract(sin(p * 127.1) * 43758.5453123); }
fn vnoise(x: f32) -> f32 {
  let i = floor(x); let f = fract(x);
  let a = f * f * (3.0 - 2.0 * f);
  return mix(hash11(i), hash11(i + 1.0), a);
}

// The randomized fiber coordinate, shared by the matte grooves and the spec
// streaks: a low-freq warp of the across coordinate makes the spacing
// non-uniform (fibers bunch and spread) instead of a perfect comb.
fn fiberCoord(uv: vec2f) -> f32 {
  let warp = u.fib1.z * vnoise(uv.y * 5.0 + 3.1);          // fiberJitter
  return (uv.y + warp) * u.fib0.y + uv.x * u.fib0.w + u.fib1.x;  // fib1.x = fiberPhase
}

// Fine grooves running along the warp (the satin striations), as a brightness
// multiplier. Thin (width from fiberSharpness), with per-fiber + along-length
// brightness variation, some fibers faint/absent, and sparse low-fiber patches,
// so it reads as natural cloth rather than a uniform comb.
fn fiberFactor(uv: vec2f) -> f32 {
  if (u.fib0.x < 0.5) { return 1.0; }
  let fpos = fiberCoord(uv);
  let id = floor(fpos);
  let frac = fract(fpos);
  let w = clamp(0.5 / max(1.0, u.fib1.y), 0.015, 0.5);     // sharpness -> thin groove
  let d = min(frac, 1.0 - frac);
  let aa = max(fwidth(fpos), 1e-4);
  let groove = 1.0 - smoothstep(w - aa, w + aa, d);        // 1 inside the thin groove
  let perFiber = mix(1.0 - u.fib2.y, 1.0, vnoise(id * 0.73 + uv.x * (1.0 + u.fib2.y * 3.0)));
  let present = smoothstep(u.fib2.z, min(1.0, u.fib2.z + 0.35), hash11(id * 1.7 + 2.0));
  let patchAmt = mix(1.0 - u.fib2.w, 1.0, vnoise(uv.x * 1.3 + uv.y * 2.7 + 9.0));
  return 1.0 - u.fib0.z * groove * perFiber * present * patchAmt;
}

// Per-fiber specular gate: breaks the broad satin highlight into thin
// fiber-aligned streaks, brighter on a random subset (the light catching some
// threads at folds) and travelling along the length. 1.0 when fibers are off.
fn fiberSpec(uv: vec2f) -> f32 {
  if (u.fib0.x < 0.5) { return 1.0; }
  let fpos = fiberCoord(uv);
  let id = floor(fpos);
  let frac = fract(fpos);
  let glint = hash11(id * 2.13 + 5.0);
  let pick = smoothstep(1.0 - u.fib2.x, 1.0, glint);       // only some fibers shine
  let along = 0.5 + 0.5 * sin(uv.x * (2.0 + glint * 6.0) * TAU + glint * 30.0);
  let center = 1.0 - smoothstep(0.0, 0.45, min(frac, 1.0 - frac));
  return mix(0.25, 1.0, center) * mix(1.0, 2.4, pick * along);
}

// Half-Lambert diffuse + Kajiya-Kay anisotropic (satin) specular + fresnel rim,
// then depth fog. The specular is banded across the tangent, so the sheen slides
// along the surface as the slide twist turns T.
fn shade(albedo: vec3f, Nin: vec3f, Tin: vec3f, depth: f32, fm: f32, fspec: f32) -> vec3f {
  var col = albedo * fm;
  if (u.fx1.w >= 0.5) {
    let L = normalize(u.lit0.xyz);
    let V = vec3f(0.0, 0.0, 1.0);
    let n = normalize(Nin);
    let tg = normalize(Tin);
    let diff = pow(clamp(dot(n, L) * 0.5 + 0.5, 0.0, 1.0), 1.5);
    let tdotl = dot(tg, L);
    let tdotv = dot(tg, V);
    let sinTL = sqrt(max(0.0, 1.0 - tdotl * tdotl));
    let sinTV = sqrt(max(0.0, 1.0 - tdotv * tdotv));
    let spec = pow(max(0.0, sinTL * sinTV - tdotl * tdotv), u.lit1.z);
    let rim = pow(1.0 - abs(dot(n, V)), u.lit2.w) * u.lit1.w;
    // Matte (ambient + diffuse) carries the thin grooves; the satin specular is
    // gated into bright fiber streaks; rim follows the grooves too.
    let matte = albedo * (u.lit0.w + u.lit1.x * diff) * fm;
    let glints = u.lit2.xyz * (u.lit1.y * spec * fspec);
    col = matte + glints + albedo * (rim * fm);
  }
  let fogT = clamp(1.0 - (depth + 1.25) / 2.5, 0.0, 1.0);
  col = mix(col, u.fx0.yzw, u.fx0.x * fogT);
  return col;
}

// Stylistic coverage (alpha). 'fill' is solid; 'lines' carves transparent gaps
// between parallel lines running along the length (banded across the width,
// tilted by lineShear); 'dots' additionally dashes each line along the length.
// sp1 = (style, lineCount, lineWidth, lineShear); sp2 = (dotCount, dotWidth).
fn styleCoverage(uv: vec2f) -> f32 {
  let style = u.sp1.x;
  if (style < 0.5) { return 1.0; }
  let lpos = uv.y * u.sp1.y + uv.x * u.sp1.w;
  let lc = abs(fract(lpos) - 0.5) * 2.0;            // 0 at line center, 1 at gap center
  let laa = max(fwidth(lpos) * 2.0, 1e-4);
  var cov = 1.0 - smoothstep(u.sp1.z - laa, u.sp1.z + laa, lc);
  if (style > 1.5) {
    let dpos = uv.x * u.sp2.x;
    let dc = abs(fract(dpos) - 0.5) * 2.0;
    let daa = max(fwidth(dpos) * 2.0, 1e-4);
    cov = cov * (1.0 - smoothstep(u.sp2.y - daa, u.sp2.y + daa, dc));
  }
  return cov;
}

@fragment
fn fs(in: VOut) -> @location(0) vec4f {
  let albedo = colorFor(fract(in.colorV), i32(u.col1.w));
  let lit = shade(albedo, in.normal, in.tangent, in.depth, fiberFactor(in.uv), fiberSpec(in.uv));

  // Soft fade at all four sheet edges so it melts into the background instead of
  // hard-clipping (taper = fraction of the sheet over which it fades).
  var a = u.fx1.z;                                   // opacity
  let taper = u.v6.w;
  if (taper > 0.0) {
    let es = smoothstep(0.0, taper, min(in.uv.x, 1.0 - in.uv.x));
    let ev = smoothstep(0.0, taper, min(in.uv.y, 1.0 - in.uv.y));
    a = a * es * ev;
  }
  if (u.fx1.y != 0.0) {
    let half = max(min(u.v1.x, u.v1.y) * 0.5, 1.0);
    let dc = length(in.screen - u.v1.zw) / half;
    a = a * (1.0 - u.fx1.y * smoothstep(0.7, 1.05, dc));
  }
  a = a * styleCoverage(in.uv);                      // lines / dots cut transparent gaps
  let rgb = lit + lit * u.fx1.x;                     // glow
  if (a <= 0.0) { discard; }
  return vec4f(rgb * a, a); // premultiplied
}
`;
