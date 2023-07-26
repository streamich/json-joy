import {
  NewConOp,
  NewObjOp,
  NewValOp,
  NewVecOp,
  NewStrOp,
  NewBinOp,
  NewArrOp,
  InsValOp,
  InsObjOp,
  InsVecOp,
  InsStrOp,
  InsBinOp,
  InsArrOp,
  DelOp,
  NopOp,
} from './operations';
import {IClock, ITimestampStruct, ITimespanStruct, ts, Timestamp} from './clock';
import {isUint8Array} from '../util/buffers/isUint8Array';
import {Patch} from './Patch';
import {ORIGIN} from './constants';
import {Tuple} from './builder/Tuple';
import {Konst} from './builder/Konst';
import {DelayedValueBuilder} from './builder/DelayedValueBuilder';

const maybeConst = (x: unknown): boolean => {
  switch (typeof x) {
    case 'number':
    case 'boolean':
      return true;
    default:
      return x === null;
  }
};

/**
 * Utility class that helps in Patch construction.
 */
export class PatchBuilder {
  public patch: Patch;

  constructor(public readonly clock: IClock) {
    this.patch = new Patch();
  }

  public nextTime(): number {
    return this.patch.nextTime() || this.clock.time;
  }

  public flush(): Patch {
    const patch = this.patch;
    this.patch = new Patch();
    return patch;
  }

  // --------------------------------------------------------- Basic operations

  /**
   * Create new object.
   * @returns ID of the new operation.
   */
  public obj(): ITimestampStruct {
    this.pad();
    const id = this.clock.tick(1);
    this.patch.ops.push(new NewObjOp(id));
    return id;
  }

  /**
   * Create new array.
   * @returns ID of the new operation.
   */
  public arr(): ITimestampStruct {
    this.pad();
    const id = this.clock.tick(1);
    this.patch.ops.push(new NewArrOp(id));
    return id;
  }

  /**
   * Create new vector - a LWW-array.
   * @returns ID of the new operation.
   */
  public vec(): ITimestampStruct {
    this.pad();
    const id = this.clock.tick(1);
    this.patch.ops.push(new NewVecOp(id));
    return id;
  }

  /**
   * Create new string.
   * @returns ID of the new operation.
   */
  public str(): ITimestampStruct {
    this.pad();
    const id = this.clock.tick(1);
    this.patch.ops.push(new NewStrOp(id));
    return id;
  }

  /**
   * Create new binary.
   * @returns ID of the new operation.
   */
  public bin(): ITimestampStruct {
    this.pad();
    const id = this.clock.tick(1);
    this.patch.ops.push(new NewBinOp(id));
    return id;
  }

  /**
   * Create a new immutable constant JSON value. Can be anything, including
   * nested arrays and objects.
   *
   * @param value JSON value
   * @returns ID of the new operation.
   */
  public const(value: unknown): ITimestampStruct {
    this.pad();
    const id = this.clock.tick(1);
    this.patch.ops.push(new NewConOp(id, value));
    return id;
  }

  /**
   * Create a new LWW register value. Can be anything, including
   * nested arrays and objects.
   *
   * @param val Reference to another object.
   * @returns ID of the new operation.
   */
  public val(val: ITimestampStruct): ITimestampStruct {
    this.pad();
    const id = this.clock.tick(1);
    this.patch.ops.push(new NewValOp(id, val));
    return id;
  }

  /**
   * Set value of document's root.
   * @returns ID of the new operation.
   */
  public root(val: ITimestampStruct): ITimestampStruct {
    this.pad();
    const id = this.clock.tick(1);
    this.patch.ops.push(new InsValOp(id, ORIGIN, val));
    return id;
  }

  /**
   * Set field of an object.
   * @returns ID of the new operation.
   */
  public setKeys(obj: ITimestampStruct, data: [key: string, value: ITimestampStruct][]): ITimestampStruct {
    this.pad();
    if (!data.length) throw new Error('EMPTY_TUPLES');
    const id = this.clock.tick(1);
    const op = new InsObjOp(id, obj, data);
    const span = op.span();
    if (span > 1) this.clock.tick(span - 1);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Set field of an object.
   * @returns ID of the new operation.
   */
  public insVec(obj: ITimestampStruct, data: [index: number, value: ITimestampStruct][]): ITimestampStruct {
    this.pad();
    if (!data.length) throw new Error('EMPTY_TUPLES');
    const id = this.clock.tick(1);
    const op = new InsVecOp(id, obj, data);
    const span = op.span();
    if (span > 1) this.clock.tick(span - 1);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Set new value of a JSON value LWW register.
   * @returns ID of the new operation.
   */
  public setVal(obj: ITimestampStruct, val: ITimestampStruct): ITimestampStruct {
    this.pad();
    const id = this.clock.tick(1);
    const op = new InsValOp(id, obj, val);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Insert substring into a string.
   * @returns ID of the new operation.
   */
  public insStr(obj: ITimestampStruct, ref: ITimestampStruct, data: string): ITimestampStruct {
    this.pad();
    if (!data.length) throw new Error('EMPTY_STRING');
    const id = this.clock.tick(1);
    const op = new InsStrOp(id, obj, ref, data);
    const span = op.span();
    if (span > 1) this.clock.tick(span - 1);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Insert binary data into a binary type.
   * @returns ID of the new operation.
   */
  public insBin(obj: ITimestampStruct, ref: ITimestampStruct, data: Uint8Array): ITimestampStruct {
    this.pad();
    if (!data.length) throw new Error('EMPTY_BINARY');
    const id = this.clock.tick(1);
    const op = new InsBinOp(id, obj, ref, data);
    const span = op.span();
    if (span > 1) this.clock.tick(span - 1);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Insert elements into an array.
   * @returns ID of the new operation.
   */
  public insArr(arr: ITimestampStruct, ref: ITimestampStruct, data: ITimestampStruct[]): ITimestampStruct {
    this.pad();
    const id = this.clock.tick(1);
    const op = new InsArrOp(id, arr, ref, data);
    const span = op.span();
    if (span > 1) this.clock.tick(span - 1);
    this.patch.ops.push(op);
    return id;
  }

  /**
   * Delete a span of operations.
   * @param obj Object in which to delete something.
   * @param what List of time spans to delete.
   * @returns ID of the new operation.
   */
  public del(obj: ITimestampStruct, what: ITimespanStruct[]): ITimestampStruct {
    this.pad();
    const id = this.clock.tick(1);
    this.patch.ops.push(new DelOp(id, obj, what));
    return id;
  }

  /**
   * Operation that does nothing just skips IDs in the patch.
   * @param span Length of the operation.
   * @returns ID of the new operation.
   *
   */
  public nop(span: number) {
    this.pad();
    const id = this.clock.tick(span);
    this.patch.ops.push(new NopOp(id, span));
    return id;
  }

  // --------------------------------------- JSON value construction operations

  /**
   * Run the necessary builder commands to create an arbitrary JSON object.
   */
  public jsonObj(json: object): ITimestampStruct {
    const obj = this.obj();
    const keys = Object.keys(json);
    if (keys.length) {
      const tuples: [key: string, value: ITimestampStruct][] = [];
      for (const k of keys) {
        const value = (json as any)[k];
        const valueId = value instanceof Timestamp ? value : maybeConst(value) ? this.const(value) : this.json(value);
        tuples.push([k, valueId]);
      }
      this.setKeys(obj, tuples);
    }
    return obj;
  }

  /**
   * Run the necessary builder commands to create an arbitrary JSON array.
   */
  public jsonArr(json: unknown[]): ITimestampStruct {
    const arr = this.arr();
    if (json.length) {
      const values: ITimestampStruct[] = [];
      for (const el of json) values.push(this.json(el));
      this.insArr(arr, arr, values);
    }
    return arr;
  }

  /**
   * Run builder commands to create a JSON string.
   */
  public jsonStr(json: string): ITimestampStruct {
    const str = this.str();
    if (json) this.insStr(str, str, json);
    return str;
  }

  /**
   * Run builder commands to create a binary data type.
   */
  public jsonBin(json: Uint8Array): ITimestampStruct {
    const bin = this.bin();
    if (json.length) this.insBin(bin, bin, json);
    return bin;
  }

  /**
   * Run builder commands to create a JSON value.
   */
  public jsonVal(json: unknown): ITimestampStruct {
    const val = this.const(json);
    return this.val(val);
  }

  /**
   * Run builder commands to create a tuple.
   */
  public jsonTup(slots: unknown[]): ITimestampStruct {
    const tup = this.vec();
    const length = slots.length;
    if (length) {
      const writes: [index: number, value: ITimestampStruct][] = [];
      for (let i = 0; i < length; i++) writes.push([i, this.constOrJson(slots[i])]);
      this.insVec(tup, writes);
    }
    return tup;
  }

  /**
   * Run the necessary builder commands to create any arbitrary JSON value.
   */
  public json(json: unknown): ITimestampStruct {
    if (json instanceof Timestamp) return json;
    if (json === undefined) return this.const(json);
    if (json instanceof Array) return this.jsonArr(json);
    if (isUint8Array(json)) return this.jsonBin(json);
    if (json instanceof Tuple) return this.jsonTup(json.slots);
    if (json instanceof Konst) return this.const(json.val);
    if (json instanceof DelayedValueBuilder) return json.build(this);
    switch (typeof json) {
      case 'object':
        return json === null ? this.jsonVal(json) : this.jsonObj(json!);
      case 'string':
        return this.jsonStr(json);
      case 'number':
      case 'boolean':
        return this.jsonVal(json);
    }
    throw new Error('INVALID_JSON');
  }

  public constOrJson(value: unknown): ITimestampStruct {
    if (value instanceof Timestamp) return value;
    return maybeConst(value) ? this.const(value) : this.json(value);
  }

  public maybeConst(value: unknown | Timestamp): Timestamp {
    return value instanceof Timestamp ? value : this.const(value);
  }

  // ------------------------------------------------------------------ Private

  /**
   * Add padding "noop" operation if clock's time has jumped.
   */
  public pad() {
    const nextTime = this.patch.nextTime();
    if (!nextTime) return;
    const drift = this.clock.time - nextTime;
    if (drift > 0) {
      const id = ts(this.clock.sid, nextTime);
      const padding = new NopOp(id, drift);
      this.patch.ops.push(padding);
    }
  }
}
