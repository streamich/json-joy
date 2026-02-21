// ---------------------------------------------------------------------- nodes

export type SlateDocument = SlateElementNode[];

export interface SlateElementNode {
  type: string;
  children: SlateDescendantNode[];
  [key: string]: unknown;
}

export type SlateDescendantNode = SlateElementNode | SlateTextNode;

export interface SlateTextNode {
  text: string;
  [key: string]: unknown;
}

// ----------------------------------------------------------------- operations

export type SlateOperation = SlateTextOperation | SlateNodeOperation | SlateSelectionOperation;
export type SlateTextOperation =
  | SlateInsertTextOperation
  | SlateRemoveTextOperation
  | SlateSetNodeOperation
  | SlateSplitNodeOperation
  | SlateMergeNodeOperation;
export type SlateNodeOperation =
  | SlateInsertNodeOperation
  | SlateRemoveNodeOperation
  | SlateSplitNodeOperation
  | SlateMergeNodeOperation
  | SlateSetNodeOperation
  | SlateMoveNodeOperation;
export type SlateSelectionOperation = SlateSetSelectionOperation;

export interface SlateInsertTextOperation {
  type: 'insert_text';
  path: SlatePath;
  offset: number;
  text: string;
}

export interface SlateRemoveTextOperation {
  type: 'remove_text';
  path: SlatePath;
  offset: number;
  text: string;
}

export interface SlateInsertNodeOperation {
  type: 'insert_node';
  path: SlatePath;
  node: SlateDescendantNode;
}

export interface SlateRemoveNodeOperation {
  type: 'remove_node';
  path: SlatePath;
  node: SlateDescendantNode;
}

export interface SlateMergeNodeOperation {
  type: 'merge_node';
  path: SlatePath;
  position: number;
  properties: Partial<SlateElementNode>;
}

export interface SlateMoveNodeOperation {
  type: 'move_node';
  path: SlatePath;
  newPath: SlatePath;
}

export interface SlateSetNodeOperation {
  type: 'set_node';
  path: SlatePath;
  properties: Partial<SlateElementNode>;
  newProperties: Partial<SlateElementNode>;
}

export interface SlateSplitNodeOperation {
  type: 'split_node';
  path: SlatePath;
  position: number;
  properties: Partial<SlateElementNode>;
}

export type SlateSetSelectionOperation =
  | {
      type: 'set_selection';
      properties: null;
      newProperties: SlateRange;
    }
  | {
      type: 'set_selection';
      properties: Partial<SlateRange>;
      newProperties: Partial<SlateRange>;
    }
  | {
      type: 'set_selection';
      properties: SlateRange;
      newProperties: null;
    };

// ------------------------------------------------------------------ positions

export interface SlateRange {
  anchor: SlatePoint;
  focus: SlatePoint;
}

export interface SlatePoint {
  path: SlatePath;
  offset: number;
}

export type SlatePath = number[];

// --------------------------------------------------------------------- editor

export type SlateEditorOnChange = (options?: {operation?: SlateOperation}) => void;
