import {s} from '../../../json-crdt-patch';
import type {JsonNodeView} from '../../../json-crdt/nodes';
import type {SchemaToJsonNode} from '../../../json-crdt/schema/types';
import {CommonSliceType} from '../slice';
import {SliceBehavior} from '../slice/constants';
import {SliceRegistry} from './SliceRegistry';

const undefSchema = s.con(undefined);

/**
 * Default annotation type registry.
 */
export const registry = new SliceRegistry();

registry.def(CommonSliceType.i, undefSchema, SliceBehavior.One, true, {
  fromHtml: {
    i: () => [CommonSliceType.i, null],
    em: () => [CommonSliceType.i, null],
  },
});

registry.def(CommonSliceType.b, undefSchema, SliceBehavior.One, true, {
  fromHtml: {
    b: () => [CommonSliceType.b, null],
    strong: () => [CommonSliceType.b, null],
  },
});

registry.def(CommonSliceType.s, undefSchema, SliceBehavior.One, true, {
  fromHtml: {
    s: () => [CommonSliceType.s, null],
    strike: () => [CommonSliceType.s, null],
  },
});

registry.def(CommonSliceType.u, undefSchema, SliceBehavior.One, true);
registry.def(CommonSliceType.code, undefSchema, SliceBehavior.One, true);
registry.def(CommonSliceType.mark, undefSchema, SliceBehavior.One, true);
registry.def(CommonSliceType.kbd, undefSchema, SliceBehavior.One, true);
registry.def(CommonSliceType.del, undefSchema, SliceBehavior.One, true);
registry.def(CommonSliceType.ins, undefSchema, SliceBehavior.One, true);
registry.def(CommonSliceType.sup, undefSchema, SliceBehavior.One, true);
registry.def(CommonSliceType.sub, undefSchema, SliceBehavior.One, true);
registry.def(CommonSliceType.math, undefSchema, SliceBehavior.One, true);

const aSchema = s.obj({
  href: s.str<string>(''),
  title: s.str<string>(''),
});
registry.def(CommonSliceType.a, aSchema, SliceBehavior.Many, true, {
  fromHtml: {
    a: (jsonml) => {
      const attr = jsonml[1] || {};
      const data: JsonNodeView<SchemaToJsonNode<typeof aSchema>> = {
        href: attr.href ?? '',
        title: attr.title ?? '',
      };
      return [CommonSliceType.a, {data, inline: true}];
    },
  },
});

// TODO: add more default annotations
// comment = SliceTypeCon.comment,
// font = SliceTypeCon.font,
// col = SliceTypeCon.col,
// bg = SliceTypeCon.bg,
// hidden = SliceTypeCon.hidden,
// footnote = SliceTypeCon.footnote,
// ref = SliceTypeCon.ref,
// iaside = SliceTypeCon.iaside,
// iembed = SliceTypeCon.iembed,
// bookmark = SliceTypeCon.bookmark,
