/**
 * Slate.js nodes
 *
 * @ignore
 */
export interface SlateTextNode {
  text: string;
  [key: string]: unknown;
}

/**
 * @ignore
 */
export interface SlateElementNode {
  children: SlateNode[];
  [key: string]: unknown;
}

/**
 * @ignore
 */
export type SlateNode = SlateElementNode | SlateTextNode;
