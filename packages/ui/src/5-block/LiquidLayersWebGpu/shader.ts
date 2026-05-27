// WGSL for LiquidLayers: a stack of N liquid layers, each a 2D scalar field
// (a sum of moving metaball sources) thresholded into a soft silhouette and
// composited back-to-front with soft crescent cast shadows. Split and merge are
// emergent from the metaball sum: two sources far apart read as two blobs, and
// as they drift together their summed field crosses the threshold in the gap and
// they bridge into one.
//
// One full-screen draw, fragment-only: the vertex shader emits a single oversized
// triangle from @builtin(vertex_index) and the fragment loops the layers. No
// geometry, no depth buffer, no MSAA, no compute. Source positions are integrated
// on the CPU and uploaded once per frame to the `sources` storage buffer.
//
// Uniforms are vec4f slots mirroring writeUniforms() in state.ts:
//
//   v0  time, dpr, resX, resY
//   v1  layerCount, colorCount, colorMode (0 depth, 1 perLayer), mode
//   v2  lightAngle, shadow, shadowOffset, shadowSoftness
//   v3  sheen, rimPower, opacity, bgOpaque (1 opaque bg, 0 transparent)
//   v4  bgR, bgG, bgB, warpPhase
//   v5  pointerX, pointerY, mouseRadius, reactMode (0 none,1 part,2 attract,3 ripple)
//   v6  rippleAmount, rippleFreq, ripplePhase, mouseStrength
//   v7  levelOffset, warpOffset, shadowSteps, _
//
// Coordinates are screen-height units: p = (uv.x * aspect, uv.y), so radii and
// spreads are isotropic regardless of canvas shape.
export const WGSL = /* wgsl */ `
struct U {
  v0: vec4f, v1: vec4f, v2: vec4f, v3: vec4f,
  v4: vec4f, v5: vec4f, v6: vec4f, v7: vec4f,
}

// One layer, packed into 4 vec4f (storage std430 = 64 bytes, matches the CPU):
//   a: level, sourceStart, sourceCount, warp
//   b: warpScale, opacity, elevation, shadow
//   c: colorR, colorG, colorB, shadowSoftness
//   d: octaves, roughness, seed, depthPos (0..1 palette position for depth mode)
struct Layer { a: vec4f, b: vec4f, c: vec4f, d: vec4f }

@group(0) @binding(0) var<uniform> u: U;
@group(0) @binding(1) var<storage, read> layers: array<Layer>;
@group(0) @binding(2) var<storage, read> sources: array<vec4f>; // (x, y, radius, weight)
@group(0) @binding(3) var<storage, read> palette: array<vec4f>;

// Non-wrapping ramp across the palette: t01 0 -> palette[0], 1 -> palette[n-1].
fn rampColor(t01: f32, n: i32) -> vec3f {
  if (n <= 1) { return palette[0].rgb; }
  let x = clamp(t01, 0.0, 1.0) * f32(n - 1);
  let i0 = i32(floor(x));
  let i1 = min(i0 + 1, n - 1);
  return mix(palette[i0].rgb, palette[i1].rgb, fract(x));
}

// Wyvill soft-object falloff: 1 at center, 0 at d>=1, C2 continuous, finite.
fn kernel(d: f32) -> f32 {
  let x = clamp(d, 0.0, 1.0);
  let a = 1.0 - x * x;
  return a * a * a;
}

fn hash21(p: vec2f) -> f32 {
  var p3 = fract(vec3f(p.x, p.y, p.x) * 0.1031);
  p3 = p3 + dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// Value noise in [-1, 1].
fn vnoise(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let w = f * f * (3.0 - 2.0 * f);
  let a = hash21(i);
  let b = hash21(i + vec2f(1.0, 0.0));
  let c = hash21(i + vec2f(0.0, 1.0));
  let d = hash21(i + vec2f(1.0, 1.0));
  return (mix(mix(a, b, w.x), mix(c, d, w.x), w.y)) * 2.0 - 1.0;
}

fn fbm(p: vec2f, oct: i32, rough: f32) -> f32 {
  var n = 0.0; var amp = 1.0; var sum = 0.0; var f = 1.0;
  for (var k = 0; k < oct; k = k + 1) {
    n = n + amp * vnoise(p * f);
    sum = sum + amp; amp = amp * rough; f = f * 2.0;
  }
  return n / max(sum, 1e-6);
}

// Two-channel domain warp; warpPhase (v4.w) animates it, seed decorrelates layers.
fn warpVec(p: vec2f, scale: f32, seed: f32, oct: i32, rough: f32) -> vec2f {
  let ph = u.v4.w;
  let q = p * scale + vec2f(seed, seed * 1.7) + vec2f(ph, ph * 0.6);
  return vec2f(fbm(q, oct, rough), fbm(q + vec2f(19.7, 4.3), oct, rough));
}

// Domain-warp p once for a layer (the fbm is the dominant per-pixel cost), then
// reuse the warped point for the silhouette, its shadow offset and the sheen
// gradient so the fbm runs once per layer instead of six times.
fn warpedPoint(L: Layer, p: vec2f) -> vec2f {
  let warpAmt = L.a.w + u.v7.y;
  if (warpAmt > 0.0001) {
    let oct = max(1, i32(L.d.x));
    return p + warpAmt * warpVec(p, L.b.x, L.d.z, oct, L.d.y);
  }
  return p;
}

// Metaball sum over a layer's sources at an already-warped point (cheap).
fn fieldAt(L: Layer, wp: vec2f) -> f32 {
  let start = i32(L.a.y);
  let count = i32(L.a.z);
  var F = 0.0;
  for (var i = 0; i < count; i = i + 1) {
    let s = sources[start + i];
    let d = length(wp - s.xy) / max(s.z, 1e-4);
    F = F + s.w * kernel(d);
  }
  return F;
}

// Anti-aliased silhouette of one layer from a field value, via fwidth.
fn coverageOf(L: Layer, F: f32) -> f32 {
  let level = L.a.x + u.v7.x;
  let aa = max(fwidth(F), 1e-4);
  return smoothstep(level - aa, level + aa, F);
}

// Soft (fixed-band) coverage for the shadow march: no fwidth, so it is safe in a
// uniform-bounded loop and cheap, and its softness gives a smooth penumbra.
fn shadowCoverageOf(level: f32, band: f32, F: f32) -> f32 {
  return smoothstep(level - band, level + band, F);
}

// Pointer ripple: a radial wave displacing the sample point near the cursor.
fn rippleP(p: vec2f) -> vec2f {
  if (i32(u.v5.w) != 3) { return p; }
  let amt = u.v6.x;
  if (amt <= 0.0) { return p; }
  let dp = p - u.v5.xy;
  let dist = length(dp);
  let rad = u.v5.z;
  if (dist >= rad || dist < 1e-4) { return p; }
  let fall = 1.0 - dist / rad;
  let ring = sin(dist * u.v6.y - u.v6.z) * fall * fall * amt;
  return p + (dp / dist) * ring;
}

struct VOut {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
}

@vertex
fn vs(@builtin(vertex_index) vi: u32) -> VOut {
  var out: VOut;
  // Oversized triangle: clip (-1,-1), (3,-1), (-1,3). uv.y is flipped so 0 is top.
  let x = f32((vi << 1u) & 2u);
  let y = f32(vi & 2u);
  out.pos = vec4f(x * 2.0 - 1.0, y * 2.0 - 1.0, 0.0, 1.0);
  out.uv = vec2f(x, 1.0 - y);
  return out;
}

@fragment
fn fs(in: VOut) -> @location(0) vec4f {
  let aspect = u.v0.z / max(u.v0.w, 1.0);
  var p = vec2f(in.uv.x * aspect, in.uv.y);
  p = rippleP(p);

  let lightDir = vec2f(cos(u.v2.x), sin(u.v2.x));
  let layerCount = i32(u.v1.x);
  let colorCount = i32(u.v1.y);
  let colorMode = i32(u.v1.z);
  let gShadow = u.v2.y;
  let gShadowOffset = u.v2.z;
  let sheen = u.v3.x;
  let rimPow = u.v3.y;

  var col = u.v4.xyz;       // background rgb (0 when transparent)
  var aMax = 0.0;           // union coverage, for the transparent-canvas alpha
  for (var k = 0; k < layerCount; k = k + 1) {
    let L = layers[k];
    let wp = warpedPoint(L, p);
    let F = fieldAt(L, wp);
    let cov = coverageOf(L, F);
    // Cast shadow on the layers behind: march toward the light in shadowSteps
    // short steps, accumulating a soft (fixed-band) coverage weighted so nearer
    // hits dominate. The soft taps blend into a smooth transparency falloff (like
    // a blurred box-shadow) that fades with distance; more steps = smoother.
    let level = L.a.x + u.v7.x;
    let soft = clamp(L.c.w, 0.0, 1.0);
    let band = 0.03 + soft * 0.14;
    let steps = max(1, i32(u.v7.z));
    let maxD = L.b.z * gShadowOffset;
    var occ = 0.0;
    var wsum = 0.0;
    for (var j = 1; j <= steps; j = j + 1) {
      let fj = f32(j);
      let w = 1.0 - (fj - 1.0) / f32(steps);
      occ = occ + shadowCoverageOf(level, band, fieldAt(L, wp + lightDir * (maxD * fj / f32(steps)))) * w;
      wsum = wsum + w;
    }
    occ = occ / max(wsum, 1e-4);
    let sh = clamp(occ * (1.0 - cov) * L.b.w * gShadow, 0.0, 1.0);
    col = col * (1.0 - sh);

    var albedo = L.c.xyz;
    if (colorMode == 0) {
      albedo = rampColor(L.d.w, colorCount);
    }
    let lo = cov * L.b.y;
    col = mix(col, albedo, lo);
    aMax = max(aMax, lo);

    if (sheen > 0.0) {
      let e = 1.5 / max(u.v0.w, 1.0);
      let gx = fieldAt(L, wp + vec2f(e, 0.0)) - fieldAt(L, wp - vec2f(e, 0.0));
      let gy = fieldAt(L, wp + vec2f(0.0, e)) - fieldAt(L, wp - vec2f(0.0, e));
      let g = normalize(vec2f(gx, gy) + vec2f(1e-6, 1e-6));
      let rim = pow(clamp(dot(g, -lightDir) * 0.5 + 0.5, 0.0, 1.0), rimPow);
      let edge = cov * (1.0 - cov) * 4.0;
      col = col + albedo * (sheen * rim * edge);
    }
  }

  var a = u.v3.z;                          // opacity
  if (u.v3.w < 0.5) { a = u.v3.z * aMax; } // transparent canvas: alpha from coverage
  a = clamp(a, 0.0, 1.0);
  if (a <= 0.0) { discard; }
  return vec4f(col * a, a); // premultiplied
}
`;
