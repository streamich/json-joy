import type {SliceStacking} from '../slice/constants';

export type PeritextMlNode = string | PeritextMlElement;

export type PeritextMlElement<Tag extends string | number = string | number, Data = unknown, Inline = boolean> = [
  tag: Tag,
  attrs: null | PeritextMlAttributes<Data, Inline>,
  ...children: PeritextMlNode[],
];

export interface PeritextMlAttributes<Data = unknown, Inline = boolean> {
  data?: Data;
  inline?: Inline;
  stacking?: SliceStacking;
}
