import {WGSL} from './shader';
import type {LiquidLayer, LiquidLayersOptions, ScrollBinding} from './types';

const DEFAULT_COLORS = ['#9d174d', '#be185d', '#db2777', '#ec4899', '#f472b6', '#f9a8d4', '#fbcfe8'];
const MODES: Record<string, number> = {independent: 0, contours: 1};
const COLOR_MODES: Record<string, number> = {depth: 0, perLayer: 1};
const REACT_MODES: Record<string, number> = {none: 0, part: 1, attract: 2, ripple: 3};

const U_FLOATS = 64;
const FLOATS_PER_LAYER = 16;
const SEED_STRIDE = 8; // dirX, dirY, seedA, seedB, freqX, freqY, radiusFactor, weight
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const EMPTY_LAYER: LiquidLayer = {};

/**
 * WebGPU LiquidLayers: a stack of liquid layers, each a 2D scalar field summed
 * from moving metaball sources and thresholded into a soft silhouette, composited
 * back-to-front with soft crescent cast shadows. Blobs split and merge as their
 * sources drift apart and together: the topology is emergent from the metaball
 * sum, not authored.
 *
 * No fallback path: if WebGPU is unavailable the component renders nothing.
 */
export class LiquidLayersGpuState {
  // Stack shape (global defaults; per-layer overrides come from `layersOpt`).
  private count = 7;
  private levelBase = 0.72;
  private levelStep = 0.035;
  private modeNum = 0;
  private gSources = 3;
  private gSourceRadius = 0.38;
  private gSourceRadiusVar = 0.25;
  private gSpread = 0.36;
  private gAttraction = 0.15;
  private gWarp = 0.18;
  private gWarpScale = 1.6;
  private gOctaves = 2;
  private gRoughness = 0.6;
  private gOpacity = 1;
  private gElevation = 1;
  private gDrift: [number, number] = [0, 0];
  private originX = 0.5;
  private originY = 0.5;
  private layersOpt: LiquidLayer[] | null = null;

  // Color.
  private colors = DEFAULT_COLORS;
  private colorModeNum = 0;
  private colorActive = 0;
  private colorChangeSpeed = 0.4;
  private colorStep = 0;
  private bgStr: string | undefined = '#2a0a1e';
  private bgR = 0;
  private bgG = 0;
  private bgB = 0;
  private bgA = 0;

  // Light, shadow, sheen.
  private lightAngle = 2.3;
  private shadow = 0.55;
  private shadowOffset = 0.05;
  private gShadowSoftness = 0.5;
  private shadowSteps = 6;
  private sheen = 0.12;
  private rimPower = 2.5;

  // Motion.
  private morphSpeed = 0.3;
  private warpSpeed = 0.12;
  private speed = 1;
  private additive = false;
  private fps = 0;
  // Internal render scale on top of the DPR cap; this is a fragment-bound effect,
  // so rendering below the device resolution (the soft liquid hides it) is the
  // main performance lever. Floored at 1x so non-retina displays stay crisp.
  private resolutionScale = 0.75;

  // Mouse.
  private reactMode = 2;
  private mouseStrength = 60;
  private mouseRadius = 200;
  private rippleAmount = 0.05;
  private rippleFreq = 40;
  private rippleSpeed = 3;
  private pointerArea: 'window' | 'element' = 'element';

  // Scroll.
  private scrollBindings: ScrollBinding[] = [];
  private winNormX = 0;
  private winNormY = 0;
  private elNormX = 0;
  private elNormY = 0;
  private scroller: HTMLElement | null = null;
  private scrollTarget: EventTarget | null = null;

  // Resolved per-layer tables (length >= layerCount; refilled by rebuildLayers).
  private levelA = new Float32Array(0);
  private srcStartA = new Float32Array(0);
  private srcCountA = new Float32Array(0);
  private warpA = new Float32Array(0);
  private warpScaleA = new Float32Array(0);
  private opacityA = new Float32Array(0);
  private elevationA = new Float32Array(0);
  private shadowA = new Float32Array(0);
  private colRA = new Float32Array(0);
  private colGA = new Float32Array(0);
  private colBA = new Float32Array(0);
  private shadowSoftA = new Float32Array(0);
  private octavesA = new Float32Array(0);
  private roughnessA = new Float32Array(0);
  private seedNumA = new Float32Array(0);
  private spreadA = new Float32Array(0);
  private attractionA = new Float32Array(0);
  private morphMulA = new Float32Array(0);
  private driftXA = new Float32Array(0);
  private driftYA = new Float32Array(0);
  private sourceRadiusA = new Float32Array(0);
  private sourceRadiusVarA = new Float32Array(0);
  private layerHomeX = new Float32Array(0);
  private layerHomeY = new Float32Array(0);
  private depthPosA = new Float32Array(0);
  private layerCount = 0;
  private layersF32 = new Float32Array(0);
  private layersDirty = true;

  // Per-source seed data + per-frame animated positions.
  private seedData = new Float32Array(0);
  private sourcesF32 = new Float32Array(0);
  private attrX = new Float32Array(0);
  private attrY = new Float32Array(0);
  private tmpX = new Float32Array(0);
  private tmpY = new Float32Array(0);
  private totalSources = 0;
  private structSig = '';

  // Color palette + rotating active slots.
  private paletteRgb: number[][] = [];
  private colorCount = 0;
  private activeK = 0;
  private slotR = new Float32Array(0);
  private slotG = new Float32Array(0);
  private slotB = new Float32Array(0);
  private slotTarget = new Int32Array(0);
  private slotNext = new Float32Array(0);
  private colorF32 = new Float32Array(0);
  private colorDirty = true;

  // DOM + viewport (CSS px; dpr only scales the canvas backing store).
  private root: HTMLDivElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private w = 0;
  private h = 0;

  // Animation clock + accumulated phases (phase += speed * dt, never t * speed).
  private t = 0;
  private last = 0;
  private acc = 0;
  private lastDt = 0;
  private morphPhase = 0;
  private driftPhase = 0;
  private warpPhase = 0;
  private ripplePhase = 0;

  // Eased pointer in container CSS px.
  private epx = 0;
  private epy = 0;
  private targetPx = 0;
  private targetPy = 0;
  private pointerActive = false;
  // Eased global lean of the whole stack toward/away from the pointer.
  private gShiftX = 0;
  private gShiftY = 0;

  // GPU objects + staging.
  private device: GPUDevice | null = null;
  private gpuCtx: GPUCanvasContext | null = null;
  private pipeline: GPURenderPipeline | null = null;
  private pipelineAdd: GPURenderPipeline | null = null;
  private bgLayout: GPUBindGroupLayout | null = null;
  private uniformBuf: GPUBuffer | null = null;
  private layersBuf: GPUBuffer | null = null;
  private sourcesBuf: GPUBuffer | null = null;
  private colorBuf: GPUBuffer | null = null;
  private bindGroup: GPUBindGroup | null = null;
  private layersCap = 0;
  private sourcesCap = 0;
  private palCap = 0;
  private readonly uniformF32 = new Float32Array(U_FLOATS);
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

  constructor(opts: LiquidLayersOptions = {}) {
    this.setOptions(opts);
    // setOptions only reparses on change, so parse the initial background once.
    this.parseBackground();
  }

  public setOptions(o: LiquidLayersOptions): void {
    this.count = o.count ?? this.count;
    this.levelBase = o.level ?? this.levelBase;
    this.levelStep = o.levelStep ?? this.levelStep;
    if (o.mode !== undefined) this.modeNum = MODES[o.mode] ?? 0;
    this.gSources = o.sources ?? this.gSources;
    this.gSourceRadius = o.sourceRadius ?? this.gSourceRadius;
    this.gSourceRadiusVar = o.sourceRadiusVar ?? this.gSourceRadiusVar;
    this.gSpread = o.spread ?? this.gSpread;
    this.gAttraction = o.attraction ?? this.gAttraction;
    this.gWarp = o.warp ?? this.gWarp;
    this.gWarpScale = o.warpScale ?? this.gWarpScale;
    this.gOctaves = o.octaves ?? this.gOctaves;
    this.gRoughness = o.roughness ?? this.gRoughness;
    this.gOpacity = o.opacity ?? this.gOpacity;
    this.gElevation = o.elevation ?? this.gElevation;
    if (o.drift) this.gDrift = o.drift;
    if (o.origin) {
      this.originX = o.origin[0];
      this.originY = o.origin[1];
    }
    if (o.layers !== undefined) this.layersOpt = o.layers ?? null;
    if (o.colorMode !== undefined) this.colorModeNum = COLOR_MODES[o.colorMode] ?? 0;
    const prevActive = this.colorActive;
    this.colorActive = o.colorActive ?? this.colorActive;
    this.colorChangeSpeed = o.colorChangeSpeed ?? this.colorChangeSpeed;
    if ('background' in o && o.background !== this.bgStr) {
      this.bgStr = o.background;
      this.parseBackground();
    }
    this.lightAngle = o.lightAngle ?? this.lightAngle;
    this.shadow = o.shadow ?? this.shadow;
    this.shadowOffset = o.shadowOffset ?? this.shadowOffset;
    this.gShadowSoftness = o.shadowSoftness ?? this.gShadowSoftness;
    this.shadowSteps = o.shadowSteps ?? this.shadowSteps;
    this.sheen = o.sheen ?? this.sheen;
    this.rimPower = o.rimPower ?? this.rimPower;
    this.morphSpeed = o.morphSpeed ?? this.morphSpeed;
    this.warpSpeed = o.warpSpeed ?? this.warpSpeed;
    this.speed = o.speed ?? this.speed;
    this.additive = o.additive ?? this.additive;
    this.fps = o.fps ?? this.fps;
    this.resolutionScale = o.resolutionScale ?? this.resolutionScale;
    if (o.reactToMouse !== undefined) this.reactMode = REACT_MODES[o.reactToMouse] ?? 0;
    this.mouseStrength = o.mouseStrength ?? this.mouseStrength;
    this.mouseRadius = o.mouseRadius ?? this.mouseRadius;
    this.rippleAmount = o.rippleAmount ?? this.rippleAmount;
    this.rippleFreq = o.rippleFreq ?? this.rippleFreq;
    this.rippleSpeed = o.rippleSpeed ?? this.rippleSpeed;
    this.pointerArea = o.pointerArea ?? this.pointerArea;
    this.scrollBindings = o.scrollBindings ?? this.scrollBindings;
    if (o.colors && !colorsEqual(o.colors, this.colors)) {
      this.colors = o.colors;
      this.colorDirty = true;
    }
    if (this.colorActive !== prevActive) this.colorDirty = true;
    this.rebuildLayers();
  }

  public readonly setRoot = (el: HTMLDivElement | null): void => {
    this.root = el;
  };

  public readonly setCanvas = (el: HTMLCanvasElement | null): void => {
    this.canvas = el;
  };

  private parseBackground(): void {
    const s = this.bgStr;
    if (!s || s === 'transparent') {
      this.bgR = this.bgG = this.bgB = 0;
      this.bgA = 0;
      return;
    }
    const rgb = parseColor(s);
    if (rgb) {
      this.bgR = rgb[0];
      this.bgG = rgb[1];
      this.bgB = rgb[2];
      this.bgA = 1;
    }
  }

  /** Parse the palette to 0..1 RGB and (re)initialize the rotating slots. */
  private prepColors(): void {
    this.colorDirty = false;
    const pal = parsePalette(this.colors);
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

  private ensureLayerArrays(N: number): void {
    if (this.levelA.length >= N) return;
    const mk = () => new Float32Array(N);
    this.levelA = mk();
    this.srcStartA = mk();
    this.srcCountA = mk();
    this.warpA = mk();
    this.warpScaleA = mk();
    this.opacityA = mk();
    this.elevationA = mk();
    this.shadowA = mk();
    this.colRA = mk();
    this.colGA = mk();
    this.colBA = mk();
    this.shadowSoftA = mk();
    this.octavesA = mk();
    this.roughnessA = mk();
    this.seedNumA = mk();
    this.spreadA = mk();
    this.attractionA = mk();
    this.morphMulA = mk();
    this.driftXA = mk();
    this.driftYA = mk();
    this.sourceRadiusA = mk();
    this.sourceRadiusVarA = mk();
    this.layerHomeX = mk();
    this.layerHomeY = mk();
    this.depthPosA = mk();
  }

  /** Resolve global + per-layer options into the GPU layer table and source seeds. */
  private rebuildLayers(): void {
    const paletteChanged = this.colorDirty;
    if (this.colorDirty) this.prepColors();
    const explicit = this.layersOpt;
    const N = Math.max(1, explicit ? explicit.length : this.count | 0);
    const contours = !explicit && this.modeNum === 1;
    this.ensureLayerArrays(N);
    const pal = this.paletteRgb;
    const sharedCount = Math.max(1, this.gSources | 0);
    // Re-span the depth ramp across the palette on a fresh build, a palette change
    // or a large count jump (a preset switch). For small count changes (dragging
    // the count by one) the step is held, so existing layers keep their color and
    // the added/removed front layer just extends/trims the ramp end.
    if (this.colorStep === 0 || paletteChanged || Math.abs(N - this.layerCount) > 1)
      this.colorStep = 1 / Math.max(1, N - 1);
    let cursor = 0;
    for (let k = 0; k < N; k++) {
      const L = explicit ? (explicit[k] ?? EMPTY_LAYER) : EMPTY_LAYER;
      const seed = L.seed ?? k * 0.61803398875 + 0.123;
      this.levelA[k] = L.level ?? this.levelBase + k * this.levelStep;
      const cnt = contours ? sharedCount : Math.max(1, (L.sources ?? this.gSources) | 0);
      this.srcCountA[k] = cnt;
      this.srcStartA[k] = contours ? 0 : cursor;
      if (!contours) cursor += cnt;
      this.sourceRadiusA[k] = L.sourceRadius ?? this.gSourceRadius;
      this.sourceRadiusVarA[k] = L.sourceRadiusVar ?? this.gSourceRadiusVar;
      this.spreadA[k] = L.spread ?? this.gSpread;
      this.attractionA[k] = L.attraction ?? this.gAttraction;
      this.morphMulA[k] = L.morphSpeed ?? 1;
      const dr = L.drift ?? this.gDrift;
      this.driftXA[k] = dr[0];
      this.driftYA[k] = dr[1];
      this.warpA[k] = L.warp ?? this.gWarp;
      this.warpScaleA[k] = L.warpScale ?? this.gWarpScale;
      this.octavesA[k] = Math.max(1, (L.octaves ?? this.gOctaves) | 0);
      this.roughnessA[k] = L.roughness ?? this.gRoughness;
      this.opacityA[k] = L.opacity ?? this.gOpacity;
      this.elevationA[k] = L.elevation ?? this.gElevation * (0.4 + 0.6 * (N > 1 ? k / (N - 1) : 1));
      this.shadowA[k] = L.shadow ?? 1;
      this.shadowSoftA[k] = L.shadowSoftness ?? this.gShadowSoftness;
      this.seedNumA[k] = seed;
      const depthPos = Math.min(1, k * this.colorStep);
      this.depthPosA[k] = depthPos;
      let rgb: number[];
      if (L.color) rgb = parseColor(L.color) ?? [1, 0.4, 0.7];
      else rgb = sampleRamp(pal, depthPos);
      this.colRA[k] = rgb[0];
      this.colGA[k] = rgb[1];
      this.colBA[k] = rgb[2];
      if (contours) {
        this.layerHomeX[k] = 0;
        this.layerHomeY[k] = 0;
      } else {
        this.layerHomeX[k] = (hashf(seed * 1.7 + 0.3) * 2 - 1) * 0.16;
        this.layerHomeY[k] = (hashf(seed * 3.1 + 1.1) * 2 - 1) * 0.11;
      }
    }
    const total = contours ? sharedCount : cursor;
    // Reseed only when the structure changes (counts, sizes, seeds), so tweaking a
    // scalar like spread at runtime never resets the source motion.
    let sig = `${N}|${contours ? 1 : 0}`;
    for (let k = 0; k < N; k++) sig += `|${this.srcCountA[k]},${this.sourceRadiusVarA[k]},${this.seedNumA[k]}`;
    if (sig !== this.structSig) {
      this.structSig = sig;
      this.seedSources(N, total, contours, sharedCount);
    }
    this.layerCount = N;
    this.totalSources = total;
    this.layersDirty = true;
  }

  /** Assign each source a fixed home direction, wander phases, freqs and size. */
  private seedSources(N: number, total: number, contours: boolean, sharedCount: number): void {
    const seeds = new Float32Array(Math.max(1, total) * SEED_STRIDE);
    const seedRange = (start: number, cnt: number, radVar: number, layerSeed: number): void => {
      for (let i = 0; i < cnt; i++) {
        const j = start + i;
        const o = j * SEED_STRIDE;
        const ang = GOLDEN * i + layerSeed * Math.PI * 2;
        seeds[o] = Math.cos(ang);
        seeds[o + 1] = Math.sin(ang);
        seeds[o + 2] = hashf(j * 12.9898 + layerSeed) * 25;
        seeds[o + 3] = hashf(j * 78.233 + layerSeed + 1.3) * 25;
        seeds[o + 4] = 0.7 + hashf(j * 3.17 + 2.1) * 0.6;
        seeds[o + 5] = 0.7 + hashf(j * 5.71 + 4.7) * 0.6;
        seeds[o + 6] = 1 + radVar * (hashf(j * 1.93 + 0.7) * 2 - 1);
        seeds[o + 7] = 1;
      }
    };
    if (contours) seedRange(0, sharedCount, this.sourceRadiusVarA[0], this.seedNumA[0]);
    else
      for (let k = 0; k < N; k++)
        seedRange(this.srcStartA[k], this.srcCountA[k], this.sourceRadiusVarA[k], this.seedNumA[k]);
    const n = Math.max(1, total);
    const prevAttrX = this.attrX;
    const prevAttrY = this.attrY;
    this.seedData = seeds;
    this.sourcesF32 = new Float32Array(n * 4);
    this.attrX = new Float32Array(n);
    this.attrY = new Float32Array(n);
    // Carry over the integrated attraction offsets of surviving sources so
    // changing the layer count does not jolt the existing layers. Layers are
    // added/removed at the front, so the source prefix maps 1:1 and the seeds of
    // unchanged layers are regenerated identically (deterministic from k and j).
    const keep = Math.min(prevAttrX.length, n);
    this.attrX.set(prevAttrX.subarray(0, keep));
    this.attrY.set(prevAttrY.subarray(0, keep));
    this.tmpX = new Float32Array(n);
    this.tmpY = new Float32Array(n);
  }

  private resize(): void {
    const root = this.root;
    const canvas = this.canvas;
    if (!root || !canvas) return;
    const rect = root.getBoundingClientRect();
    const pr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2) * this.resolutionScale);
    this.w = rect.width;
    this.h = rect.height;
    if (!this.pointerActive) {
      this.epx = rect.width * 0.5;
      this.epy = rect.height * 0.5;
    }
    canvas.width = Math.max(1, (rect.width * pr) | 0);
    canvas.height = Math.max(1, (rect.height * pr) | 0);
    if (this.ready && this.reduce?.matches) this.renderFrame();
  }

  public start(): void {
    if (this.started || !this.root || !this.canvas) return;
    this.started = true;
    const gen = ++this.gen;
    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.ro = new ResizeObserver(this.onResize);
    this.ro.observe(this.root);
    this.io = new IntersectionObserver(this.onIntersect);
    this.io.observe(this.root);
    document.addEventListener('visibilitychange', this.onVisibility);
    if (this.reactMode !== 0) window.addEventListener('pointermove', this.onPointerMove, {passive: true});
    const needWindow = this.scrollBindings.some((b) => (b.source ?? 'window') === 'window');
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
    this.layersBuf?.destroy();
    this.sourcesBuf?.destroy();
    this.colorBuf?.destroy();
    this.uniformBuf?.destroy();
    this.device?.destroy();
    this.device = null;
    this.gpuCtx = null;
    this.pipeline = this.pipelineAdd = null;
    this.bgLayout = null;
    this.uniformBuf = this.layersBuf = this.sourcesBuf = this.colorBuf = null;
    this.bindGroup = null;
    this.layersCap = this.sourcesCap = this.palCap = 0;
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
    this.uniformBuf = device.createBuffer({
      size: U_FLOATS * 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    if (this.colorDirty) this.prepColors();
    this.ensureGpuBuffers();
    this.ready = true;
    if (this.reduce?.matches) {
      // A pleasing frozen multi-blob pose for prefers-reduced-motion.
      this.morphPhase = 4;
      this.warpPhase = 2;
      this.driftPhase = 0;
      this.renderFrame();
    } else this.play();
  }

  private buildPipeline(device: GPUDevice, format: GPUTextureFormat): void {
    const module = device.createShaderModule({code: WGSL});
    const over: GPUBlendComponent = {srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add'};
    const add: GPUBlendComponent = {srcFactor: 'one', dstFactor: 'one', operation: 'add'};
    const bgLayout = device.createBindGroupLayout({
      entries: [
        {binding: 0, visibility: GPUShaderStage.FRAGMENT, buffer: {type: 'uniform'}},
        {binding: 1, visibility: GPUShaderStage.FRAGMENT, buffer: {type: 'read-only-storage'}},
        {binding: 2, visibility: GPUShaderStage.FRAGMENT, buffer: {type: 'read-only-storage'}},
        {binding: 3, visibility: GPUShaderStage.FRAGMENT, buffer: {type: 'read-only-storage'}},
      ],
    });
    this.bgLayout = bgLayout;
    const layout = device.createPipelineLayout({bindGroupLayouts: [bgLayout]});
    const mk = (blend: GPUBlendComponent): GPURenderPipeline =>
      device.createRenderPipeline({
        layout,
        vertex: {module, entryPoint: 'vs', buffers: []},
        fragment: {module, entryPoint: 'fs', targets: [{format, blend: {color: blend, alpha: blend}}]},
        primitive: {topology: 'triangle-list'},
      });
    this.pipeline = mk(over);
    this.pipelineAdd = mk(add);
  }

  /** (Re)create the layers/sources/palette storage buffers and the bind group. */
  private ensureGpuBuffers(): void {
    const device = this.device;
    const bgLayout = this.bgLayout;
    const uniformBuf = this.uniformBuf;
    if (!device || !bgLayout || !uniformBuf) return;
    const layersNeed = Math.max(1, this.layerCount);
    const sourcesNeed = Math.max(1, this.totalSources);
    const palNeed = Math.max(1, this.paletteRgb.length);
    let rebind = false;
    if (this.layersCap !== layersNeed || !this.layersBuf) {
      this.layersBuf?.destroy();
      this.layersBuf = device.createBuffer({
        size: layersNeed * FLOATS_PER_LAYER * 4,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });
      this.layersCap = layersNeed;
      this.layersDirty = true;
      rebind = true;
    }
    if (this.sourcesCap !== sourcesNeed || !this.sourcesBuf) {
      this.sourcesBuf?.destroy();
      this.sourcesBuf = device.createBuffer({
        size: sourcesNeed * 16,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });
      this.sourcesCap = sourcesNeed;
      rebind = true;
    }
    if (this.palCap !== palNeed || !this.colorBuf) {
      this.colorBuf?.destroy();
      this.colorBuf = device.createBuffer({
        size: palNeed * 16,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });
      this.palCap = palNeed;
      rebind = true;
    }
    if (rebind || !this.bindGroup) {
      this.bindGroup = device.createBindGroup({
        layout: bgLayout,
        entries: [
          {binding: 0, resource: {buffer: uniformBuf}},
          {binding: 1, resource: {buffer: this.layersBuf}},
          {binding: 2, resource: {buffer: this.sourcesBuf}},
          {binding: 3, resource: {buffer: this.colorBuf}},
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
    if (!root || this.reactMode === 0) return;
    const rect = root.getBoundingClientRect();
    if (this.pointerArea === 'element') {
      const inside =
        e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!inside) {
        this.pointerActive = false;
        return;
      }
    }
    this.targetPx = e.clientX - rect.left;
    this.targetPy = e.clientY - rect.top;
    if (!this.pointerActive) {
      this.epx = this.targetPx;
      this.epy = this.targetPy;
    }
    this.pointerActive = true;
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
    this.morphPhase += (this.morphSpeed + this.scrollDelta('morphSpeed')) * this.speed * dt;
    this.driftPhase += this.speed * dt;
    this.warpPhase += this.warpSpeed * this.speed * dt;
    this.ripplePhase += this.rippleSpeed * this.speed * dt;
    const kp = 1 - Math.exp(-12 * dt);
    this.epx += (this.targetPx - this.epx) * kp;
    this.epy += (this.targetPy - this.epy) * kp;
    if (this.activeK) this.updateSlots(dt);
    this.lastDt = dt;
    this.renderFrame();
  };

  /** Integrate the source positions for this frame into `sourcesF32`. */
  private updateSources(dt: number): void {
    const total = this.totalSources;
    if (total <= 0) return;
    const h = Math.max(1, this.h);
    const aspect = this.h > 0 ? this.w / this.h : 1;
    const f = this.sourcesF32;
    const seeds = this.seedData;
    const sSpread = this.scrollDelta('spread');
    const sAttr = this.scrollDelta('attraction');
    // Pointer reaction is a smooth global lean of the whole stack toward
    // ('attract') or away from ('part') the cursor, eased back to rest when the
    // pointer leaves. Translating the mass keeps each blob's shape intact, so it
    // reads as the liquid leaning rather than the jagged per-source distortion an
    // independent push produced.
    const lean = (this.reactMode === 1 || this.reactMode === 2) && this.pointerActive;
    const toward = this.reactMode === 2 ? 1 : -1;
    let tShiftX = 0;
    let tShiftY = 0;
    if (lean) {
      const gain = this.mouseStrength / 200;
      tShiftX = toward * (this.epx / h - aspect * 0.5) * gain;
      tShiftY = toward * (this.epy / h - 0.5) * gain;
    }
    const es = 1 - Math.exp(-6 * dt);
    this.gShiftX += (tShiftX - this.gShiftX) * es;
    this.gShiftY += (tShiftY - this.gShiftY) * es;
    const decay = 1 - Math.min(0.5, 0.4 * dt);
    const denom = this.layerCount > 1 ? this.layerCount - 1 : 1;
    const layersToRun = this.modeNum === 1 && !this.layersOpt ? 1 : this.layerCount;
    for (let k = 0; k < layersToRun; k++) {
      const start = this.srcStartA[k];
      const cnt = this.srcCountA[k];
      if (cnt <= 0) continue;
      const spread = Math.max(0, this.spreadA[k] + sSpread);
      const attraction = this.attractionA[k] + sAttr;
      const ph = this.morphPhase * this.morphMulA[k];
      const radius = this.sourceRadiusA[k];
      // Front layers lean a touch more than back layers for a subtle parallax.
      const par = 0.7 + 0.6 * (k / denom);
      const homeCx =
        aspect * this.originX + this.layerHomeX[k] + this.driftXA[k] * this.driftPhase + this.gShiftX * par;
      const homeCy = this.originY + this.layerHomeY[k] + this.driftYA[k] * this.driftPhase + this.gShiftY * par;
      let cx = 0;
      let cy = 0;
      for (let i = 0; i < cnt; i++) {
        const j = start + i;
        const so = j * SEED_STRIDE;
        const bx = homeCx + spread * seeds[so] + spread * fbm1(ph * seeds[so + 4] + seeds[so + 2]);
        const by = homeCy + spread * seeds[so + 1] + spread * fbm1(ph * seeds[so + 5] + seeds[so + 3]);
        this.tmpX[j] = bx;
        this.tmpY[j] = by;
        cx += bx;
        cy += by;
      }
      cx /= cnt;
      cy /= cnt;
      for (let i = 0; i < cnt; i++) {
        const j = start + i;
        const so = j * SEED_STRIDE;
        const bx = this.tmpX[j];
        const by = this.tmpY[j];
        let ax = (this.attrX[j] + (cx - bx) * attraction * dt) * decay;
        let ay = (this.attrY[j] + (cy - by) * attraction * dt) * decay;
        if (ax > spread) ax = spread;
        else if (ax < -spread) ax = -spread;
        if (ay > spread) ay = spread;
        else if (ay < -spread) ay = -spread;
        this.attrX[j] = ax;
        this.attrY[j] = ay;
        const rad = radius * seeds[so + 6] * (1 + 0.08 * Math.sin(ph * 1.3 + seeds[so + 2]));
        const o = j * 4;
        f[o] = bx + ax;
        f[o + 1] = by + ay;
        f[o + 2] = Math.max(0.01, rad);
        f[o + 3] = seeds[so + 7];
      }
    }
  }

  /** Update buffers and issue the single full-screen draw. */
  private renderFrame(): void {
    const device = this.device;
    const ctx = this.gpuCtx;
    const pipeline = this.pipeline;
    if (!this.ready || !device || !ctx || !pipeline) return;
    if (this.colorDirty) this.rebuildLayers();
    this.ensureGpuBuffers();
    const uniformBuf = this.uniformBuf;
    const layersBuf = this.layersBuf;
    const sourcesBuf = this.sourcesBuf;
    const colorBuf = this.colorBuf;
    const bindGroup = this.bindGroup;
    if (!uniformBuf || !layersBuf || !sourcesBuf || !colorBuf || !bindGroup) return;

    this.writeUniforms();
    device.queue.writeBuffer(uniformBuf, 0, this.uniformF32);
    if (this.layersDirty) {
      this.writeLayers();
      device.queue.writeBuffer(layersBuf, 0, this.layersF32, 0, this.layerCount * FLOATS_PER_LAYER);
      this.layersDirty = false;
    }
    this.updateSources(this.lastDt);
    device.queue.writeBuffer(sourcesBuf, 0, this.sourcesF32, 0, this.totalSources * 4);
    this.writeColors();
    device.queue.writeBuffer(colorBuf, 0, this.colorF32, 0, this.colorCount * 4);

    const view = ctx.getCurrentTexture().createView();
    const enc = device.createCommandEncoder();
    const pass = enc.beginRenderPass({
      colorAttachments: [{view, clearValue: {r: 0, g: 0, b: 0, a: 0}, loadOp: 'clear', storeOp: 'store'}],
    });
    pass.setPipeline(this.additive ? (this.pipelineAdd ?? pipeline) : pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(3);
    pass.end();
    device.queue.submit([enc.finish()]);
  }

  private writeLayers(): void {
    const N = this.layerCount;
    if (this.layersF32.length < N * FLOATS_PER_LAYER)
      this.layersF32 = new Float32Array(Math.max(1, N) * FLOATS_PER_LAYER);
    const f = this.layersF32;
    for (let k = 0; k < N; k++) {
      const o = k * FLOATS_PER_LAYER;
      f[o] = this.levelA[k];
      f[o + 1] = this.srcStartA[k];
      f[o + 2] = this.srcCountA[k];
      f[o + 3] = this.warpA[k];
      f[o + 4] = this.warpScaleA[k];
      f[o + 5] = this.opacityA[k];
      f[o + 6] = this.elevationA[k];
      f[o + 7] = this.shadowA[k];
      f[o + 8] = this.colRA[k];
      f[o + 9] = this.colGA[k];
      f[o + 10] = this.colBA[k];
      f[o + 11] = this.shadowSoftA[k];
      f[o + 12] = this.octavesA[k];
      f[o + 13] = this.roughnessA[k];
      f[o + 14] = this.seedNumA[k];
      f[o + 15] = this.depthPosA[k];
    }
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
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const h = Math.max(1, this.h);
    const active = this.reactMode !== 0 && this.pointerActive;
    f[0] = this.t;
    f[1] = dpr;
    f[2] = this.w;
    f[3] = this.h;
    f[4] = this.layerCount;
    f[5] = this.colorCount;
    f[6] = this.colorModeNum;
    f[7] = this.modeNum;
    f[8] = this.lightAngle + this.scrollDelta('lightAngle');
    f[9] = Math.max(0, this.shadow + this.scrollDelta('shadow'));
    f[10] = this.shadowOffset;
    f[11] = this.gShadowSoftness;
    f[12] = Math.max(0, this.sheen + this.scrollDelta('sheen'));
    f[13] = this.rimPower;
    f[14] = 1;
    f[15] = this.bgA;
    f[16] = this.bgR;
    f[17] = this.bgG;
    f[18] = this.bgB;
    f[19] = this.warpPhase;
    f[20] = active ? this.epx / h : -1e9;
    f[21] = active ? this.epy / h : -1e9;
    f[22] = this.mouseRadius / h;
    f[23] = this.reactMode;
    f[24] = this.rippleAmount;
    f[25] = this.rippleFreq;
    f[26] = this.ripplePhase;
    f[27] = this.mouseStrength / h;
    f[28] = this.scrollDelta('level');
    f[29] = this.scrollDelta('warp');
    f[30] = Math.max(1, this.shadowSteps | 0);
    f[31] = 0;
  }
}

const hashf = (x: number): number => {
  const s = Math.sin(x) * 43758.5453;
  return s - Math.floor(s);
};

// Smooth deterministic 1D wander in roughly [-1, 1] (a tiny sum of sines).
const fbm1 = (x: number): number =>
  (Math.sin(x) + 0.5 * Math.sin(2.17 * x + 1.3) + 0.25 * Math.sin(4.13 * x + 3.7)) / 1.75;

const sampleRamp = (pal: number[][], t: number): number[] => {
  const n = pal.length;
  if (n === 0) return [1, 0.4, 0.7];
  if (n === 1) return pal[0];
  const x = (t < 0 ? 0 : t > 1 ? 1 : t) * (n - 1);
  const i0 = Math.floor(x);
  const i1 = Math.min(i0 + 1, n - 1);
  const fr = x - i0;
  const a = pal[i0];
  const b = pal[i1];
  return [a[0] + (b[0] - a[0]) * fr, a[1] + (b[1] - a[1]) * fr, a[2] + (b[2] - a[2]) * fr];
};

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
