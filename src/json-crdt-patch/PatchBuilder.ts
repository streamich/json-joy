import {DeleteOperation} from './operations/DeleteOperation';
import {FALSE_ID, NULL_ID, TRUE_ID, UNDEFINED_ID} from './constants';
import {InsertArrayElementsOperation} from './operations/InsertArrayElementsOperation';
import {InsertBinaryDataOperation} from './operations/InsertBinaryDataOperation';
import {InsertStringSubstringOperation} from './operations/InsertStringSubstringOperation';
import {isUint8Array} from '../util/isUint8Array';
import {LogicalTimestamp, ITimestamp, IClock} from './clock';
import {MakeArrayOperation} from './operations/MakeArrayOperation';
import {MakeBinaryOperation} from './operations/MakeBinaryOperation';
import {MakeConstantOperation} from './operations/MakeConstantOperation';
import {MakeNumberOperation} from './operations/MakeNumberOperation';
import {MakeObjectOperation} from './operations/MakeObjectOperation';
import {MakeStringOperation} from './operations/MakeStringOperation';
import {MakeValueOperation} from './operations/MakeValueOperation';
import {NoopOperation} from './operations/NoopOperation';
import {Patch} from './Patch';
import {SetNumberOperation} from './operations/SetNumberOperation';
import {SetObjectKeysOperation} from './operations/SetObjectKeysOperation';
import {SetRootOperation} from './operations/SetRootOperation';
import {SetValueOperation} from './operations/SetValueOperation';

/**
 * Utility class that helps in Patch construction.
 */
export class PatchBuilder {
  public readonly patch: Patch;

  constructor(public readonly clock: IClock) {
    this.patch = new Patch();
  }

  // Basic operations ----------------------------------------------------------

  /**
   * Create new object.
   * @returns ID of the new operation.
   */
  public obj(): ITimestamp {
    this.pad();
    const id = this.clock.tick(1);
    const op = new MakeObjectOperation(id);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Create new array.
   * @returns ID of the new operation.
   */
  public arr(): ITimestamp {
    this.pad();
    const id = this.clock.tick(1);
    const op = new MakeArrayOperation(id);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Create new string.
   * @returns ID of the new operation.
   */
  public str(): ITimestamp {
    this.pad();
    const id = this.clock.tick(1);
    const op = new MakeStringOperation(id);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Create new binary.
   * @returns ID of the new operation.
   */
  public bin(): ITimestamp {
    this.pad();
    const id = this.clock.tick(1);
    const op = new MakeBinaryOperation(id);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Create new number.
   * @returns ID of the new operation.
   */
  public num(): ITimestamp {
    this.pad();
    const id = this.clock.tick(1);
    const op = new MakeNumberOperation(id);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Create a new immutable constant JSON value. Can be anything, including
   * nested arrays and objects.
   *
   * @param value JSON value
   * @returns ID of the new operation.
   */
  public const(value: unknown): ITimestamp {
    this.pad();
    const id = this.clock.tick(1);
    const op = new MakeConstantOperation(id, value);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Create a new LWW register JSON value. Can be anything, including
   * nested arrays and objects.
   *
   * @param value JSON value
   * @returns ID of the new operation.
   */
  public val(value: unknown): ITimestamp {
    this.pad();
    const id = this.clock.tick(1);
    const op = new MakeValueOperation(id, value);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Set value of document's root.
   * @returns ID of the new operation.
   */
  public root(value: ITimestamp): ITimestamp {
    this.pad();
    const id = this.clock.tick(1);
    const op = new SetRootOperation(id, value);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Set field of an object.
   * @returns ID of the new operation.
   */
  public setKeys(obj: ITimestamp, tuples: [key: string, value: ITimestamp][]): ITimestamp {
    this.pad();
    if (!tuples.length) throw new Error('EMPTY_TUPLES');
    const id = this.clock.tick(1);
    const op = new SetObjectKeysOperation(id, obj, tuples);
    const span = op.span();
    if (span > 1) this.clock.tick(span - 1);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Set number value.
   * @returns ID of the new operation.
   */
  public setNum(obj: ITimestamp, value: number): ITimestamp {
    this.pad();
    const id = this.clock.tick(1);
    const op = new SetNumberOperation(id, obj, value);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Set new new value of a JSON value LWW register.
   * @returns ID of the new operation.
   */
  public setVal(obj: ITimestamp, value: unknown): ITimestamp {
    this.pad();
    const id = this.clock.tick(1);
    const op = new SetValueOperation(id, obj, value);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Insert substring into a string.
   * @returns ID of the new operation.
   */
  public insStr(obj: ITimestamp, after: ITimestamp, substring: string): ITimestamp {
    this.pad();
    if (!substring.length) throw new Error('EMPTY_STRING');
    const id = this.clock.tick(1);
    const op = new InsertStringSubstringOperation(id, obj, after, substring);
    const span = op.span();
    if (span > 1) this.clock.tick(span - 1);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Insert binary data into a binary type.
   * @returns ID of the new operation.
   */
  public insBin(obj: ITimestamp, after: ITimestamp, data: Uint8Array): ITimestamp {
    this.pad();
    if (!data.length) throw new Error('EMPTY_BINARY');
    const id = this.clock.tick(1);
    const op = new InsertBinaryDataOperation(id, obj, after, data);
    const span = op.span();
    if (span > 1) this.clock.tick(span - 1);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Insert elements into an array.
   * @returns ID of the new operation.
   */
  public insArr(arr: ITimestamp, after: ITimestamp, elements: ITimestamp[]): ITimestamp {
    this.pad();
    const id = this.clock.tick(1);
    const op = new InsertArrayElementsOperation(id, arr, after, elements);
    const span = op.span();
    if (span > 1) this.clock.tick(span - 1);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Delete a span of operations.
   * @param start First operation to delete.
   * @param span Number of subsequent (by incrementing logical clock) operations to delete.
   * @returns ID of the new operation.
   */
  public del(obj: ITimestamp, start: ITimestamp, span: number): ITimestamp {
    this.pad();
    const id = this.clock.tick(span);
    const op = new DeleteOperation(id, obj, start, span);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Operation that does nothing just skips IDs in the patch.
   * @param span Length of the operation.
   * @returns ID of the new operation.
   */
  public noop(span: number) {
    this.pad();
    const id = this.clock.tick(span);
    const op = new NoopOperation(id, span);
    this.patch.ops.push(op);
    return id;
  }

  // JSON value construction operations ----------------------------------------

  /**
   * Run the necessary builder commands to create an arbitrary JSON object.
   */
  public jsonObj(json: object): ITimestamp {
    const obj = this.obj();
    const keys = Object.keys(json);
    if (keys.length) {
      const tuples: [key: string, value: ITimestamp][] = [];
      for (const k of keys) tuples.push([k, this.json((json as any)[k])]);
      this.setKeys(obj, tuples);
    }
    return obj;
  }

  /**
   * Run the necessary builder commands to create an arbitrary JSON array.
   */
  public jsonArr(json: unknown[]): ITimestamp {
    const arr = this.arr();
    if (json.length) {
      const values: ITimestamp[] = [];
      for (const el of json) values.push(this.json(el));
      this.insArr(arr, arr, values);
    }
    return arr;
  }

  /**
   * Run builder commands to create a JSON string.
   */
  public jsonStr(json: string): ITimestamp {
    const str = this.str();
    if (json) this.insStr(str, str, json);
    return str;
  }

  /**
   * Run builder commands to create a binary data type.
   */
   public jsonBin(json: Uint8Array): ITimestamp {
    const bin = this.bin();
    if (json.length) this.insBin(bin, bin, json);
    return bin;
  }

  /**
   * Run builder commands to create a JSON value.
   */
  public jsonVal(json: unknown): ITimestamp {
    return this.val(json);
  }

  /**
   * Run the necessary builder commands to create any arbitrary JSON value.
   */
  public json(json: unknown): ITimestamp {
    switch (json) {
      case null:
        return NULL_ID;
      case true:
        return TRUE_ID;
      case false:
        return FALSE_ID;
    }
    if (Array.isArray(json)) return this.jsonArr(json);
    if (isUint8Array(json)) return this.jsonBin(json);
    switch (typeof json) {
      case 'object':
        return this.jsonObj(json!);
      case 'string':
        return this.jsonStr(json);
      case 'number':
        return this.jsonVal(json);
    }
    return UNDEFINED_ID;
  }

  // Private -------------------------------------------------------------------

  /**
   * Add padding "noop" operation if clock's time has jumped.
   */
  private pad() {
    const nextTime = this.patch.nextTime();
    if (!nextTime) return;
    const drift = this.clock.time - nextTime;
    if (drift > 0) {
      const id = new LogicalTimestamp(this.clock.getSessionId(), nextTime);
      const padding = new NoopOperation(id, drift);
      this.patch.ops.push(padding);
    }
  }
}
