import {type ITimestampStruct, printTs, Timestamp} from '../../../json-crdt-patch/clock';
import type {JsonNode} from '../types';
import type {Printable} from 'tree-dump/lib/types';

/**
 * Represents the `con` type of the JSON CRDT specification.
 *
 * Constant type represents an immutable JSON value. It can be any JSON/CBOR
 * value including deeply nested objects and arrays, Uint8Array binary data, or
 * it can store a logical timestamp. The constant value cannot be edited.
 *
 * @category CRDT Node
 */
export class ConNode<View = unknown | ITimestampStruct> implements JsonNode<View>, Printable {
  /**
   * @param id ID of the CRDT node.
   * @param val Raw value of the constant. It can be any JSON/CBOR value, or
   *        a logical timestamp {@link Timestamp}.
   */
  constructor(
    public readonly id: ITimestampStruct,
    public readonly val: View,
  ) {}

  // ----------------------------------------------------------------- JsonNode

  /**
   * @ignore
   */
  public children() {}

  /**
   * @ignore
   */
  public child() {
    return undefined;
  }

  /**
   * @ignore
   */
  public container(): JsonNode | undefined {
    return undefined;
  }

  public view(): View {
    return this.val;
  }

  /**
   * @ignore
   */
  public api: undefined | unknown = undefined;

  public name(): string {
    return 'con';
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab?: string): string {
    const val = this.val;
    const valFormatted =
      val instanceof Uint8Array
        ? `Uint8Array { ${('' + val).replaceAll(',', ', ')} }`
        : `{ ${val instanceof Timestamp ? printTs(val as Timestamp) : JSON.stringify(val)} }`;
    return `${this.name()} ${printTs(this.id)} ${valFormatted}`;
  }
}
