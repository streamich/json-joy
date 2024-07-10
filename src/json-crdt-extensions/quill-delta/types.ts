import type {PeritextDataNode} from '../peritext/types';

export type QuillDataNode = PeritextDataNode;

export interface QuillDeltaPatch {
  ops: QuillDeltaOp[];
}

export type QuillDeltaOp = QuillDeltaOpInsert | QuillDeltaOpRetain | QuillDeltaOpDelete;

export type QuillDeltaAttributes = Record<string, unknown | null>;

export interface QuillDeltaOpInsert {
  insert: string | Record<string, unknown>;
  attributes?: QuillDeltaAttributes;
}

export interface QuillDeltaOpRetain {
  retain: number;
  attributes?: QuillDeltaAttributes;
}

export interface QuillDeltaOpDelete {
  delete: number;
}

export type QuillDeltaSliceDto = [
  /** First character session ID, inclusive. */
  sid1: number,
  /** First character clock time, inclusive. */
  time1: number,
  /** Last character session ID, inclusive. */
  sid2: number,
  /** Last character clock time, inclusive. */
  time2: number,
  /** Slice markup. */
  attributes: QuillDeltaAttributes,
  /** Non-textual insert data. */
  insert?: Record<string, unknown>,
];

export interface QuillTrace {
  contents: QuillDeltaPatch;
  transactions: QuillDeltaPatch['ops'][];
}
