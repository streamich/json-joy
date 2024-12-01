export type PeritextMlNode = string | PeritextMlElement;
export type PeritextMlElement = [
  tag: string | number,
  attrs: null | PeritextMlAttributes,
  ...children: PeritextMlNode[],
];
export interface PeritextMlAttributes {
  inline?: boolean;
  data?: unknown;
}
