import {s} from "../../../json-crdt-patch";
import {JsonNodeView} from "../../../json-crdt/nodes";
import {PeritextMlElement} from "../block/types";
import {CommonSliceType} from "../slice";
import {SliceRegistry} from "./SliceRegistry";

/**
 * Default annotation type registry.
 */
export const registry = new SliceRegistry();

registry.add({
  type: CommonSliceType.a,
  schema: s.obj({
    href: s.str(''),
    title: s.str(''),
  }),
  toHtml: (el) => {
    throw new Error('Not implemented');
  },
});
