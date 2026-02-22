// ----------------------------------------------------------------- Serialized

export interface PmJsonNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: (PmJsonNode | PmJsonTextNode)[];
  marks?: PmJsonMark[];
}

export interface PmJsonTextNode extends PmJsonNode {
  text: string;
}
export interface PmJsonMark {
  type: string;
  attrs?: PmAttrs;
}

// ---------------------------------------------------------------------- Model

export type PmAttrs = Record<string, unknown>;

export interface PmNode {
  readonly type: PmNodeType;
  readonly attrs?: PmAttrs;
  readonly content?: PmFragment;
  readonly marks?: readonly PmMark[];
}

export interface PmTextNode extends PmNode {
  readonly text: string;
}

export interface PmNodeType {
  readonly name: string;
}

export interface PmFragment {
  readonly content: readonly (PmNode | PmTextNode)[];
}

export interface PmMark {
  readonly type: PmNodeType;
  readonly attrs?: PmAttrs;
}
