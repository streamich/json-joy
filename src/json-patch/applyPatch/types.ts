import type {JsonPatchOptions, Operation} from '../types';

export interface ApplyPatchOptions extends JsonPatchOptions {
  /**
   * Whether mutation of the source document is allowed.
   */
  mutate: boolean;
}

export interface OpResult {
  doc: unknown;
  old?: unknown;
}

export interface PatchResult {
  doc: unknown;
  res: readonly OpResult[];
}

export type ApplyPatch = (doc: unknown, patch: readonly Operation[], options: ApplyPatchOptions) => PatchResult;
