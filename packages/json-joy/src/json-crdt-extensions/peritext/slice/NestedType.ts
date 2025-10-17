import type {ArrApi} from '../../../json-crdt/model';
import {NestedTag} from './NestedTag';
import type {PersistedSlice} from './PersistedSlice';
import * as schema from './schema';
import type {SliceTypeSteps} from './types';

export class NestedType<T = string> {
  constructor(protected slice: PersistedSlice<T>) {}

  /** Enforces slice type to be an "arr" of tags. */
  public asArr(): ArrApi {
    const {slice} = this;
    const api = slice.typeApi();
    if (api && api.node.name() === 'arr') return api as unknown as ArrApi;
    let type: unknown;
    if (!api) type = [0];
    else {
      type = api.view();
      if (!Array.isArray(type)) type = typeof type === 'number' || typeof type === 'string' ? [type] : [0];
    }
    slice.update({type: schema.type(type as SliceTypeSteps)});
    return slice.typeApi() as unknown as ArrApi;
  }

  /**
   * Nested tag API for nested block types.
   *
   * @param index The position of the tag in the type array. If not specified,
   *     returns the last tag (255). Maximum index is 255.
   * @returns Slice tag API for the given position.
   */
  public tag(index: number = 255): NestedTag<T> {
    return new NestedTag<T>(this, index);
  }
}
