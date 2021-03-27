import type {LogicalClock, LogicalTimestamp} from "./clock";
import {DeleteOperation} from "./operations/DeleteOperation";
import {InsertArrayElementsOperation} from "./operations/InsertArrayElementsOperation";
import {InsertStringSubstringOperation} from "./operations/InsertStringSubstringOperation";
import {MakeArrayOperation} from "./operations/MakeArrayOperation";
import {MakeNumberOperation} from "./operations/MakeNumberOperation";
import {MakeObjectOperation} from "./operations/MakeObjectOperation";
import {MakeStringOperation} from "./operations/MakeStringOperation";
import {SetObjectKeysOperation} from "./operations/SetObjectKeysOperation";
import {SetRootOperation} from "./operations/SetRootOperation";
import {SetNumberOperation} from "./operations/SetNumberOperation";
import {Patch} from "./Patch";
import {FALSE_ID, NULL_ID, TRUE_ID, UNDEFINED_ID} from "./constants";
import {NoopOperation} from "./operations/NoopOperation";

/**
 * Utility class that helps in Patch construction.
 */
export class PatchBuilder {
  public readonly patch: Patch;

  constructor(public readonly clock: LogicalClock) {
    this.patch = new Patch();
  }

  /**
   * Create new object.
   * @returns ID of the new operation.
   */
  public obj(): LogicalTimestamp {
    const id = this.clock.tick(1);
    const op = new MakeObjectOperation(id);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Create new array.
   * @returns ID of the new operation.
   */
  public arr(): LogicalTimestamp {
    const id = this.clock.tick(1);
    const op = new MakeArrayOperation(id);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Create new string.
   * @returns ID of the new operation.
   */
  public str(): LogicalTimestamp {
    const id = this.clock.tick(1);
    const op = new MakeStringOperation(id);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Create new number.
   * @returns ID of the new operation.
   */
  public num(): LogicalTimestamp {
    const id = this.clock.tick(1);
    const op = new MakeNumberOperation(id);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Set value of document's root.
   * @returns ID of the new operation.
   */
  public root(value: LogicalTimestamp): LogicalTimestamp {
    const id = this.clock.tick(1);
    const op = new SetRootOperation(id, value);
    this.patch.ops.push(op);
    return id;
  }
  
  /**
   * Set field of an object.
   * @returns ID of the new operation.
   */
  public setKeys(obj: LogicalTimestamp, tuples: [key: string, value: LogicalTimestamp][]): LogicalTimestamp {
    if (!tuples.length) 
      throw new Error('EMPTY_TUPLES');
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
  public setNum(obj: LogicalTimestamp, value: number): LogicalTimestamp {
    const id = this.clock.tick(1);
    const op = new SetNumberOperation(id, obj, value);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Insert substring into a string.
   * @returns ID of the new operation.
   */
  public insStr(obj: LogicalTimestamp, after: LogicalTimestamp, substring: string): LogicalTimestamp {
    if (!substring.length) 
      throw new Error('EMPTY_STRING');
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
  public insArr(arr: LogicalTimestamp, after: LogicalTimestamp, elements: LogicalTimestamp[]): LogicalTimestamp {
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
  public del(obj: LogicalTimestamp, start: LogicalTimestamp, span: number): LogicalTimestamp {
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
    const id = this.clock.tick(span);
    const op = new NoopOperation(id, span);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Run the necessary builder commands to create an arbitrary JSON object.
   */
  public jsonObj(json: object): LogicalTimestamp {
    const obj = this.obj();
    const keys = Object.keys(json);
    if (keys.length) {
      const tuples: [key: string, value: LogicalTimestamp][] = [];
      for (const k of keys) tuples.push([k, this.json((json as any)[k])]);
      this.setKeys(obj, tuples);
    }
    return obj;
  }

  /**
   * Run the necessary builder commands to create an arbitrary JSON array.
   */
  public jsonArr(json: unknown[]): LogicalTimestamp {
    const arr = this.arr();
    const values: LogicalTimestamp[] = [];
    for (const el of json) values.push(this.json(el));
    this.insArr(arr, arr, values);
    return arr;
  }

  /**
   * Run builder commands to create a JSON string.
   */
  public jsonStr(json: string): LogicalTimestamp {
    const str = this.str();
    this.insStr(str, str, json);
    return str;
  }

  /**
   * Run builder commands to create a JSON number.
   */
  public jsonNum(json: number): LogicalTimestamp {
    const num = this.num();
    this.setNum(num, json);
    return num;
  }

  /**
   * Run the necessary builder commands to create any arbitrary JSON value.
   */
  public json(json: unknown): LogicalTimestamp {
    switch (json) {
      case null: return NULL_ID;
      case true: return TRUE_ID;
      case false: return FALSE_ID;
    }
    if (Array.isArray(json)) return this.jsonArr(json);
    switch (typeof json) {
      case 'object': return this.jsonObj(json!);
      case 'string': return this.jsonStr(json);
      case 'number': return this.jsonNum(json);
    }
    return UNDEFINED_ID;
  }
}
