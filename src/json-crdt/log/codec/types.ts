import type {FileModelEncoding} from './constants';

export type FileMetadata = [map: {}, modelFormat: FileModelEncoding];

export type FileWriteSequence = [
  view: unknown | null,
  metadata: FileMetadata,
  model: Uint8Array | unknown | null,
  history: FileWriteSequenceHistory,
];

export type FileWriteSequenceHistory = [model: Uint8Array | unknown | null, patches: Array<Uint8Array | unknown>];

export type FileReadSequence = [...FileWriteSequence, ...frontier: Array<Uint8Array | unknown>];
