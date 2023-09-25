import {type ITimestampStruct, toDisplayString, Timestamp} from '../../../json-crdt-patch/clock';
import type {JsonNode} from '../types';
import type {Printable} from '../../../util/print/types';

/**
 * Constant type represents an immutable JSON value. It can be any JSON value
 * including deeply nested objects and arrays, Uint8Array binary data. The
 * constant value cannot be edited.
 */
export class Const<View = unknown | ITimestampStruct> implements JsonNode<View>, Printable {
  constructor(public readonly id: ITimestampStruct, public readonly val: View) {}

  // ----------------------------------------------------------------- JsonNode

  public children() {}

  public child() {
    return undefined;
  }

  public container(): JsonNode | undefined {
    return undefined;
  }

  public view(): Readonly<View> {
    return this.val;
  }

  public api: undefined | unknown = undefined;

  // ---------------------------------------------------------------- Printable

  public toString(tab?: string): string {
    const val = this.val;
    const valFormatted =
      val instanceof Uint8Array
        ? `Uint8Array { ${('' + val).replaceAll(',', ', ')} }`
        : `{ ${val instanceof Timestamp ? toDisplayString(val as Timestamp) : JSON.stringify(val)} }`;
    return `${this.constructor.name} ${toDisplayString(this.id)} ${valFormatted}`;
  }
}
