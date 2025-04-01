import {AvlMap} from "sonic-forest/lib/avl/AvlMap";
import {compare, type ITimestampStruct} from "../../json-crdt-patch";
import type {LeafBlock} from "../../json-crdt-extensions";

/**
 * Mapping from Peritext slices to DOM elements. This allows faster DOM
 * element lookup.
 */
export class ElementMapping {
  protected blocks = new AvlMap<ITimestampStruct, Element>(compare);

  public setBlock(block: LeafBlock, element: Element): void {
    // TODO: Make `id` be passed as argument.
    const id = block.marker?.marker.start.id;
    if (!id) return;
    this.blocks.set(id, element);
  }

  public delBlock(block: LeafBlock): void {
    const id = block.marker?.marker.start.id;
    if (!id) return;
    this.blocks.del(id);
  }
}
