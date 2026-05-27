import {WGSL} from './shader';
import type {ScrollBinding, SheetFieldOptions} from './types';

const DEFAULT_COLORS = ['#5b8cff', '#8b5cf6', '#ec4899', '#fb923c'];
const STYLES: Record<string, number> = {fill: 0, lines: 1, dots: 2};
const U_FLOATS = 128;
const BIG = 1e30;
const fin = (v: number): number => (v === Infinity ? BIG : v === -Infinity ? -BIG : v);

/**
 * WebGPU SheetField: one large draped sheet (a "blanket"). A single subdivided
 * plane is twisted about its forward axis (the slide twist) and rippled by a
 * fold field, then viewed by a camera tilted toward edge-on, so it fans, pinches
 * to a waist, and fans again, the Stripe-style ribbon hero as one continuous
 * surface. The whole surface is a pure function of `(s, v, time)`, so there is no
 * compute pass: one indexed draw of a procedural grid, the CPU only advances
 * time, eases the pointer, and rotates a few color slots.
 *
 * No fallback path: if WebGPU is unavailable the component renders nothing.
 */
export class SheetFieldGpuState {
  // The sheet.
  private segments = 800;
  private columns = 300;
  private lengthV = 4.4;
  private widthV = 1.5;
  private forward: [number, number, number] = [1.5, 0, 0.5];
  private tilt = 0.45;
  private taper = 0.12;
  private colors = DEFAULT_COLORS;

  // Slide twist.
  private twistBase = 0;
  private twistTurns = 0.55;
  private twistWave = 0.12;
  private twistFreq = 2;
  private twistSpeed = 0.2;

  // Folds.
  private foldAmp = 0.3;
  private foldLateral = 0.08;
  private foldFreq = 1.3;
  private foldSpeed = 0.3;
  private shapeOctaves = 3;
  private shapeRoughness = 0.6;
  private flowScale = 1;
  private pulseAmp = 0;
  private pulseSpeed = 0.5;

  // Color.
  private colorMode: 'gradient' | 'palette' = 'gradient';
  private colorAlong = 0.9;
  private colorAcross = 0.12;
  private colorActive = 4;
  private colorChangeSpeed = 1;
  private cBase = 0;
  private cRand = 0;
  private cWave = 0.05;
  private cFreq = 0.8;
  private cSpeed = 0.2;
  private cMin = -Infinity;
  private cMax = Infinity;

  // Fibers.
  private fibers = true;
  private fiberCount = 220;
  private fiberContrast = 0.35;
  private fiberShear = 0.3;
  private fiberDrift = 0.03;
  private fiberSharpness = 4;
  private fiberJitter = 0.45;
  private fiberVariation = 0.55;
  private fiberGaps = 0.3;
  private fiberGlint = 0.5;

  // Drawing style: 0 fill (solid), 1 lines (transparent gaps), 2 dots (dashed).
  private style = 0;
  private lineCount = 40;
  private lineWidth = 0.5;
  private lineShear = 0;
  private dotCount = 60;
  private dotWidth = 0.5;

  // Lighting.
  private light = true;
  private ambient = 0.58;
  private diffuse = 0.6;
  private specular = 0.15;
  private shininess = 11;
  private specColorRgb = [1, 1, 1];
  private rim = 0.98;
  private rimPower = 3;
  private lightDir: [number, number, number] = [0.2, 0.6, 0.7];
  private lightFollowsMouse = true;

  // Surface effects.
  private fog = 0;
  private fogColorRgb = [0.5, 0.5, 0.6];
  private glow = 0;
  private vignette = 0.1;
  private opacity = 1;
  private additive = false;

  // Motion + camera.
  private yawSpeed = 0;
  private pitchAmp = 0;
  private pitchSpeed = 0.2;
  private perspective = 7;
  private radiusFrac = 1;
  private centerDrift = 0;
  private centerDriftSpeed = 0.4;
  private fps = 0;

  // Mouse.
  private reactToMouse = true;
  private tiltMax = 0.2;
  private followMouse = true;
  private followStrength = 0.05;
  private followReach = 0.4;
  private bendMouse = false;
  private bendRadius = 160;
  private bendStrength = 50;
  private pointerArea: 'window' | 'element' = 'element';

  // Scroll.
  private scrollYaw = 0;
  private scrollPulse = 0;
  private scrollBindings: ScrollBinding[] = [];
  private winNormX = 0;
  private winNormY = 0;
  private elNormX = 0;
  private elNormY = 0;
  private scroller: HTMLElement | null = null;
  private scrollTarget: EventTarget | null = null;

  // Procedural grid (rebuilt when segments/columns change).
  private gridVerts = new Float32Array(0);
  private gridIdx = new Uint32Array(0);
  private indexCount = 0;
  private gridBuilt = false;

  // Color palette + rotating active slots.
  private paletteRgb: number[][] = [];
  private colorCount = 0;
  private activeK = 0;
  private slotR = new Float32Array(0);
  private slotG = new Float32Array(0);
  private slotB = new Float32Array(0);
  private slotTarget = new Int32Array(0);
  private slotNext = new Float32Array(0);
  private colorDirty = true;

  // DOM + viewport (CSS px; dpr only scales the canvas backing store).
  private root: HTMLDivElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private w = 0;
  private h = 0;
  // Screen anchor for the sheet center, as fractions of the container (0.5 = center).
  private originX = 0.5;
  private originY = 0.5;
  private cx = 0;
  private cy = 0;
  private radiusPx = 0;

  // Animation clock + eased pointer.
  private t = 0;
  private last = 0;
  private acc = 0;
  // Per-channel accumulated phases (phase += speed * dt). Decoupling phase from
  // absolute time keeps animation continuous when a speed is changed at runtime:
  // the rate changes going forward instead of rescaling the whole phase history.
  private foldPhase = 0;
  private twistPhase = 0;
  private colorPhase = 0;
  private fiberPhase = 0;
  private yawPhase = 0;
  private pitchPhase = 0;
  private pulsePhase = 0;
  private cdPhase = 0;
  private mYaw = 0;
  private mPitch = 0;
  private targetYaw = 0;
  private targetPitch = 0;
  private followX = 0;
  private followY = 0;
  private targetFollowX = 0;
  private targetFollowY = 0;
  private lightX = 0;
  private lightY = 0;
  private targetLightX = 0;
  private targetLightY = 0;
  private pointerX = -1e9;
  private pointerY = -1e9;

  // GPU objects + staging arrays.
  private device: GPUDevice | null = null;
  private gpuCtx: GPUCanvasContext | null = null;
  private format: GPUTextureFormat = 'bgra8unorm';
  private pipeline: GPURenderPipeline | null = null;
  private pipelineAdd: GPURenderPipeline | null = null;
  private bgLayout: GPUBindGroupLayout | null = null;
  private uniformBuf: GPUBuffer | null = null;
  private vertexBuf: GPUBuffer | null = null;
  private indexBuf: GPUBuffer | null = null;
  private colorBuf: GPUBuffer | null = null;
  private bindGroup: GPUBindGroup | null = null;
  private depthTexture: GPUTexture | null = null;
  private msaaTexture: GPUTexture | null = null;
  private depthView: GPUTextureView | null = null;
  private msaaView: GPUTextureView | null = null;
  private pxW = 0;
  private pxH = 0;
  private vertexBufBytes = 0;
  private indexBufBytes = 0;
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

  constructor(opts: SheetFieldOptions = {}) {
    this.setOptions(opts);
  }

  public setOptions(o: SheetFieldOptions): void {
    const prevSeg = this.segments;
    const prevCol = this.columns;
    this.segments = o.segments ?? this.segments;
    this.columns = o.columns ?? this.columns;
    this.lengthV = o.length ?? this.lengthV;
    this.widthV = o.width ?? this.widthV;
    if (o.forward) this.forward = o.forward;
    this.tilt = o.tilt ?? this.tilt;
    this.taper = o.taper ?? this.taper;
    this.twistBase = o.twistBase ?? this.twistBase;
    this.twistTurns = o.twistTurns ?? this.twistTurns;
    this.twistWave = o.twistWave ?? this.twistWave;
    this.twistFreq = o.twistFreq ?? this.twistFreq;
    this.twistSpeed = o.twistSpeed ?? this.twistSpeed;
    this.foldAmp = o.foldAmp ?? this.foldAmp;
    this.foldLateral = o.foldLateral ?? this.foldLateral;
    this.foldFreq = o.foldFreq ?? this.foldFreq;
    this.foldSpeed = o.foldSpeed ?? this.foldSpeed;
    this.shapeOctaves = o.shapeOctaves ?? this.shapeOctaves;
    this.shapeRoughness = o.shapeRoughness ?? this.shapeRoughness;
    this.flowScale = o.flowScale ?? this.flowScale;
    this.pulseAmp = o.pulse ?? this.pulseAmp;
    this.pulseSpeed = o.pulseSpeed ?? this.pulseSpeed;
    const prevMode = this.colorMode;
    if (o.colorMode) this.colorMode = o.colorMode;
    this.colorAlong = o.colorAlong ?? this.colorAlong;
    this.colorAcross = o.colorAcross ?? this.colorAcross;
    const prevActive = this.colorActive;
    this.colorActive = o.colorActive ?? this.colorActive;
    this.colorChangeSpeed = o.colorChangeSpeed ?? this.colorChangeSpeed;
    const cl = o.color;
    if (cl) {
      this.cBase = cl.base ?? this.cBase;
      this.cRand = cl.random ?? this.cRand;
      this.cWave = cl.wave ?? this.cWave;
      this.cFreq = cl.waveFreq ?? this.cFreq;
      this.cSpeed = cl.waveSpeed ?? this.cSpeed;
      this.cMin = cl.min ?? this.cMin;
      this.cMax = cl.max ?? this.cMax;
    }
    this.fibers = o.fibers ?? this.fibers;
    this.fiberCount = o.fiberCount ?? this.fiberCount;
    this.fiberContrast = o.fiberContrast ?? this.fiberContrast;
    this.fiberShear = o.fiberShear ?? this.fiberShear;
    this.fiberDrift = o.fiberDrift ?? this.fiberDrift;
    this.fiberSharpness = o.fiberSharpness ?? this.fiberSharpness;
    this.fiberJitter = o.fiberJitter ?? this.fiberJitter;
    this.fiberVariation = o.fiberVariation ?? this.fiberVariation;
    this.fiberGaps = o.fiberGaps ?? this.fiberGaps;
    this.fiberGlint = o.fiberGlint ?? this.fiberGlint;
    if (o.style !== undefined) this.style = STYLES[o.style] ?? 0;
    this.lineCount = o.lineCount ?? this.lineCount;
    this.lineWidth = o.lineWidth ?? this.lineWidth;
    this.lineShear = o.lineShear ?? this.lineShear;
    this.dotCount = o.dotCount ?? this.dotCount;
    this.dotWidth = o.dotWidth ?? this.dotWidth;
    this.light = o.light ?? this.light;
    this.ambient = o.ambient ?? this.ambient;
    this.diffuse = o.diffuse ?? this.diffuse;
    this.specular = o.specular ?? this.specular;
    this.shininess = o.shininess ?? this.shininess;
    if (o.specColor) this.specColorRgb = parseColor(o.specColor) ?? this.specColorRgb;
    this.rim = o.rim ?? this.rim;
    this.rimPower = o.rimPower ?? this.rimPower;
    if (o.lightDir) this.lightDir = o.lightDir;
    this.lightFollowsMouse = o.lightFollowsMouse ?? this.lightFollowsMouse;
    this.fog = o.fog ?? this.fog;
    if (o.fogColor) this.fogColorRgb = parseColor(o.fogColor) ?? this.fogColorRgb;
    this.glow = o.glow ?? this.glow;
    this.vignette = o.vignette ?? this.vignette;
    this.opacity = o.opacity ?? this.opacity;
    this.additive = o.additive ?? this.additive;
    this.yawSpeed = o.yawSpeed ?? this.yawSpeed;
    this.pitchAmp = o.pitchAmp ?? this.pitchAmp;
    this.pitchSpeed = o.pitchSpeed ?? this.pitchSpeed;
    this.perspective = o.perspective ?? this.perspective;
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
    this.centerDrift = o.centerDrift ?? this.centerDrift;
    this.centerDriftSpeed = o.centerDriftSpeed ?? this.centerDriftSpeed;
    this.fps = o.fps ?? this.fps;
    this.reactToMouse = o.reactToMouse ?? this.reactToMouse;
    this.tiltMax = o.tiltMax ?? this.tiltMax;
    this.followMouse = o.followMouse ?? this.followMouse;
    this.followStrength = o.followStrength ?? this.followStrength;
    this.followReach = o.followReach ?? this.followReach;
    this.bendMouse = o.bendMouse ?? this.bendMouse;
    this.bendRadius = o.bendRadius ?? this.bendRadius;
    this.bendStrength = o.bendStrength ?? this.bendStrength;
    this.pointerArea = o.pointerArea ?? this.pointerArea;
    this.scrollYaw = o.scrollYaw ?? this.scrollYaw;
    this.scrollPulse = o.scrollPulse ?? this.scrollPulse;
    this.scrollBindings = o.scrollBindings ?? this.scrollBindings;
    if (o.colors && !colorsEqual(o.colors, this.colors)) {
      this.colors = o.colors;
      this.colorDirty = true;
    }
    if (this.colorActive !== prevActive || this.colorMode !== prevMode) this.colorDirty = true;
    if (this.gridBuilt && (this.segments !== prevSeg || this.columns !== prevCol)) {
      this.buildGrid();
      this.uploadGrid();
    }
  }

  public readonly setRoot = (el: HTMLDivElement | null): void => {
    this.root = el;
  };

  public readonly setCanvas = (el: HTMLCanvasElement | null): void => {
    this.canvas = el;
  };

  private buildGrid(): void {
    const ns = Math.max(1, this.segments | 0);
    const nv = Math.max(1, this.columns | 0);
    const vx = ns + 1;
    const vy = nv + 1;
    const verts = new Float32Array(vx * vy * 2);
    let o = 0;
    for (let i = 0; i < vx; i++) {
      const s = i / ns;
      for (let j = 0; j < vy; j++) {
        verts[o++] = s;
        verts[o++] = j / nv;
      }
    }
    const idx = new Uint32Array(ns * nv * 6);
    let q = 0;
    for (let i = 0; i < ns; i++) {
      for (let j = 0; j < nv; j++) {
        const a = i * vy + j;
        const b = (i + 1) * vy + j;
        const c = (i + 1) * vy + (j + 1);
        const d = i * vy + (j + 1);
        idx[q++] = a;
        idx[q++] = b;
        idx[q++] = c;
        idx[q++] = a;
        idx[q++] = c;
        idx[q++] = d;
      }
    }
    this.gridVerts = verts;
    this.gridIdx = idx;
    this.indexCount = idx.length;
    this.gridBuilt = true;
  }

  private prepColors(): void {
    this.colorDirty = false;
    const pal = parsePalette(this.colors);
    this.paletteRgb = pal;
    const np = pal.length;
    const K = this.colorMode === 'palette' && this.colorActive >= 1 && this.colorActive < np ? this.colorActive : 0;
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
    if (this.device) this.ensureTextures();
    if (this.ready && this.reduce?.matches) this.renderFrame();
  }

  public start(): void {
    if (this.started || !this.root || !this.canvas) return;
    this.started = true;
    const gen = ++this.gen;
    if (!this.gridBuilt) this.buildGrid();
    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.ro = new ResizeObserver(this.onResize);
    this.ro.observe(this.root);
    this.io = new IntersectionObserver(this.onIntersect);
    this.io.observe(this.root);
    document.addEventListener('visibilitychange', this.onVisibility);
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
    this.depthTexture?.destroy();
    this.msaaTexture?.destroy();
    this.depthTexture = this.msaaTexture = null;
    this.depthView = this.msaaView = null;
    this.device?.destroy();
    this.device = null;
    this.gpuCtx = null;
    this.pipeline = this.pipelineAdd = null;
    this.bgLayout = null;
    this.uniformBuf = this.vertexBuf = this.indexBuf = this.colorBuf = null;
    this.bindGroup = null;
    this.pxW = this.pxH = 0;
    this.vertexBufBytes = this.indexBufBytes = 0;
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
    this.format = format;
    this.buildPipeline(device, format);
    this.uniformBuf = device.createBuffer({
      size: U_FLOATS * 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.uploadGrid();
    this.ensureTextures();
    if (this.colorDirty) this.prepColors();
    this.ensureColorBuf();
    this.ready = true;
    if (this.reduce?.matches) {
      this.t = 6.3;
      this.renderFrame();
    } else this.play();
  }

  private buildPipeline(device: GPUDevice, format: GPUTextureFormat): void {
    const module = device.createShaderModule({code: WGSL});
    const over: GPUBlendComponent = {srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add'};
    const add: GPUBlendComponent = {srcFactor: 'one', dstFactor: 'one', operation: 'add'};
    const bgLayout = device.createBindGroupLayout({
      entries: [
        {binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: {type: 'uniform'}},
        {
          binding: 1,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: {type: 'read-only-storage'},
        },
      ],
    });
    this.bgLayout = bgLayout;
    const layout = device.createPipelineLayout({bindGroupLayouts: [bgLayout]});
    const buffers: GPUVertexBufferLayout[] = [
      {arrayStride: 8, stepMode: 'vertex', attributes: [{shaderLocation: 0, offset: 0, format: 'float32x2'}]},
    ];
    const mk = (blend: GPUBlendComponent, depthWrite: boolean, depthCompare: GPUCompareFunction): GPURenderPipeline =>
      device.createRenderPipeline({
        layout,
        vertex: {module, entryPoint: 'vs', buffers},
        fragment: {module, entryPoint: 'fs', targets: [{format, blend: {color: blend, alpha: blend}}]},
        primitive: {topology: 'triangle-list', cullMode: 'none'},
        depthStencil: {format: 'depth24plus', depthWriteEnabled: depthWrite, depthCompare},
        multisample: {count: 4},
      });
    this.pipeline = mk(over, true, 'less');
    this.pipelineAdd = mk(add, false, 'always');
  }

  /** (Re)create the MSAA color + depth textures sized to the canvas backing store. */
  private ensureTextures(): void {
    const device = this.device;
    const canvas = this.canvas;
    if (!device || !canvas) return;
    const w = Math.max(1, canvas.width);
    const h = Math.max(1, canvas.height);
    if (w === this.pxW && h === this.pxH && this.depthView && this.msaaView) return;
    this.pxW = w;
    this.pxH = h;
    this.depthTexture?.destroy();
    this.msaaTexture?.destroy();
    this.depthTexture = device.createTexture({
      size: {width: w, height: h},
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
      sampleCount: 4,
    });
    this.msaaTexture = device.createTexture({
      size: {width: w, height: h},
      format: this.format,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
      sampleCount: 4,
    });
    this.depthView = this.depthTexture.createView();
    this.msaaView = this.msaaTexture.createView();
  }

  /** (Re)upload the grid vertex + index buffers; recreate them if sizes changed. */
  private uploadGrid(): void {
    const device = this.device;
    if (!device) return;
    if (!this.gridBuilt) this.buildGrid();
    const vbytes = this.gridVerts.byteLength;
    if (!this.vertexBuf || this.vertexBufBytes !== vbytes) {
      this.vertexBuf?.destroy();
      this.vertexBuf = makeBuffer(device, this.gridVerts, GPUBufferUsage.VERTEX);
      this.vertexBufBytes = vbytes;
    } else {
      device.queue.writeBuffer(this.vertexBuf, 0, this.gridVerts);
    }
    const ibytes = this.gridIdx.byteLength;
    if (!this.indexBuf || this.indexBufBytes !== ibytes) {
      this.indexBuf?.destroy();
      this.indexBuf = makeBuffer(device, this.gridIdx, GPUBufferUsage.INDEX);
      this.indexBufBytes = ibytes;
    } else {
      device.queue.writeBuffer(this.indexBuf, 0, this.gridIdx);
    }
  }

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
    if (!this.reactToMouse && !this.followMouse && !this.bendMouse && !this.lightFollowsMouse) return;
    const rect = root.getBoundingClientRect();
    // In 'element' mode only react while the pointer is over the box; outside it,
    // ease every pointer-driven target back to rest and park the pointer offscreen.
    if (this.pointerArea === 'element') {
      const inside =
        e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!inside) {
        this.targetYaw = 0;
        this.targetPitch = 0;
        this.targetFollowX = 0;
        this.targetFollowY = 0;
        this.targetLightX = 0;
        this.targetLightY = 0;
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
    const ndcX = clamp(offX / halfW, -1, 1);
    const ndcY = clamp(offY / halfH, -1, 1);
    if (this.reactToMouse) {
      this.targetYaw = ndcX * this.tiltMax;
      this.targetPitch = -ndcY * this.tiltMax;
    }
    if (this.followMouse) {
      const maxX = halfW * this.followReach;
      const maxY = halfH * this.followReach;
      this.targetFollowX = clamp(offX * this.followStrength, -maxX, maxX);
      this.targetFollowY = clamp(offY * this.followStrength, -maxY, maxY);
    }
    if (this.lightFollowsMouse) {
      this.targetLightX = ndcX;
      this.targetLightY = -ndcY;
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
    // Accumulate per-channel phase so changing a speed at runtime never jumps.
    this.foldPhase += this.foldSpeed * dt;
    this.twistPhase += this.twistSpeed * dt;
    this.colorPhase += this.cSpeed * dt;
    this.fiberPhase += this.fiberDrift * dt;
    this.yawPhase += this.yawSpeed * dt;
    this.pitchPhase += this.pitchSpeed * dt;
    this.pulsePhase += this.pulseSpeed * dt;
    this.cdPhase += this.centerDriftSpeed * dt;
    // Ease disabled pointer features back to neutral when toggled off.
    if (!this.reactToMouse) {
      this.targetYaw = 0;
      this.targetPitch = 0;
    }
    if (!this.followMouse) {
      this.targetFollowX = 0;
      this.targetFollowY = 0;
    }
    if (!this.lightFollowsMouse) {
      this.targetLightX = 0;
      this.targetLightY = 0;
    }
    const kt = 1 - Math.exp(-4 * dt);
    this.mYaw += (this.targetYaw - this.mYaw) * kt;
    this.mPitch += (this.targetPitch - this.mPitch) * kt;
    this.lightX += (this.targetLightX - this.lightX) * kt;
    this.lightY += (this.targetLightY - this.lightY) * kt;
    const kf = 1 - Math.exp(-2.5 * dt);
    this.followX += (this.targetFollowX - this.followX) * kf;
    this.followY += (this.targetFollowY - this.followY) * kf;
    if (this.activeK) this.updateSlots(dt);
    this.renderFrame();
  };

  /** Update uniforms + colors and issue the single indexed draw. */
  private renderFrame(): void {
    const device = this.device;
    const ctx = this.gpuCtx;
    const pipeline = this.pipeline;
    if (!this.ready || !device || !ctx || !pipeline) return;
    if (this.colorDirty) {
      this.prepColors();
      this.ensureColorBuf();
    }
    this.ensureTextures();
    const uniformBuf = this.uniformBuf;
    const vertexBuf = this.vertexBuf;
    const indexBuf = this.indexBuf;
    const colorBuf = this.colorBuf;
    const bindGroup = this.bindGroup;
    const depthView = this.depthView;
    const msaaView = this.msaaView;
    if (!uniformBuf || !vertexBuf || !indexBuf || !colorBuf || !bindGroup || !depthView || !msaaView) return;

    this.writeUniforms();
    device.queue.writeBuffer(uniformBuf, 0, this.uniformF32);
    this.writeColors();
    device.queue.writeBuffer(colorBuf, 0, this.colorF32, 0, this.colorCount * 4);

    const view = ctx.getCurrentTexture().createView();
    const enc = device.createCommandEncoder();
    const pass = enc.beginRenderPass({
      colorAttachments: [
        {view: msaaView, resolveTarget: view, clearValue: {r: 0, g: 0, b: 0, a: 0}, loadOp: 'clear', storeOp: 'store'},
      ],
      depthStencilAttachment: {view: depthView, depthClearValue: 1.0, depthLoadOp: 'clear', depthStoreOp: 'store'},
    });
    pass.setBindGroup(0, bindGroup);
    pass.setVertexBuffer(0, vertexBuf);
    pass.setIndexBuffer(indexBuf, 'uint32');
    pass.setPipeline(this.additive ? (this.pipelineAdd ?? pipeline) : pipeline);
    pass.drawIndexed(this.indexCount);
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
    const yaw = this.yawPhase + this.mYaw + this.scrollYaw * this.winNormY + this.scrollDelta('yaw');
    const pitch =
      this.tilt +
      Math.sin(this.pitchPhase) * this.pitchAmp +
      this.mPitch +
      this.scrollDelta('pitch') +
      this.scrollDelta('tilt');
    const pulse =
      this.pulseAmp * Math.sin(this.pulsePhase) + this.scrollPulse * this.winNormY + this.scrollDelta('pulse');
    const foldAmpEff = (this.foldAmp + this.scrollDelta('fold')) * (1 + pulse);
    const twistTurns = this.twistTurns + this.scrollDelta('twist');

    // Sheet basis: forward (long axis), right0 (in-plane across), up0 (normal).
    const [fx, fy, fz] = norm3(this.forward[0], this.forward[1], this.forward[2]);
    // right0 = up x forward (fall back if forward is nearly vertical).
    let rx = 1 * fz - 0 * fy;
    let ry = 0 * fx - 0 * fz;
    let rz = 0 * fy - 1 * fx;
    if (rx * rx + ry * ry + rz * rz < 1e-6) {
      rx = 1;
      ry = 0;
      rz = 0;
    }
    [rx, ry, rz] = norm3(rx, ry, rz);
    // up0 = forward x right0.
    const ux = fy * rz - fz * ry;
    const uy = fz * rx - fx * rz;
    const uz = fx * ry - fy * rx;

    const cd = this.centerDrift + this.scrollDelta('centerDrift');
    const cp = this.cdPhase;
    const depthRange = Math.max(6, this.lengthV + this.widthV + this.foldAmp + 2);

    // v0: time, dpr, scale, segments
    f[0] = t;
    f[1] = dpr;
    f[2] = this.radiusPx;
    f[3] = Math.max(1, this.segments | 0);
    // v1: resX, resY, centerX, centerY
    f[4] = this.w;
    f[5] = this.h;
    f[6] = this.cx + this.followX;
    f[7] = this.cy + this.followY;
    // v2: yaw, pitch, perspective, depthRange
    f[8] = yaw;
    f[9] = pitch;
    f[10] = this.perspective + this.scrollDelta('perspective');
    f[11] = depthRange;
    // v3: forward.xyz, length
    f[12] = fx;
    f[13] = fy;
    f[14] = fz;
    f[15] = this.lengthV;
    // v4: right0.xyz, width
    f[16] = rx;
    f[17] = ry;
    f[18] = rz;
    f[19] = this.widthV;
    // v5: up0.xyz, columns
    f[20] = ux;
    f[21] = uy;
    f[22] = uz;
    f[23] = Math.max(1, this.columns | 0);
    // v6: center.xyz (drift), taper
    f[24] = cd * Math.sin(cp * 0.31) * Math.cos(cp * 0.21 + 1.3);
    f[25] = cd * Math.sin(cp * 0.27 + 2.1);
    f[26] = cd * Math.sin(cp * 0.19 + 4.2) * 0.6;
    f[27] = this.taper;
    // v7: foldAmp, foldLateral, foldFreq, foldPhase
    f[28] = foldAmpEff;
    f[29] = this.foldLateral;
    f[30] = this.foldFreq;
    f[31] = this.foldPhase;
    // v8: shapeOctaves, shapeRoughness, flowScale, _
    f[32] = Math.max(1, this.shapeOctaves | 0);
    f[33] = this.shapeRoughness;
    f[34] = this.flowScale;
    f[35] = 0;
    // v9: twistBase, twistTurns, twistWave, twistFreq
    f[36] = this.twistBase;
    f[37] = twistTurns;
    f[38] = this.twistWave;
    f[39] = this.twistFreq;
    // v10: twistPhase, _, _, _
    f[40] = this.twistPhase;
    f[41] = 0;
    f[42] = 0;
    f[43] = 0;
    // col0: colBase, colAlong, colAcross, colRandom
    f[44] = this.cBase;
    f[45] = this.colorAlong;
    f[46] = this.colorAcross;
    f[47] = this.cRand;
    // col1: colWave, colFreq, colPhase, colorCount
    f[48] = this.cWave;
    f[49] = this.cFreq;
    f[50] = this.colorPhase;
    f[51] = this.colorCount;
    // col2: colMin, colMax, _, _
    f[52] = fin(this.cMin);
    f[53] = fin(this.cMax);
    f[54] = 0;
    f[55] = 0;
    // fib0: fiberOn, fiberCount, fiberContrast, fiberShear
    f[56] = this.fibers ? 1 : 0;
    f[57] = this.fiberCount;
    f[58] = this.fiberContrast;
    f[59] = this.fiberShear;
    // fib1: fiberPhase, fiberSharpness, fiberJitter, _
    f[60] = this.fiberPhase;
    f[61] = this.fiberSharpness;
    f[62] = this.fiberJitter;
    f[63] = 0;
    // lit0: lightDir.xyz, ambient
    let lx = this.lightDir[0];
    let ly = this.lightDir[1];
    let lz = this.lightDir[2];
    if (this.lightFollowsMouse) {
      lx = this.lightX;
      ly = this.lightY;
      lz = 0.8;
    }
    const ll = Math.hypot(lx, ly, lz) || 1;
    f[64] = lx / ll;
    f[65] = ly / ll;
    f[66] = lz / ll;
    f[67] = this.ambient;
    // lit1: diffuse, specular, shininess, rim
    f[68] = this.diffuse;
    f[69] = this.specular;
    f[70] = Math.max(1, this.shininess);
    f[71] = this.rim;
    // lit2: specColor.xyz, rimPower
    f[72] = this.specColorRgb[0];
    f[73] = this.specColorRgb[1];
    f[74] = this.specColorRgb[2];
    f[75] = this.rimPower;
    // fx0: fog, fogColor.xyz
    f[76] = this.fog;
    f[77] = this.fogColorRgb[0];
    f[78] = this.fogColorRgb[1];
    f[79] = this.fogColorRgb[2];
    // fx1: glow, vignette, opacity, lightOn
    f[80] = this.glow + this.scrollDelta('glow');
    f[81] = this.vignette;
    f[82] = this.opacity;
    f[83] = this.light ? 1 : 0;
    // pt0: pointerX, pointerY, bendRadius, bendStrength
    f[84] = this.pointerX;
    f[85] = this.pointerY;
    f[86] = this.bendRadius;
    f[87] = this.bendMouse ? this.bendStrength : 0;
    // fib2: fiberGlint, fiberVariation, fiberGaps, fiberGaps
    f[88] = this.fiberGlint;
    f[89] = this.fiberVariation;
    f[90] = this.fiberGaps;
    f[91] = this.fiberGaps;
    // sp1: style, lineCount, lineWidth, lineShear
    f[92] = this.style;
    f[93] = this.lineCount;
    f[94] = this.lineWidth;
    f[95] = this.lineShear;
    // sp2: dotCount, dotWidth
    f[96] = this.dotCount;
    f[97] = this.dotWidth;
  }
}

const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);

const norm3 = (x: number, y: number, z: number): [number, number, number] => {
  const l = Math.hypot(x, y, z) || 1;
  return [x / l, y / l, z / l];
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

const makeBuffer = (device: GPUDevice, data: Float32Array | Uint32Array, usage: number): GPUBuffer => {
  const buf = device.createBuffer({size: Math.max(4, data.byteLength), usage, mappedAtCreation: true});
  const range = buf.getMappedRange();
  if (data instanceof Uint32Array) new Uint32Array(range).set(data);
  else new Float32Array(range).set(data);
  buf.unmap();
  return buf;
};

/** Parse CSS color strings to 0..1 RGB via a 1x1 canvas (runs only on change). */
/** Shallow value-equality so a fresh-but-equal `colors` array (new identity each
 * React render) does not force a palette re-parse every frame. */
const colorsEqual = (a: string[], b: string[]): boolean => {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
};

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
