export interface ProseMirrorJsonNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: (ProseMirrorJsonNode | ProseMirrorJsonTextNode)[];
  marks?: ProseMirrorJsonMark[];
}

export interface ProseMirrorJsonTextNode extends ProseMirrorJsonNode {
  text: string;
}

export interface ProseMirrorJsonMark {
  type: string;
  attrs?: ProseMirrorAttrs;
}

export type ProseMirrorAttrs = Record<string, unknown>;

export interface ProseMirrorNode {
  type: ProseMirrorNodeType;
  attrs?: ProseMirrorAttrs;
  content?: ProseMirrorFragment;
  marks?: ProseMirrorMark[];
}

export interface ProseMirrorTextNode extends ProseMirrorNode {
  text: string;
}

export interface ProseMirrorNodeType {
  name: string;
}

export interface ProseMirrorFragment {
  content: (ProseMirrorNode | ProseMirrorTextNode)[];
}

export interface ProseMirrorMark {
  type: ProseMirrorNodeType;
  attrs?: ProseMirrorAttrs;
}
