// Minimal ambient WebGPU declarations.
//
// This TypeScript version does not ship WebGPU types in lib.dom.d.ts, and the
// task forbids adding a dependency (@webgpu/types). So we declare just the
// subset of the API this component touches. If @webgpu/types is ever added,
// delete this file. Type aliases for enums are kept as `string` on purpose to
// avoid enumerating every spec literal while still type-checking our usage.

type GPUTextureFormat = string;
type GPUVertexFormat = string;
type GPUVertexStepMode = 'vertex' | 'instance';
type GPUPrimitiveTopology = string;
type GPULoadOp = 'load' | 'clear';
type GPUStoreOp = 'store' | 'discard';
type GPUBlendFactor = string;
type GPUBlendOperation = string;
type GPUCanvasAlphaMode = 'opaque' | 'premultiplied';
type GPUBufferUsageFlags = number;
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
}

interface GPURenderPipeline {
  getBindGroupLayout(index: number): GPUBindGroupLayout;
}

interface GPURenderPassEncoder {
  setPipeline(pipeline: GPURenderPipeline): void;
  setBindGroup(index: number, bindGroup: GPUBindGroup): void;
  setVertexBuffer(slot: number, buffer: GPUBuffer, offset?: number, size?: number): void;
  draw(vertexCount: number, instanceCount?: number, firstVertex?: number, firstInstance?: number): void;
  end(): void;
}

interface GPUCommandEncoder {
  beginRenderPass(descriptor: {
    colorAttachments: Array<{
      view: GPUTextureView;
      clearValue?: GPUColor;
      loadOp: GPULoadOp;
      storeOp: GPUStoreOp;
    }>;
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

interface GPUBindGroupLayoutEntry {
  binding: number;
  visibility: GPUShaderStageFlags;
  buffer?: {type?: 'uniform' | 'storage' | 'read-only-storage'};
}

interface GPUDevice {
  readonly queue: GPUQueue;
  createBuffer(descriptor: {size: number; usage: GPUBufferUsageFlags; mappedAtCreation?: boolean}): GPUBuffer;
  createShaderModule(descriptor: {code: string}): GPUShaderModule;
  createBindGroupLayout(descriptor: {entries: GPUBindGroupLayoutEntry[]}): GPUBindGroupLayout;
  createPipelineLayout(descriptor: {bindGroupLayouts: GPUBindGroupLayout[]}): GPUPipelineLayout;
  createRenderPipeline(descriptor: {
    layout: 'auto' | GPUPipelineLayout;
    vertex: {module: GPUShaderModule; entryPoint: string; buffers: GPUVertexBufferLayout[]};
    fragment: {module: GPUShaderModule; entryPoint: string; targets: GPUColorTargetState[]};
    primitive?: {topology?: GPUPrimitiveTopology};
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

declare const GPUShaderStage: {
  readonly VERTEX: number;
  readonly FRAGMENT: number;
  readonly COMPUTE: number;
};
