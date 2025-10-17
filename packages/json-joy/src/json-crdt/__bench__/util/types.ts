export type SequentialTraceName =
  | 'automerge-paper'
  | 'friendsforever_flat'
  | 'rustcode'
  | 'seph-blog1'
  | 'sveltecomponent'
  | 'json-crdt-patch'
  | 'json-crdt-blog-post';

export interface SequentialTrace {
  startContent: string;
  endContent: string;
  txns: SequentialTraceTransaction[];
}

export interface SequentialTraceTransaction {
  patches: [number, number, string][];
}

export interface SequentialTraceEditor {
  name: string;
  factory: () => SequentialTraceEditorInstance;
}

export interface SequentialTraceEditorInstance {
  ins: (pos: number, insert: string) => void;
  del: (pos: number, len: number) => void;
  get: () => string;
  len: () => number;
  chunks: () => number;
  toBlob?: () => Uint8Array;
}

export interface StructuralEditor {
  name: string;
  factory: (snapshot?: Uint8Array) => StructuralEditorInstance;
}

export interface StructuralEditorInstance {
  view: () => unknown;
  setRoot: (pojo: unknown) => void;
  toBlob: () => Uint8Array;
}

export interface ConcurrentTrace {
  kind: 'concurrent';
  endContent: 'string';
  numAgents: number;
  txns: ConcurrentTraceTransaction[];
}

export interface ConcurrentTraceTransaction {
  parents: number[];
  numChildren: number;
  agent: number;
  patches: [position: number, remove: number, text: string][];
}
