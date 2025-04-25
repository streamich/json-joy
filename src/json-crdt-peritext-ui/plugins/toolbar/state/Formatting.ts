import type {Slice} from "../../../../json-crdt-extensions";
import type {ToolbarSliceBehavior} from "../types";

/**
 * Formatting is a specific application of known formatting option to a range of
 * text. Formatting is composed of a specific {@link Slice} which stores the
 * state (location, data) of the formatting and a {@link ToolbarSliceBehavior}
 * which defines the formatting behavior.
 */
export class Formatting {
  public constructor(
    public readonly slice: Slice<string>,
    public readonly behavior: ToolbarSliceBehavior,
  ) {}

  public key(): number {
    return this.slice.hash;
  }
}
