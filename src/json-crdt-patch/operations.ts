import {printTree} from 'tree-dump/lib/printTree';
import {type ITimestampStruct, type ITimespanStruct, Timestamp, printTs} from './clock';
import type {IJsonCrdtPatchEditOperation, IJsonCrdtPatchOperation} from './types';

/**
 * Operation which creates a constant "con" data type.
 *
 * @category Operations
 */
export class NewConOp implements IJsonCrdtPatchOperation {
  constructor(
    public readonly id: ITimestampStruct,
    public readonly val: unknown | undefined | ITimestampStruct,
  ) {}

  public span(): number {
    return 1;
  }

  public name() {
    return 'new_con' as const;
  }

  public toString(tab: string = ''): string {
    const val = this.val;
    const klass = 'Uint8Array';
    const valFormatted =
      val instanceof Timestamp
        ? `{ ${printTs(val)} }`
        : val instanceof Uint8Array
          ? val.length < 13
            ? `${klass} { ${('' + val).replaceAll(',', ', ')} }`
            : `${klass}(${val.length})`
          : `{ ${JSON.stringify(val)} }`;
    return `${this.name()} ${printTs(this.id)} ${valFormatted}`;
  }
}

/**
 * Operation which creates a new value object.
 *
 * @category Operations
 */
export class NewValOp implements IJsonCrdtPatchOperation {
  constructor(public readonly id: ITimestampStruct) {}

  public span(): number {
    return 1;
  }

  public name() {
    return 'new_val' as const;
  }

  public toString(): string {
    return `${this.name()} ${printTs(this.id)}`;
  }
}

/**
 * Operation which creates a new object.
 *
 * @category Operations
 */
export class NewObjOp implements IJsonCrdtPatchOperation {
  constructor(public readonly id: ITimestampStruct) {}

  public span(): number {
    return 1;
  }

  public name() {
    return 'new_obj' as const;
  }

  public toString(): string {
    return `${this.name()} ${printTs(this.id)}`;
  }
}

/**
 * Operation which creates a new vector object.
 *
 * @category Operations
 */
export class NewVecOp implements IJsonCrdtPatchOperation {
  constructor(public readonly id: ITimestampStruct) {}

  public span(): number {
    return 1;
  }

  public name() {
    return 'new_vec' as const;
  }

  public toString(): string {
    return `${this.name()} ${printTs(this.id)}`;
  }
}

/**
 * Operation which creates a new string object.
 *
 * @category Operations
 */
export class NewStrOp implements IJsonCrdtPatchOperation {
  constructor(public readonly id: ITimestampStruct) {}

  public span(): number {
    return 1;
  }

  public name() {
    return 'new_str' as const;
  }

  public toString(): string {
    return `${this.name()} ${printTs(this.id)}`;
  }
}

/**
 * Operation which creates a new binary object.
 *
 * @category Operations
 */
export class NewBinOp implements IJsonCrdtPatchOperation {
  constructor(public readonly id: ITimestampStruct) {}

  public span(): number {
    return 1;
  }

  public name() {
    return 'new_bin' as const;
  }

  public toString(tab: string = ''): string {
    return `${this.name()} ${printTs(this.id)}`;
  }
}

/**
 * Operation which creates a new array object.
 *
 * @category Operations
 */
export class NewArrOp implements IJsonCrdtPatchOperation {
  constructor(public readonly id: ITimestampStruct) {}

  public span(): number {
    return 1;
  }

  public name() {
    return 'new_arr' as const;
  }

  public toString(): string {
    return `${this.name()} ${printTs(this.id)}`;
  }
}

/**
 * Operation which writes a new value to a value "val" object.
 *
 * @category Operations
 */
export class InsValOp implements IJsonCrdtPatchEditOperation {
  constructor(
    public readonly id: ITimestampStruct,
    /** @todo Rename to `node`. */
    public readonly obj: ITimestampStruct,
    public readonly val: ITimestampStruct,
  ) {}

  public span(): number {
    return 1;
  }

  public name() {
    return 'ins_val' as const;
  }

  public toString(tab: string = ''): string {
    return `${this.name()} ${printTs(this.id)}!${this.span()}, obj = ${printTs(this.obj)}, val = ${printTs(this.val)}`;
  }
}

/**
 * Operation which sets object keys.
 *
 * @category Operations
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

  public name() {
    return 'ins_obj' as const;
  }

  public toString(tab: string = ''): string {
    const header = `${this.name()} ${printTs(this.id)}!${this.span()}, obj = ${printTs(this.obj)}`;
    return (
      header +
      printTree(
        tab,
        this.data.map((item) => (tab) => `${JSON.stringify(item[0])}: ${printTs(item[1])}`),
      )
    );
  }
}

/**
 * Operation which sets vector elements.
 *
 * @category Operations
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

  public name() {
    return 'ins_vec' as const;
  }

  public toString(tab: string = ''): string {
    const header = `${this.name()} ${printTs(this.id)}!${this.span()}, obj = ${printTs(this.obj)}`;
    return (
      header +
      printTree(
        tab,
        this.data.map((item) => (tab) => `${item[0]}: ${printTs(item[1])}`),
      )
    );
  }
}

/**
 * Operation which inserts text into a "str" string object.
 *
 * @category Operations
 */
export class InsStrOp implements IJsonCrdtPatchEditOperation {
  constructor(
    public readonly id: ITimestampStruct,
    public readonly obj: ITimestampStruct,
    public readonly ref: ITimestampStruct,
    public data: string,
  ) {}

  public span(): number {
    return this.data.length;
  }

  public name() {
    return 'ins_str' as const;
  }

  public toString(): string {
    return `${this.name()} ${printTs(this.id)}!${this.span()}, obj = ${printTs(
      this.obj,
    )} { ${printTs(this.ref)} ← ${JSON.stringify(this.data)} }`;
  }
}

/**
 * Operations which inserts binary data into a "bin" binary object.
 *
 * @category Operations
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

  public name() {
    return 'ins_bin' as const;
  }

  public toString(tab: string = ''): string {
    const ref = printTs(this.ref);
    return `${this.name()} ${printTs(this.id)}!${this.span()}, obj = ${printTs(this.obj)} { ${ref} ← ${this.data} }`;
  }
}

/**
 * Operation which inserts elements into an array.
 *
 * @category Operations
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

  public name() {
    return 'ins_arr' as const;
  }

  public toString(): string {
    return `${this.name()} ${printTs(this.id)}!${this.span()}, obj = ${printTs(
      this.obj,
    )} { ${printTs(this.ref)} ← ${this.data.map(printTs).join(', ')} }`;
  }
}

/**
 * Operation which deletes one or more ranges of values in some object.
 * The object could be a string, an array, or a binary.
 *
 * @category Operations
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

  public name() {
    return 'del' as const;
  }

  public toString(): string {
    const spans = this.what.map((span) => printTs(span) + '!' + span.span).join(', ');
    return `${this.name()} ${printTs(this.id)}, obj = ${printTs(this.obj)} { ${spans} }`;
  }
}

/**
 * Operation which does nothing. Useful for skipping clock cycles, so that
 * operations with a gap in clock can be included in the same patch.
 *
 * @category Operations
 */
export class NopOp implements IJsonCrdtPatchOperation {
  constructor(
    public readonly id: ITimestampStruct,
    public readonly len: number,
  ) {}

  public span(): number {
    return this.len;
  }

  public name() {
    return 'nop' as const;
  }

  public toString(): string {
    return `${this.name()} ${printTs(this.id)}!${this.len}`;
  }
}
