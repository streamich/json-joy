import {type ITimestampStruct, toDisplayString, Timestamp} from '../../../json-crdt-patch/clock';
import type {JsonNode} from '../types';
import type {Printable} from '../../../util/print/types';

/**
 * Represents the `con` type of the JSON CRDT specification.
 *
 * Constant type represents an immutable JSON value. It can be any JSON/CBOR
 * value including deeply nested objects and arrays, Uint8Array binary data, or
 * it can store a logical timestamp. The constant value cannot be edited.
 *
 * @category CRDT Node
 */
export class Const<View = unknown | ITimestampStruct> implements JsonNode<View>, Printable {
  /**
   * @param id ID of the CRDT node.
   * @param val Raw value of the constant. It can be any JSON/CBOR value, or
   *        a logical timestamp {@link Timestamp}.
   */
  constructor(public readonly id: ITimestampStruct, public readonly val: View) {}

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

  public view(): Readonly<View> {
    return this.val;
  }

  /**
   * @ignore
   */
  public api: undefined | unknown = undefined;

  // ---------------------------------------------------------------- Printable

  public toString(tab?: string): string {
    const val = this.val;
    const valFormatted =
      val instanceof Uint8Array
        ? `Uint8Array { ${('' + val).replaceAll(',', ', ')} }`
        : `{ ${val instanceof Timestamp ? toDisplayString(val as Timestamp) : JSON.stringify(val)} }`;
        return `${this.constructor.name} "con" ${toDisplayString(this.id)} ${valFormatted}`;
      }
}
