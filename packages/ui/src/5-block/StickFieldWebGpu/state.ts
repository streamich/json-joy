import {WGSL} from './shader';
import type {ScrollBinding, StickFieldOptions} from './types';

const TWO_PI = Math.PI * 2;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const DEFAULT_COLORS = ['#5b6ee1', '#7c5cff', '#9b8cff'];
const FIELD_MODES: Record<string, number> = {radial: 0, line: 1, ring: 2};

// Uniform buffer is 24 vec4f slots (384 bytes). Float indices below mirror the
// `struct U` layout documented in shader.ts.
const U_FLOATS = 96;
const FLOATS_PER_INSTANCE = 11; // dir(3) + rndAxis(3) + rnd(4) + rndMag(1)

// Replace +-Infinity (the modulator min/max defaults) with a large finite value
// so uniforms never carry non-finite floats to the driver.
const BIG = 1e30;
const fin = (v: number): number => (v === Infinity ? BIG : v === -Infinity ? -BIG : v);

/**
 * WebGPU reimplementation of StickField: a floating cloud of short, round-capped
 * sticks arranged on a breathing sphere. The whole per-stick adjustment loop
 * (magnetism, fbm radius, size/thickness/color waves, rotation, perspective,
 * back-cull) runs in the vertex shader of a single instanced draw, so the CPU
 * only advances time, eases the pointer and rotates a few color slots per frame.
 *
 * No fallback path: if WebGPU is unavailable the component renders nothing.
 *
 * Per-stick state is a pure function of a fixed sphere direction and time, so no
 * compute pass is needed (see prompt). The vec4f-packed uniforms and the small
 * color storage buffer leave room (slot `v5`, the storage buffer) to add mouse
 * forces or extra waves later without reshaping the pipeline.
 */
export class StickFieldGpuState {
  private count = 333;
  private colors = DEFAULT_COLORS;
  private stickLength = 0.07;
  private lineWidth = 3.8;
  private rounding = 1;
  private radiusFrac = 1.1;
  private originX = 0.5;
  private originY = 0.5;
  private perspective = 7.1;
  private shapeOctaves = 3;
  private shapeRoughness = 0.75;
  private shapeSharpness = 1;
  private pulseAmp = 0.04;
  private pulseSpeed = 0.75;
  private flatten = 0;
  private hideBack = true;
  private cullDepth = -0.5;
  private yawSpeed = 0.38;
  // Integrated autonomous yaw, so changing `yawSpeed` at runtime changes the
  // rotation rate without snapping the angle (it is not `t * yawSpeed`).
  private yawAccum = 0;
  private pitchAmp = 1.5;
  private pitchSpeed = 0.7;
  private reactToMouse = true;
  private followMouse = true;
  private followStrength = 0.6;
  private followReach = 1.2;
  private tiltMax = 0.65;
  // Center of attraction: a body-space point (sphere center by default) that the
  // cloud is built around. It can drift autonomously for an idle 3D float, and is
  // the target for radial magnetism and the rays.
  private centerDrift = 0;
  private centerDriftSpeed = 0.6;
  // Magnetism field that sticks align toward (blended by the magnetism modulator):
  // 0 radial (out from center), 1 line (a common axis), 2 ring (swirl around it).
  private fieldMode = 0;
  private fieldAxisX = 0;
  private fieldAxisY = 1;
  private fieldAxisZ = 0;
  private fieldDrift = 1;
  // Rays from each stick toward the center of attraction.
  private rays = true;
  private rayWidth = 0.5;
  private rayFrom = 0.12;
  private rayTo = 0.82;
  private rayAlphaNear = 0.4;
  private rayAlphaFar = 0;
  private rayColorRgb: number[] | null = null; // null -> use the stick's color

  // Cheap effects (all opt-in; defaults are no-ops).
  private fog = 0;
  private fogColorRgb = [0.5, 0.5, 0.6];
  private twinkle = 0;
  private twinkleSpeed = 12;
  private vignette = 0;
  private spin = 4;
  private glow = 0.05;
  private parallax = 0.24;
  private additive = false;
  private scrollYaw = 0;
  private scrollPulse = 0;
  private scrollBindings: ScrollBinding[] = [];
  // Normalized (0..1) scroll positions, page and local element, both axes.
  private winNormX = 0;
  private winNormY = 0;
  private elNormX = 0;
  private elNormY = 0;
  private scroller: HTMLElement | null = null;
  private scrollTarget: EventTarget | null = null;
  // Local mouse repulsion: a soft screen-space push of sticks near the pointer,
  // on top of the global followMouse drift.
  private repelMouse = false;
  private repelRadius = 140;
  private repelStrength = 60;
  private pointerArea: 'window' | 'element' = 'window';
  private fps = 0;

  // Modulators, flattened to primitives.
  private szBase = 0.9;
  private szRand = 0.35;
  private szWave = 12;
  private szFreq = 9.5;
  private szSpeed = 1.8;
  private szMin = 0.15;
  private szMax = 0.25;
  private thBase = 2.85;
  private thRand = 0;
  private thWave = 1.3;
  private thFreq = 1.8;
  private thSpeed = 2.8;
  private thMin = 3.55;
  private thMax = 8;
  private dsBase = 1;
  private dsRand = 0;
  private dsWave = 0.1;
  private dsFreq = 1.5;
  private dsSpeed = 4.2;
  private dsMin = -Infinity;
  private dsMax = Infinity;
  private clBase = 0;
  private clRand = 2.05;
  private clWave = 2.2;
  private clFreq = 0.6;
  private clSpeed = 0.75;
  private clMin = -Infinity;
  private clMax = Infinity;
  private mgBase = 0.9;
  private mgRand = 0;
  private mgWave = 0;
  private mgFreq = 1;
  private mgMin = -Infinity;
  private mgMax = Infinity;
  private colorActive = 3;
  private colorChangeSpeed = 2.45;

  // Per-stick seed data, packed for the instance vertex buffer (rebuilt on seed).
  private instanceData = new Float32Array(0);
  private seeded = false;

  // Color: palette parsed to 0..1 RGB, plus rotating "active" slots that
  // cross-fade. The shader interpolates whichever set we upload to colorBuf.
  private paletteRgb: number[][] = [];
  private colorCount = 0;
  private activeK = 0;
  private slotR = new Float32Array(0);
  private slotG = new Float32Array(0);
  private slotB = new Float32Array(0);
  private slotTarget = new Int32Array(0);
  private slotNext = new Float32Array(0);
  private colorDirty = true;

  // DOM + viewport (CSS px; the dpr only scales the canvas backing store).
  private root: HTMLDivElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
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
  // Pointer position in container CSS px (same space as projected sticks).
  // Far offscreen until the first pointer move, so repulsion stays inert.
  private pointerX = -1e9;
  private pointerY = -1e9;

  // GPU objects + staging arrays.
  private device: GPUDevice | null = null;
  private gpuCtx: GPUCanvasContext | null = null;
  private pipeline: GPURenderPipeline | null = null;
  private pipelineAdd: GPURenderPipeline | null = null;
  private rayPipeline: GPURenderPipeline | null = null;
  private rayPipelineAdd: GPURenderPipeline | null = null;
  private bgLayout: GPUBindGroupLayout | null = null;
  private uniformBuf: GPUBuffer | null = null;
  private cornerBuf: GPUBuffer | null = null;
  private instanceBuf: GPUBuffer | null = null;
  private colorBuf: GPUBuffer | null = null;
  private bindGroup: GPUBindGroup | null = null;
  private colorCapacity = 0;
  private readonly uniformF32 = new Float32Array(U_FLOATS);
  private colorF32 = new Float32Array(0);
  private ready = false;

  // Lifecycle.
  private started = false;
  // Bumped on every start()/dispose(); an async initGpu() captures the value and
  // bails if it changed, so a StrictMode remount cannot mix two GPUDevices.
  private gen = 0;
  private rafId = 0;
  private ro: ResizeObserver | null = null;
  private io: IntersectionObserver | null = null;
  private reduce: MediaQueryList | null = null;

  constructor(opts: StickFieldOptions = {}) {
    this.setOptions(opts);
  }

  public setOptions(o: StickFieldOptions): void {
    const prevCount = this.count;
    this.count = o.count ?? this.count;
    this.stickLength = o.stickLength ?? this.stickLength;
    this.lineWidth = o.lineWidth ?? this.lineWidth;
    this.rounding = o.rounding ?? this.rounding;
    const prevRadius = this.radiusFrac;
    this.radiusFrac = o.radius ?? this.radiusFrac;
    if (this.radiusFrac !== prevRadius && this.w > 0) this.radiusPx = Math.min(this.w, this.h) * 0.5 * this.radiusFrac;
    if (o.origin) {
      this.originX = o.origin[0];
      this.originY = o.origin[1];
      if (this.w > 0) {
        this.cx = this.w * this.originX;
        this.cy = this.h * this.originY;
      }
    }
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
    this.centerDrift = o.centerDrift ?? this.centerDrift;
    this.centerDriftSpeed = o.centerDriftSpeed ?? this.centerDriftSpeed;
    if (o.fieldMode !== undefined) this.fieldMode = FIELD_MODES[o.fieldMode] ?? 0;
    if (o.fieldAxis) {
      this.fieldAxisX = o.fieldAxis[0];
      this.fieldAxisY = o.fieldAxis[1];
      this.fieldAxisZ = o.fieldAxis[2];
    }
    this.fieldDrift = o.fieldDrift ?? this.fieldDrift;
    this.rays = o.rays ?? this.rays;
    this.rayWidth = o.rayWidth ?? this.rayWidth;
    this.rayFrom = o.rayFrom ?? this.rayFrom;
    this.rayTo = o.rayTo ?? this.rayTo;
    this.rayAlphaNear = o.rayAlphaNear ?? this.rayAlphaNear;
    this.rayAlphaFar = o.rayAlphaFar ?? this.rayAlphaFar;
    if (o.rayColor !== undefined) this.rayColorRgb = o.rayColor ? parseColor(o.rayColor) : null;
    this.fog = o.fog ?? this.fog;
    if (o.fogColor) this.fogColorRgb = parseColor(o.fogColor) ?? this.fogColorRgb;
    this.twinkle = o.twinkle ?? this.twinkle;
    this.twinkleSpeed = o.twinkleSpeed ?? this.twinkleSpeed;
    this.vignette = o.vignette ?? this.vignette;
    this.spin = o.spin ?? this.spin;
    this.glow = o.glow ?? this.glow;
    this.parallax = o.parallax ?? this.parallax;
    this.additive = o.additive ?? this.additive;
    this.scrollYaw = o.scrollYaw ?? this.scrollYaw;
    this.scrollPulse = o.scrollPulse ?? this.scrollPulse;
    this.scrollBindings = o.scrollBindings ?? this.scrollBindings;
    this.repelMouse = o.repelMouse ?? this.repelMouse;
    this.repelRadius = o.repelRadius ?? this.repelRadius;
    this.repelStrength = o.repelStrength ?? this.repelStrength;
    this.pointerArea = o.pointerArea ?? this.pointerArea;
    this.fps = o.fps ?? this.fps;
    const prevActive = this.colorActive;
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
    if (o.colors && !colorsEqual(o.colors, this.colors)) {
      this.colors = o.colors;
      this.colorDirty = true;
    }
    if (this.colorActive !== prevActive) this.colorDirty = true;
    if (this.seeded && this.count !== prevCount) {
      this.seed();
      this.uploadInstances();
    }
  }

  public readonly setRoot = (el: HTMLDivElement | null): void => {
    this.root = el;
  };

  public readonly setCanvas = (el: HTMLCanvasElement | null): void => {
    this.canvas = el;
  };

  /** Distribute sticks over a sphere; assign each a random axis and randoms. */
  private seed(): void {
    const n = this.count;
    const data = new Float32Array(n * FLOATS_PER_INSTANCE);
    const denom = n > 1 ? n - 1 : 1;
    for (let i = 0; i < n; i++) {
      const o = i * FLOATS_PER_INSTANCE;
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
  }

  /** Parse the palette to 0..1 RGB and (re)initialize the rotating slots. */
  private prepColors(): void {
    this.colorDirty = false;
    const colors = this.colors;
    const pal = parsePalette(colors);
    this.paletteRgb = pal;
    const np = pal.length;
    const K = this.colorActive >= 1 && this.colorActive < np ? this.colorActive : 0;
    this.activeK = K;
    this.colorCount = K > 0 ? K : np;
    if (this.colorF32.length < Math.max(1, this.colorCount) * 4)
      this.colorF32 = new Float32Array(Math.max(1, this.colorCount) * 4);
    if (K) {
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

  /** Advance the rotating active-color slots toward their targets. */
  private updateSlots(dt: number): void {
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

  private resize(): void {
    const root = this.root;
    const canvas = this.canvas;
    if (!root || !canvas) return;
    const rect = root.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = rect.width;
    this.h = rect.height;
    this.cx = rect.width * this.originX;
    this.cy = rect.height * this.originY;
    this.radiusPx = Math.min(rect.width, rect.height) * 0.5 * this.radiusFrac;
    canvas.width = Math.max(1, (rect.width * dpr) | 0);
    canvas.height = Math.max(1, (rect.height * dpr) | 0);
    if (this.ready && this.reduce?.matches) this.renderFrame();
  }

  public start(): void {
    if (this.started || !this.root || !this.canvas) return;
    this.started = true;
    const gen = ++this.gen;
    if (!this.seeded) this.seed();
    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.ro = new ResizeObserver(this.onResize);
    this.ro.observe(this.root);
    this.io = new IntersectionObserver(this.onIntersect);
    this.io.observe(this.root);
    document.addEventListener('visibilitychange', this.onVisibility);
    if (this.reactToMouse || this.followMouse || this.repelMouse)
      window.addEventListener('pointermove', this.onPointerMove, {passive: true});
    const needWindow =
      this.scrollYaw !== 0 ||
      this.scrollPulse !== 0 ||
      this.scrollBindings.some((b) => (b.source ?? 'window') === 'window');
    if (needWindow) {
      window.addEventListener('scroll', this.onWindowScroll, {passive: true});
      this.onWindowScroll();
    }
    if (this.scrollBindings.some((b) => b.source === 'element')) {
      this.scroller = findScroller(this.root);
      this.scrollTarget =
        this.scroller === document.documentElement || this.scroller === document.body ? window : this.scroller;
      this.scrollTarget.addEventListener('scroll', this.onElementScroll, {passive: true});
      this.onElementScroll();
    }
    this.resize();
    void this.initGpu(gen);
  }

  public dispose(): void {
    this.pause();
    this.started = false;
    this.gen++;
    this.ready = false;
    this.ro?.disconnect();
    this.io?.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('scroll', this.onWindowScroll);
    this.scrollTarget?.removeEventListener('scroll', this.onElementScroll);
    this.scrollTarget = null;
    this.scroller = null;
    this.ro = this.io = null;
    this.device?.destroy();
    this.device = null;
    this.gpuCtx = null;
    this.pipeline = this.pipelineAdd = this.rayPipeline = this.rayPipelineAdd = null;
    this.bgLayout = null;
    this.uniformBuf = this.cornerBuf = this.instanceBuf = this.colorBuf = null;
    this.bindGroup = null;
    this.instanceBufBytes = 0;
    this.colorCapacity = 0;
  }

  /** Async GPU setup. On any unsupported/failure path we render nothing. */
  private async initGpu(gen: number): Promise<void> {
    const gpu = navigator.gpu;
    const canvas = this.canvas;
    if (!gpu || !canvas) return;
    let device: GPUDevice;
    try {
      const adapter = await gpu.requestAdapter();
      if (!adapter) return;
      device = await adapter.requestDevice();
    } catch {
      return;
    }
    // A remount (StrictMode) or dispose() since we started: drop this device so
    // its resources never mix with the live one.
    if (gen !== this.gen) {
      device.destroy();
      return;
    }
    const ctx = canvas.getContext('webgpu');
    if (!ctx) {
      device.destroy();
      return;
    }
    const format = gpu.getPreferredCanvasFormat();
    ctx.configure({device, format, alphaMode: 'premultiplied'});
    this.device = device;
    this.gpuCtx = ctx;
    this.buildPipeline(device, format);
    this.cornerBuf = makeBuffer(
      device,
      new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5]),
      GPUBufferUsage.VERTEX,
    );
    this.uniformBuf = device.createBuffer({
      size: U_FLOATS * 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.uploadInstances();
    if (this.colorDirty) this.prepColors();
    this.ensureColorBuf();
    this.ready = true;
    if (this.reduce?.matches) this.renderFrame();
    else this.play();
  }

  private buildPipeline(device: GPUDevice, format: GPUTextureFormat): void {
    const module = device.createShaderModule({code: WGSL});
    // Both blends consume the premultiplied fragment output. "over" is normal
    // source-over, "add" accumulates brightness for the additive nebula look.
    const over: GPUBlendComponent = {srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add'};
    const add: GPUBlendComponent = {srcFactor: 'one', dstFactor: 'one', operation: 'add'};
    // Explicit layout so one bind group works for all pipelines (auto layouts are
    // not guaranteed compatible across pipelines).
    const bgLayout = device.createBindGroupLayout({
      entries: [
        {binding: 0, visibility: GPUShaderStage.VERTEX, buffer: {type: 'uniform'}},
        {binding: 1, visibility: GPUShaderStage.VERTEX, buffer: {type: 'read-only-storage'}},
      ],
    });
    this.bgLayout = bgLayout;
    const layout = device.createPipelineLayout({bindGroupLayouts: [bgLayout]});
    const buffers: GPUVertexBufferLayout[] = [
      {arrayStride: 8, stepMode: 'vertex', attributes: [{shaderLocation: 0, offset: 0, format: 'float32x2'}]},
      {
        arrayStride: FLOATS_PER_INSTANCE * 4,
        stepMode: 'instance',
        attributes: [
          {shaderLocation: 1, offset: 0, format: 'float32x3'},
          {shaderLocation: 2, offset: 12, format: 'float32x3'},
          {shaderLocation: 3, offset: 24, format: 'float32x4'},
          {shaderLocation: 4, offset: 40, format: 'float32'},
        ],
      },
    ];
    const mk = (vsEntry: string, fsEntry: string, blend: GPUBlendComponent): GPURenderPipeline =>
      device.createRenderPipeline({
        layout,
        vertex: {module, entryPoint: vsEntry, buffers},
        fragment: {module, entryPoint: fsEntry, targets: [{format, blend: {color: blend, alpha: blend}}]},
        primitive: {topology: 'triangle-strip'},
      });
    this.pipeline = mk('vs', 'fs', over);
    this.pipelineAdd = mk('vs', 'fs', add);
    this.rayPipeline = mk('vsRay', 'fsRay', over);
    this.rayPipelineAdd = mk('vsRay', 'fsRay', add);
  }

  /** (Re)upload the per-instance seed buffer; recreate it if the count changed. */
  private uploadInstances(): void {
    const device = this.device;
    if (!device) return;
    const bytes = this.instanceData.byteLength;
    // A GPU buffer's size is fixed at creation, so recreate when count changes.
    if (!this.instanceBuf || this.instanceBufBytes !== bytes) {
      this.instanceBuf?.destroy();
      this.instanceBuf = makeBuffer(device, this.instanceData, GPUBufferUsage.VERTEX);
      this.instanceBufBytes = bytes;
    } else {
      device.queue.writeBuffer(this.instanceBuf, 0, this.instanceData);
    }
  }
  private instanceBufBytes = 0;

  /** Size the color storage buffer to the palette and rebuild the bind group. */
  private ensureColorBuf(): void {
    const device = this.device;
    const bgLayout = this.bgLayout;
    const uniformBuf = this.uniformBuf;
    if (!device || !bgLayout || !uniformBuf) return;
    const need = Math.max(1, this.paletteRgb.length);
    if (need !== this.colorCapacity || !this.colorBuf || !this.bindGroup) {
      this.colorBuf?.destroy();
      this.colorCapacity = need;
      this.colorBuf = device.createBuffer({size: need * 16, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST});
      this.bindGroup = device.createBindGroup({
        layout: bgLayout,
        entries: [
          {binding: 0, resource: {buffer: uniformBuf}},
          {binding: 1, resource: {buffer: this.colorBuf}},
        ],
      });
    }
  }

  private play(): void {
    if (!this.ready || this.rafId || this.reduce?.matches) return;
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

  private readonly onWindowScroll = (): void => {
    this.winNormY = (window.scrollY || 0) / Math.max(1, window.innerHeight || 1);
    this.winNormX = (window.scrollX || 0) / Math.max(1, window.innerWidth || 1);
  };

  private readonly onElementScroll = (): void => {
    const el = this.scroller;
    if (!el) return;
    const rangeY = el.scrollHeight - el.clientHeight;
    const rangeX = el.scrollWidth - el.clientWidth;
    this.elNormY = rangeY > 0 ? el.scrollTop / rangeY : 0;
    this.elNormX = rangeX > 0 ? el.scrollLeft / rangeX : 0;
  };

  private readonly onPointerMove = (e: PointerEvent): void => {
    const root = this.root;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    if (this.pointerArea === 'element') {
      const inside =
        e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!inside) {
        this.targetYaw = 0;
        this.targetPitch = 0;
        this.targetFollowX = 0;
        this.targetFollowY = 0;
        this.pointerX = -1e9;
        this.pointerY = -1e9;
        return;
      }
    }
    const halfW = rect.width / 2;
    const halfH = rect.height / 2;
    const offX = e.clientX - rect.left - halfW;
    const offY = e.clientY - rect.top - halfH;
    this.pointerX = e.clientX - rect.left;
    this.pointerY = e.clientY - rect.top;
    // Only steer tilt/drift when those are enabled; repel just needs pointerX/Y.
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
    this.yawAccum += this.yawSpeed * dt;
    const kt = 1 - Math.exp(-4 * dt);
    this.mYaw += (this.targetYaw - this.mYaw) * kt;
    this.mPitch += (this.targetPitch - this.mPitch) * kt;
    const kf = 1 - Math.exp(-2.5 * dt);
    this.followX += (this.targetFollowX - this.followX) * kf;
    this.followY += (this.targetFollowY - this.followY) * kf;
    if (this.activeK) this.updateSlots(dt);
    this.renderFrame();
  };

  /** Update uniforms + colors and issue the draws (rays behind sticks). */
  private renderFrame(): void {
    const device = this.device;
    const ctx = this.gpuCtx;
    const pipeline = this.pipeline;
    if (!this.ready || !device || !ctx || !pipeline) return;
    if (this.colorDirty) {
      this.prepColors();
      this.ensureColorBuf();
    }
    const uniformBuf = this.uniformBuf;
    const cornerBuf = this.cornerBuf;
    const instanceBuf = this.instanceBuf;
    const colorBuf = this.colorBuf;
    const bindGroup = this.bindGroup;
    if (!uniformBuf || !cornerBuf || !instanceBuf || !colorBuf || !bindGroup) return;

    this.writeUniforms();
    device.queue.writeBuffer(uniformBuf, 0, this.uniformF32);
    this.writeColors();
    device.queue.writeBuffer(colorBuf, 0, this.colorF32, 0, this.colorCount * 4);

    const view = ctx.getCurrentTexture().createView();
    const enc = device.createCommandEncoder();
    const pass = enc.beginRenderPass({
      colorAttachments: [{view, clearValue: {r: 0, g: 0, b: 0, a: 0}, loadOp: 'clear', storeOp: 'store'}],
    });
    pass.setBindGroup(0, bindGroup);
    pass.setVertexBuffer(0, cornerBuf);
    pass.setVertexBuffer(1, instanceBuf);
    // Rays first so the sticks paint on top of them.
    const rayP = this.additive ? this.rayPipelineAdd : this.rayPipeline;
    if (this.rays && this.rayWidth > 0 && rayP) {
      pass.setPipeline(rayP);
      pass.draw(4, this.count);
    }
    pass.setPipeline(this.additive ? (this.pipelineAdd ?? pipeline) : pipeline);
    pass.draw(4, this.count);
    pass.end();
    device.queue.submit([enc.finish()]);
  }

  private writeColors(): void {
    const f = this.colorF32;
    if (this.activeK) {
      for (let k = 0; k < this.activeK; k++) {
        const o = k * 4;
        f[o] = this.slotR[k];
        f[o + 1] = this.slotG[k];
        f[o + 2] = this.slotB[k];
        f[o + 3] = 0;
      }
    } else {
      const pal = this.paletteRgb;
      for (let i = 0; i < pal.length; i++) {
        const o = i * 4;
        f[o] = pal[i][0];
        f[o + 1] = pal[i][1];
        f[o + 2] = pal[i][2];
        f[o + 3] = 0;
      }
    }
  }

  /** Sum scroll-binding contributions for one target (0 when none bound). */
  private scrollDelta(target: string): number {
    let v = 0;
    const b = this.scrollBindings;
    for (let i = 0; i < b.length; i++) {
      if (b[i].target !== target) continue;
      const axis = b[i].axis ?? 'y';
      const src = b[i].source ?? 'window';
      const n =
        src === 'element' ? (axis === 'x' ? this.elNormX : this.elNormY) : axis === 'x' ? this.winNormX : this.winNormY;
      v += (b[i].scale ?? 1) * n;
    }
    return v;
  }

  private writeUniforms(): void {
    const f = this.uniformF32;
    const t = this.t;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const yaw = this.yawAccum + this.mYaw + this.scrollYaw * this.winNormY + this.scrollDelta('yaw');
    const pitch = Math.sin(t * this.pitchSpeed) * this.pitchAmp + this.mPitch + this.scrollDelta('pitch');
    const pulse =
      this.pulseAmp * Math.sin(t * this.pulseSpeed) + this.scrollPulse * this.winNormY + this.scrollDelta('pulse');
    // v0: time, dpr, radiusPx, perspective
    f[0] = t;
    f[1] = dpr;
    f[2] = this.radiusPx + this.scrollDelta('radius') * Math.min(this.w, this.h) * 0.5;
    f[3] = this.perspective + this.scrollDelta('perspective');
    // v1: resX, resY, centerX, centerY
    f[4] = this.w;
    f[5] = this.h;
    f[6] = this.cx + this.followX;
    f[7] = this.cy + this.followY;
    // v2: stickLength, lineWidth, zScale, pulse
    f[8] = this.stickLength;
    f[9] = this.lineWidth;
    f[10] = 1 - (this.flatten + this.scrollDelta('flatten'));
    f[11] = pulse;
    // v3: yaw, pitch, hideBack, cullDepth
    f[12] = yaw;
    f[13] = pitch;
    f[14] = this.hideBack ? 1 : 0;
    f[15] = this.cullDepth;
    // v4: shapeOctaves, shapeRoughness, shapeSharpness, colorCount
    f[16] = Math.max(1, this.shapeOctaves | 0);
    f[17] = this.shapeRoughness;
    f[18] = this.shapeSharpness;
    f[19] = this.colorCount;
    // v5: rounding, attractX, attractY, attractZ (center of attraction, body space)
    const cd = this.centerDrift + this.scrollDelta('centerDrift');
    const cs = this.centerDriftSpeed;
    f[20] = this.rounding;
    f[21] = cd * Math.sin(t * 0.31 * cs) * Math.cos(t * 0.21 * cs + 1.3);
    f[22] = cd * Math.sin(t * 0.27 * cs + 2.1);
    f[23] = cd * Math.sin(t * 0.19 * cs + 4.2) * 0.6;
    // v6: pointerX, pointerY, repelRadius, repelStrength (strength 0 disables)
    f[24] = this.pointerX;
    f[25] = this.pointerY;
    f[26] = this.repelRadius;
    f[27] = this.repelMouse ? this.repelStrength : 0;
    // size / thickness / distance / color: (base,rand,wave,freq)|(speed,min,max,_)
    writeMod(f, 28, this.szBase, this.szRand, this.szWave, this.szFreq, this.szSpeed, this.szMin, this.szMax);
    writeMod(f, 36, this.thBase, this.thRand, this.thWave, this.thFreq, this.thSpeed, this.thMin, this.thMax);
    writeMod(f, 44, this.dsBase, this.dsRand, this.dsWave, this.dsFreq, this.dsSpeed, this.dsMin, this.dsMax);
    writeMod(f, 52, this.clBase, this.clRand, this.clWave, this.clFreq, this.clSpeed, this.clMin, this.clMax);
    // mg: (base,rand,wave,freq)|(min,max,_,_)
    f[60] = this.mgBase;
    f[61] = this.mgRand;
    f[62] = this.mgWave;
    f[63] = this.mgFreq;
    f[64] = fin(this.mgMin);
    f[65] = fin(this.mgMax);
    f[66] = f[67] = 0;
    // fld0 (68-71): field axis (drifting) + mode
    let axX = this.fieldAxisX;
    let axY = this.fieldAxisY;
    let axZ = this.fieldAxisZ;
    const fd = this.fieldDrift + this.scrollDelta('fieldDrift');
    if (fd > 0) {
      axX += fd * Math.sin(t * 0.3);
      axY += fd * Math.sin(t * 0.23 + 1.7);
      axZ += fd * Math.sin(t * 0.19 + 3.1);
    }
    const al = Math.hypot(axX, axY, axZ) || 1;
    f[68] = axX / al;
    f[69] = axY / al;
    f[70] = axZ / al;
    f[71] = this.fieldMode;
    // ray0 (72-75): width, from, to, enabled
    f[72] = this.rayWidth;
    f[73] = this.rayFrom;
    f[74] = this.rayTo;
    f[75] = this.rays ? 1 : 0;
    // ray1 (76-79): alphaNear, alphaFar, useStickColor, _
    f[76] = this.rayAlphaNear;
    f[77] = this.rayAlphaFar;
    f[78] = this.rayColorRgb ? 0 : 1;
    f[79] = 0;
    // ray2 (80-83): ray color rgb (used when not using the stick color)
    const rc = this.rayColorRgb;
    f[80] = rc ? rc[0] : 1;
    f[81] = rc ? rc[1] : 1;
    f[82] = rc ? rc[2] : 1;
    f[83] = 0;
    // cw0 (84-87): fog amount + fog color
    f[84] = this.fog;
    f[85] = this.fogColorRgb[0];
    f[86] = this.fogColorRgb[1];
    f[87] = this.fogColorRgb[2];
    // cw1 (88-91): twinkle, twinkleSpeed, _ (reserved), vignette
    f[88] = this.twinkle + this.scrollDelta('twinkle');
    f[89] = this.twinkleSpeed;
    f[90] = 0;
    f[91] = this.vignette;
    // cw2 (92-95): spin, parallax, glow, _
    f[92] = this.spin + this.scrollDelta('spin');
    f[93] = this.parallax;
    f[94] = this.glow + this.scrollDelta('glow');
    f[95] = 0;
  }
}

const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);

/** Nearest scrollable element from `el` upward (the element itself counts); the
 * page scrolling element when none is found. */
const findScroller = (el: HTMLElement): HTMLElement => {
  let p: HTMLElement | null = el;
  while (p && p !== document.body && p !== document.documentElement) {
    const s = getComputedStyle(p);
    const oy = s.overflowY;
    const ox = s.overflowX;
    const scrollY = (oy === 'auto' || oy === 'scroll' || oy === 'overlay') && p.scrollHeight > p.clientHeight;
    const scrollX = (ox === 'auto' || ox === 'scroll' || ox === 'overlay') && p.scrollWidth > p.clientWidth;
    if (scrollY || scrollX) return p;
    p = p.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? document.documentElement;
};

const writeMod = (
  f: Float32Array,
  o: number,
  base: number,
  rand: number,
  wave: number,
  freq: number,
  speed: number,
  min: number,
  max: number,
): void => {
  f[o] = base;
  f[o + 1] = rand;
  f[o + 2] = wave;
  f[o + 3] = freq;
  f[o + 4] = speed;
  f[o + 5] = fin(min);
  f[o + 6] = fin(max);
  f[o + 7] = 0;
};

const makeBuffer = (device: GPUDevice, data: Float32Array, usage: number): GPUBuffer => {
  const buf = device.createBuffer({size: Math.max(4, data.byteLength), usage, mappedAtCreation: true});
  new Float32Array(buf.getMappedRange()).set(data);
  buf.unmap();
  return buf;
};

const colorsEqual = (a: string[], b: string[]): boolean => {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
};

/** Parse CSS color strings to 0..1 RGB via a 1x1 canvas (runs only on change). */
const parsePalette = (colors: string[]): number[][] => {
  if (typeof document === 'undefined' || !document.createElement) return [];
  const c = document.createElement('canvas');
  c.width = c.height = 1;
  const g = c.getContext('2d', {willReadFrequently: true});
  if (!g) return [];
  const out: number[][] = [];
  for (let i = 0; i < colors.length; i++) {
    g.clearRect(0, 0, 1, 1);
    g.fillStyle = colors[i];
    g.fillRect(0, 0, 1, 1);
    const d = g.getImageData(0, 0, 1, 1).data;
    out.push([d[0] / 255, d[1] / 255, d[2] / 255]);
  }
  return out;
};

/** Parse a single CSS color to 0..1 RGB, or null when unavailable. */
const parseColor = (color: string): number[] | null => parsePalette([color])[0] ?? null;
