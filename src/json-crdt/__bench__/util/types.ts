export type SequentialTraceName =
  | 'automerge-paper'
  | 'friendsforever_flat'
  | 'rustcode'
  | 'seph-blog1'
  | 'sveltecomponent';

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
}
