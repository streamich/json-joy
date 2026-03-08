import {JsonNodeView, s, SchemaToJsonNode} from "json-joy/lib/json-crdt";
import {SliceBehavior, SliceStacking, SliceTypeCon, PeritextMlElement} from "json-joy/lib/json-crdt-extensions";

export const schema = s.obj(
  {
    href: s.str<string>(''),
  },
  {
    title: s.str<string>(''),
  },
);

export type BehaviorData = JsonNodeView<SchemaToJsonNode<typeof schema>>;

export const behavior = new SliceBehavior(
  SliceStacking.Many,
  SliceTypeCon.a,
  'Link',
  schema,
  false,
  void 0,
  {
    a: (jsonml) => {
      const attr = jsonml[1] || {};
      const data: BehaviorData = {
        href: attr.href ?? '',
        title: attr.title ?? '',
      };
      return [SliceTypeCon.a, {data, inline: true}] as PeritextMlElement<SliceTypeCon.a, BehaviorData, true>;
    },
  },
);
