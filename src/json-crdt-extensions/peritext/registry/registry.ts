import {s} from "../../../json-crdt-patch";
import {JsonNodeView} from "../../../json-crdt/nodes";
import {SchemaToJsonNode} from "../../../json-crdt/schema/types";
import {CommonSliceType} from "../slice";
import {SliceBehavior} from '../slice/constants';
import {SliceRegistry} from "./SliceRegistry";

/**
 * Default annotation type registry.
 */
export const registry = new SliceRegistry();

const aSchema = s.obj({
  href: s.str<string>(''),
  title: s.str<string>(''),
});

registry.add({
  type: CommonSliceType.a,
  schema: aSchema,
  // toHtml: (el) => ['a', {...el[1]?.data}],
  fromHtml: {
    a: (jsonml) => {
      const attr = jsonml[1] || {};
      const data: JsonNodeView<SchemaToJsonNode<typeof aSchema>> = {
        href: attr.href ?? '',
        title: attr.title ?? '',
      };
      return [CommonSliceType.a, {data, inline: true}];
    }
  },
});

registry.add({
  type: CommonSliceType.i,
  behavior: SliceBehavior.One,
  schema: s.con(undefined),
  fromHtml: {
    em: () => [CommonSliceType.i, null],
    i: () => [CommonSliceType.i, null],
  },
});
