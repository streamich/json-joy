import type {IJsonCrdtPatchEditOperation, IJsonCrdtPatchOperation} from './types';
import {type ITimestampStruct, type ITimespanStruct, Timestamp, toDisplayString} from './clock';

/**
 * Operation which creates a constant "con" data type.
 */
export class NewConOp implements IJsonCrdtPatchOperation {
  constructor(public readonly id: ITimestampStruct, public readonly val: unknown | undefined | ITimestampStruct) {}

  public span(): number {
    return 1;
  }

  public name(): string {
    return 'con';
  }

  public toString(tab: string = ''): string {
    const val = this.val;
    const valFormatted =
      val instanceof Timestamp
        ? `{ ${toDisplayString(val)} }`
        : val instanceof Uint8Array
        ? val.length < 13
          ? `Uint8Array { ${('' + val).replaceAll(',', ', ')} }`
          : `Uint8Array(${val.length})`
        : `{ ${JSON.stringify(val)} }`;
    return `"${this.name()}" ${toDisplayString(this.id)} ${valFormatted}`;
  }
}

/**
 * Operation which creates a new value object.
 */
export class NewValOp implements IJsonCrdtPatchOperation {
  constructor(public readonly id: ITimestampStruct, public readonly val: ITimestampStruct) {}

  public span(): number {
    return 1;
  }

  public name(): string {
    return 'val';
  }

  public toString(): string {
    return `"${this.name()}" ${toDisplayString(this.id)} { ${toDisplayString(this.val)} }`;
  }
}

/**
 * Operation which creates a new object.
 */
export class NewObjOp implements IJsonCrdtPatchOperation {
  constructor(public readonly id: ITimestampStruct) {}

  public span(): number {
    return 1;
  }

  public name(): string {
    return 'obj';
  }

  public toString(): string {
    return `"${this.name()}" ${toDisplayString(this.id)}`;
  }
}

/**
 * Operation which creates a new vector object.
 */
export class NewVecOp implements IJsonCrdtPatchOperation {
  constructor(public readonly id: ITimestampStruct) {}

  public span(): number {
    return 1;
  }

  public name(): string {
    return 'vec';
  }

  public toString(): string {
    return `"${this.name()}" ${toDisplayString(this.id)}`;
  }
}

/**
 * Operation which creates a new string object.
 */
export class NewStrOp implements IJsonCrdtPatchOperation {
  constructor(public readonly id: ITimestampStruct) {}

  public span(): number {
    return 1;
  }

  public name(): string {
    return 'str';
  }

  public toString(): string {
    return `"${this.name()}" ${toDisplayString(this.id)}`;
  }
}

/**
 * Operation which creates a new binary object.
 */
export class NewBinOp implements IJsonCrdtPatchOperation {
  constructor(public readonly id: ITimestampStruct) {}

  public span(): number {
    return 1;
  }

  public name(): string {
    return 'bin';
  }

  public toString(tab: string = ''): string {
    return `"${this.name()}" ${toDisplayString(this.id)}`;
  }
}

/**
 * Operation which creates a new array object.
 */
export class NewArrOp implements IJsonCrdtPatchOperation {
  constructor(public readonly id: ITimestampStruct) {}

  public span(): number {
    return 1;
  }

  public name(): string {
    return 'arr';
  }

  public toString(): string {
    return `"${this.name()}" ${toDisplayString(this.id)}`;
  }
}

/**
 * Operation which writes a new value to a value "val" object.
 */
export class InsValOp implements IJsonCrdtPatchEditOperation {
  constructor(
    public readonly id: ITimestampStruct,
    public readonly obj: ITimestampStruct,
    public readonly val: ITimestampStruct,
  ) {}

  public span(): number {
    return 1;
  }

  public name(): string {
    return 'ins_val';
  }

  public toString(tab: string = ''): string {
    return `"${this.name()}" ${toDisplayString(this.id)}!${this.span()}, obj = ${toDisplayString(
      this.obj,
    )}, val = ${toDisplayString(this.val)}`;
  }
}

/**
 * Operation which sets object keys.
 */
export class InsObjOp implements IJsonCrdtPatchEditOperation {
  constructor(
    public readonly id: ITimestampStruct,
    public readonly obj: ITimestampStruct,
    public readonly data: [key: string, value: ITimestampStruct][],
  ) {}

  public span(): number {
    return 1;
  }

  public name(): string {
    return 'ins_obj';
  }

  public toString(tab: string = ''): string {
    let out = `"${this.name()}" ${toDisplayString(this.id)}!${this.span()}, obj = ${toDisplayString(this.obj)}`;
    for (let i = 0; i < this.data.length; i++) {
      const isLast = i === this.data.length - 1;
      out += `\n${tab}  ${isLast ? '└─' : '├─'} ${JSON.stringify(this.data[i][0])}: ${toDisplayString(
        this.data[i][1],
      )}`;
    }
    return out;
  }
}

/**
 * Operation which sets vector elements.
 */
export class InsVecOp implements IJsonCrdtPatchEditOperation {
  constructor(
    public readonly id: ITimestampStruct,
    public readonly obj: ITimestampStruct,
    public readonly data: [key: number, value: ITimestampStruct][],
  ) {}

  public span(): number {
    return 1;
  }

  public name(): string {
    return 'ins_vec';
  }

  public toString(tab: string = ''): string {
    let out = `"${this.name()}" ${toDisplayString(this.id)}!${this.span()}, obj = ${toDisplayString(this.obj)}`;
    for (let i = 0; i < this.data.length; i++) {
      const isLast = i === this.data.length - 1;
      out += `\n${tab}  ${isLast ? '└─' : '├─'} ${JSON.stringify(this.data[i][0])}: ${toDisplayString(
        this.data[i][1],
      )}`;
    }
    return out;
  }
}

/**
 * Operation which inserts text into a "str" string object.
 */
export class InsStrOp implements IJsonCrdtPatchEditOperation {
  constructor(
    public readonly id: ITimestampStruct,
    public readonly obj: ITimestampStruct,
    public readonly ref: ITimestampStruct,
    public readonly data: string,
  ) {}

  public span(): number {
    return this.data.length;
  }

  public name(): string {
    return 'ins_str';
  }

  public toString(): string {
    return `"${this.name()}" ${toDisplayString(this.id)}!${this.span()}, obj = ${toDisplayString(
      this.obj,
    )} { ${toDisplayString(this.ref)} ← ${JSON.stringify(this.data)} }`;
  }
}

/**
 * Operations which inserts binary data into a "bin" binary object.
 */
export class InsBinOp implements IJsonCrdtPatchEditOperation {
  constructor(
    public readonly id: ITimestampStruct,
    public readonly obj: ITimestampStruct,
    public readonly ref: ITimestampStruct,
    public readonly data: Uint8Array,
  ) {}

  public span(): number {
    return this.data.length;
  }

  public name(): string {
    return 'ins_bin';
  }

  public toString(tab: string = ''): string {
    const ref = toDisplayString(this.ref);
    return `"${this.name()}" ${toDisplayString(this.id)}!${this.span()}, obj = ${toDisplayString(
      this.obj,
    )} { ${ref} ← ${this.data} }`;
  }
}

/**
 * Operation which inserts elements into an array.
 */
export class InsArrOp implements IJsonCrdtPatchEditOperation {
  /**
   * @param id ID if the first operation in this compound operation.
   * @param obj ID of the array where to insert elements. In theory `arr` is
   *        not necessary as it is possible to find the `arr` just using the
   *        `after` property, however to efficiently be able to find `arr` just
   *        by `after` at runtime all operations would need to be indexed and
   *        also they each would need to store a pointer to array type, which
   *        would require additional dozens of bytes of RAM for each array
   *        insert operation.
   * @param ref ID of the element after which to insert elements.
   * @param data The elements to insert.
   */
  constructor(
    public readonly id: ITimestampStruct,
    public readonly obj: ITimestampStruct,
    public readonly ref: ITimestampStruct,
    public readonly data: ITimestampStruct[],
  ) {}

  public span(): number {
    return this.data.length;
  }

  public name(): string {
    return 'ins_arr';
  }

  public toString(): string {
    return `"${this.name()}" ${toDisplayString(this.id)}!${this.span()}, obj = ${toDisplayString(
      this.obj,
    )} { ${toDisplayString(this.ref)} ← ${this.data.map(toDisplayString).join(', ')} }`;
  }
}

/**
 * Operation which does nothing. Useful for skipping clock cycles, so that
 * operations with a gap in clock can be included in the same patch.
 */
export class NopOp implements IJsonCrdtPatchOperation {
  constructor(public readonly id: ITimestampStruct, public readonly len: number) {}

  public span(): number {
    return this.len;
  }

  public name(): string {
    return 'nop';
  }

  public toString(): string {
    return `"${this.name()}" ${toDisplayString(this.id)}!${this.len}`;
  }
}

/**
 * Operation which deletes one or more ranges of values in some object.
 * The object could be a string, an array, or a binary.
 */
export class DelOp implements IJsonCrdtPatchEditOperation {
  /**
   * @param id ID of this operation.
   * @param obj Object in which to delete something.
   * @param what ID of the first operation to be deleted.
   */
  constructor(
    public readonly id: ITimestampStruct,
    public readonly obj: ITimestampStruct,
    public readonly what: ITimespanStruct[],
  ) {}

  public span(): number {
    return 1;
  }

  public name(): string {
    return 'del';
  }

  public toString(): string {
    const spans = this.what.map((span) => toDisplayString(span) + '!' + span.span).join(', ');
    return `"${this.name()}" ${toDisplayString(this.id)}, obj = ${toDisplayString(this.obj)} { ${spans} }`;
  }
}
