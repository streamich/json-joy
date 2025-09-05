import type {FileModelEncoding} from './constants';

export type LogHeader<metadata extends Record<string, unknown> = Record<string, unknown>> = [
  metadata: metadata,
  modelFormat: FileModelEncoding,
];

export type LogComponents<Metadata extends Record<string, unknown> = Record<string, unknown>> = [
  view: unknown | null,
  header: LogHeader<Metadata>,
  model: Uint8Array | unknown | null,
  history: LogHistory,
];

export type LogHistory = [model: Uint8Array | unknown | null, patches: Array<Uint8Array | unknown>];

export type LogComponentsWithFrontier = [...LogComponents, ...frontier: Array<Uint8Array | unknown>];
