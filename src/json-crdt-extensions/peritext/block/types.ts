import type {SliceStacking} from '../slice/constants';

export type PeritextMlNode = PeritextMlText | PeritextMlElement;
export type PeritextMlText = string;
export type PeritextMlElement<Tag extends string | number = string | number, Data = unknown, Inline = boolean> = [
  tag: Tag,
  attrs: null | PeritextMlAttributes<Data, Inline>,
  ...children: PeritextMlNode[],
];

/**
 * @todo Make this an array tuple.
 */
export interface PeritextMlAttributes<Data = unknown, Inline = boolean> {
  data?: Data;
  inline?: Inline;
  stacking?: SliceStacking;
}
