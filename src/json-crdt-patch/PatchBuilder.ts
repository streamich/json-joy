import type {LogicalClock, LogicalTimestamp} from "../json-crdt/clock";
import {DeleteStringSubstringOperation} from "./operations/DeleteStringSubstringOperation";
import {InsertArrayElementsOperation} from "./operations/InsertArrayElementsOperation";
import {InsertStringSubstringOperation} from "./operations/InsertStringSubstringOperation";
import {MakeArrayOperation} from "./operations/MakeArrayOperation";
import {MakeNumberOperation} from "./operations/MakeNumberOperation";
import {MakeObjectOperation} from "./operations/MakeObjectOperation";
import {MakeStringOperation} from "./operations/MakeStringOperation";
import {SetObjectKeysOperation} from "./operations/SetObjectKeysOperation";
import {SetRootOperation} from "./operations/SetRootOperation";
import {Patch} from "./Patch";

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
  public root(after: LogicalTimestamp, value: LogicalTimestamp): LogicalTimestamp {
    const id = this.clock.tick(1);
    const op = new SetRootOperation(id, after, value);
    this.patch.ops.push(op);
    return id;
  }
  
  /**
   * Set field of an object.
   * @returns ID of the new operation.
   */
  public setKeys(object: LogicalTimestamp, tuples: [key: string, value: LogicalTimestamp][]): LogicalTimestamp {
    if (!tuples.length) 
      throw new Error('EMPTY_TUPLES');
    const id = this.clock.tick(1);
    const op = new SetObjectKeysOperation(id, object, tuples);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Insert substring into a string.
   * @returns ID of the new operation.
   */
  public insStr(after: LogicalTimestamp, substringToInsert: string): LogicalTimestamp {
    if (!substringToInsert.length) 
      throw new Error('EMPTY_STRING');
    const id = this.clock.tick(1);
    const op = new InsertStringSubstringOperation(id, after, substringToInsert);
    const span = op.getSpan();
    if (span > 1) this.clock.tick(span - 1);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Insert elements into an array.
   * @returns ID of the new operation.
   */
  public insArr(array: LogicalTimestamp, after: LogicalTimestamp, elements: LogicalTimestamp[]): LogicalTimestamp {
    const id = this.clock.tick(1);
    const op = new InsertArrayElementsOperation(id, after, elements);
    const span = op.getSpan();
    if (span > 1) this.clock.tick(span - 1);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Delete a substring of a string.
   * @returns ID of the new operation.
   */
  public delStr(firstCharacter: LogicalTimestamp, span: number): LogicalTimestamp {
    const id = this.clock.tick(span);
    const op = new DeleteStringSubstringOperation(id, firstCharacter, span);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Delete elements of an array.
   * @returns ID of the new operation.
   */
  public delArr(firstCharacter: LogicalTimestamp, span: number): LogicalTimestamp {
    const id = this.clock.tick(span);
    const op = new DeleteStringSubstringOperation(id, firstCharacter, span);
    this.patch.ops.push(op);
    return id;
  }
}
