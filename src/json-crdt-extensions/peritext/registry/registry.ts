import {s} from '../../../json-crdt-patch';
import {SliceBehavior, SliceTypeCon} from '../slice/constants';
import {SliceRegistry, SliceRegistryEntry, TagType} from './SliceRegistry';
import type {JsonNodeView} from '../../../json-crdt/nodes';
import type {SchemaToJsonNode} from '../../../json-crdt/schema/types';

/**
 * Default annotation type registry.
*/
export const registry = new SliceRegistry();

const undefSchema = s.con(undefined);

// ----------------------------------------- Inline elements with "One" behavior

const inlineOne = <Tag extends TagType = TagType>(
  tag: Tag,
  fromHtml?: SliceRegistryEntry<SliceBehavior.One, Tag, typeof undefSchema>['fromHtml'],
): void => {
  registry.add(
    new SliceRegistryEntry(
      SliceBehavior.One,
      tag,
      undefSchema,
      false,
      void 0,
      fromHtml,
    )
  );
};

const inlineOne2 = <Tag extends TagType = TagType>(tag: Tag, htmlTags: string[]): void => {
  const fromHtml = {} as Record<any, any>;
  for (const htmlTag of htmlTags) fromHtml[htmlTag] = () => [tag, null];
  inlineOne(tag, fromHtml);
};

inlineOne2(SliceTypeCon.i, ['i', 'em']);
inlineOne2(SliceTypeCon.b, ['b', 'strong']);
inlineOne2(SliceTypeCon.s, ['s', 'strike']);
inlineOne(SliceTypeCon.u);
inlineOne(SliceTypeCon.code);
inlineOne(SliceTypeCon.mark);
inlineOne(SliceTypeCon.kbd);
inlineOne(SliceTypeCon.del);
inlineOne(SliceTypeCon.ins);
inlineOne(SliceTypeCon.sup);
inlineOne(SliceTypeCon.sub);
inlineOne(SliceTypeCon.math);

// ---------------------------------------- Inline elements with "Many" behavior

const aSchema = s.obj({
  href: s.str<string>(''),
  title: s.str<string>(''),
});
registry.add(
  new SliceRegistryEntry(
    SliceBehavior.Many,
    SliceTypeCon.a,
    aSchema,
    false,
    void 0,
    {
      a: (jsonml) => {
        const attr = jsonml[1] || {};
        const data: JsonNodeView<SchemaToJsonNode<typeof aSchema>> = {
          href: attr.href ?? '',
          title: attr.title ?? '',
        };
        return [SliceTypeCon.a, {data, inline: true}];
      },
    },
  )
);

// TODO: add more default annotations with "Many" behavior
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

// --------------------------------------- Block elements with "Marker" behavior

// registry.def(CommonSliceType.blockquote, undefSchema, SliceBehavior.Marker, false);
