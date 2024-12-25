import {PeritextMlElement} from "../block/types";
import {CommonSliceType} from "../slice";
import {SliceRegistry} from "./SliceRegistry";
import {SliceTypeDefinition} from "./types";

/**
 * Default annotation type registry.
 */
export const registry = new SliceRegistry();

registry.add({
  type: CommonSliceType.a,
  toHtml: (element: PeritextMlElement<CommonSliceType.a, {}, true>) => ['a', element[1], element[2]],
} as SliceTypeDefinition<PeritextMlElement<CommonSliceType.a, {href?: string, title?: string}, true>>);
