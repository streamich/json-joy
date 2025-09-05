import type {FileModelEncoding} from './constants';

export type LogHeader<LogMetadata extends Record<string, unknown> = Record<string, unknown>> = [
  map: LogMetadata,
  modelFormat: FileModelEncoding,
];

export type LogComponents<LogMetadata extends Record<string, unknown> = Record<string, unknown>> = [
  view: unknown | null,
  header: LogHeader<LogMetadata>,
  model: Uint8Array | unknown | null,
  history: LogHistory,
];

export type LogHistory = [model: Uint8Array | unknown | null, patches: Array<Uint8Array | unknown>];

export type LogComponentsWithFrontier = [...LogComponents, ...frontier: Array<Uint8Array | unknown>];
