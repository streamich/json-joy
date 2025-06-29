import {printTree} from 'tree-dump/lib/printTree';
import {type ITimestampStruct, type ITimespanStruct, Timestamp, printTs} from './clock';
import type {IJsonCrdtPatchEditOperation, IJsonCrdtPatchOperation} from './types';
import type {JsonCrdtPatchMnemonic} from './codec/verbose';

abstract class Op implements IJsonCrdtPatchOperation {
  constructor(public readonly id: ITimestampStruct) {}

  public span(): number {
    return 1;
  }

  public abstract name(): JsonCrdtPatchMnemonic;

  public toString(): string {
    let str: string = this.name() + ' ' + printTs(this.id);
    const span = this.span();
    if (span > 1) str += '!' + span;
    return str;
  }
}

/**
 * Operation which creates a constant "con" data type.
 *
 * @category Operations
 */
export class NewConOp extends Op implements IJsonCrdtPatchOperation {
  constructor(
    public readonly id: ITimestampStruct,
    public readonly val: unknown | undefined | ITimestampStruct,
  ) {
    super(id);
  }

  public name() {
    return 'new_con' as const;
  }

  public toString(): string {
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
    return super.toString() + ' ' + valFormatted;
  }
}

/**
 * Operation which creates a new value object.
 *
 * @category Operations
 */
export class NewValOp extends Op implements IJsonCrdtPatchOperation {
  public name() {
    return 'new_val' as const;
  }
}

/**
 * Operation which creates a new object.
 *
 * @category Operations
 */
export class NewObjOp extends Op implements IJsonCrdtPatchOperation {
  public name() {
    return 'new_obj' as const;
  }
}

/**
 * Operation which creates a new vector object.
 *
 * @category Operations
 */
export class NewVecOp extends Op implements IJsonCrdtPatchOperation {
  public name() {
    return 'new_vec' as const;
  }
}

/**
 * Operation which creates a new string object.
 *
 * @category Operations
 */
export class NewStrOp extends Op implements IJsonCrdtPatchOperation {
  public name() {
    return 'new_str' as const;
  }
}

/**
 * Operation which creates a new binary object.
 *
 * @category Operations
 */
export class NewBinOp extends Op implements IJsonCrdtPatchOperation {
  public name() {
    return 'new_bin' as const;
  }
}

/**
 * Operation which creates a new array object.
 *
 * @category Operations
 */
export class NewArrOp extends Op implements IJsonCrdtPatchOperation {
  public name() {
    return 'new_arr' as const;
  }
}

/**
 * Operation which writes a new value to a value "val" object.
 *
 * @category Operations
 */
export class InsValOp extends Op implements IJsonCrdtPatchEditOperation {
  constructor(
    public readonly id: ITimestampStruct,
    public readonly obj: ITimestampStruct,
    public readonly val: ITimestampStruct,
  ) {
    super(id);
  }

  public name() {
    return 'ins_val' as const;
  }

  public toString(): string {
    return super.toString() + `, obj = ${printTs(this.obj)}, val = ${printTs(this.val)}`;
  }
}

/**
 * Operation which sets object keys.
 *
 * @category Operations
 */
export class InsObjOp extends Op implements IJsonCrdtPatchEditOperation {
  constructor(
    public readonly id: ITimestampStruct,
    public readonly obj: ITimestampStruct,
    public readonly data: [key: string, value: ITimestampStruct][],
  ) {
    super(id);
  }

  public name() {
    return 'ins_obj' as const;
  }

  public toString(tab: string = ''): string {
    const header = super.toString() + `, obj = ${printTs(this.obj)}`;
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
export class InsVecOp extends Op implements IJsonCrdtPatchEditOperation {
  constructor(
    public readonly id: ITimestampStruct,
    public readonly obj: ITimestampStruct,
    public readonly data: [key: number, value: ITimestampStruct][],
  ) {
    super(id);
  }

  public name() {
    return 'ins_vec' as const;
  }

  public toString(tab: string = ''): string {
    const header = super.toString() + `, obj = ${printTs(this.obj)}`;
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
export class InsStrOp extends Op implements IJsonCrdtPatchEditOperation {
  constructor(
    public readonly id: ITimestampStruct,
    public readonly obj: ITimestampStruct,
    public readonly ref: ITimestampStruct,
    public data: string,
  ) {
    super(id);
  }

  public span(): number {
    return this.data.length;
  }

  public name() {
    return 'ins_str' as const;
  }

  public toString(): string {
    return super.toString() + `, obj = ${printTs(
      this.obj,
    )} { ${printTs(this.ref)} ← ${JSON.stringify(this.data)} }`;
  }
}

/**
 * Operations which inserts binary data into a "bin" binary object.
 *
 * @category Operations
 */
export class InsBinOp extends Op implements IJsonCrdtPatchEditOperation {
  constructor(
    public readonly id: ITimestampStruct,
    public readonly obj: ITimestampStruct,
    public readonly ref: ITimestampStruct,
    public readonly data: Uint8Array,
  ) {
    super(id);
  }

  public span(): number {
    return this.data.length;
  }

  public name() {
    return 'ins_bin' as const;
  }

  public toString(): string {
    const ref = printTs(this.ref);
    return super.toString() + `, obj = ${printTs(this.obj)} { ${ref} ← ${this.data} }`;
  }
}

/**
 * Operation which inserts elements into an array.
 *
 * @category Operations
 */
export class InsArrOp extends Op implements IJsonCrdtPatchEditOperation {
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
  ) {
    super(id);
  }

  public span(): number {
    return this.data.length;
  }

  public name() {
    return 'ins_arr' as const;
  }

  public toString(): string {
    const obj = printTs(this.obj);
    const ref = printTs(this.ref);
    const data = this.data.map(printTs).join(', ');
    return super.toString()  + ', obj = ' + obj + ' { ' + ref + ' ← ' + data + ' }';
  }
}

/**
 * Operation which updates an existing element in an array.
 *
 * @category Operations
 */
export class UpdArrOp extends Op implements IJsonCrdtPatchEditOperation {
  /**
    * @param id ID of this operation.
    * @param obj and "arr" object ID where to update an element.
    * @param ref ID of the element to update.
    * @param val ID of the new value to set.
   */
  constructor(
    public readonly id: ITimestampStruct,
    public readonly obj: ITimestampStruct,
    public readonly ref: ITimestampStruct,
    public readonly val: ITimestampStruct,
  ) {
    super(id);
  }

  public name() {
    return 'upd_arr' as const;
  }

  public toString(): string {
    const obj = printTs(this.obj);
    const ref = printTs(this.ref);
    const val = printTs(this.val);
    return super.toString()  + ', obj = ' + obj + ' { ' + ref + ': ' + val + ' }';
  }
}

/**
 * Operation which deletes one or more ranges of values in some object.
 * The object could be a string, an array, or a binary.
 *
 * @category Operations
 */
export class DelOp extends Op implements IJsonCrdtPatchEditOperation {
  /**
   * @param id ID of this operation.
   * @param obj Object in which to delete something.
   * @param what ID of the first operation to be deleted.
   */
  constructor(
    public readonly id: ITimestampStruct,
    public readonly obj: ITimestampStruct,
    public readonly what: ITimespanStruct[],
  ) {
    super(id);
  }

  public name() {
    return 'del' as const;
  }

  public toString(): string {
    const spans = this.what.map((span) => printTs(span) + '!' + span.span).join(', ');
    return super.toString() + `, obj = ${printTs(this.obj)} { ${spans} }`;
  }
}

/**
 * Operation which does nothing. Useful for skipping clock cycles, so that
 * operations with a gap in clock can be included in the same patch.
 *
 * @category Operations
 */
export class NopOp extends Op implements IJsonCrdtPatchOperation {
  constructor(
    public readonly id: ITimestampStruct,
    public readonly len: number,
  ) {
    super(id);
  }

  public span(): number {
    return this.len;
  }

  public name() {
    return 'nop' as const;
  }
}
