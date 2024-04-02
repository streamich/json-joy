import type {FileModelEncoding} from './constants';

export type LogMetadata = [map: {}, modelFormat: FileModelEncoding];

export type LogComponents = [
  view: unknown | null,
  metadata: LogMetadata,
  model: Uint8Array | unknown | null,
  history: LogHistory,
];

export type LogHistory = [model: Uint8Array | unknown | null, patches: Array<Uint8Array | unknown>];

export type LogComponentsWithFrontier = [...LogComponents, ...frontier: Array<Uint8Array | unknown>];
