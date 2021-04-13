import {LogicalClock, LogicalTimestamp, Timestamp} from './clock';
import {DeleteOperation} from './operations/DeleteOperation';
import {InsertArrayElementsOperation} from './operations/InsertArrayElementsOperation';
import {InsertStringSubstringOperation} from './operations/InsertStringSubstringOperation';
import {MakeArrayOperation} from './operations/MakeArrayOperation';
import {MakeNumberOperation} from './operations/MakeNumberOperation';
import {MakeObjectOperation} from './operations/MakeObjectOperation';
import {MakeStringOperation} from './operations/MakeStringOperation';
import {SetObjectKeysOperation} from './operations/SetObjectKeysOperation';
import {SetRootOperation} from './operations/SetRootOperation';
import {SetNumberOperation} from './operations/SetNumberOperation';
import {NoopOperation} from './operations/NoopOperation';
import {MakeConstantOperation} from './operations/MakeConstantOperation';
import {MakeValueOperation} from './operations/MakeValueOperation';
import {SetValueOperation} from './operations/SetValueOperation';
import {FALSE_ID, NULL_ID, TRUE_ID, UNDEFINED_ID} from './constants';
import {Patch} from './Patch';

/**
 * Utility class that helps in Patch construction.
 */
export class PatchBuilder {
  public readonly patch: Patch;

  constructor(public readonly clock: LogicalClock) {
    this.patch = new Patch();
  }

  // Basic operations ----------------------------------------------------------

  /**
   * Create new object.
   * @returns ID of the new operation.
   */
  public obj(): Timestamp {
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
  public arr(): Timestamp {
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
  public str(): Timestamp {
    this.pad();
    const id = this.clock.tick(1);
    const op = new MakeStringOperation(id);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Create new number.
   * @returns ID of the new operation.
   */
  public num(): Timestamp {
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
  public const(value: unknown): Timestamp {
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
  public val(value: unknown): Timestamp {
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
  public root(value: Timestamp): Timestamp {
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
  public setKeys(obj: Timestamp, tuples: [key: string, value: Timestamp][]): Timestamp {
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
  public setNum(obj: Timestamp, value: number): Timestamp {
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
  public setVal(obj: Timestamp, value: unknown): Timestamp {
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
  public insStr(obj: Timestamp, after: Timestamp, substring: string): Timestamp {
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
   * Insert elements into an array.
   * @returns ID of the new operation.
   */
  public insArr(arr: Timestamp, after: Timestamp, elements: Timestamp[]): Timestamp {
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
  public del(obj: Timestamp, start: Timestamp, span: number): Timestamp {
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
  public jsonObj(json: object): Timestamp {
    const obj = this.obj();
    const keys = Object.keys(json);
    if (keys.length) {
      const tuples: [key: string, value: Timestamp][] = [];
      for (const k of keys) tuples.push([k, this.json((json as any)[k])]);
      this.setKeys(obj, tuples);
    }
    return obj;
  }

  /**
   * Run the necessary builder commands to create an arbitrary JSON array.
   */
  public jsonArr(json: unknown[]): Timestamp {
    const arr = this.arr();
    if (json.length) {
      const values: Timestamp[] = [];
      for (const el of json) values.push(this.json(el));
      this.insArr(arr, arr, values);
    }
    return arr;
  }

  /**
   * Run builder commands to create a JSON string.
   */
  public jsonStr(json: string): Timestamp {
    const str = this.str();
    if (json) this.insStr(str, str, json);
    return str;
  }

  /**
   * Run builder commands to create a JSON value.
   */
  public jsonVal(json: unknown): Timestamp {
    return this.val(json);
  }

  /**
   * Run the necessary builder commands to create any arbitrary JSON value.
   */
  public json(json: unknown): Timestamp {
    switch (json) {
      case null:
        return NULL_ID;
      case true:
        return TRUE_ID;
      case false:
        return FALSE_ID;
    }
    if (Array.isArray(json)) return this.jsonArr(json);
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
