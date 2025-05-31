import type {PeritextDataNode} from "../peritext/types";

export type ProseMirrorDataNode = PeritextDataNode;
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
  readonly type: ProseMirrorNodeType;
  readonly attrs?: ProseMirrorAttrs;
  readonly content?: ProseMirrorFragment;
  readonly marks?: readonly ProseMirrorMark[];
}

export interface ProseMirrorTextNode extends ProseMirrorNode {
  readonly text: string;
}

export interface ProseMirrorNodeType {
  readonly name: string;
}

export interface ProseMirrorFragment {
  readonly content: readonly (ProseMirrorNode | ProseMirrorTextNode)[];
}

export interface ProseMirrorMark {
  readonly type: ProseMirrorNodeType;
  readonly attrs?: ProseMirrorAttrs;
}
