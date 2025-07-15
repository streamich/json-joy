import {PeritextMlElement, PeritextMlNode} from '../block/types';
import {CommonSliceType} from '../slice';
import {SliceStacking} from '../slice/constants';

export const h = (tag: string, props: Record<string, unknown> | null, ...children: PeritextMlNode[]): PeritextMlElement => {
  const attrs: PeritextMlElement[1] = {};
  if (props) attrs.data = props;
  if (tag as any === h) return ['', null, ...children];
  const num = CommonSliceType[tag as any];
  if (typeof num === 'number') {
    const inline = num < 0;
    attrs.inline = inline;
    attrs.stacking = inline ? (props ? SliceStacking.Many : SliceStacking.One) : SliceStacking.Marker;
    return [num, attrs, ...children];
  } else {
    const inline = !props;
    attrs.inline = inline;
    attrs.stacking = inline ? (props ? SliceStacking.Many : SliceStacking.One) : SliceStacking.Marker;
    return [tag, attrs, ...children];
  }
};
