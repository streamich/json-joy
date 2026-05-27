// Minimal ambient WebGPU declarations for SheetField.

type GPUTextureFormat = string;
type GPUVertexFormat = string;
type GPUIndexFormat = 'uint16' | 'uint32';
type GPUVertexStepMode = 'vertex' | 'instance';
type GPUPrimitiveTopology = string;
type GPUCullMode = 'none' | 'front' | 'back';
type GPULoadOp = 'load' | 'clear';
type GPUStoreOp = 'store' | 'discard';
type GPUCompareFunction = string;
type GPUBlendFactor = string;
type GPUBlendOperation = string;
type GPUCanvasAlphaMode = 'opaque' | 'premultiplied';
type GPUBufferUsageFlags = number;
type GPUTextureUsageFlags = number;
type GPUShaderStageFlags = number;
type GPUColor = {r: number; g: number; b: number; a: number};

type GPUBufferSource = ArrayBuffer | ArrayBufferView;

interface GPUBuffer {
  getMappedRange(offset?: number, size?: number): ArrayBuffer;
  unmap(): void;
  destroy(): void;
}

// Opaque GPU handles: we only pass these around, never inspect them. The brand
// keeps them distinct types without tripping the empty-interface lint.
type GPUShaderModule = {readonly __brand: 'GPUShaderModule'};
type GPUBindGroupLayout = {readonly __brand: 'GPUBindGroupLayout'};
type GPUBindGroup = {readonly __brand: 'GPUBindGroup'};
type GPUPipelineLayout = {readonly __brand: 'GPUPipelineLayout'};
type GPUCommandBuffer = {readonly __brand: 'GPUCommandBuffer'};
type GPUTextureView = {readonly __brand: 'GPUTextureView'};

interface GPUTexture {
  createView(descriptor?: object): GPUTextureView;
  destroy(): void;
}

interface GPURenderPipeline {
  getBindGroupLayout(index: number): GPUBindGroupLayout;
}

interface GPURenderPassEncoder {
  setPipeline(pipeline: GPURenderPipeline): void;
  setBindGroup(index: number, bindGroup: GPUBindGroup): void;
  setVertexBuffer(slot: number, buffer: GPUBuffer, offset?: number, size?: number): void;
  setIndexBuffer(buffer: GPUBuffer, indexFormat: GPUIndexFormat, offset?: number, size?: number): void;
  draw(vertexCount: number, instanceCount?: number, firstVertex?: number, firstInstance?: number): void;
  drawIndexed(
    indexCount: number,
    instanceCount?: number,
    firstIndex?: number,
    baseVertex?: number,
    firstInstance?: number,
  ): void;
  end(): void;
}

interface GPURenderPassColorAttachment {
  view: GPUTextureView;
  resolveTarget?: GPUTextureView;
  clearValue?: GPUColor;
  loadOp: GPULoadOp;
  storeOp: GPUStoreOp;
}

interface GPURenderPassDepthStencilAttachment {
  view: GPUTextureView;
  depthClearValue?: number;
  depthLoadOp?: GPULoadOp;
  depthStoreOp?: GPUStoreOp;
}

interface GPUCommandEncoder {
  beginRenderPass(descriptor: {
    colorAttachments: GPURenderPassColorAttachment[];
    depthStencilAttachment?: GPURenderPassDepthStencilAttachment;
  }): GPURenderPassEncoder;
  finish(): GPUCommandBuffer;
}

interface GPUQueue {
  writeBuffer(buffer: GPUBuffer, bufferOffset: number, data: GPUBufferSource, dataOffset?: number, size?: number): void;
  submit(commandBuffers: GPUCommandBuffer[]): void;
}

interface GPUVertexAttribute {
  shaderLocation: number;
  offset: number;
  format: GPUVertexFormat;
}

interface GPUVertexBufferLayout {
  arrayStride: number;
  stepMode?: GPUVertexStepMode;
  attributes: GPUVertexAttribute[];
}

interface GPUBlendComponent {
  srcFactor?: GPUBlendFactor;
  dstFactor?: GPUBlendFactor;
  operation?: GPUBlendOperation;
}

interface GPUColorTargetState {
  format: GPUTextureFormat;
  blend?: {color: GPUBlendComponent; alpha: GPUBlendComponent};
}

interface GPUDepthStencilState {
  format: GPUTextureFormat;
  depthWriteEnabled?: boolean;
  depthCompare?: GPUCompareFunction;
}

interface GPUBindGroupLayoutEntry {
  binding: number;
  visibility: GPUShaderStageFlags;
  buffer?: {type?: 'uniform' | 'storage' | 'read-only-storage'};
}

interface GPUDevice {
  readonly queue: GPUQueue;
  createBuffer(descriptor: {size: number; usage: GPUBufferUsageFlags; mappedAtCreation?: boolean}): GPUBuffer;
  createTexture(descriptor: {
    size: {width: number; height: number} | [number, number];
    format: GPUTextureFormat;
    usage: GPUTextureUsageFlags;
    sampleCount?: number;
  }): GPUTexture;
  createShaderModule(descriptor: {code: string}): GPUShaderModule;
  createBindGroupLayout(descriptor: {entries: GPUBindGroupLayoutEntry[]}): GPUBindGroupLayout;
  createPipelineLayout(descriptor: {bindGroupLayouts: GPUBindGroupLayout[]}): GPUPipelineLayout;
  createRenderPipeline(descriptor: {
    layout: 'auto' | GPUPipelineLayout;
    vertex: {module: GPUShaderModule; entryPoint: string; buffers: GPUVertexBufferLayout[]};
    fragment: {module: GPUShaderModule; entryPoint: string; targets: GPUColorTargetState[]};
    primitive?: {topology?: GPUPrimitiveTopology; cullMode?: GPUCullMode};
    depthStencil?: GPUDepthStencilState;
    multisample?: {count?: number};
  }): GPURenderPipeline;
  createBindGroup(descriptor: {
    layout: GPUBindGroupLayout;
    entries: Array<{binding: number; resource: {buffer: GPUBuffer}}>;
  }): GPUBindGroup;
  createCommandEncoder(): GPUCommandEncoder;
  destroy(): void;
}

interface GPUAdapter {
  requestDevice(descriptor?: object): Promise<GPUDevice>;
}

interface GPU {
  requestAdapter(options?: object): Promise<GPUAdapter | null>;
  getPreferredCanvasFormat(): GPUTextureFormat;
}

interface GPUCanvasContext {
  configure(configuration: {device: GPUDevice; format: GPUTextureFormat; alphaMode?: GPUCanvasAlphaMode}): void;
  getCurrentTexture(): GPUTexture;
}

interface Navigator {
  readonly gpu?: GPU;
}

interface HTMLCanvasElement {
  getContext(contextId: 'webgpu'): GPUCanvasContext | null;
}

declare const GPUBufferUsage: {
  readonly VERTEX: number;
  readonly UNIFORM: number;
  readonly STORAGE: number;
  readonly COPY_DST: number;
  readonly COPY_SRC: number;
  readonly INDEX: number;
};

declare const GPUTextureUsage: {
  readonly RENDER_ATTACHMENT: number;
  readonly TEXTURE_BINDING: number;
  readonly COPY_SRC: number;
  readonly COPY_DST: number;
};

declare const GPUShaderStage: {
  readonly VERTEX: number;
  readonly FRAGMENT: number;
  readonly COMPUTE: number;
};
