import type {StickFieldOptions} from './types';

const TWO_PI = Math.PI * 2;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const DEFAULT_COLORS = ['#5b6ee1', '#7c5cff', '#9b8cff'];
const RAMP = 96; // static full-palette ramp resolution
const ARAMP = 64; // rotating active-colors ramp resolution
const CULL_BAND = 0.18; // soft fade width at the back-cull silhouette
// Direction the spatial waves travel through the cloud (body space, normalized).
const WDX = 0.4319;
const WDY = 0.8638;
const WDZ = 0.2591;
// Per-octave directions for the fractal shape noise (normalized, varied so
// octaves do not align into an obvious single ripple).
const WDS: readonly (readonly [number, number, number])[] = [
  [WDX, WDY, WDZ],
  [-0.7035, 0.5025, 0.5025],
  [0.3042, -0.4056, 0.8619],
];

/**
 * Renders a floating cloud of short sticks arranged on a sphere, drawn on a
 * 2D canvas.
 *
 * Per-stick properties are driven by composable modulators (see Modulator in
 * ./types): each of size, thickness, distance-from-center, color and magnetism
 * is the sum of a constant base, a per-stick random offset, and a smooth wave
 * that travels through space so neighbors share similar values. This lets the
 * cloud breathe, vary stick sizes/thickness, flow a color gradient, and point
 * sticks radially like a magnetic field, all from the same building blocks.
 *
 * Color can use the full palette, or a small rotating set of "active" colors
 * that cross-fade over time (less busy, easier on the eye).
 *
 * All animation, DOM mutation and lifecycle live here; the React component is
 * a thin shell that forwards the root and canvas refs.
 */
export class StickFieldState {
  // Geometry + motion options.
  private count = 140;
  private colors = DEFAULT_COLORS;
  private stickLength = 0.085;
  private lineWidth = 1.4;
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
  private fps = 0;

  // Modulators, flattened to primitives for the hot loop.
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

  // Per-stick data (typed arrays, allocated on seed).
  private dirX = new Float32Array(0);
  private dirY = new Float32Array(0);
  private dirZ = new Float32Array(0);
  private rndAxX = new Float32Array(0);
  private rndAxY = new Float32Array(0);
  private rndAxZ = new Float32Array(0);
  private axX = new Float32Array(0);
  private axY = new Float32Array(0);
  private axZ = new Float32Array(0);
  private rndSize = new Float32Array(0);
  private rndThick = new Float32Array(0);
  private rndDist = new Float32Array(0);
  private rndColor = new Float32Array(0);
  private rndMag = new Float32Array(0);
  private seeded = false;

  // Color: static full-palette ramp, plus a rotating active-colors ramp.
  private paletteRgb: number[][] = [];
  private ramp: string[] = [];
  private activeRamp: string[] = [];
  private activeK = 0;
  private slotR = new Float32Array(0);
  private slotG = new Float32Array(0);
  private slotB = new Float32Array(0);
  private slotTarget = new Int32Array(0);
  private slotNext = new Float32Array(0);
  private colorDirty = true;

  // DOM + viewport.
  private root: HTMLDivElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
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
    const mgB = this.mgBase;
    const mgR = this.mgRand;
    const mgW = this.mgWave;
    const mgF = this.mgFreq;
    const mgLo = this.mgMin;
    const mgHi = this.mgMax;
    this.count = o.count ?? this.count;
    this.stickLength = o.stickLength ?? this.stickLength;
    this.lineWidth = o.lineWidth ?? this.lineWidth;
    this.radiusFrac = o.radius ?? this.radiusFrac;
    // radiusPx is normally derived in resize(); recompute it here too so the
    // radius applies live when changed (e.g. dragging a knob), not only on resize.
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
    this.fps = o.fps ?? this.fps;
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
    if (this.seeded) {
      if (this.count !== prevCount) this.seed();
      else if (
        this.mgBase !== mgB ||
        this.mgRand !== mgR ||
        this.mgWave !== mgW ||
        this.mgFreq !== mgF ||
        this.mgMin !== mgLo ||
        this.mgMax !== mgHi
      )
        this.computeAxes();
    }
  }

  public readonly setRoot = (el: HTMLDivElement | null): void => {
    this.root = el;
  };

  public readonly setCanvas = (el: HTMLCanvasElement | null): void => {
    this.canvas = el;
    this.ctx = el ? el.getContext('2d') : null;
  };

  /** Distribute sticks over a sphere; assign each a random axis and randoms. */
  private seed(): void {
    const n = this.count;
    const dirX = (this.dirX = new Float32Array(n));
    const dirY = (this.dirY = new Float32Array(n));
    const dirZ = (this.dirZ = new Float32Array(n));
    const rndAxX = (this.rndAxX = new Float32Array(n));
    const rndAxY = (this.rndAxY = new Float32Array(n));
    const rndAxZ = (this.rndAxZ = new Float32Array(n));
    this.axX = new Float32Array(n);
    this.axY = new Float32Array(n);
    this.axZ = new Float32Array(n);
    const rndSize = (this.rndSize = new Float32Array(n));
    const rndThick = (this.rndThick = new Float32Array(n));
    const rndDist = (this.rndDist = new Float32Array(n));
    const rndColor = (this.rndColor = new Float32Array(n));
    const rndMag = (this.rndMag = new Float32Array(n));
    const denom = n > 1 ? n - 1 : 1;
    for (let i = 0; i < n; i++) {
      // Fibonacci sphere for an even spread.
      const y = 1 - (i / denom) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = GOLDEN * i;
      dirX[i] = Math.cos(theta) * r;
      dirY[i] = y;
      dirZ[i] = Math.sin(theta) * r;
      // Random unit axis, later blended toward the normal by magnetism.
      const a = Math.random() * TWO_PI;
      const u = Math.random() * 2 - 1;
      const s = Math.sqrt(Math.max(0, 1 - u * u));
      rndAxX[i] = Math.cos(a) * s;
      rndAxY[i] = u;
      rndAxZ[i] = Math.sin(a) * s;
      rndSize[i] = Math.random() * 2 - 1;
      rndThick[i] = Math.random() * 2 - 1;
      rndDist[i] = Math.random() * 2 - 1;
      rndColor[i] = Math.random() * 2 - 1;
      rndMag[i] = Math.random() * 2 - 1;
    }
    this.seeded = true;
    this.computeAxes();
  }

  /** Resolve each stick's axis by blending its random axis toward the normal. */
  private computeAxes(): void {
    const n = this.count;
    const {dirX, dirY, dirZ, rndAxX, rndAxY, rndAxZ, axX, axY, axZ, rndMag} = this;
    for (let i = 0; i < n; i++) {
      const dx = dirX[i];
      const dy = dirY[i];
      const dz = dirZ[i];
      const proj = dx * WDX + dy * WDY + dz * WDZ;
      const mRaw = clamp(
        this.mgBase + this.mgRand * rndMag[i] + this.mgWave * Math.sin(proj * this.mgFreq),
        this.mgMin,
        this.mgMax,
      );
      const m = clamp(mRaw, 0, 1);
      let ex = rndAxX[i] * (1 - m) + dx * m;
      let ey = rndAxY[i] * (1 - m) + dy * m;
      let ez = rndAxZ[i] * (1 - m) + dz * m;
      const len = Math.hypot(ex, ey, ez) || 1;
      ex /= len;
      ey /= len;
      ez /= len;
      axX[i] = ex;
      axY[i] = ey;
      axZ[i] = ez;
    }
  }

  /** Parse the palette to RGB, build the static ramp, and init active slots. */
  private prepColors(): void {
    this.colorDirty = false;
    this.activeRamp = [];
    const colors = this.colors;
    const n = colors.length;
    if (typeof document === 'undefined' || !document.createElement) {
      this.paletteRgb = [];
      this.ramp = [];
      this.activeK = 0;
      return;
    }
    const c = document.createElement('canvas');
    c.width = RAMP;
    c.height = 1;
    const g = c.getContext('2d');
    if (!g) {
      this.paletteRgb = [];
      this.ramp = [];
      this.activeK = 0;
      return;
    }
    // Parse each palette color to RGB by painting and reading one pixel.
    const pal: number[][] = [];
    for (let i = 0; i < n; i++) {
      g.fillStyle = colors[i];
      g.fillRect(0, 0, 1, 1);
      const d = g.getImageData(0, 0, 1, 1).data;
      pal.push([d[0], d[1], d[2]]);
    }
    this.paletteRgb = pal;
    // Static full-palette ramp (used when active colors are disabled).
    const grad = g.createLinearGradient(0, 0, RAMP, 0);
    for (let i = 0; i < n; i++) grad.addColorStop(i / n, colors[i]);
    grad.addColorStop(1, colors[0]);
    g.fillStyle = grad;
    g.fillRect(0, 0, RAMP, 1);
    const data = g.getImageData(0, 0, RAMP, 1).data;
    const ramp = new Array<string>(RAMP);
    for (let i = 0; i < RAMP; i++) {
      const o = i * 4;
      ramp[i] = `rgb(${data[o]},${data[o + 1]},${data[o + 2]})`;
    }
    this.ramp = ramp;
    // Active rotating colors.
    const K = this.colorActive >= 1 && this.colorActive < n ? this.colorActive : 0;
    this.activeK = K;
    if (K) {
      this.slotR = new Float32Array(K);
      this.slotG = new Float32Array(K);
      this.slotB = new Float32Array(K);
      this.slotTarget = new Int32Array(K);
      this.slotNext = new Float32Array(K);
      for (let k = 0; k < K; k++) {
        const idx = (Math.random() * n) | 0;
        this.slotR[k] = pal[idx][0];
        this.slotG[k] = pal[idx][1];
        this.slotB[k] = pal[idx][2];
        this.slotTarget[k] = (Math.random() * n) | 0;
        this.slotNext[k] = this.t + (k + 1) * (2 + Math.random() * 2);
      }
    }
  }

  /** Advance active color slots and rebuild the active-colors ramp. */
  private updateActiveRamp(dt: number): void {
    const K = this.activeK;
    const pal = this.paletteRgb;
    const np = pal.length;
    if (!K || !np) {
      this.activeRamp = [];
      return;
    }
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
    const ramp = this.activeRamp.length === ARAMP ? this.activeRamp : new Array<string>(ARAMP);
    for (let j = 0; j < ARAMP; j++) {
      const pos = (j / ARAMP) * K;
      const i0 = pos | 0;
      const i1 = (i0 + 1) % K;
      const f = pos - i0;
      const r = (this.slotR[i0] + (this.slotR[i1] - this.slotR[i0]) * f) | 0;
      const g = (this.slotG[i0] + (this.slotG[i1] - this.slotG[i0]) * f) | 0;
      const b = (this.slotB[i0] + (this.slotB[i1] - this.slotB[i0]) * f) | 0;
      ramp[j] = `rgb(${r},${g},${b})`;
    }
    this.activeRamp = ramp;
  }

  private resize(): void {
    const root = this.root;
    const canvas = this.canvas;
    const ctx = this.ctx;
    if (!root || !canvas || !ctx) return;
    const rect = root.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = rect.width;
    this.h = rect.height;
    this.cx = rect.width / 2;
    this.cy = rect.height / 2;
    this.radiusPx = Math.min(rect.width, rect.height) * 0.5 * this.radiusFrac;
    canvas.width = Math.max(1, (rect.width * dpr) | 0);
    canvas.height = Math.max(1, (rect.height * dpr) | 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.reduce?.matches) this.draw();
  }

  public start(): void {
    if (this.started || !this.root || !this.canvas || !this.ctx) return;
    this.started = true;
    if (!this.seeded) this.seed();
    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.ro = new ResizeObserver(this.onResize);
    this.ro.observe(this.root);
    this.io = new IntersectionObserver(this.onIntersect);
    this.io.observe(this.root);
    document.addEventListener('visibilitychange', this.onVisibility);
    if (this.reactToMouse || this.followMouse)
      window.addEventListener('pointermove', this.onPointerMove, {passive: true});
    this.resize();
    if (this.reduce.matches) this.draw();
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
    const offX = e.clientX - rect.left - halfW;
    const offY = e.clientY - rect.top - halfH;
    this.targetYaw = clamp(offX / halfW, -1, 1) * this.tiltMax;
    this.targetPitch = -clamp(offY / halfH, -1, 1) * this.tiltMax;
    // Per-axis clamp so the blob can reach the div edges; followReach = 1 lets
    // its center travel all the way to an edge, > 1 lets it overshoot past.
    const maxX = halfW * this.followReach;
    const maxY = halfH * this.followReach;
    this.targetFollowX = clamp(offX * this.followStrength, -maxX, maxX);
    this.targetFollowY = clamp(offY * this.followStrength, -maxY, maxY);
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
    // Ease tilt and follow toward their targets, frame-rate independent.
    const kt = 1 - Math.exp(-4 * dt);
    this.mYaw += (this.targetYaw - this.mYaw) * kt;
    this.mPitch += (this.targetPitch - this.mPitch) * kt;
    const kf = 1 - Math.exp(-2.5 * dt);
    this.followX += (this.targetFollowX - this.followX) * kf;
    this.followY += (this.targetFollowY - this.followY) * kf;
    if (this.colorDirty) this.prepColors();
    if (this.activeK) this.updateActiveRamp(dt);
    this.draw();
  };

  private draw(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    if (this.colorDirty) this.prepColors();
    if (this.activeK && !this.activeRamp.length) this.updateActiveRamp(0);
    const cx = this.cx + this.followX;
    const cy = this.cy + this.followY;
    const radiusPx = this.radiusPx;
    const count = this.count;
    const colors = this.colors;
    const ramp = this.activeK ? this.activeRamp : this.ramp;
    const ncol = colors.length;
    const nramp = ramp.length;
    const t = this.t;
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.lineCap = 'round';

    const yaw = t * this.yawSpeed + this.mYaw;
    const pitch = Math.sin(t * this.pitchSpeed) * this.pitchAmp + this.mPitch;
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const cosX = Math.cos(pitch);
    const sinX = Math.sin(pitch);
    const D = this.perspective;
    const lenBase = this.stickLength;
    const baseW = this.lineWidth;
    // Shape: per-frame fractal-noise + breathing-pulse + flatten constants.
    const octaves = this.shapeOctaves < 1 ? 1 : this.shapeOctaves | 0;
    const rough = this.shapeRoughness;
    const sharp = this.shapeSharpness;
    const pulse = this.pulseAmp * Math.sin(t * this.pulseSpeed);
    const zScale = 1 - this.flatten;

    for (let i = 0; i < count; i++) {
      const dx = this.dirX[i];
      const dy = this.dirY[i];
      const dz = this.dirZ[i];
      const proj = dx * WDX + dy * WDY + dz * WDZ;
      // Distance (breathing): a fractal sum of octaves makes an irregular,
      // organic surface of peaks and valleys; sharpness emphasizes them; the
      // pulse adds a uniform global breath.
      let nz = 0;
      let amp = 1;
      let ampSum = 0;
      let freq = this.dsFreq;
      for (let k = 0; k < octaves; k++) {
        const wd = WDS[k % 3];
        nz +=
          amp * Math.sin((dx * wd[0] + dy * wd[1] + dz * wd[2]) * freq + t * this.dsSpeed * (1 + 0.35 * k) + k * 1.7);
        ampSum += amp;
        amp *= rough;
        freq *= 2;
      }
      nz /= ampSum || 1;
      if (sharp !== 1) nz = Math.sign(nz) * Math.abs(nz) ** sharp;
      const rad = clamp(this.dsBase + this.dsRand * this.rndDist[i] + this.dsWave * nz + pulse, this.dsMin, this.dsMax);
      let size = clamp(
        this.szBase + this.szRand * this.rndSize[i] + this.szWave * Math.sin(proj * this.szFreq + t * this.szSpeed),
        this.szMin,
        this.szMax,
      );
      if (size < 0) size = 0;
      let thick = clamp(
        this.thBase + this.thRand * this.rndThick[i] + this.thWave * Math.sin(proj * this.thFreq + t * this.thSpeed),
        this.thMin,
        this.thMax,
      );
      if (thick < 0) thick = 0;
      const half = lenBase * size * 0.5;
      const ox = this.axX[i] * half;
      const oy = this.axY[i] * half;
      const oz = this.axZ[i] * half;
      // Center position, flattened toward a sheet along the depth axis. Sticks
      // keep their full size (offset is not flattened).
      const bx = dx * rad;
      const by = dy * rad;
      const bz = dz * rad * zScale;
      const p1 = project(bx + ox, by + oy, bz + oz, cosY, sinY, cosX, sinX, D, cx, cy, radiusPx);
      const p2 = project(bx - ox, by - oy, bz - oz, cosY, sinY, cosX, sinX, D, cx, cy, radiusPx);
      const depth = (p1.z + p2.z) * 0.5;
      // Optionally hide back-facing sticks, with a soft fade at the silhouette
      // so they don't pop as the sphere rotates.
      let cull = 1;
      if (this.hideBack) {
        const edge = depth - this.cullDepth;
        if (edge < -CULL_BAND) continue;
        if (edge < CULL_BAND) {
          const u = (edge + CULL_BAND) / (2 * CULL_BAND);
          cull = u * u * (3 - 2 * u);
        }
      }
      let cv = clamp(
        this.clBase + this.clRand * this.rndColor[i] + this.clWave * Math.sin(proj * this.clFreq + t * this.clSpeed),
        this.clMin,
        this.clMax,
      );
      cv -= Math.floor(cv);
      let color: string;
      if (nramp) {
        let idx = (cv * nramp) | 0;
        if (idx >= nramp) idx = nramp - 1;
        color = ramp[idx];
      } else {
        let idx = (cv * ncol) | 0;
        if (idx >= ncol) idx = ncol - 1;
        color = colors[idx];
      }
      ctx.globalAlpha = clamp(0.2 + 0.8 * ((depth + 1.25) / 2.5), 0.15, 1) * cull;
      ctx.lineWidth = baseW * size * thick * (p1.s + p2.s) * 0.5;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}

const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);

interface Projected {
  x: number;
  y: number;
  z: number;
  s: number;
}

/** Rotate a body-space point (yaw then pitch) and apply perspective to screen px. */
const project = (
  px: number,
  py: number,
  pz: number,
  cosY: number,
  sinY: number,
  cosX: number,
  sinX: number,
  D: number,
  cx: number,
  cy: number,
  radiusPx: number,
): Projected => {
  const x1 = px * cosY + pz * sinY;
  const z1 = -px * sinY + pz * cosY;
  const y2 = py * cosX - z1 * sinX;
  const z2 = py * sinX + z1 * cosX;
  const s = D / (D - z2);
  return {x: cx + x1 * s * radiusPx, y: cy - y2 * s * radiusPx, z: z2, s};
};
